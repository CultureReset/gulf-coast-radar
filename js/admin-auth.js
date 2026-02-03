// Admin Authentication System
// Password protection for AR Hunt admin dashboard

class AdminAuth {
  constructor(options = {}) {
    this.storageKey = 'gcr_admin_auth';
    this.sessionKey = 'gcr_admin_session';
    this.requireAuth = options.requireAuth !== false; // Default true
    this.redirectToLogin = options.redirectToLogin !== false; // Default true

    if (this.requireAuth) {
      this.init();
    }
  }

  init() {
    // Check if authenticated this session
    if (!this.isAuthenticated() && this.redirectToLogin) {
      // Redirect to login page if not authenticated
      if (!window.location.pathname.includes('admin.html')) {
        window.location.href = 'admin.html';
      }
    }
  }

  // Check if admin password is set
  isPasswordSet() {
    const auth = localStorage.getItem(this.storageKey);
    return auth !== null;
  }

  // Check if currently authenticated (this session)
  isAuthenticated() {
    const session = sessionStorage.getItem(this.sessionKey);
    return session === 'authenticated';
  }

  // Hash password (simple hash for client-side)
  hashPassword(password) {
    // Simple hash - in production you'd use a better method
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Set admin password (first time setup)
  setPassword(password) {
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const hashed = this.hashPassword(password);
    localStorage.setItem(this.storageKey, hashed);

    return { success: true };
  }

  // Verify password
  verifyPassword(password) {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return false;

    const hashed = this.hashPassword(password);
    return hashed === stored;
  }

  // Login
  login(password) {
    if (!this.isPasswordSet()) {
      // First time setup
      const result = this.setPassword(password);
      if (result.success) {
        sessionStorage.setItem(this.sessionKey, 'authenticated');
        return { success: true, firstTime: true };
      }
      return result;
    }

    // Verify existing password
    if (this.verifyPassword(password)) {
      sessionStorage.setItem(this.sessionKey, 'authenticated');
      return { success: true };
    }

    return { success: false, error: 'Incorrect password' };
  }

  // Logout
  logout() {
    sessionStorage.removeItem(this.sessionKey);
    window.location.reload();
  }

  // Change password
  changePassword(oldPassword, newPassword) {
    if (!this.verifyPassword(oldPassword)) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    const hashed = this.hashPassword(newPassword);
    localStorage.setItem(this.storageKey, hashed);

    return { success: true };
  }

  // Show login modal
  showLoginModal() {
    const isFirstTime = !this.isPasswordSet();

    const modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.className = 'admin-login-modal';
    modal.innerHTML = `
      <div class="login-modal-content">
        <div class="login-header">
          <div class="login-icon">🔒</div>
          <h2>${isFirstTime ? 'Set Admin Password' : 'Admin Login Required'}</h2>
          <p>${isFirstTime ? 'Create a password to protect your admin dashboard' : 'Enter your password to access the dashboard'}</p>
        </div>

        <form id="admin-login-form" class="login-form">
          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              id="admin-password"
              placeholder="${isFirstTime ? 'Create password (min 6 characters)' : 'Enter your password'}"
              required
              minlength="6"
              autofocus
            >
          </div>

          ${isFirstTime ? `
            <div class="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                id="admin-password-confirm"
                placeholder="Confirm password"
                required
                minlength="6"
              >
            </div>
          ` : ''}

          <div id="login-error" class="login-error" style="display: none;"></div>

          <button type="submit" class="btn-login">
            ${isFirstTime ? '🔒 Set Password' : '🔓 Login'}
          </button>

          ${!isFirstTime ? `
            <div class="login-help">
              <p>Forgot your password? You'll need to clear browser data or contact support.</p>
            </div>
          ` : ''}
        </form>

        ${!isFirstTime ? `
          <div class="login-footer">
            <a href="index.html" class="btn-back-to-site">← Back to Site</a>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(modal);

    // Setup form handler
    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin(isFirstTime);
    });
  }

  handleLogin(isFirstTime) {
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');

    if (isFirstTime) {
      const confirmPassword = document.getElementById('admin-password-confirm').value;

      if (password !== confirmPassword) {
        this.showError('Passwords do not match');
        return;
      }
    }

    const result = this.login(password);

    if (result.success) {
      // Remove modal and show dashboard
      document.getElementById('admin-login-modal').remove();

      if (result.firstTime) {
        alert('✅ Admin password set successfully!\n\nIMPORTANT: Remember this password. You\'ll need it every time you access the admin dashboard.\n\nYour password is stored securely in your browser.');
      }
    } else {
      this.showError(result.error || 'Login failed');
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Shake animation
    errorDiv.style.animation = 'shake 0.5s';
    setTimeout(() => {
      errorDiv.style.animation = '';
    }, 500);
  }

  // Show change password modal
  showChangePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'admin-login-modal';
    modal.innerHTML = `
      <div class="login-modal-content" style="max-width: 400px;">
        <div class="login-header">
          <h2>🔑 Change Password</h2>
        </div>

        <form id="change-password-form" class="login-form">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" id="current-password" required>
          </div>

          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="new-password" required minlength="6">
          </div>

          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" id="confirm-new-password" required minlength="6">
          </div>

          <div id="change-error" class="login-error" style="display: none;"></div>

          <div style="display: flex; gap: 12px;">
            <button type="submit" class="btn-login">Change Password</button>
            <button type="button" class="btn-cancel" onclick="this.closest('.admin-login-modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('change-password-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const current = document.getElementById('current-password').value;
      const newPass = document.getElementById('new-password').value;
      const confirm = document.getElementById('confirm-new-password').value;

      if (newPass !== confirm) {
        const errorDiv = document.getElementById('change-error');
        errorDiv.textContent = 'New passwords do not match';
        errorDiv.style.display = 'block';
        return;
      }

      const result = this.changePassword(current, newPass);

      if (result.success) {
        modal.remove();
        alert('✅ Password changed successfully!');
      } else {
        const errorDiv = document.getElementById('change-error');
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
      }
    });
  }

  // Add logout button to page
  addLogoutButton() {
    const header = document.querySelector('.admin-header-actions');
    if (!header) return;

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn-secondary';
    logoutBtn.innerHTML = '🔒 Logout';
    logoutBtn.onclick = () => {
      if (confirm('Are you sure you want to logout?')) {
        this.logout();
      }
    };

    const changePassBtn = document.createElement('button');
    changePassBtn.className = 'btn-secondary';
    changePassBtn.innerHTML = '🔑 Change Password';
    changePassBtn.onclick = () => this.showChangePasswordModal();

    header.insertBefore(changePassBtn, header.firstChild);
    header.appendChild(logoutBtn);
  }

  // Protect admin page - redirect if not authenticated
  protectPage() {
    if (!this.isAuthenticated()) {
      window.location.href = 'admin.html';
    }
  }
}

// Note: AdminAuth should be instantiated manually on each page
// For login page: new AdminAuth({ requireAuth: false })
// For admin pages: new AdminAuth() - will auto-redirect if not authenticated
