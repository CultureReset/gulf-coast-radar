// Social Feed API Integration
// This file handles communication with the backend API for real social media data

const API_BASE_URL = 'http://localhost:3001/api';

// Fetch posts for a specific business
async function fetchBusinessPosts(businessId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${businessId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error(`Error fetching posts for ${businessId}:`, error);
    // Fall back to static data if API fails
    return getBusinessPosts(businessId);
  }
}

// Fetch all posts from all businesses
async function fetchAllPosts() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching all posts:', error);
    // Fall back to static data if API fails
    return getAllPosts();
  }
}

// Check if backend API is available
async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend API not available, using static data');
    return false;
  }
}

// Render social feed with API integration
async function renderSocialFeedAPI(businessId) {
  const posts = await fetchBusinessPosts(businessId);

  if (!posts || posts.length === 0) {
    return `
      <div class="feed-empty-state">
        <div class="feed-empty-state-icon">📱</div>
        <h3 class="feed-empty-state-title">No posts yet</h3>
        <p class="feed-empty-state-description">Check back soon for updates from this business!</p>
      </div>
    `;
  }

  let feedHtml = '<div class="feed-posts-grid">';

  posts.forEach(post => {
    const platformIcon = post.platform === 'facebook' ?
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="post-platform-icon platform-facebook"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' :
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="post-platform-icon platform-instagram"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';

    feedHtml += `
      <div class="social-post-card">
        <div class="post-header">
          <img src="${post.profileImage}" alt="${post.accountName}" class="post-profile-image">
          <div class="post-account-info">
            <div class="post-account-name">
              ${post.accountName}
              ${post.verified ? '<span class="verified-badge">✓</span>' : ''}
            </div>
            <div class="post-timestamp">${formatTimestamp(post.timestamp)}</div>
          </div>
          ${platformIcon}
        </div>

        ${post.content ? `<div class="post-content">${post.content}</div>` : ''}

        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-media">` : ''}
        ${post.videoUrl ? `<img src="${post.videoUrl}" alt="Video thumbnail" class="post-video">` : ''}

        <div class="post-stats">
          ${post.likes ? `<span class="post-stat"><span class="post-stat-icon">❤️</span> ${post.likes}</span>` : ''}
          ${post.comments ? `<span class="post-stat"><span class="post-stat-icon">💬</span> ${post.comments}</span>` : ''}
          ${post.shares ? `<span class="post-stat"><span class="post-stat-icon">🔄</span> ${post.shares}</span>` : ''}
        </div>
      </div>
    `;
  });

  feedHtml += '</div>';
  return feedHtml;
}
