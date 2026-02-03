// ============================================
// CyberCheck - Reviews Manager JavaScript
// ============================================

import { requireAuth } from './shared/auth.js';
import { apiGet, apiPost, apiPut, apiDelete } from './shared/api.js';

let currentFilter = 'all';
let reviews = [];

// ============================================
// Initialize on Load
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Require authentication
  if (!requireAuth()) return;

  initializeFilters();
  initializeActions();
  initializeModals();
  await loadReviews();
});

// ============================================
// Filter Tabs
// ============================================

function initializeFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      currentFilter = filter;

      // Update active state
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Apply filter
      filterReviews(filter);
    });
  });
}

function filterReviews(filter) {
  const reviewCards = document.querySelectorAll('.review-card');

  reviewCards.forEach(card => {
    if (filter === 'all') {
      card.style.display = 'block';
    } else if (card.classList.contains(filter)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  showToast(`Showing ${filter === 'all' ? 'all' : filter} reviews`);
}

// ============================================
// Review Actions
// ============================================

function initializeActions() {
  document.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.action-btn');

    if (!actionBtn) return;

    const reviewCard = actionBtn.closest('.review-card');
    const reviewId = reviewCard?.dataset.reviewId;

    if (!reviewId) return;

    const btnText = actionBtn.textContent.trim();

    if (btnText === 'Approve' || btnText.includes('Approve')) {
      approveReview(reviewId, reviewCard);
    } else if (btnText === 'Reject' || btnText.includes('Reject')) {
      if (confirm('Reject this review?')) {
        rejectReview(reviewId, reviewCard);
      }
    } else if (btnText === 'Reply' || btnText.includes('Reply')) {
      openReplyModal(reviewId);
    } else if (btnText === 'Edit Reply' || btnText.includes('Edit')) {
      openReplyModal(reviewId, true);
    } else if (btnText === 'Flag' || btnText.includes('Flag')) {
      flagReview(reviewId, reviewCard);
    } else if (btnText === 'Hide' || btnText.includes('Hide')) {
      if (confirm('Hide this review from your public profile?')) {
        hideReview(reviewId, reviewCard);
      }
    } else if (btnText === 'Delete' || btnText.includes('Delete')) {
      if (confirm('Permanently delete this review? This cannot be undone.')) {
        deleteReview(reviewId, reviewCard);
      }
    }
  });
}

async function approveReview(reviewId, reviewCard) {
  console.log('Approving review:', reviewId);

  try {
    await apiPost(`/reviews/${reviewId}/approve`);
    // Update UI
  reviewCard.classList.remove('pending');
  reviewCard.classList.add('published');

  const statusBadge = reviewCard.querySelector('.status-badge');
  if (statusBadge) {
    statusBadge.className = 'status-badge published';
    statusBadge.textContent = 'Published';
  }

  // Update actions
  const actionsContainer = reviewCard.querySelector('.review-actions');
  if (actionsContainer) {
    actionsContainer.innerHTML = `
      <button class="action-btn" title="Reply">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Reply
      </button>
      <button class="action-btn" title="Flag">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        Flag
      </button>
      <button class="action-btn danger" title="Hide">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
        Hide
      </button>
    `;
  }

    showToast('Review approved and published');
    await loadReviews(); // Reload reviews
  } catch (error) {
    console.error('Failed to approve review:', error);
    showToast('Failed to approve review: ' + error.message);
  }
}

async function rejectReview(reviewId, reviewCard) {
  console.log('Rejecting review:', reviewId);

  try {
    await apiPost(`/reviews/${reviewId}/reject`);
    // Remove from view with animation
  reviewCard.style.opacity = '0';
  reviewCard.style.transform = 'translateX(-20px)';
  reviewCard.style.transition = 'all 0.3s ease-out';

  setTimeout(() => {
    reviewCard.remove();
  }, 300);

    showToast('Review rejected');
    setTimeout(async () => {
      await loadReviews(); // Reload reviews after animation
    }, 300);
  } catch (error) {
    console.error('Failed to reject review:', error);
    showToast('Failed to reject review: ' + error.message);
  }
}

async function flagReview(reviewId, reviewCard) {
  console.log('Flagging review:', reviewId);

  try {
    await apiPost(`/reviews/${reviewId}/flag`);
    reviewCard.classList.add('flagged');

  const statusContainer = reviewCard.querySelector('.review-status');
  if (statusContainer) {
    // Add flagged badge if not already present
    if (!statusContainer.querySelector('.status-badge.flagged')) {
      const flaggedBadge = document.createElement('span');
      flaggedBadge.className = 'status-badge flagged';
      flaggedBadge.textContent = 'Flagged';
      statusContainer.appendChild(flaggedBadge);
    }
  }

    showToast('Review flagged for moderation');
  } catch (error) {
    console.error('Failed to flag review:', error);
    showToast('Failed to flag review: ' + error.message);
  }
}

async function hideReview(reviewId, reviewCard) {
  console.log('Hiding review:', reviewId);

  try {
    await apiPost(`/reviews/${reviewId}/hide`);
    reviewCard.style.opacity = '0.5';
    showToast('Review hidden from public profile');
  } catch (error) {
    console.error('Failed to hide review:', error);
    showToast('Failed to hide review: ' + error.message);
  }
}

async function deleteReview(reviewId, reviewCard) {
  console.log('Deleting review:', reviewId);

  try {
    await apiDelete(`/reviews/${reviewId}`);

    reviewCard.style.opacity = '0';
    reviewCard.style.transform = 'scale(0.9)';
    reviewCard.style.transition = 'all 0.3s ease-out';

    setTimeout(() => {
      reviewCard.remove();
    }, 300);

    showToast('Review deleted permanently');
  } catch (error) {
    console.error('Failed to delete review:', error);
    showToast('Failed to delete review: ' + error.message);
  }
}

// ============================================
// Reply Modal
// ============================================

function initializeModals() {
  // Reply Modal
  const closeReplyModal = document.getElementById('closeReplyModal');
  const cancelReplyBtn = document.getElementById('cancelReplyBtn');
  const replyForm = document.getElementById('replyForm');
  const replyTextarea = replyForm?.querySelector('textarea');
  const replyCount = document.getElementById('replyCount');

  if (closeReplyModal) {
    closeReplyModal.addEventListener('click', () => closeModal('replyModal'));
  }

  if (cancelReplyBtn) {
    cancelReplyBtn.addEventListener('click', () => closeModal('replyModal'));
  }

  if (replyForm) {
    replyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitReply();
    });
  }

  // Character counter
  if (replyTextarea && replyCount) {
    replyTextarea.addEventListener('input', () => {
      const count = replyTextarea.value.length;
      replyCount.textContent = count;

      if (count > 500) {
        replyCount.style.color = 'rgb(239, 68, 68)';
        replyTextarea.value = replyTextarea.value.substring(0, 500);
      } else {
        replyCount.style.color = '';
      }
    });
  }

  // Settings Modal
  const reviewSettingsBtn = document.getElementById('reviewSettingsBtn');
  const closeSettingsModal = document.getElementById('closeSettingsModal');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  const settingsForm = document.getElementById('settingsForm');

  if (reviewSettingsBtn) {
    reviewSettingsBtn.addEventListener('click', () => openModal('settingsModal'));
  }

  if (closeSettingsModal) {
    closeSettingsModal.addEventListener('click', () => closeModal('settingsModal'));
  }

  if (cancelSettingsBtn) {
    cancelSettingsBtn.addEventListener('click', () => closeModal('settingsModal'));
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettings();
    });
  }

  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
}

let currentReviewId = null;
let isEditingReply = false;

function openReplyModal(reviewId, isEdit = false) {
  currentReviewId = reviewId;
  isEditingReply = isEdit;

  const modal = document.getElementById('replyModal');
  const form = document.getElementById('replyForm');
  const textarea = form.querySelector('textarea');
  const modalTitle = modal.querySelector('.modal-title');

  if (!modal || !form) return;

  modalTitle.textContent = isEdit ? 'Edit Reply' : 'Reply to Review';

  if (isEdit) {
    // Load existing reply
    // In production: fetch reply from API or DOM
    const reviewCard = document.querySelector(`.review-card[data-review-id="${reviewId}"]`);
    const replyText = reviewCard?.querySelector('.reply-text')?.textContent;

    if (replyText) {
      textarea.value = replyText;
      document.getElementById('replyCount').textContent = replyText.length;
    }
  } else {
    form.reset();
    document.getElementById('replyCount').textContent = '0';
  }

  openModal('replyModal');
}

function submitReply() {
  const form = document.getElementById('replyForm');
  const textarea = form.querySelector('textarea');
  const replyText = textarea.value.trim();

  if (!replyText) {
    showToast('Please write a reply', 'error');
    return;
  }

  console.log('Submitting reply for review:', currentReviewId);
  console.log('Reply text:', replyText);

  // In production: API call
  // await fetch(`/api/reviews/${currentReviewId}/reply`, {
  //   method: 'POST',
  //   body: JSON.stringify({ reply: replyText })
  // });

  // Update UI
  const reviewCard = document.querySelector(`.review-card[data-review-id="${currentReviewId}"]`);

  if (reviewCard) {
    let replyContainer = reviewCard.querySelector('.owner-reply');

    if (isEditingReply && replyContainer) {
      // Update existing reply
      const replyTextElement = replyContainer.querySelector('.reply-text');
      if (replyTextElement) {
        replyTextElement.textContent = replyText;
      }
    } else if (!replyContainer) {
      // Add new reply
      replyContainer = document.createElement('div');
      replyContainer.className = 'owner-reply';
      replyContainer.innerHTML = `
        <div class="reply-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span>Your Reply</span>
        </div>
        <p class="reply-text">${replyText}</p>
      `;

      const reviewContent = reviewCard.querySelector('.review-content');
      if (reviewContent) {
        reviewContent.after(replyContainer);
      }
    }
  }

  showToast(isEditingReply ? 'Reply updated' : 'Reply posted');
  closeModal('replyModal');
}

// ============================================
// Settings
// ============================================

function saveSettings() {
  const form = document.getElementById('settingsForm');

  const settingsData = {
    autoRequest: form.querySelector('input[type="checkbox"]').checked,
    requestDelay: form.querySelector('select').value,
    allowPhotos: form.querySelectorAll('input[type="checkbox"]')[1].checked,
    requireApproval: form.querySelectorAll('input[type="checkbox"]')[2].checked,
    autoFlagProfanity: form.querySelectorAll('input[type="checkbox"]')[3].checked,
    autoFlag1Star: form.querySelectorAll('input[type="checkbox"]')[4].checked,
    showOnProfile: form.querySelectorAll('input[type="checkbox"]')[5].checked,
    sortBy: form.querySelectorAll('select')[1].value
  };

  console.log('Saving settings:', settingsData);

  // In production: API call
  // await fetch('/api/reviews/settings', {
  //   method: 'POST',
  //   body: JSON.stringify(settingsData)
  // });

  showToast('Settings saved successfully');
  closeModal('settingsModal');
}

// ============================================
// Photo Gallery
// ============================================

document.addEventListener('click', (e) => {
  const photoItem = e.target.closest('.photo-item');

  if (photoItem) {
    const img = photoItem.querySelector('img');
    if (img) {
      // In production: open lightbox/modal with full-size image
      showToast('Photo viewer coming soon');
      console.log('Opening photo:', img.src);
    }
  }
});

// ============================================
// Load Reviews
// ============================================

async function loadReviews() {
  try {
    const response = await apiGet('/reviews');
    reviews = response.data || [];
    renderReviews(reviews);
    updateStats(reviews);
    console.log(`Loaded ${reviews.length} reviews from API`);
  } catch (error) {
    console.error('Failed to load reviews:', error);
    showToast('Failed to load reviews: ' + error.message);
  }
}

function renderReviews(reviewsList) {
  // Render reviews in the UI - implementation depends on HTML structure
  console.log('Rendering reviews:', reviewsList.length);
}

function updateStats(reviewsList) {
  // Update stats counters - implementation depends on HTML structure
  const pending = reviewsList.filter(r => r.status === 'pending').length;
  const published = reviewsList.filter(r => r.status === 'published').length;
  const flagged = reviewsList.filter(r => r.is_flagged).length;
  console.log('Stats:', { pending, published, flagged });
}

// ============================================
// Modal Helpers
// ============================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'success', duration = 3000) {
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;

  const bgColor = type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(0, 0, 0, 0.9)';

  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${bgColor};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    animation: slideInUp 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// Keyboard Shortcuts
// ============================================

document.addEventListener('keydown', (e) => {
  // Escape to close modals
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      closeModal(modal.id);
    });
  }
});

// ============================================
// Console Log
// ============================================

console.log('%cReviews Manager Ready', 'font-size: 16px; font-weight: bold; color: #4DA6FF;');
console.log('Current filter:', currentFilter);
