// Signup Form Handler with Google Sheets Integration
// Gulf Coast Radar - Loyalty Signup System

// Google Sheets Web App URL
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby-TiV-cRzrT4i4PNqwrbm3zSY4F2WnefffbJzyRo9vY0huCb6LwtztE8wcxLE8mFtugw/exec';

// Alias function for compatibility
function openSignupModal() {
  openLoyaltySignup('loyalty-button');
}

// Open the signup modal
function openLoyaltySignup(source = 'home', autoOpen = false) {
  const modal = document.getElementById('loyaltySignupModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Track where signup was opened from (for analytics)
    const sourceInput = document.getElementById('signupSource');
    if (sourceInput) {
      sourceInput.value = source;
    }

    console.log('📱 Signup modal opened from:', source);
  } else {
    console.error('❌ Signup modal not found!');
  }
}

// Close the signup modal
function closeLoyaltySignup() {
  const modal = document.getElementById('loyaltySignupModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling

    // Reset form
    const form = document.getElementById('loyaltySignupForm');
    if (form) {
      form.reset();
    }

    // Clear any error messages
    clearSignupErrors();
  }
}

// Handle form submission
async function handleSignupSubmit(event) {
  event.preventDefault();

  console.log('📝 Processing signup form...');

  // Clear previous errors
  clearSignupErrors();

  // Get form data
  const form = event.target;
  const formData = new FormData(form);

  const signupData = {
    formType: 'Loyalty Signup Form',
    name: formData.get('name')?.trim() || '',
    phone: formData.get('phone')?.trim() || '',
    email: formData.get('email')?.trim() || '',
    zipCode: formData.get('zipCode')?.trim() || '',
    userType: formData.get('userType') || '',
    checkInDate: formData.get('checkInDate') || '',
    checkOutDate: formData.get('checkOutDate') || '',
    smsConsent: formData.get('smsConsent') === 'on' ? 'Yes' : 'No',
    source: formData.get('source') || 'home',
    interests: Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value).join(','),
    timestamp: new Date().toISOString(),
    url: window.location.href
  };

  // Validate required fields
  if (!signupData.name) {
    showSignupError('Please enter your name');
    return;
  }

  if (!signupData.phone) {
    showSignupError('Please enter your phone number');
    return;
  }

  // Validate phone format (basic US phone validation)
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(signupData.phone)) {
    showSignupError('Please enter a valid phone number');
    return;
  }

  // Validate user type
  if (!signupData.userType) {
    showSignupError('Please select whether you are a tourist, snowbird, or local');
    return;
  }

  // Validate dates for tourists and snowbirds
  if (signupData.userType !== 'local') {
    if (!signupData.checkInDate || !signupData.checkOutDate) {
      showSignupError('Please select your check-in and check-out dates');
      return;
    }

    // Validate check-out is after check-in
    const checkIn = new Date(signupData.checkInDate);
    const checkOut = new Date(signupData.checkOutDate);
    if (checkOut <= checkIn) {
      showSignupError('Check-out date must be after check-in date');
      return;
    }
  }

  // Validate at least one interest is selected
  if (!signupData.interests || signupData.interests.length === 0) {
    showSignupError('Please select at least one interest');
    return;
  }

  // Validate SMS consent
  if (signupData.smsConsent !== 'Yes') {
    showSignupError('Please agree to receive SMS messages to continue');
    return;
  }

  // Email validation (if provided)
  if (signupData.email && !isValidEmail(signupData.email)) {
    showSignupError('Please enter a valid email address');
    return;
  }

  // Show loading state
  showSignupLoading(true);

  try {
    // Submit to Google Sheets
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    // Note: With no-cors mode, we can't read the response
    // We assume success if no error is thrown
    console.log('✅ Signup submitted successfully');

    // Also save to localStorage as backup
    saveSignupToLocalStorage(signupData);

    // Show success message
    showSignupSuccess();

    // Close modal after 2 seconds
    setTimeout(() => {
      closeLoyaltySignup();
    }, 2000);

  } catch (error) {
    console.error('❌ Signup error:', error);
    showSignupError('There was an error submitting your signup. Please try again or call us directly.');

    // Save to localStorage as fallback
    saveSignupToLocalStorage(signupData);
  } finally {
    showSignupLoading(false);
  }
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show error message
function showSignupError(message) {
  const errorDiv = document.getElementById('signupError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

// Clear error messages
function clearSignupErrors() {
  const errorDiv = document.getElementById('signupError');
  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  const successDiv = document.getElementById('signupSuccess');
  if (successDiv) {
    successDiv.style.display = 'none';
  }
}

// Show success message
function showSignupSuccess() {
  const successDiv = document.getElementById('signupSuccess');
  if (successDiv) {
    successDiv.style.display = 'block';
  }

  const errorDiv = document.getElementById('signupError');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// Show/hide loading state
function showSignupLoading(isLoading) {
  const submitBtn = document.querySelector('#loyaltySignupForm button[type="submit"]');
  if (submitBtn) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up for Exclusive Deals';
    }
  }
}

// Save signup to localStorage as backup
function saveSignupToLocalStorage(signupData) {
  try {
    const existingSignups = JSON.parse(localStorage.getItem('gcr_signups') || '[]');
    existingSignups.push(signupData);
    localStorage.setItem('gcr_signups', JSON.stringify(existingSignups));
    console.log('💾 Signup saved to localStorage as backup');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Format phone number as user types
function formatPhoneNumber(input) {
  let value = input.value.replace(/\D/g, ''); // Remove non-digits

  if (value.length > 10) {
    value = value.slice(0, 10);
  }

  if (value.length >= 6) {
    input.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
  } else if (value.length >= 3) {
    input.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
  } else {
    input.value = value;
  }
}

// Initialize signup form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎁 Signup form handler initialized');

  // Close modal when clicking outside
  const modal = document.getElementById('loyaltySignupModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeLoyaltySignup();
      }
    });
  }

  // Handle form submission
  const form = document.getElementById('loyaltySignupForm');
  if (form) {
    form.addEventListener('submit', handleSignupSubmit);
  }

  // Format phone number on input
  const phoneInput = document.getElementById('signupPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => formatPhoneNumber(e.target));
  }

  // Handle ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLoyaltySignup();
    }
  });
});
