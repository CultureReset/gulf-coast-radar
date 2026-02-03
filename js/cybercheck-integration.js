/**
 * CyberCheck Integration for Gulf Coast Radar
 *
 * This file enables GCR to fetch business profiles from CyberCheck API
 * IMPORTANT: GCR header, navigation, and footer ALWAYS stay visible
 * User NEVER leaves gulfcoastradar.com domain
 */

const CYBERCHECK_API_URL = 'https://cybercheckinc.com/api/gcr';

/**
 * Fetch business profile from CyberCheck
 * Falls back to local data.js if not available or not GCR-enabled
 */
async function loadBusinessFromCyberCheck(businessId) {
  try {
    console.log(`🔍 Checking CyberCheck for business: ${businessId}`);

    const response = await fetch(`${CYBERCHECK_API_URL}/profile/${businessId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('❌ CyberCheck API returned error, using local data');
      return null;
    }

    const data = await response.json();

    if (data.success && data.business && data.business.gcr_enabled) {
      console.log('✅ CyberCheck profile found and GCR enabled!');
      return data.business;
    } else {
      console.log('⚠️ Business not GCR-enabled, using local data');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching from CyberCheck:', error);
    return null;
  }
}

/**
 * Display CyberCheck profile on GCR
 * IMPORTANT: GCR header stays visible!
 */
function displayCyberCheckProfile(cyberCheckBusiness) {
  console.log('📝 Displaying CyberCheck profile on GCR');

  // Update basic info
  document.getElementById('business-name').textContent = cyberCheckBusiness.name || '';
  document.getElementById('business-subtitle').textContent = cyberCheckBusiness.subtitle || '';

  const descEl = document.getElementById('business-description');
  if (descEl) {
    descEl.textContent = cyberCheckBusiness.description || '';
  }

  // Update cover image if available
  if (cyberCheckBusiness.cover_image) {
    const coverEl = document.getElementById('profile-cover-image');
    if (coverEl) {
      coverEl.src = cyberCheckBusiness.cover_image;
    }
  }

  // Update profile image if available
  if (cyberCheckBusiness.profile_image) {
    const profileEl = document.getElementById('profile-image');
    if (profileEl) {
      profileEl.src = cyberCheckBusiness.profile_image;
    }
  }

  // Display contact details
  if (cyberCheckBusiness.details) {
    displayCyberCheckContactDetails(cyberCheckBusiness.details);
  }

  // Display hours of operation
  if (cyberCheckBusiness.hours) {
    displayCyberCheckHours(cyberCheckBusiness.hours);
  }

  // Display photo gallery
  if (cyberCheckBusiness.photos && cyberCheckBusiness.photos.length > 0) {
    displayCyberCheckGallery(cyberCheckBusiness.photos);
  }

  // Display coupons
  if (cyberCheckBusiness.coupons && cyberCheckBusiness.coupons.length > 0) {
    displayCyberCheckCoupons(cyberCheckBusiness.coupons);
  }

  // Add badge showing this is powered by CyberCheck
  addCyberCheckBadge(cyberCheckBusiness.id);
}

/**
 * Display contact details from CyberCheck
 */
function displayCyberCheckContactDetails(details) {
  // Phone
  if (details.phone && details.phone.value) {
    const phoneEl = document.getElementById('business-phone');
    if (phoneEl) {
      phoneEl.textContent = details.phone.value;
      phoneEl.href = `tel:${details.phone.value}`;
    }
  }

  // Email
  if (details.email && details.email.value) {
    const emailEl = document.getElementById('business-email');
    if (emailEl) {
      emailEl.textContent = details.email.value;
      emailEl.href = `mailto:${details.email.value}`;
    }
  }

  // Address
  if (details.address && details.address.value) {
    const addressEl = document.getElementById('business-address');
    if (addressEl) {
      addressEl.textContent = details.address.value;
    }
  }

  // Website
  if (details.website && details.website.value) {
    const websiteEl = document.getElementById('business-website');
    if (websiteEl) {
      websiteEl.href = details.website.value;
      websiteEl.textContent = 'Visit Website';
    }
  }
}

/**
 * Display hours of operation from CyberCheck
 */
function displayCyberCheckHours(hours) {
  const hoursContainer = document.getElementById('business-hours');
  if (!hoursContainer) return;

  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  let hoursHTML = '<div class="hours-list">';

  daysOrder.forEach(day => {
    if (hours[day]) {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      const dayHours = hours[day];

      if (dayHours.is_closed) {
        hoursHTML += `
          <div class="hours-row">
            <span class="hours-day">${dayName}</span>
            <span class="hours-time closed">Closed</span>
          </div>
        `;
      } else {
        hoursHTML += `
          <div class="hours-row">
            <span class="hours-day">${dayName}</span>
            <span class="hours-time">${dayHours.open} - ${dayHours.close}</span>
          </div>
        `;
      }
    }
  });

  hoursHTML += '</div>';
  hoursContainer.innerHTML = hoursHTML;
}

/**
 * Display photo gallery from CyberCheck
 */
function displayCyberCheckGallery(photos) {
  const galleryContainer = document.getElementById('business-gallery');
  if (!galleryContainer) return;

  let galleryHTML = '<div class="photo-grid">';

  photos.forEach((photo, index) => {
    galleryHTML += `
      <div class="photo-item" onclick="openPhotoModal(${index})">
        <img src="${photo}" alt="Photo ${index + 1}" loading="lazy">
      </div>
    `;
  });

  galleryHTML += '</div>';
  galleryContainer.innerHTML = galleryHTML;

  // Store photos globally for modal
  window.currentGalleryPhotos = photos;
}

/**
 * Display coupons from CyberCheck
 */
function displayCyberCheckCoupons(coupons) {
  const couponsContainer = document.getElementById('business-coupons');
  if (!couponsContainer) return;

  let couponsHTML = '<div class="coupons-grid">';

  coupons.forEach(coupon => {
    const expiryDate = new Date(coupon.expiry_date);
    const formattedDate = expiryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    couponsHTML += `
      <div class="coupon-card">
        <div class="coupon-code">${coupon.code}</div>
        <div class="coupon-title">${coupon.title}</div>
        <div class="coupon-description">${coupon.description}</div>
        <div class="coupon-discount">
          ${coupon.discount_type === 'percentage' ? coupon.discount + '% OFF' : '$' + coupon.discount + ' OFF'}
        </div>
        <div class="coupon-expiry">Expires: ${formattedDate}</div>
      </div>
    `;
  });

  couponsHTML += '</div>';
  couponsContainer.innerHTML = couponsHTML;
}

/**
 * Add badge showing profile is powered by CyberCheck
 */
function addCyberCheckBadge(businessId) {
  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) return;

  // Only add badge if it doesn't exist
  if (document.getElementById('cybercheck-badge')) return;

  const badge = document.createElement('div');
  badge.id = 'cybercheck-badge';
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    cursor: pointer;
  `;
  badge.innerHTML = '⚡ Powered by CyberCheck';
  badge.onclick = () => {
    window.open(`https://cybercheckinc.com/${businessId}`, '_blank');
  };

  document.body.appendChild(badge);
}

/**
 * Main integration function
 * Call this from profile.js to enable CyberCheck integration
 */
async function initCyberCheckIntegration(businessId) {
  console.log('🚀 Initializing CyberCheck integration for:', businessId);

  // Try to fetch from CyberCheck
  const cyberCheckBusiness = await loadBusinessFromCyberCheck(businessId);

  if (cyberCheckBusiness) {
    // Display CyberCheck profile (GCR header stays!)
    displayCyberCheckProfile(cyberCheckBusiness);
    return true;
  } else {
    // Fall back to local data.js
    console.log('📂 Using local GCR data');
    return false;
  }
}

/**
 * Search CyberCheck for profiles (useful for linking musicians to events)
 */
async function searchCyberCheckProfiles(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${CYBERCHECK_API_URL}/search?${queryString}`);

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    return data.success ? data.results : [];
  } catch (error) {
    console.error('Error searching CyberCheck:', error);
    return [];
  }
}

// Export functions for use in other scripts
window.CyberCheckIntegration = {
  init: initCyberCheckIntegration,
  search: searchCyberCheckProfiles
};

console.log('✅ CyberCheck Integration loaded');
