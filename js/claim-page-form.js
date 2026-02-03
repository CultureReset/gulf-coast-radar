// Claim Page Form Handler for Gulf Coast Radar
// Allows business owners to claim their profile

// Google Sheets Web App URL for claim submissions
const CLAIM_PAGE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby-TiV-cRzrT4i4PNqwrbm3zSY4F2WnefffbJzyRo9vY0huCb6LwtztE8wcxLE8mFtugw/exec';

// Open claim page modal
function openClaimPageModal() {
  const modal = document.getElementById('claimPageModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Pre-fill business name if available
    const businessNameInput = document.getElementById('claim-business-name');
    if (businessNameInput && currentBusiness) {
      businessNameInput.value = currentBusiness.name || '';
      businessNameInput.readOnly = true;
    }

    console.log('📋 Claim Page modal opened');
  } else {
    console.error('❌ Claim Page modal not found');
  }
}

// Close claim page modal
function closeClaimPageModal() {
  const modal = document.getElementById('claimPageModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';

    // Reset form
    const form = document.getElementById('claimPageForm');
    if (form) {
      form.reset();
    }

    console.log('✅ Claim Page modal closed');
  }
}

// Handle claim page form submission
async function handleClaimPageSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    // Get form data
    const formData = new FormData(form);
    const claimData = {
      formType: 'Claim Page Form',
      businessName: formData.get('businessName')?.trim() || '',
      ownerName: formData.get('ownerName')?.trim() || '',
      phone: formData.get('phone')?.trim() || '',
      email: formData.get('email')?.trim() || '',
      message: formData.get('message')?.trim() || '',
      businessId: currentBusiness?.id || '',
      businessUrl: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Validate required fields
    if (!claimData.businessName || !claimData.ownerName || !claimData.phone || !claimData.email) {
      throw new Error('Please fill in all required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(claimData.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate phone format (basic US phone validation)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(claimData.phone)) {
      throw new Error('Please enter a valid phone number');
    }

    console.log('📤 Submitting claim request:', claimData);

    // Submit to Google Sheets
    const response = await fetch(CLAIM_PAGE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(claimData)
    });

    // Since we're using no-cors, we can't read the response
    // Assume success after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Claim request submitted successfully');

    // Show success message
    showClaimSuccessMessage();

    // Close modal after 2 seconds
    setTimeout(() => {
      closeClaimPageModal();
    }, 2000);

  } catch (error) {
    console.error('❌ Error submitting claim request:', error);

    // Show error message
    showClaimErrorMessage(error.message);

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
}

// Show success message
function showClaimSuccessMessage() {
  const form = document.getElementById('claimPageForm');
  if (!form) return;

  const existingMsg = form.querySelector('.claim-form-message');
  if (existingMsg) {
    existingMsg.remove();
  }

  const successMsg = document.createElement('div');
  successMsg.className = 'claim-form-message claim-success';
  successMsg.innerHTML = `
    <div style="text-align: center; padding: 20px; background: #10B981; color: white; border-radius: 12px; margin-top: 20px;">
      <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
      <h3 style="margin: 0 0 10px 0; font-size: 20px;">Claim Request Submitted!</h3>
      <p style="margin: 0; font-size: 14px;">We'll review your request and contact you within 1-2 business days.</p>
    </div>
  `;

  form.appendChild(successMsg);
}

// Show error message
function showClaimErrorMessage(errorText) {
  const form = document.getElementById('claimPageForm');
  if (!form) return;

  const existingMsg = form.querySelector('.claim-form-message');
  if (existingMsg) {
    existingMsg.remove();
  }

  const errorMsg = document.createElement('div');
  errorMsg.className = 'claim-form-message claim-error';
  errorMsg.innerHTML = `
    <div style="text-align: center; padding: 15px; background: #EF4444; color: white; border-radius: 12px; margin-top: 20px;">
      <div style="font-size: 32px; margin-bottom: 5px;">⚠️</div>
      <p style="margin: 0; font-size: 14px;">${errorText}</p>
    </div>
  `;

  form.appendChild(errorMsg);

  // Remove error message after 5 seconds
  setTimeout(() => {
    errorMsg.remove();
  }, 5000);
}

// Initialize form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('claimPageForm');
  if (form) {
    form.addEventListener('submit', handleClaimPageSubmit);
    console.log('✅ Claim Page form handler initialized');
  }

  // Close modal when clicking outside
  const modal = document.getElementById('claimPageModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeClaimPageModal();
      }
    });
  }
});

// Format phone number as user types (optional enhancement)
document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('claim-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
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
  }
});
