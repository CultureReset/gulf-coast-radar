/**
 * Square POS Integration
 * Handles OAuth, order verification, and order submission
 */

class SquareIntegration {
  constructor() {
    // Square Application ID from Developer Dashboard
    this.applicationId = 'sq0idp-T2LU7grFu2gVkbuuepmr9w';

    // Sandbox vs Production
    this.environment = 'production'; // Change to 'sandbox' for testing

    this.baseUrl = this.environment === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';

    this.apiVersion = '2024-01-18'; // Latest Square API version
  }

  /**
   * Step 1: Initiate OAuth Flow
   * Business owner clicks "Connect Square" button
   */
  connectSquare(businessId) {
    const scopes = [
      'ORDERS_READ',        // Read past orders (for CyberMate verification)
      'ORDERS_WRITE',       // Create new orders (for CyberCheck)
      'PAYMENTS_READ',      // Read payment details
      'ITEMS_READ',         // Read menu items
      'MERCHANT_PROFILE_READ' // Read business info
    ].join('+');

    const redirectUrl = window.location.origin + '/square-callback.html';

    // Build OAuth URL
    const authUrl = `${this.baseUrl}/oauth2/authorize?` +
      `client_id=${this.applicationId}&` +
      `scope=${scopes}&` +
      `session=false&` +
      `state=${businessId}`; // Pass business ID to identify which business is connecting

    console.log('🔐 Redirecting to Square OAuth...');
    console.log('Business will be asked to authorize access');

    // Redirect to Square login
    window.location.href = authUrl;
  }

  /**
   * Step 2: Handle OAuth Callback
   * Square redirects back with authorization code
   */
  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const businessId = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`Square OAuth error: ${error}`);
    }

    if (!authCode) {
      throw new Error('No authorization code received from Square');
    }

    console.log('✅ Received authorization code from Square');
    console.log('📝 Business ID:', businessId);

    // Exchange authorization code for access token
    // Note: This requires your Application Secret, which should be kept secure
    // In production, do this server-side or use a secure proxy
    return {
      authCode,
      businessId,
      message: 'Authorization code received. Exchange for access token on your backend.'
    };
  }

  /**
   * Step 3: Exchange Auth Code for Access Token
   * IMPORTANT: In production, do this server-side to keep your Application Secret secure
   * For now, we'll do it client-side for testing
   */
  async exchangeToken(authCode, applicationSecret) {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Square-Version': this.apiVersion
        },
        body: JSON.stringify({
          client_id: this.applicationId,
          client_secret: applicationSecret,
          code: authCode,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Square API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      console.log('✅ Successfully obtained access token');
      console.log('Token expires at:', new Date(data.expires_at));

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
        merchantId: data.merchant_id
      };
    } catch (error) {
      console.error('❌ Token exchange failed:', error);
      throw error;
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(refreshToken, applicationSecret) {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Square-Version': this.apiVersion
        },
        body: JSON.stringify({
          client_id: this.applicationId,
          client_secret: applicationSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at
      };
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * CYBERMATE: Verify a customer made a purchase
   * Used for verified review badges
   */
  async verifyPurchase(accessToken, customerEmail, locationId, itemName = null, daysBack = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const response = await fetch(`${this.baseUrl}/v2/orders/search`, {
        method: 'POST',
        headers: {
          'Square-Version': this.apiVersion,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location_ids: [locationId],
          query: {
            filter: {
              date_time_filter: {
                created_at: {
                  start_at: startDate.toISOString(),
                  end_at: new Date().toISOString()
                }
              },
              state_filter: {
                states: ['COMPLETED'] // Only completed orders
              }
            }
          },
          limit: 100
        })
      });

      const data = await response.json();

      if (!data.orders || data.orders.length === 0) {
        return {
          verified: false,
          message: 'No orders found for this customer'
        };
      }

      // Search for customer email in orders
      const customerOrders = data.orders.filter(order => {
        // Check if order has customer email (may need customer API for this)
        return order.tenders && order.tenders.some(tender =>
          tender.customer_id || tender.card_details?.card?.cardholder_name
        );
      });

      // If specific item name provided, check if they ordered it
      let purchasedItem = null;
      if (itemName && customerOrders.length > 0) {
        purchasedItem = customerOrders.find(order =>
          order.line_items.some(item =>
            item.name.toLowerCase().includes(itemName.toLowerCase())
          )
        );
      }

      return {
        verified: customerOrders.length > 0,
        orderCount: customerOrders.length,
        mostRecentOrder: customerOrders[0]?.created_at,
        purchasedItem: !!purchasedItem,
        totalSpent: customerOrders.reduce((sum, order) =>
          sum + (order.total_money?.amount || 0), 0) / 100 // Convert cents to dollars
      };
    } catch (error) {
      console.error('❌ Purchase verification failed:', error);
      return {
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * CYBERCHECK: Submit order to Square POS
   * Used for digital menu ordering
   */
  async createOrder(accessToken, locationId, orderData) {
    try {
      const lineItems = orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity.toString(),
        base_price_money: {
          amount: Math.round(item.price * 100), // Convert dollars to cents
          currency: 'USD'
        },
        note: item.specialInstructions || ''
      }));

      const response = await fetch(`${this.baseUrl}/v2/orders`, {
        method: 'POST',
        headers: {
          'Square-Version': this.apiVersion,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order: {
            location_id: locationId,
            line_items: lineItems,
            metadata: {
              source: 'CyberCheck',
              customer_name: orderData.customerName || 'Guest',
              table_number: orderData.tableNumber || '',
              phone: orderData.phone || '',
              notes: orderData.notes || ''
            }
          },
          idempotency_key: this.generateIdempotencyKey()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Order creation failed');
      }

      const data = await response.json();

      console.log('✅ Order created successfully!');
      console.log('Order ID:', data.order.id);

      return {
        success: true,
        orderId: data.order.id,
        totalMoney: data.order.total_money,
        createdAt: data.order.created_at
      };
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      throw error;
    }
  }

  /**
   * Get menu items (catalog) from Square
   * Useful for syncing menus in CyberCheck
   */
  async getMenuItems(accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/v2/catalog/list?types=ITEM`, {
        method: 'GET',
        headers: {
          'Square-Version': this.apiVersion,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      return {
        items: data.objects || [],
        count: data.objects?.length || 0
      };
    } catch (error) {
      console.error('❌ Failed to fetch menu items:', error);
      throw error;
    }
  }

  /**
   * Get business location info
   */
  async getLocations(accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/v2/locations`, {
        method: 'GET',
        headers: {
          'Square-Version': this.apiVersion,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      return data.locations || [];
    } catch (error) {
      console.error('❌ Failed to fetch locations:', error);
      throw error;
    }
  }

  /**
   * Generate unique idempotency key for orders
   * Prevents duplicate orders if request is retried
   */
  generateIdempotencyKey() {
    return 'cybercheck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(expiresAt) {
    return new Date(expiresAt) <= new Date();
  }
}

// Initialize global instance
window.squareIntegration = new SquareIntegration();

console.log('✅ Square Integration loaded');
console.log('📝 Environment:', window.squareIntegration.environment);
console.log('🔗 Base URL:', window.squareIntegration.baseUrl);
