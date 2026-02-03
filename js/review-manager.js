// Review Manager - Handles verified reviews display and management

class ReviewManager {
  constructor() {
    this.reviews = this.loadReviews();
  }

  /**
   * Load reviews from localStorage
   */
  loadReviews() {
    const reviewsData = localStorage.getItem('gcr_reviews');
    return reviewsData ? JSON.parse(reviewsData) : [];
  }

  /**
   * Save reviews to localStorage
   */
  saveReviews() {
    localStorage.setItem('gcr_reviews', JSON.stringify(this.reviews));
  }

  /**
   * Get all reviews for a business
   */
  getBusinessReviews(businessId) {
    return this.reviews
      .filter(r => r.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get reviews for a specific menu item
   */
  getItemReviews(businessId, itemId) {
    const businessReviews = this.getBusinessReviews(businessId);
    const itemReviews = [];

    businessReviews.forEach(review => {
      const itemReview = review.itemReviews.find(ir => ir.itemId === itemId);
      if (itemReview) {
        itemReviews.push({
          ...itemReview,
          reviewId: review.reviewId,
          verified: review.verified,
          createdAt: review.createdAt,
          overallRating: review.overallRating
        });
      }
    });

    return itemReviews;
  }

  /**
   * Get average rating for a business
   */
  getBusinessAverageRating(businessId) {
    const reviews = this.getBusinessReviews(businessId);
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + (review.overallRating || 0), 0);
    return (totalRating / reviews.length).toFixed(1);
  }

  /**
   * Get average rating for a specific item
   */
  getItemAverageRating(businessId, itemId) {
    const itemReviews = this.getItemReviews(businessId, itemId);
    if (itemReviews.length === 0) return 0;

    const totalRating = itemReviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / itemReviews.length).toFixed(1);
  }

  /**
   * Get review count for a business
   */
  getBusinessReviewCount(businessId) {
    return this.getBusinessReviews(businessId).length;
  }

  /**
   * Get review count for a specific item
   */
  getItemReviewCount(businessId, itemId) {
    return this.getItemReviews(businessId, itemId).length;
  }

  /**
   * Get percentage of customers who would order item again
   */
  getItemReorderPercentage(businessId, itemId) {
    const itemReviews = this.getItemReviews(businessId, itemId);
    if (itemReviews.length === 0) return 0;

    const wouldReorder = itemReviews.filter(r => r.wouldOrderAgain).length;
    return Math.round((wouldReorder / itemReviews.length) * 100);
  }

  /**
   * Get rating distribution for a business
   */
  getRatingDistribution(businessId) {
    const reviews = this.getBusinessReviews(businessId);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(review => {
      if (review.overallRating > 0) {
        distribution[review.overallRating]++;
      }
    });

    return distribution;
  }

  /**
   * Render star rating HTML
   */
  renderStars(rating, maxStars = 5) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let html = '';

    for (let i = 0; i < fullStars; i++) {
      html += '<span style="color: #ffc107;">★</span>';
    }

    if (hasHalfStar) {
      html += '<span style="color: #ffc107;">★</span>';
    }

    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      html += '<span style="color: #e0e0e0;">★</span>';
    }

    return html;
  }

  /**
   * Render business reviews summary
   */
  renderBusinessReviewsSummary(businessId) {
    const avgRating = this.getBusinessAverageRating(businessId);
    const reviewCount = this.getBusinessReviewCount(businessId);

    if (reviewCount === 0) {
      return `
        <div style="color: #7f8c8d; font-size: 14px;">
          No reviews yet - be the first to review!
        </div>
      `;
    }

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="font-size: 24px;">
          ${this.renderStars(parseFloat(avgRating))}
        </div>
        <div>
          <div style="font-size: 20px; font-weight: 700; color: #2c3e50;">
            ${avgRating}
          </div>
          <div style="font-size: 14px; color: #7f8c8d;">
            ${reviewCount} review${reviewCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render individual item review summary
   */
  renderItemReviewSummary(businessId, itemId) {
    const avgRating = this.getItemAverageRating(businessId, itemId);
    const reviewCount = this.getItemReviewCount(businessId, itemId);
    const reorderPercent = this.getItemReorderPercentage(businessId, itemId);

    if (reviewCount === 0) {
      return '';
    }

    return `
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
        <div style="font-size: 16px;">
          ${this.renderStars(parseFloat(avgRating))}
        </div>
        <div style="font-size: 14px; color: #2c3e50; font-weight: 600;">
          ${avgRating}
        </div>
        <div style="font-size: 13px; color: #7f8c8d;">
          (${reviewCount})
        </div>
        ${reorderPercent >= 80 ? `
          <div style="background: #28a745; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
            ${reorderPercent}% would order again
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render full review list for a business
   */
  renderBusinessReviewsList(businessId) {
    const reviews = this.getBusinessReviews(businessId);

    if (reviews.length === 0) {
      return `
        <div style="text-align: center; padding: 40px 20px; color: #7f8c8d;">
          <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
          <h3>No reviews yet</h3>
          <p>Be the first to leave a review!</p>
        </div>
      `;
    }

    return reviews.map(review => `
      <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 2px solid #e9ecef;">
        <!-- Review Header -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <div style="font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 4px;">
              Verified Customer
              ${review.verified ? '<span style="background: #28a745; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">✓ Verified Purchase</span>' : ''}
            </div>
            <div style="font-size: 13px; color: #7f8c8d;">
              ${new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          ${review.overallRating > 0 ? `
            <div style="text-align: right;">
              <div style="font-size: 20px;">${this.renderStars(review.overallRating)}</div>
              <div style="font-size: 14px; color: #2c3e50; font-weight: 600;">${review.overallRating}.0</div>
            </div>
          ` : ''}
        </div>

        <!-- Overall Comment -->
        ${review.overallComment ? `
          <div style="color: #2c3e50; line-height: 1.6; margin-bottom: 16px;">
            "${review.overallComment}"
          </div>
        ` : ''}

        <!-- Item Reviews -->
        ${review.itemReviews.length > 0 ? `
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <div style="font-size: 13px; font-weight: 600; color: #7f8c8d; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Items Reviewed
            </div>
            ${review.itemReviews.map(item => `
              <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e9ecef;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <div style="font-weight: 600; color: #2c3e50;">${item.itemName}</div>
                  <div style="font-size: 16px;">${this.renderStars(item.rating)}</div>
                </div>
                ${item.comment ? `
                  <div style="color: #7f8c8d; font-size: 14px; line-height: 1.5;">${item.comment}</div>
                ` : ''}
                ${item.wouldOrderAgain ? `
                  <div style="color: #28a745; font-size: 12px; font-weight: 600; margin-top: 6px;">
                    ✓ Would order again
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }
}

// Create global instance
window.reviewManager = new ReviewManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReviewManager;
}
