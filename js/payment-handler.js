// Payment Handler - Generate payment links (NO payment processing on our platform!)
// Businesses handle payments on their own sites/systems

class PaymentHandler {
  constructor() {
    this.paymentMethods = {
      'square': this.generateSquarePaymentLink.bind(this),
      'toast': this.generateToastPaymentLink.bind(this),
      'direct': this.generateDirectPaymentLink.bind(this),
      'payAtCounter': this.generatePayAtCounterInfo.bind(this)
    };
  }

  /**
   * Generate payment info based on business's payment system
   * @param {Object} order - Order details
   * @param {Object} business - Business info
   * @returns {Object} Payment info with link/QR/instructions
   */
  async generatePaymentInfo(order, business) {
    const paymentSystem = business.paymentSystem || business.posSystem || 'payAtCounter';

    console.log(`💳 Generating payment info for system: ${paymentSystem}`);

    const handler = this.paymentMethods[paymentSystem] || this.paymentMethods['payAtCounter'];
    return await handler(order, business);
  }

  /**
   * Square Payment Link
   * Square allows creating hosted payment pages
   */
  async generateSquarePaymentLink(order, business) {
    try {
      // If backend is available, create Square payment link via API
      if (window.awsSecretIntegration) {
        const response = await fetch(`${awsSecretIntegration.apiBaseUrl}/create-payment-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: business.id,
            order: order
          })
        });

        const result = await response.json();

        if (result.success && result.paymentUrl) {
          return {
            method: 'square_link',
            paymentUrl: result.paymentUrl,
            instructions: 'Complete payment on Square to confirm your order',
            requiresAction: true
          };
        }
      }

      // Fallback: Link to business website payment page
      return {
        method: 'business_website',
        paymentUrl: business.websiteUrl ? `${business.websiteUrl}/pay?order=${order.orderId}` : null,
        instructions: business.paymentInstructions || 'Pay at pickup or follow restaurant instructions',
        requiresAction: false
      };

    } catch (error) {
      console.error('Error generating Square payment link:', error);
      return this.generatePayAtCounterInfo(order, business);
    }
  }

  /**
   * Toast Payment Link
   */
  async generateToastPaymentLink(order, business) {
    try {
      // Toast doesn't have direct payment link API
      // Options:
      // 1. Link to their online ordering page
      // 2. Generate QR code for payment at pickup
      // 3. Pay at counter

      if (business.toastOnlineOrderingUrl) {
        return {
          method: 'toast_online',
          paymentUrl: business.toastOnlineOrderingUrl,
          instructions: 'Complete payment on Toast to confirm your order',
          requiresAction: true
        };
      }

      // Default to pay at counter
      return this.generatePayAtCounterInfo(order, business);

    } catch (error) {
      console.error('Error generating Toast payment link:', error);
      return this.generatePayAtCounterInfo(order, business);
    }
  }

  /**
   * Direct Business Payment Link
   * Link to business's own payment page
   */
  async generateDirectPaymentLink(order, business) {
    const baseUrl = business.websiteUrl || business.paymentPageUrl;

    if (!baseUrl) {
      return this.generatePayAtCounterInfo(order, business);
    }

    // Generate payment link with order details
    const paymentUrl = `${baseUrl}/pay?` + new URLSearchParams({
      orderId: order.orderId,
      businessId: business.id,
      total: order.total.toFixed(2),
      phone: order.phone
    }).toString();

    return {
      method: 'direct_link',
      paymentUrl: paymentUrl,
      instructions: `Complete payment on ${business.name}'s website to confirm your order`,
      requiresAction: true
    };
  }

  /**
   * Pay at Counter (Default - No online payment)
   */
  generatePayAtCounterInfo(order, business) {
    return {
      method: 'pay_at_counter',
      paymentUrl: null,
      qrCode: this.generateOrderQRCode(order),
      instructions: order.orderType === 'dinein'
        ? `Order confirmed! Your order number is #${order.orderId.slice(-6)}. Show this to your server for payment.`
        : `Order confirmed! Pay when you pick up. Order #${order.orderId.slice(-6)}`,
      requiresAction: false,
      showAtRestaurant: true
    };
  }

  /**
   * Generate QR code with order info (for showing at restaurant)
   */
  generateOrderQRCode(order) {
    // Simple data URL QR code (in production, use qrcode.js library)
    const orderData = {
      orderId: order.orderId,
      businessId: order.businessId,
      total: order.total,
      phone: order.phone,
      items: order.items.length
    };

    const dataString = JSON.stringify(orderData);

    // For now, return a placeholder
    // In production, use: https://github.com/davidshimjs/qrcodejs
    return {
      data: dataString,
      displayUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dataString)}`
    };
  }

  /**
   * Payment Methods Info for Business Dashboard
   * Shows businesses what payment options they can enable
   */
  getAvailablePaymentMethods(business) {
    const methods = [];

    // Square
    if (business.posSystem === 'square' || business.squareConnected) {
      methods.push({
        id: 'square',
        name: 'Square Payment Links',
        description: 'Customers pay online via Square hosted page',
        enabled: !!business.squareConnected,
        feeInfo: 'Square fees: 2.6% + 10¢ per transaction'
      });
    }

    // Toast
    if (business.posSystem === 'toast') {
      methods.push({
        id: 'toast',
        name: 'Toast Online Ordering',
        description: 'Link to your Toast online ordering page',
        enabled: !!business.toastOnlineOrderingUrl,
        feeInfo: 'Toast fees: varies by plan'
      });
    }

    // Business Website
    if (business.websiteUrl) {
      methods.push({
        id: 'direct',
        name: 'Your Website Payment Page',
        description: 'Link customers to your own payment page',
        enabled: true,
        feeInfo: 'You handle payment processing'
      });
    }

    // Pay at Counter (always available)
    methods.push({
      id: 'payAtCounter',
      name: 'Pay at Counter/Table',
      description: 'Customer pays when they pick up or dine in',
      enabled: true,
      feeInfo: 'No online payment fees'
    });

    return methods;
  }

  /**
   * Validate payment completion (for online payments)
   */
  async verifyPaymentCompleted(orderId, paymentMethod) {
    try {
      // Check with backend if payment was completed
      const response = await fetch(`${awsSecretIntegration.apiBaseUrl}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          paymentMethod: paymentMethod
        })
      });

      const result = await response.json();
      return result.paid || false;

    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }
}

// Create global instance
window.paymentHandler = new PaymentHandler();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentHandler;
}
