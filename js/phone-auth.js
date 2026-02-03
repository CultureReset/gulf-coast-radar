// Phone Authentication System
// Uses Twilio SMS for verification (mock mode for testing)

class PhoneAuth {
  constructor() {
    this.phone = null;
    this.verificationCode = null;
    this.resendTimer = null;
    this.resendSeconds = 30;

    // Check if already logged in
    this.checkExistingSession();

    // Setup phone input formatting
    this.setupPhoneInput();
  }

  /**
   * Check if user already has a valid session
   */
  checkExistingSession() {
    const session = localStorage.getItem('gcr_user_session');
    if (session) {
      try {
        const userData = JSON.parse(session);
        if (userData.verified && userData.phone) {
          // User is already logged in, redirect to home
          const returnUrl = new URLSearchParams(window.location.search).get('return') || 'index.html';
          window.location.href = returnUrl;
        }
      } catch (e) {
        // Invalid session, clear it
        localStorage.removeItem('gcr_user_session');
      }
    }
  }

  /**
   * Setup phone input with auto-formatting
   */
  setupPhoneInput() {
    const phoneInput = document.getElementById('phoneInput');

    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

      // Format as (XXX) XXX-XXXX
      if (value.length > 0) {
        if (value.length <= 3) {
          value = `(${value}`;
        } else if (value.length <= 6) {
          value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
          value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
      }

      e.target.value = value;
    });

    // Handle enter key
    phoneInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendVerificationCode();
      }
    });
  }

  /**
   * Extract clean phone number (digits only)
   */
  getCleanPhone() {
    const phoneInput = document.getElementById('phoneInput');
    return phoneInput.value.replace(/\D/g, '');
  }

  /**
   * Validate phone number
   */
  validatePhone(phone) {
    // Must be exactly 10 digits
    return /^\d{10}$/.test(phone);
  }

  /**
   * Send verification code via SMS
   */
  async sendVerificationCode() {
    const cleanPhone = this.getCleanPhone();

    // Validate
    if (!this.validatePhone(cleanPhone)) {
      this.showError('Please enter a valid 10-digit phone number');
      return;
    }

    // Format as E.164 (US numbers)
    this.phone = `+1${cleanPhone}`;

    // Show loading
    const btn = document.getElementById('sendCodeBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span>Sending...';

    try {
      // Generate 6-digit code
      this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Send SMS via Twilio (MOCK for now)
      await this.sendSMS(this.phone, `Your Gulf Coast Radar verification code is: ${this.verificationCode}`);

      // Show success and move to step 2
      this.showSuccess('Verification code sent!');

      // Display phone number
      document.getElementById('displayPhone').textContent = document.getElementById('phoneInput').value;

      // Show step 2
      window.showStep('step2');

      // Focus first code input
      document.getElementById('code1').focus();

      // Start resend timer
      this.startResendTimer();

      // Log for testing (REMOVE IN PRODUCTION)
      console.log('🔐 TEST MODE: Verification code is', this.verificationCode);

    } catch (error) {
      console.error('Error sending verification code:', error);
      this.showError('Failed to send verification code. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Continue';
    }
  }

  /**
   * Send SMS via Twilio (MOCK implementation)
   */
  async sendSMS(to, message) {
    // MOCK: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Replace with actual Twilio API call
    // const response = await fetch('/api/send-sms', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, message })
    // });

    console.log(`📱 SMS sent to ${to}: ${message}`);
    return { success: true };
  }

  /**
   * Verify the entered code
   */
  async verifyCode() {
    // Get entered code
    const code = this.getEnteredCode();

    if (code.length !== 6) {
      this.showError('Please enter the complete 6-digit code');
      return;
    }

    // Show loading
    const btn = document.getElementById('verifyCodeBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span>Verifying...';

    try {
      // Verify code
      if (code === this.verificationCode) {
        // Success! Create session
        const userData = {
          phone: this.phone,
          verified: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          orderHistory: []
        };

        // Save session
        localStorage.setItem('gcr_user_session', JSON.stringify(userData));

        // Show success
        window.showStep('step3');

        // Redirect after 1.5 seconds
        setTimeout(() => {
          const returnUrl = new URLSearchParams(window.location.search).get('return') || 'index.html';
          window.location.href = returnUrl;
        }, 1500);

      } else {
        // Wrong code
        this.showError('Invalid verification code. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Verify & Sign In';

        // Clear code inputs
        for (let i = 1; i <= 6; i++) {
          document.getElementById(`code${i}`).value = '';
        }
        document.getElementById('code1').focus();
      }

    } catch (error) {
      console.error('Error verifying code:', error);
      this.showError('Verification failed. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Verify & Sign In';
    }
  }

  /**
   * Get entered verification code
   */
  getEnteredCode() {
    let code = '';
    for (let i = 1; i <= 6; i++) {
      code += document.getElementById(`code${i}`).value;
    }
    return code;
  }

  /**
   * Start resend timer countdown
   */
  startResendTimer() {
    this.resendSeconds = 30;
    const countdownEl = document.getElementById('resendCountdown');

    this.resendTimer = setInterval(() => {
      this.resendSeconds--;

      if (this.resendSeconds > 0) {
        countdownEl.textContent = `Wait ${this.resendSeconds}s`;
      } else {
        clearInterval(this.resendTimer);
        countdownEl.innerHTML = '<a href="#" onclick="phoneAuth.sendVerificationCode(); return false;" style="color: #667eea; text-decoration: underline;">Resend code</a>';
      }
    }, 1000);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    successEl.textContent = message;
    successEl.style.display = 'block';

    setTimeout(() => {
      successEl.style.display = 'none';
    }, 3000);
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';

    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }
}

// Global functions for button clicks
window.sendVerificationCode = function() {
  window.phoneAuth.sendVerificationCode();
};

window.verifyCode = function() {
  window.phoneAuth.verifyCode();
};

window.showStep = function(stepId) {
  // Hide all steps
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('active');
  });

  // Show requested step
  document.getElementById(stepId).classList.add('active');
};

// Handle code input navigation
window.handleCodeInput = function(event, position) {
  const input = event.target;
  const value = input.value;

  // Only allow digits
  if (value && !/^\d$/.test(value)) {
    input.value = '';
    return;
  }

  // Move to next input if digit entered
  if (value && position < 6) {
    document.getElementById(`code${position + 1}`).focus();
  }

  // Handle backspace
  if (event.key === 'Backspace' && !value && position > 1) {
    document.getElementById(`code${position - 1}`).focus();
  }

  // Auto-submit when all 6 digits entered
  if (position === 6 && value) {
    const code = window.phoneAuth.getEnteredCode();
    if (code.length === 6) {
      window.phoneAuth.verifyCode();
    }
  }
};

// Handle paste for verification code
window.handlePaste = function(event) {
  event.preventDefault();
  const paste = (event.clipboardData || window.clipboardData).getData('text');
  const digits = paste.replace(/\D/g, '').slice(0, 6);

  // Fill in the digits
  for (let i = 0; i < digits.length && i < 6; i++) {
    document.getElementById(`code${i + 1}`).value = digits[i];
  }

  // Focus last filled input
  if (digits.length > 0) {
    document.getElementById(`code${Math.min(digits.length, 6)}`).focus();
  }

  // Auto-submit if 6 digits
  if (digits.length === 6) {
    window.phoneAuth.verifyCode();
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.phoneAuth = new PhoneAuth();
});
