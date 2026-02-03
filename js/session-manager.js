// Session Manager - Handles user authentication state
// Used across the platform to check if user is logged in

class SessionManager {
  constructor() {
    this.currentUser = null;
    this.loadSession();
  }

  /**
   * Load current session from localStorage
   */
  loadSession() {
    const session = localStorage.getItem('gcr_user_session');
    if (session) {
      try {
        this.currentUser = JSON.parse(session);
      } catch (e) {
        console.error('Invalid session data:', e);
        this.clearSession();
      }
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return this.currentUser && this.currentUser.verified && this.currentUser.phone;
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current user's phone number
   */
  getPhone() {
    return this.currentUser ? this.currentUser.phone : null;
  }

  /**
   * Get current user's phone number (formatted)
   */
  getFormattedPhone() {
    if (!this.currentUser || !this.currentUser.phone) return '';

    // Remove +1 and format as (XXX) XXX-XXXX
    const digits = this.currentUser.phone.replace(/\D/g, '').slice(-10);
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  /**
   * Update user data in session
   */
  updateUser(updates) {
    if (!this.currentUser) return;

    this.currentUser = { ...this.currentUser, ...updates };
    localStorage.setItem('gcr_user_session', JSON.stringify(this.currentUser));
  }

  /**
   * Add order to user's order history
   */
  addOrderToHistory(order) {
    if (!this.currentUser) return;

    if (!this.currentUser.orderHistory) {
      this.currentUser.orderHistory = [];
    }

    this.currentUser.orderHistory.push({
      orderId: order.orderId,
      businessId: order.businessId,
      businessName: order.businessName,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt
    });

    localStorage.setItem('gcr_user_session', JSON.stringify(this.currentUser));
  }

  /**
   * Get user's order history
   */
  getOrderHistory() {
    return this.currentUser && this.currentUser.orderHistory ? this.currentUser.orderHistory : [];
  }

  /**
   * Clear session and log out
   */
  clearSession() {
    this.currentUser = null;
    localStorage.removeItem('gcr_user_session');
  }

  /**
   * Log out user
   */
  logout() {
    this.clearSession();
    window.location.href = 'phone-login.html';
  }

  /**
   * Require authentication - redirect to login if not logged in
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      // Save current page to return after login
      const currentPage = window.location.pathname + window.location.search;
      window.location.href = `phone-login.html?return=${encodeURIComponent(currentPage)}`;
    }
  }

  /**
   * Show user info in header (if logged in)
   */
  showUserInHeader() {
    if (!this.isLoggedIn()) return;

    // Find a good place to show user info (e.g., in header)
    const header = document.querySelector('header') || document.querySelector('.header');
    if (!header) return;

    // Create user info element
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.style.cssText = 'position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.9); padding: 10px 15px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 14px; display: flex; align-items: center; gap: 10px;';
    userInfo.innerHTML = `
      <span style="color: #2c3e50;">📱 ${this.getFormattedPhone()}</span>
      <button onclick="sessionManager.logout()" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-weight: 600; padding: 0;">Logout</button>
    `;

    header.style.position = 'relative';
    header.appendChild(userInfo);
  }
}

// Create global instance
window.sessionManager = new SessionManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}
