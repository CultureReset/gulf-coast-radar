// Gulf Coast Radar Feed - API Integration
// Fetches REAL social media posts from CyberCheck instead of mock data

const CYBERCHECK_API_URL = 'https://cybercheckinc.com/api/gcr';

let allPosts = [];
let currentFilter = 'all';
let currentSort = 'recent';
let currentOffset = 0;
const POSTS_PER_PAGE = 20;

document.addEventListener('DOMContentLoaded', async () => {
  // Show loading state
  showLoading();

  // Fetch initial posts
  await loadCommunityFeed();

  // Setup filter buttons
  setupFilters();

  // Auto-refresh every 5 minutes
  setInterval(async () => {
    await refreshFeed();
  }, 300000); // 5 minutes

  // Update "LIVE" badge with stats
  updateLiveBadge();
  setInterval(updateLiveBadge, 60000); // Update every minute
});

/**
 * Load community feed from CyberCheck API
 */
async function loadCommunityFeed(append = false) {
  try {
    const url = `${CYBERCHECK_API_URL}/community-feed?` + new URLSearchParams({
      limit: POSTS_PER_PAGE,
      offset: currentOffset,
      filter: currentFilter,
      sort: currentSort
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      if (append) {
        allPosts = [...allPosts, ...data.posts];
      } else {
        allPosts = data.posts;
      }

      displayPosts(allPosts);

      // Show/hide "Load More" button
      updateLoadMoreButton(data.pagination.has_more);

      return data;
    } else {
      throw new Error(data.message || 'Failed to load feed');
    }

  } catch (error) {
    console.error('Error loading community feed:', error);
    showError('Unable to load social feed. Please try again later.');

    // Fallback to mock data if API fails
    if (typeof getAllPosts === 'function') {
      console.log('Falling back to mock data');
      allPosts = getAllPosts();
      displayPosts(allPosts);
    }
  }
}

/**
 * Display posts in the feed
 */
function displayPosts(posts) {
  const container = document.getElementById('feed-posts-container');

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="feed-empty-state">
        <div class="feed-empty-state-icon">📱</div>
        <h3 class="feed-empty-state-title">No posts found</h3>
        <p class="feed-empty-state-description">
          ${currentFilter !== 'all' ? 'Try adjusting your filters to see more posts' : 'No businesses have connected their social media yet'}
        </p>
      </div>
    `;
    return;
  }

  let postsHtml = '<div class="feed-posts-grid">';

  posts.forEach(postData => {
    const post = postData.post;
    const business = postData.business;

    const platformIcon = post.platform === 'facebook' ?
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="post-platform-icon platform-facebook"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' :
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="post-platform-icon platform-instagram"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';

    // Get first image URL
    const imageUrl = post.image_urls && post.image_urls.length > 0
      ? post.image_urls[0]
      : (post.thumbnail_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800');

    // Build badges for auto-detected content
    let badges = '';
    if (post.has_events) {
      badges += `<span class="post-badge event-badge">🎵 ${post.event_count} Event${post.event_count > 1 ? 's' : ''}</span>`;
    }
    if (post.has_specials) {
      badges += `<span class="post-badge special-badge">🎉 Special</span>`;
    }

    postsHtml += `
      <div class="social-post-card" onclick="window.location.href='profile.html?id=${business.card_url}'">
        <div class="post-header">
          <img src="${post.profile_picture || 'https://via.placeholder.com/100'}" alt="${post.account_name}" class="post-profile-image">
          <div class="post-account-info">
            <div class="post-account-name">
              ${post.account_name}
              ${post.verified ? '<span class="verified-badge">✓</span>' : ''}
            </div>
            <div class="post-business-name">${business.name}</div>
            <div class="post-timestamp">${post.posted_at_human}</div>
          </div>
          ${platformIcon}
        </div>

        ${post.post_type !== 'text' ? `
          <div class="post-media">
            ${post.post_type === 'video' ? `
              <video controls class="post-video">
                <source src="${post.video_url}" type="video/mp4">
              </video>
            ` : `
              <img src="${imageUrl}" alt="Post image" class="post-image">
            `}
            ${badges ? `<div class="post-badges">${badges}</div>` : ''}
          </div>
        ` : ''}

        ${post.caption ? `
          <div class="post-content">
            <p class="post-caption">${linkifyHashtags(truncateCaption(post.caption, 150))}</p>
          </div>
        ` : ''}

        <div class="post-footer">
          <div class="post-stats">
            <span class="post-stat">❤️ ${formatNumber(post.likes_count)}</span>
            <span class="post-stat">💬 ${formatNumber(post.comments_count)}</span>
            ${post.shares_count ? `<span class="post-stat">↗️ ${formatNumber(post.shares_count)}</span>` : ''}
          </div>
          <a href="${business.profile_url}" class="post-view-profile" onclick="event.stopPropagation()">
            View Profile →
          </a>
        </div>
      </div>
    `;
  });

  postsHtml += '</div>';

  // Add "Load More" button
  postsHtml += `
    <div class="load-more-container" id="load-more-container">
      <button class="load-more-btn" onclick="loadMore()">Load More Posts</button>
    </div>
  `;

  container.innerHTML = postsHtml;
}

/**
 * Load more posts
 */
async function loadMore() {
  currentOffset += POSTS_PER_PAGE;
  await loadCommunityFeed(true);
}

/**
 * Update "Load More" button visibility
 */
function updateLoadMoreButton(hasMore) {
  const container = document.getElementById('load-more-container');
  if (container) {
    container.style.display = hasMore ? 'block' : 'none';
  }
}

/**
 * Setup filter buttons
 */
function setupFilters() {
  // Add filter buttons to the page (if they don't exist)
  const newsHeader = document.querySelector('.news-feed-header');
  if (newsHeader && !document.querySelector('.feed-filters')) {
    const filtersHtml = `
      <div class="feed-filters">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="food">🍽️ Food</button>
        <button class="filter-btn" data-filter="events">🎵 Events</button>
        <button class="filter-btn" data-filter="specials">🎉 Specials</button>
      </div>
      <div class="feed-sort">
        <select class="sort-select" onchange="handleSortChange(this.value)">
          <option value="recent">Recent</option>
          <option value="popular">Popular</option>
          <option value="trending">Trending</option>
        </select>
      </div>
    `;
    newsHeader.innerHTML += filtersHtml;

    // Add filter click handlers
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => handleFilterChange(btn.dataset.filter));
    });
  }
}

/**
 * Handle filter change
 */
async function handleFilterChange(filter) {
  currentFilter = filter;
  currentOffset = 0;

  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  showLoading();
  await loadCommunityFeed();
}

/**
 * Handle sort change
 */
async function handleSortChange(sort) {
  currentSort = sort;
  currentOffset = 0;

  showLoading();
  await loadCommunityFeed();
}

/**
 * Refresh feed
 */
async function refreshFeed() {
  console.log('Refreshing feed...');
  currentOffset = 0;
  await loadCommunityFeed();
}

/**
 * Update "LIVE" badge with stats
 */
async function updateLiveBadge() {
  try {
    const response = await fetch(`${CYBERCHECK_API_URL}/feed-stats`);
    const data = await response.json();

    if (data.success) {
      const badge = document.querySelector('.live-update-badge');
      if (badge && data.stats.posts_last_hour > 0) {
        badge.title = `${data.stats.posts_last_hour} new posts in the last hour`;
      }
    }
  } catch (error) {
    console.error('Error fetching feed stats:', error);
  }
}

/**
 * Utility functions
 */
function showLoading() {
  const container = document.getElementById('feed-posts-container');
  container.innerHTML = `
    <div class="feed-loading">
      <div class="loading-spinner"></div>
      <p>Loading posts...</p>
    </div>
  `;
}

function showError(message) {
  const container = document.getElementById('feed-posts-container');
  container.innerHTML = `
    <div class="feed-error">
      <div class="error-icon">⚠️</div>
      <h3>Oops!</h3>
      <p>${message}</p>
      <button onclick="location.reload()" class="retry-btn">Try Again</button>
    </div>
  `;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function truncateCaption(caption, maxLength) {
  if (caption.length <= maxLength) return caption;
  return caption.substring(0, maxLength) + '...';
}

function linkifyHashtags(text) {
  return text.replace(/#(\w+)/g, '<a href="#" class="hashtag" onclick="searchHashtag(\'$1\'); return false;">#$1</a>');
}

function searchHashtag(tag) {
  console.log('Searching for hashtag:', tag);
  // TODO: Implement hashtag search
}
