// Multi-Platform Reservation Manager
// Handles reservations via OpenTable, Phone, Email, Resy, and direct website booking
// NO user accounts required!

class ReservationManager {
  constructor() {
    this.currentBusiness = null;
  }

  // Show reservation modal for a business
  showReservationModal(business) {
    this.currentBusiness = business;

    if (!business.reservation) {
      this.showNoReservationMessage(business);
      return;
    }

    const modal = this.createReservationModal(business);
    document.body.appendChild(modal);

    // Animate in
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  createReservationModal(business) {
    const modal = document.createElement('div');
    modal.className = 'reservation-modal';
    modal.innerHTML = `
      <div class="reservation-overlay"></div>
      <div class="reservation-content">
        <button class="reservation-close" onclick="reservationManager.closeModal()">×</button>

        <div class="reservation-header">
          <h2>Reserve at ${business.name}</h2>
          <p class="reservation-subtitle">${business.location}</p>
        </div>

        <div class="reservation-body">
          ${this.generateReservationOptions(business)}
        </div>
      </div>
    `;

    // Close on overlay click
    modal.querySelector('.reservation-overlay').addEventListener('click', () => {
      this.closeModal();
    });

    return modal;
  }

  generateReservationOptions(business) {
    const res = business.reservation;
    let html = '<div class="reservation-options">';

    // OpenTable Widget
    if (res.method === 'opentable' || res.openTableId) {
      html += this.generateOpenTableOption(res.openTableId);
    }

    // Resy
    if (res.method === 'resy' || res.resyUrl) {
      html += this.generateResyOption(res.resyUrl);
    }

    // Direct Website Booking
    if (res.method === 'website' || res.website) {
      html += this.generateWebsiteOption(res.website);
    }

    // Phone Reservations
    if (res.method === 'phone' || res.phone) {
      html += this.generatePhoneOption(res.phone, business.name);
    }

    // Email Reservations
    if (res.method === 'email' || res.email) {
      html += this.generateEmailOption(res.email, business.name);
    }

    // Walk-in only
    if (res.method === 'walkin') {
      html += this.generateWalkInMessage();
    }

    html += '</div>';

    // Add helpful note
    html += `
      <div class="reservation-note">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 4v1h2V4H7zm0 2v6h2V6H7z"/>
        </svg>
        <span>No account required! Choose your preferred reservation method above.</span>
      </div>
    `;

    return html;
  }

  generateOpenTableOption(restaurantId) {
    return `
      <div class="reservation-option opentable">
        <div class="reservation-option-header">
          <div class="reservation-option-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
            </svg>
          </div>
          <div class="reservation-option-title">
            <h3>Book via OpenTable</h3>
            <p>Instant confirmation</p>
          </div>
        </div>
        <div id="opentable-widget-${restaurantId}" class="opentable-widget-container">
          <script type='text/javascript' src='//www.opentable.com/widget/reservation/loader?rid=${restaurantId}&type=standard&theme=standard&iframe=true&domain=com&lang=en-US&newtab=false&ot_source=Restaurant%20website'></script>
        </div>
      </div>
    `;
  }

  generateResyOption(resyUrl) {
    return `
      <div class="reservation-option resy">
        <div class="reservation-option-header">
          <div class="reservation-option-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            </svg>
          </div>
          <div class="reservation-option-title">
            <h3>Book via Resy</h3>
            <p>Instant confirmation</p>
          </div>
        </div>
        <a href="${resyUrl}" target="_blank" class="reservation-button resy-button">
          Open Resy to Book
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM5.5 7.5l2.5 2.5 3.5-3.5-1-1-2.5 2.5-1.5-1.5z"/>
          </svg>
        </a>
      </div>
    `;
  }

  generateWebsiteOption(websiteUrl) {
    return `
      <div class="reservation-option website">
        <div class="reservation-option-header">
          <div class="reservation-option-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div class="reservation-option-title">
            <h3>Book on Restaurant Website</h3>
            <p>Direct online booking</p>
          </div>
        </div>
        <a href="${websiteUrl}" target="_blank" class="reservation-button website-button">
          Go to Restaurant Website
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM2 12V3h12v9H2z"/>
            <path d="M4 5h8v1H4zm0 2h8v1H4zm0 2h5v1H4z"/>
          </svg>
        </a>
      </div>
    `;
  }

  generatePhoneOption(phone, businessName) {
    // Format phone for display
    const displayPhone = this.formatPhoneNumber(phone);
    const telLink = phone.replace(/\D/g, ''); // Remove non-digits for tel: link

    return `
      <div class="reservation-option phone">
        <div class="reservation-option-header">
          <div class="reservation-option-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </div>
          <div class="reservation-option-title">
            <h3>Call to Reserve</h3>
            <p>Speak directly with restaurant</p>
          </div>
        </div>
        <div class="phone-actions">
          <a href="tel:${telLink}" class="reservation-button phone-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            Call ${displayPhone}
          </a>
          <button onclick="reservationManager.sendSMS('${telLink}', '${businessName}')" class="reservation-button sms-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            Text to Reserve
          </button>
        </div>
      </div>
    `;
  }

  generateEmailOption(email, businessName) {
    return `
      <div class="reservation-option email">
        <div class="reservation-option-header">
          <div class="reservation-option-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <div class="reservation-option-title">
            <h3>Email to Reserve</h3>
            <p>Send reservation request</p>
          </div>
        </div>
        <button onclick="reservationManager.sendEmail('${email}', '${businessName}')" class="reservation-button email-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Send Email Reservation Request
        </button>
      </div>
    `;
  }

  generateWalkInMessage() {
    return `
      <div class="reservation-option walkin">
        <div class="reservation-option-header">
          <div class="reservation-option-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
            </svg>
          </div>
          <div class="reservation-option-title">
            <h3>Walk-In Only</h3>
            <p>This restaurant accepts walk-ins - no reservations needed!</p>
          </div>
        </div>
      </div>
    `;
  }

  sendSMS(phone, businessName) {
    const message = encodeURIComponent(`Hi! I'd like to make a reservation at ${businessName}. Please let me know available times. Thank you!`);
    window.open(`sms:${phone}?body=${message}`, '_self');
  }

  sendEmail(email, businessName) {
    const subject = encodeURIComponent(`Reservation Request for ${businessName}`);
    const body = encodeURIComponent(`Hello,

I would like to make a reservation at ${businessName}.

Preferred Date:
Preferred Time:
Party Size:
Name:
Phone:

Please let me know if this is available. Thank you!`);

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  }

  formatPhoneNumber(phone) {
    // Format phone as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone; // Return as-is if not 10 digits
  }

  showNoReservationMessage(business) {
    const modal = document.createElement('div');
    modal.className = 'reservation-modal';
    modal.innerHTML = `
      <div class="reservation-overlay"></div>
      <div class="reservation-content">
        <button class="reservation-close" onclick="reservationManager.closeModal()">×</button>

        <div class="reservation-header">
          <h2>${business.name}</h2>
        </div>

        <div class="reservation-body">
          <div class="reservation-note">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 4v1h2V4H7zm0 2v6h2V6H7z"/>
            </svg>
            <span>Reservation information not available for this business. Please call ${business.phone || 'the restaurant'} directly.</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      modal.classList.add('active');
    }, 10);

    modal.querySelector('.reservation-overlay').addEventListener('click', () => {
      this.closeModal();
    });
  }

  closeModal() {
    const modal = document.querySelector('.reservation-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }
}

// Initialize global instance
const reservationManager = new ReservationManager();
