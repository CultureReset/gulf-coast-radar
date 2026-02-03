// POS Integration Layer - Connects to Toast, Square, SpotOn APIs
// Sends orders directly to restaurant POS systems

class POSIntegrationManager {
  constructor() {
    this.integrations = {
      toast: new ToastPOSConnector(),
      square: new SquarePOSConnector(),
      spoton: new SpotOnPOSConnector()
    };
  }

  /**
   * Send order to restaurant's POS system
   * @param {Object} order - Order object from order-manager.js
   * @param {Object} business - Business object with POS credentials
   * @returns {Promise<Object>} POS order confirmation
   */
  async sendOrderToPOS(order, business) {
    if (!business.posSystem) {
      console.warn('Business has no POS integration configured');
      return { success: false, error: 'No POS integration' };
    }

    const posType = business.posSystem.toLowerCase();
    const connector = this.integrations[posType];

    if (!connector) {
      console.error(`Unsupported POS system: ${posType}`);
      return { success: false, error: 'Unsupported POS system' };
    }

    try {
      // Convert our order format to POS-specific format
      const posOrder = this.convertToPOSFormat(order, posType);

      // Send to POS
      const result = await connector.createOrder(posOrder, business.posCredentials);

      if (result.success) {
        // Save POS order ID for tracking
        order.posOrderId = result.posOrderId;
        order.posSystem = posType;

        console.log(`✅ Order sent to ${posType} POS:`, result.posOrderId);
        return result;
      } else {
        console.error(`❌ Failed to send order to ${posType}:`, result.error);
        return result;
      }
    } catch (error) {
      console.error(`Error sending order to ${posType}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert our order format to POS-specific format
   */
  convertToPOSFormat(order, posType) {
    switch (posType) {
      case 'toast':
        return this.convertToToastFormat(order);
      case 'square':
        return this.convertToSquareFormat(order);
      case 'spoton':
        return this.convertToSpotOnFormat(order);
      default:
        return order;
    }
  }

  convertToToastFormat(order) {
    // Toast POS format
    return {
      orderType: 'TAKEOUT', // or 'DINE_IN'
      checks: [{
        customer: {
          phone: order.phone
        },
        selections: order.items.map(item => ({
          itemGuid: item.posItemId || item.id,
          quantity: item.quantity,
          specialInstructions: item.notes || ''
        })),
        specialInstructions: order.specialInstructions || ''
      }]
    };
  }

  convertToSquareFormat(order) {
    // Square Orders API format
    return {
      order: {
        location_id: order.businessLocationId,
        line_items: order.items.map(item => ({
          catalog_object_id: item.posItemId || item.id,
          quantity: item.quantity.toString(),
          note: item.notes || ''
        })),
        fulfillments: [{
          type: order.orderType === 'togo' ? 'PICKUP' : 'DELIVERY',
          state: 'PROPOSED',
          pickup_details: {
            recipient: {
              phone_number: order.phone
            },
            note: order.specialInstructions || ''
          }
        }]
      }
    };
  }

  convertToSpotOnFormat(order) {
    // SpotOn POS format
    return {
      orderType: order.orderType === 'togo' ? 'pickup' : 'dinein',
      customer: {
        phoneNumber: order.phone
      },
      items: order.items.map(item => ({
        itemId: item.posItemId || item.id,
        quantity: item.quantity,
        modifiers: [],
        notes: item.notes || ''
      })),
      notes: order.specialInstructions || ''
    };
  }

  /**
   * Get order status from POS system
   */
  async getOrderStatus(order) {
    if (!order.posOrderId || !order.posSystem) {
      return { success: false, error: 'No POS tracking info' };
    }

    const connector = this.integrations[order.posSystem];
    if (!connector) {
      return { success: false, error: 'Unsupported POS system' };
    }

    try {
      return await connector.getOrderStatus(order.posOrderId, order.posCredentials);
    } catch (error) {
      console.error('Error getting order status:', error);
      return { success: false, error: error.message };
    }
  }
}

// ===== TOAST POS CONNECTOR =====
class ToastPOSConnector {
  constructor() {
    this.apiBase = 'https://api.toasttab.com/orders/v2';
  }

  async createOrder(order, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Toast-Restaurant-External-ID': credentials.restaurantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const result = await response.json();
      return {
        success: true,
        posOrderId: result.guid,
        posResponse: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOrderStatus(orderId, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Toast-Restaurant-External-ID': credentials.restaurantId
        }
      });

      if (!response.ok) {
        return { success: false, error: 'Order not found' };
      }

      const result = await response.json();
      return {
        success: true,
        status: this.mapToastStatus(result.status),
        posData: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  mapToastStatus(toastStatus) {
    const statusMap = {
      'NEW': 'pending',
      'APPROVED': 'confirmed',
      'COOKING': 'preparing',
      'READY': 'ready',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[toastStatus] || 'pending';
  }
}

// ===== SQUARE POS CONNECTOR =====
class SquarePOSConnector {
  constructor() {
    this.apiBase = 'https://connect.squareup.com/v2';
  }

  async createOrder(orderData, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-18'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.errors?.[0]?.detail || 'Order failed' };
      }

      const result = await response.json();
      return {
        success: true,
        posOrderId: result.order.id,
        posResponse: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOrderStatus(orderId, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Square-Version': '2024-01-18'
        }
      });

      if (!response.ok) {
        return { success: false, error: 'Order not found' };
      }

      const result = await response.json();
      return {
        success: true,
        status: this.mapSquareStatus(result.order.state),
        posData: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  mapSquareStatus(squareStatus) {
    const statusMap = {
      'OPEN': 'pending',
      'PROPOSED': 'pending',
      'ACCEPTED': 'confirmed',
      'PREPARING': 'preparing',
      'READY': 'ready',
      'COMPLETED': 'completed',
      'CANCELED': 'cancelled'
    };
    return statusMap[squareStatus] || 'pending';
  }
}

// ===== SPOTON POS CONNECTOR =====
class SpotOnPOSConnector {
  constructor() {
    this.apiBase = 'https://api.spoton.com/v1';
  }

  async createOrder(order, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const result = await response.json();
      return {
        success: true,
        posOrderId: result.orderId,
        posResponse: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOrderStatus(orderId, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`
        }
      });

      if (!response.ok) {
        return { success: false, error: 'Order not found' };
      }

      const result = await response.json();
      return {
        success: true,
        status: this.mapSpotOnStatus(result.status),
        posData: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  mapSpotOnStatus(spotOnStatus) {
    const statusMap = {
      'pending': 'pending',
      'accepted': 'confirmed',
      'preparing': 'preparing',
      'ready': 'ready',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    return statusMap[spotOnStatus] || 'pending';
  }
}

// Create global instance
window.posIntegrationManager = new POSIntegrationManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = POSIntegrationManager;
}
