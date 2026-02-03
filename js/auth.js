// ============================================
// CyberCheck - Authentication JavaScript
// ============================================

const API_BASE_URL = 'http://localhost:3000/api';

// ============================================
// TOKEN MANAGEMENT
// ============================================

const AuthManager = {
  /**
   * Store authentication token and user data
   */
  setAuth(token, user, business, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('auth_token', token);
    storage.setItem('user_data', JSON.stringify({ user, business }));
  },

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  },

  /**
   * Get stored user data
   */
  getUserData() {
    const data = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  /**
   * Clear authentication data
   */
  clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }
};

// ============================================
// UI HELPERS
// ============================================

function showError(message) {
  // Check if error container exists
  let errorContainer = document.querySelector('.auth-error');
  if (!errorContainer) {
    // Create error container
    const form = document.querySelector('.auth-form');
    if (form) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'auth-error';
      form.insertBefore(errorContainer, form.firstChild);
    }
  }

  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    errorContainer.style.padding = '12px';
    errorContainer.style.marginBottom = '16px';
    errorContainer.style.backgroundColor = '#fee';
    errorContainer.style.border = '1px solid #fcc';
    errorContainer.style.borderRadius = '8px';
    errorContainer.style.color = '#c00';
  } else {
    alert(message);
  }
}

function hideError() {
  const errorContainer = document.querySelector('.auth-error');
  if (errorContainer) {
    errorContainer.style.display = 'none';
  }
}

function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = loadingText;
    button.disabled = true;
  } else {
    button.innerHTML = button.dataset.originalText || button.innerHTML;
    button.disabled = false;
  }
}

// ============================================
// PASSWORD UTILITIES
// ============================================

// Password toggle visibility
const passwordToggles = document.querySelectorAll('.password-toggle');
passwordToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const input = toggle.previousElementSibling;
    if (input && input.type === 'password') {
      input.type = 'text';
      toggle.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      `;
    } else if (input) {
      input.type = 'password';
      toggle.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      `;
    }
  });
});

// Password strength indicator
const passwordInput = document.getElementById('password');
if (passwordInput && document.getElementById('registerForm')) {
  const strengthBar = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');

  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);

    if (!strengthBar || !strengthText) return;

    // Remove previous classes
    strengthBar.classList.remove('weak', 'medium', 'strong');

    if (password.length === 0) {
      strengthBar.style.width = '0%';
      strengthText.textContent = '';
      return;
    }

    if (strength < 40) {
      strengthBar.classList.add('weak');
      strengthText.textContent = 'Weak password';
      strengthText.style.color = 'var(--error)';
    } else if (strength < 70) {
      strengthBar.classList.add('medium');
      strengthText.textContent = 'Medium password';
      strengthText.style.color = 'var(--warning)';
    } else {
      strengthBar.classList.add('strong');
      strengthText.textContent = 'Strong password';
      strengthText.style.color = 'var(--success)';
    }
  });
}

function calculatePasswordStrength(password) {
  let strength = 0;

  // Length
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;

  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 15;

  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 15;

  // Contains numbers
  if (/[0-9]/.test(password)) strength += 15;

  // Contains special characters
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

  return strength;
}

// ============================================
// LOGIN FORM
// ============================================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = loginForm.querySelector('#email').value;
    const password = loginForm.querySelector('#password').value;
    const remember = loginForm.querySelector('input[name="remember"]')?.checked || false;
    const submitButton = loginForm.querySelector('button[type="submit"]');

    try {
      setButtonLoading(submitButton, true, 'Logging in...');

      const response = await AuthManager.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success) {
        // Store authentication data
        AuthManager.setAuth(
          response.data.token,
          response.data.user,
          response.data.business,
          remember
        );

        console.log('Login successful:', response.data.user.email);

        // Redirect to dashboard
        window.location.href = '../../pages/dashboard/overview.html';
      } else {
        showError(response.error || 'Login failed');
        setButtonLoading(submitButton, false);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'Login failed. Please try again.');
      setButtonLoading(submitButton, false);
    }
  });
}

// ============================================
// REGISTER FORM
// ============================================

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const fullName = registerForm.querySelector('#fullName').value;
    const email = registerForm.querySelector('#email').value;
    const phone = registerForm.querySelector('#phone')?.value;
    const password = registerForm.querySelector('#password').value;
    const businessName = registerForm.querySelector('#businessName')?.value || fullName + "'s Business";
    const businessType = registerForm.querySelector('#businessType')?.value || 'restaurant';
    const termsAccepted = registerForm.querySelector('input[name="terms"]')?.checked;

    if (termsAccepted === false) {
      showError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');

    try {
      setButtonLoading(submitButton, true, 'Creating account...');

      // Prepare signup data
      const signupData = {
        email,
        password,
        full_name: fullName,
        business_name: businessName,
        business_type: businessType,
        industry: businessType === 'restaurant' ? 'food_beverage' : 'other'
      };

      // Only include phone if provided
      if (phone && phone.trim()) {
        signupData.phone = phone.trim();
      }

      const response = await AuthManager.apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData)
      });

      if (response.success) {
        // Store authentication data
        AuthManager.setAuth(
          response.data.token,
          response.data.user,
          response.data.business,
          true // Remember user on registration
        );

        console.log('Registration successful:', response.data.user.email);

        // Redirect to dashboard
        window.location.href = '../dashboard/overview.html';
      } else {
        showError(response.error || 'Registration failed');
        setButtonLoading(submitButton, false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError(error.message || 'Registration failed. Please try again.');
      setButtonLoading(submitButton, false);
    }
  });
}

// ============================================
// FORGOT PASSWORD FORM
// ============================================

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = forgotPasswordForm.querySelector('#email').value;
    const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');

    try {
      setButtonLoading(submitButton, true, 'Sending...');

      const response = await AuthManager.apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (response.success) {
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'auth-success';
        successDiv.textContent = 'Password reset link sent! Check your email.';
        successDiv.style.padding = '12px';
        successDiv.style.marginBottom = '16px';
        successDiv.style.backgroundColor = '#efe';
        successDiv.style.border = '1px solid #cfc';
        successDiv.style.borderRadius = '8px';
        successDiv.style.color = '#060';
        forgotPasswordForm.insertBefore(successDiv, forgotPasswordForm.firstChild);

        forgotPasswordForm.reset();
        setButtonLoading(submitButton, false);
      } else {
        showError(response.error || 'Failed to send reset link');
        setButtonLoading(submitButton, false);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showError(error.message || 'Failed to send reset link. Please try again.');
      setButtonLoading(submitButton, false);
    }
  });
}

// ============================================
// SOCIAL AUTH BUTTONS
// ============================================

const socialButtons = document.querySelectorAll('.btn-social');
socialButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const provider = button.id.replace('Login', '').replace('Signup', '');
    console.log(`Social auth with ${provider}`);

    // TODO: Implement actual social auth
    alert(`${provider} authentication coming soon!`);
  });
});

// ============================================
// PHONE FORMATTING
// ============================================

// Phone formatting removed - using E.164 format (+1234567890) for register form
// The backend strips non-digits during signup processing

// ============================================
// EMAIL VALIDATION
// ============================================

const emailInputs = document.querySelectorAll('input[type="email"]');
emailInputs.forEach(input => {
  input.addEventListener('blur', () => {
    const email = input.value;
    if (email && !isValidEmail(email)) {
      input.setCustomValidity('Please enter a valid email address');
      input.reportValidity();
    } else {
      input.setCustomValidity('');
    }
  });
});

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ============================================
// PAGE INITIALIZATION
// ============================================

// Auto-focus first input on page load
document.addEventListener('DOMContentLoaded', () => {
  const firstInput = document.querySelector('.auth-form input:not([type="hidden"])');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }

  // Redirect if already logged in
  if (AuthManager.isAuthenticated()) {
    const currentPage = window.location.pathname;
    if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
      window.location.href = '../../pages/dashboard/overview.html';
    }
  }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K to focus search (if exists)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.focus();
    }
  }
});

// ============================================
// EXPORT FOR USE IN OTHER SCRIPTS
// ============================================

// Make AuthManager available globally
window.AuthManager = AuthManager;

// Console message
console.log('%cCyberCheck Auth', 'font-size: 16px; font-weight: bold; color: #4DA6FF;');
console.log('Using secure authentication. All data is encrypted.');
