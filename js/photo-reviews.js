/**
 * Photo Review System
 *
 * Allows users to take/upload photos with:
 * - GPS location tracking
 * - Timestamp and date
 * - Optional review text and rating
 * - Photo categories (food, drinks, atmosphere, view, events)
 * - No account required - uses localStorage
 */

class PhotoReviewManager {
  constructor(businessId) {
    this.businessId = businessId;
    this.storageKey = `gcr_photos_${businessId}`;
    this.photos = this.loadPhotos();
    this.currentLocation = null;

    // Get user's location
    this.getUserLocation();
  }

  // Get user's GPS location
  async getUserLocation() {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        console.log('Location acquired:', this.currentLocation);
      } catch (error) {
        console.warn('Location not available:', error.message);
      }
    }
  }

  // Load photos from localStorage
  loadPhotos() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading photos:', error);
      return [];
    }
  }

  // Save photos to localStorage
  savePhotos() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.photos));
    } catch (error) {
      // Storage quota exceeded - remove oldest photos
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage full, removing oldest photos');
        this.photos = this.photos.slice(-50); // Keep last 50 photos
        localStorage.setItem(this.storageKey, JSON.stringify(this.photos));
      }
    }
  }

  // Open photo capture modal
  openPhotoModal() {
    const modal = document.getElementById('photo-review-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // Close photo modal
  closePhotoModal() {
    const modal = document.getElementById('photo-review-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    // Clear preview
    const preview = document.getElementById('photo-preview');
    if (preview) {
      preview.innerHTML = '';
      preview.style.display = 'none';
    }

    // Reset form
    const form = document.getElementById('photo-review-form');
    if (form) form.reset();
  }

  // Trigger camera capture
  async capturePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handlePhotoFile(file);
      }
    };

    input.click();
  }

  // Upload photo from gallery
  uploadPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handlePhotoFile(file);
      }
    };

    input.click();
  }

  // Handle photo file (camera or upload)
  async handlePhotoFile(file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large. Maximum size is 5MB.');
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;

      // Show preview
      this.showPhotoPreview(imageData);

      // Store temporarily
      this.currentPhotoData = {
        imageData: imageData,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    };

    reader.readAsDataURL(file);
  }

  // Show photo preview
  showPhotoPreview(imageData) {
    const preview = document.getElementById('photo-preview');
    if (preview) {
      preview.innerHTML = `
        <img src="${imageData}" alt="Photo preview" style="max-width: 100%; border-radius: 12px;">
      `;
      preview.style.display = 'block';
    }
  }

  // Submit photo review
  async submitPhotoReview(formData) {
    if (!this.currentPhotoData) {
      alert('Please take or upload a photo first.');
      return false;
    }

    // Create photo object
    const photo = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessId: this.businessId,
      imageData: this.currentPhotoData.imageData,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),

      // Location data
      location: this.currentLocation || null,

      // User input
      userName: formData.userName || 'Anonymous',
      category: formData.category || 'general',
      rating: parseInt(formData.rating) || null,
      reviewText: formData.reviewText || '',
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],

      // Metadata
      fileName: this.currentPhotoData.fileName,
      fileSize: this.currentPhotoData.fileSize,
      fileType: this.currentPhotoData.fileType,

      // Verification
      verified: this.verifyPhotoAuthenticity(),

      // Engagement
      likes: 0,
      reports: 0,

      // Admin approval (photos start as pending)
      status: 'pending', // 'pending', 'approved', 'rejected'
      approvedBy: null,
      approvedAt: null
    };

    // Save photo
    this.photos.push(photo);
    this.savePhotos();

    // Clear current photo
    this.currentPhotoData = null;

    // Track in Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'photo_review_submitted', {
        business_id: this.businessId,
        photo_category: photo.category,
        has_rating: photo.rating !== null,
        has_location: photo.location !== null,
        event_category: 'Engagement',
        event_label: 'Photo Review'
      });
    }

    return true;
  }

  // Verify photo authenticity (location + time)
  verifyPhotoAuthenticity() {
    // Check if location is near business (within 0.5 miles)
    if (this.currentLocation && typeof allBusinesses !== 'undefined' && allBusinesses && allBusinesses.length > 0) {
      const business = allBusinesses.find(b => b.id === this.businessId);
      if (business && business.lat && business.lng) {
        const distance = this.calculateDistance(
          this.currentLocation.lat,
          this.currentLocation.lng,
          business.lat,
          business.lng
        );

        // Photo is verified if taken within 0.5 miles of business
        return distance <= 0.5;
      }
    }

    return false;
  }

  // Calculate distance using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get photos for this business
  getPhotos(filters = {}) {
    let filtered = [...this.photos];

    // By default, only show approved photos (unless admin mode)
    if (filters.showPending !== true) {
      filtered = filtered.filter(p => p.status === 'approved');
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Filter by verified
    if (filters.verified === true) {
      filtered = filtered.filter(p => p.verified === true);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filtered;
  }

  // Admin: Approve photo
  approvePhoto(photoId, adminName = 'Admin') {
    const photo = this.photos.find(p => p.id === photoId);
    if (photo) {
      photo.status = 'approved';
      photo.approvedBy = adminName;
      photo.approvedAt = new Date().toISOString();
      this.savePhotos();
      return true;
    }
    return false;
  }

  // Admin: Reject photo
  rejectPhoto(photoId) {
    const photo = this.photos.find(p => p.id === photoId);
    if (photo) {
      photo.status = 'rejected';
      this.savePhotos();
      return true;
    }
    return false;
  }

  // Admin: Delete photo permanently
  deletePhoto(photoId) {
    const index = this.photos.findIndex(p => p.id === photoId);
    if (index > -1) {
      this.photos.splice(index, 1);
      this.savePhotos();
      return true;
    }
    return false;
  }

  // Admin: Get pending photos count
  getPendingCount() {
    return this.photos.filter(p => p.status === 'pending').length;
  }

  // Render photo gallery
  renderPhotoGallery(containerId, filters = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const photos = this.getPhotos(filters);

    if (photos.length === 0) {
      container.innerHTML = `
        <div class="no-photos">
          <p>No photos yet. Be the first to share!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = photos.map(photo => `
      <div class="photo-card" data-photo-id="${photo.id}">
        <div class="photo-image">
          <img src="${photo.imageData}" alt="${photo.category}" loading="lazy">
          ${photo.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
        </div>
        <div class="photo-info">
          <div class="photo-header">
            <span class="photo-user">${photo.userName}</span>
            <span class="photo-date">${photo.date}</span>
          </div>
          ${photo.rating ? `
            <div class="photo-rating">
              ${'⭐'.repeat(photo.rating)}
            </div>
          ` : ''}
          ${photo.reviewText ? `
            <p class="photo-review">${photo.reviewText}</p>
          ` : ''}
          <div class="photo-meta">
            <span class="photo-category">${photo.category}</span>
            <span class="photo-time">${photo.time}</span>
          </div>
          ${photo.tags.length > 0 ? `
            <div class="photo-tags">
              ${photo.tags.map(tag => `<span class="photo-tag">#${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // Like a photo
  likePhoto(photoId) {
    const photo = this.photos.find(p => p.id === photoId);
    if (photo) {
      photo.likes = (photo.likes || 0) + 1;
      this.savePhotos();
      return photo.likes;
    }
    return 0;
  }

  // Get photo statistics
  getPhotoStats() {
    return {
      total: this.photos.length,
      verified: this.photos.filter(p => p.verified).length,
      byCategory: {
        food: this.photos.filter(p => p.category === 'food').length,
        drinks: this.photos.filter(p => p.category === 'drinks').length,
        atmosphere: this.photos.filter(p => p.category === 'atmosphere').length,
        view: this.photos.filter(p => p.category === 'view').length,
        events: this.photos.filter(p => p.category === 'events').length
      },
      averageRating: this.photos.filter(p => p.rating).reduce((sum, p) => sum + p.rating, 0) /
                     this.photos.filter(p => p.rating).length || 0
    };
  }
}

// Global helper functions
window.openPhotoReviewModal = function(businessId) {
  if (!window.photoReviewManager) {
    window.photoReviewManager = new PhotoReviewManager(businessId);
  }
  window.photoReviewManager.openPhotoModal();
};

window.closePhotoReviewModal = function() {
  if (window.photoReviewManager) {
    window.photoReviewManager.closePhotoModal();
  }
};

window.capturePhoto = function() {
  if (window.photoReviewManager) {
    window.photoReviewManager.capturePhoto();
  }
};

window.uploadPhoto = function() {
  if (window.photoReviewManager) {
    window.photoReviewManager.uploadPhoto();
  }
};

window.submitPhotoReview = async function() {
  if (!window.photoReviewManager) return;

  const form = document.getElementById('photo-review-form');
  if (!form) return;

  const formData = {
    userName: document.getElementById('photo-user-name')?.value,
    category: document.getElementById('photo-category')?.value,
    rating: document.getElementById('photo-rating')?.value,
    reviewText: document.getElementById('photo-review-text')?.value,
    tags: document.getElementById('photo-tags')?.value
  };

  const success = await window.photoReviewManager.submitPhotoReview(formData);

  if (success) {
    // Show success message
    alert('Thank you for sharing your photo! It will appear on the profile after approval.');

    // Close modal
    window.photoReviewManager.closePhotoModal();

    // Refresh gallery
    window.photoReviewManager.renderPhotoGallery('photo-gallery');

    // Update stats
    const stats = window.photoReviewManager.getPhotoStats();
    const statsEl = document.getElementById('photo-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <span>${stats.total} photos</span>
        <span>${stats.verified} verified</span>
        <span>${stats.averageRating.toFixed(1)}⭐ avg</span>
      `;
    }
  }
};

// Initialize photo manager on profile pages
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get('id');

  if (businessId && document.getElementById('photo-gallery')) {
    window.photoReviewManager = new PhotoReviewManager(businessId);
    window.photoReviewManager.renderPhotoGallery('photo-gallery');

    // Update stats
    const stats = window.photoReviewManager.getPhotoStats();
    const statsEl = document.getElementById('photo-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <span>${stats.total} photos</span>
        <span>${stats.verified} verified</span>
        ${stats.averageRating > 0 ? `<span>${stats.averageRating.toFixed(1)}⭐ avg</span>` : ''}
      `;
    }
  }
});
