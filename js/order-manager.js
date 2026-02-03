// Order Manager - Handles order creation, tracking, and management

class OrderManager {
  constructor() {
    this.orders = this.loadOrders();
  }

  /**
   * Load orders from localStorage
   */
  loadOrders() {
    const ordersData = localStorage.getItem('gcr_orders');
    return ordersData ? JSON.parse(ordersData) : [];
  }

  /**
   * Save orders to localStorage
   */
  saveOrders() {
    localStorage.setItem('gcr_orders', JSON.stringify(this.orders));
  }

  /**
   * Generate unique order ID
   */
  generateOrderId() {
    return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Create a new order
   */
  createOrder(orderData) {
    if (!sessionManager.isLoggedIn()) {
      throw new Error('Must be logged in to place order');
    }

    const phone = sessionManager.getPhone();
    const orderId = this.generateOrderId();

    const order = {
      orderId: orderId,
      phone: phone,
      businessId: orderData.businessId,
      businessName: orderData.businessName,
      items: orderData.items,
      orderType: orderData.orderType || 'togo',
      status: 'pending',
      total: this.calculateTotal(orderData.items),
      subtotal: this.calculateSubtotal(orderData.items),
      tax: this.calculateTax(orderData.items),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      tableNumber: orderData.tableNumber || null,
      specialInstructions: orderData.specialInstructions || '',
      reviewToken: null // Generated after completion
    };

    // Save order
    this.orders.push(order);
    this.saveOrders();

    // Add to user's order history
    sessionManager.addOrderToHistory({
      orderId: order.orderId,
      businessId: order.businessId,
      businessName: order.businessName,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt
    });

    // Send SMS confirmation (mock)
    this.sendOrderConfirmation(order);

    return order;
  }

  /**
   * Calculate subtotal (before tax)
   */
  calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * Calculate tax (8% Gulf Coast average)
   */
  calculateTax(items) {
    const subtotal = this.calculateSubtotal(items);
    return subtotal * 0.08;
  }

  /**
   * Calculate total (subtotal + tax)
   */
  calculateTotal(items) {
    const subtotal = this.calculateSubtotal(items);
    const tax = this.calculateTax(items);
    return subtotal + tax;
  }

  /**
   * Get order by ID
   */
  getOrder(orderId) {
    return this.orders.find(o => o.orderId === orderId);
  }

  /**
   * Get orders for current user
   */
  getUserOrders() {
    if (!sessionManager.isLoggedIn()) return [];

    const phone = sessionManager.getPhone();
    return this.orders
      .filter(o => o.phone === phone)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get orders for a business
   */
  getBusinessOrders(businessId) {
    return this.orders
      .filter(o => o.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId, newStatus) {
    const order = this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'completed') {
      order.completedAt = new Date().toISOString();
      // Generate review token
      order.reviewToken = this.generateReviewToken(order);
    }

    this.saveOrders();

    // Send SMS notification
    this.sendStatusUpdate(order, oldStatus, newStatus);

    return order;
  }

  /**
   * Update order with any fields
   */
  updateOrder(orderId, updates) {
    const order = this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Merge updates into order
    Object.assign(order, updates);
    order.updatedAt = new Date().toISOString();

    this.saveOrders();

    return order;
  }

  /**
   * Generate cryptographically secure review token
   */
  generateReviewToken(order) {
    // Simple token for now (in production, use proper JWT)
    const tokenData = {
      orderId: order.orderId,
      phone: order.phone,
      businessId: order.businessId,
      items: order.items.map(i => i.id),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      used: false
    };

    return btoa(JSON.stringify(tokenData));
  }

  /**
   * Validate review token
   */
  validateReviewToken(token) {
    try {
      const tokenData = JSON.parse(atob(token));

      // Check expiration
      if (Date.now() > tokenData.exp) {
        return { valid: false, reason: 'Token expired' };
      }

      // Check if already used
      if (tokenData.used) {
        return { valid: false, reason: 'Token already used' };
      }

      // Check if order exists
      const order = this.getOrder(tokenData.orderId);
      if (!order) {
        return { valid: false, reason: 'Order not found' };
      }

      // Check if phone matches
      if (!sessionManager.isLoggedIn() || sessionManager.getPhone() !== tokenData.phone) {
        return { valid: false, reason: 'Phone number mismatch' };
      }

      return { valid: true, order: order, tokenData: tokenData };
    } catch (e) {
      return { valid: false, reason: 'Invalid token' };
    }
  }

  /**
   * Mark review token as used
   */
  markReviewTokenUsed(orderId) {
    const order = this.getOrder(orderId);
    if (order && order.reviewToken) {
      const tokenData = JSON.parse(atob(order.reviewToken));
      tokenData.used = true;
      order.reviewToken = btoa(JSON.stringify(tokenData));
      this.saveOrders();
    }
  }

  /**
   * Send order confirmation SMS (mock)
   */
  sendOrderConfirmation(order) {
    const message = `✅ Order confirmed! ${order.businessName} - Order #${order.orderId.slice(-6)}\n\n${order.items.length} items - $${order.total.toFixed(2)}\n\nWe'll text you when your order is ready!`;

    console.log(`📱 SMS to ${sessionManager.getFormattedPhone()}:`);
    console.log(message);

    // TODO: Integrate with Twilio
  }

  /**
   * Send status update SMS (mock)
   */
  sendStatusUpdate(order, oldStatus, newStatus) {
    let message = '';

    switch (newStatus) {
      case 'confirmed':
        message = `✅ Your order at ${order.businessName} has been confirmed!\n\nOrder #${order.orderId.slice(-6)}\nWe're preparing your food now.`;
        break;

      case 'preparing':
        message = `👨‍🍳 Your order at ${order.businessName} is being prepared!\n\nOrder #${order.orderId.slice(-6)}\nShould be ready in 15-20 minutes.`;
        break;

      case 'ready':
        message = `🎉 Your order is ready for pickup!\n\n${order.businessName}\nOrder #${order.orderId.slice(-6)}\n\nCome get it while it's hot!`;
        break;

      case 'completed':
        message = `✅ Order completed!\n\nThanks for ordering from ${order.businessName}!\n\nHow was everything? Leave a review: ${window.location.origin}/review.html?token=${order.reviewToken}`;
        break;

      case 'cancelled':
        message = `❌ Order cancelled\n\nYour order at ${order.businessName} has been cancelled.\n\nOrder #${order.orderId.slice(-6)}`;
        break;
    }

    if (message) {
      console.log(`📱 SMS to ${sessionManager.getFormattedPhone()}:`);
      console.log(message);
    }

    // TODO: Integrate with Twilio
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId, reason = '') {
    const order = this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Only allow cancellation if order is still pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Cannot cancel order in current status');
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.updatedAt = new Date().toISOString();

    this.saveOrders();
    this.sendStatusUpdate(order, order.status, 'cancelled');

    return order;
  }

  /**
   * Get order status display info
   */
  getStatusInfo(status) {
    const statusMap = {
      pending: { icon: '⏳', text: 'Order Placed', color: '#ffc107' },
      confirmed: { icon: '✅', text: 'Confirmed', color: '#28a745' },
      preparing: { icon: '👨‍🍳', text: 'Preparing', color: '#17a2b8' },
      ready: { icon: '🎉', text: 'Ready for Pickup', color: '#28a745' },
      completed: { icon: '✅', text: 'Completed', color: '#6c757d' },
      cancelled: { icon: '❌', text: 'Cancelled', color: '#dc3545' }
    };

    return statusMap[status] || { icon: '❓', text: 'Unknown', color: '#6c757d' };
  }
}

// Create global instance
window.orderManager = new OrderManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OrderManager;
}
