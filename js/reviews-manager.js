// Reviews Manager - User Reviews System
// Stores reviews in localStorage (no account required)

class ReviewsManager {
  constructor() {
    this.storageKey = 'gulfCoastRadar_reviews';
    this.reviews = this.loadReviews();
  }

  /**
   * Load reviews from localStorage
   */
  loadReviews() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading reviews:', error);
      return {};
    }
  }

  /**
   * Save reviews to localStorage
   */
  saveReviews() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reviews));
    } catch (error) {
      console.error('Error saving reviews:', error);
    }
  }

  /**
   * Get all reviews for a business
   */
  getBusinessReviews(businessId) {
    return this.reviews[businessId] || [];
  }

  /**
   * Add a review for a business
   */
  addReview(businessId, review) {
    if (!this.reviews[businessId]) {
      this.reviews[businessId] = [];
    }

    const newReview = {
      id: Date.now().toString(),
      rating: review.rating,
      comment: review.comment,
      userName: review.userName || 'Anonymous',
      date: new Date().toISOString(),
      helpful: 0
    };

    this.reviews[businessId].unshift(newReview); // Add to beginning
    this.saveReviews();
    return newReview;
  }

  /**
   * Calculate average rating for a business
   */
  getAverageRating(businessId) {
    const businessReviews = this.getBusinessReviews(businessId);
    if (businessReviews.length === 0) return 0;

    const sum = businessReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / businessReviews.length).toFixed(1);
  }

  /**
   * Mark review as helpful
   */
  markHelpful(businessId, reviewId) {
    const businessReviews = this.reviews[businessId];
    if (!businessReviews) return;

    const review = businessReviews.find(r => r.id === reviewId);
    if (review) {
      review.helpful = (review.helpful || 0) + 1;
      this.saveReviews();
    }
  }

  /**
   * Show review modal
   */
  showReviewModal(business) {
    const existingModal = document.getElementById('review-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'review-modal';
    modal.innerHTML = `
      <div class="review-modal-overlay" onclick="document.getElementById('review-modal').remove()"></div>
      <div class="review-modal-content">
        <div class="review-modal-header">
          <h3>Write a Review</h3>
          <button class="review-modal-close" onclick="document.getElementById('review-modal').remove()">×</button>
        </div>

        <div class="review-modal-body">
          <div class="review-business-info">
            <h4>${business.name}</h4>
            <p>${business.location}</p>
          </div>

          <div class="review-rating-section">
            <label>Your Rating</label>
            <div class="review-stars" id="review-star-input">
              ${[1, 2, 3, 4, 5].map(star => `
                <span class="review-star" data-rating="${star}" onclick="reviewsManager.selectRating(${star})">☆</span>
              `).join('')}
            </div>
            <input type="hidden" id="selected-rating" value="0">
          </div>

          <div class="review-form-group">
            <label for="review-name">Your Name (optional)</label>
            <input type="text" id="review-name" placeholder="Enter your name or leave anonymous">
          </div>

          <div class="review-form-group">
            <label for="review-comment">Your Review</label>
            <textarea id="review-comment" rows="5" placeholder="Tell others about your experience..."></textarea>
          </div>

          <button class="btn btn-primary btn-large" onclick="reviewsManager.submitReview('${business.id}')">
            Submit Review
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
  }

  /**
   * Select rating stars
   */
  selectRating(rating) {
    document.getElementById('selected-rating').value = rating;
    const stars = document.querySelectorAll('.review-star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.textContent = '★';
        star.classList.add('selected');
      } else {
        star.textContent = '☆';
        star.classList.remove('selected');
      }
    });
  }

  /**
   * Submit a review
   */
  submitReview(businessId) {
    const rating = parseInt(document.getElementById('selected-rating').value);
    const comment = document.getElementById('review-comment').value.trim();
    const userName = document.getElementById('review-name').value.trim();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (comment === '') {
      alert('Please write a review');
      return;
    }

    this.addReview(businessId, { rating, comment, userName });

    document.getElementById('review-modal').remove();

    // Show success message
    this.showSuccessMessage();

    // Reload page to show new review
    setTimeout(() => location.reload(), 1500);
  }

  /**
   * Show success message
   */
  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'review-success-toast';
    message.textContent = '✓ Review submitted successfully!';
    document.body.appendChild(message);

    setTimeout(() => message.classList.add('show'), 10);
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => message.remove(), 300);
    }, 2000);
  }

  /**
   * Render reviews section for a business
   */
  renderReviewsSection(businessId) {
    const businessReviews = this.getBusinessReviews(businessId);
    const avgRating = this.getAverageRating(businessId);

    const section = `
      <section class="profile-section reviews-section">
        <div class="reviews-header">
          <h2 class="profile-section-title">⭐ Reviews & Ratings</h2>
          <button class="btn btn-primary" onclick="reviewsManager.showReviewModal(currentBusiness)">
            Write a Review
          </button>
        </div>

        ${businessReviews.length > 0 ? `
          <div class="reviews-summary">
            <div class="reviews-average">
              <div class="reviews-average-score">${avgRating}</div>
              <div class="reviews-average-stars">${this.renderStars(parseFloat(avgRating))}</div>
              <div class="reviews-count">${businessReviews.length} ${businessReviews.length === 1 ? 'review' : 'reviews'}</div>
            </div>
          </div>

          <div class="reviews-list">
            ${businessReviews.slice(0, 10).map(review => this.renderReviewCard(review, businessId)).join('')}
          </div>
        ` : `
          <div class="reviews-empty">
            <p>No reviews yet. Be the first to review this business!</p>
          </div>
        `}
      </section>
    `;

    return section;
  }

  /**
   * Render a single review card
   */
  renderReviewCard(review, businessId) {
    const date = new Date(review.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return `
      <div class="review-card">
        <div class="review-card-header">
          <div class="review-card-user">
            <div class="review-card-avatar">${review.userName.charAt(0).toUpperCase()}</div>
            <div>
              <div class="review-card-name">${review.userName}</div>
              <div class="review-card-date">${date}</div>
            </div>
          </div>
          <div class="review-card-rating">${this.renderStars(review.rating)}</div>
        </div>
        <div class="review-card-comment">${review.comment}</div>
        <div class="review-card-footer">
          <button class="review-helpful-btn" onclick="reviewsManager.markHelpful('${businessId}', '${review.id}')">
            👍 Helpful (${review.helpful || 0})
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render star rating display
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) +
           (hasHalfStar ? '½' : '') +
           '☆'.repeat(emptyStars);
  }
}

// Initialize reviews manager
const reviewsManager = new ReviewsManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReviewsManager;
}
