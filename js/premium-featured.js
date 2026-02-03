/**
 * PREMIUM FEATURED CAROUSEL
 * Auto-scrolling showcase for Premium Plus businesses
 * Gulf Coast Radar - Analytics & Featured Business System
 */

// Premium Plus Business IDs (manually curated for now)
// TODO: Later integrate with business packages from admin dashboard
const PREMIUM_PLUS_BUSINESSES = [
  'sea-n-suds',
  'lulus',
  'the-hangout',
  'fishermans-corner',
  'cobalt',
  'ginny-lane'
];

/**
 * Initialize Premium Featured Carousel
 */
function initPremiumFeaturedCarousel() {
  const carousel = document.getElementById('premium-featured-carousel');
  if (!carousel || !window.allBusinesses) return;

  // Get Premium Plus businesses
  const featured = window.allBusinesses.filter(b =>
    PREMIUM_PLUS_BUSINESSES.includes(b.business_id)
  );

  if (featured.length === 0) {
    // Fallback: Show top 6 businesses if no premium set
    featured.push(...window.allBusinesses.slice(0, 6));
  }

  // Populate carousel
  carousel.innerHTML = '';
  featured.forEach(business => {
    const card = createPremiumFeaturedCard(business);
    carousel.appendChild(card);
  });

  // Start auto-scroll
  startAutoScroll(carousel);
}

/**
 * Create Premium Featured Business Card (Clean Design)
 */
function createPremiumFeaturedCard(business) {
  const card = document.createElement('div');
  card.style.cssText = `
    min-width: 280px;
    max-width: 280px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;
  `;

  // Premium badge
  const badge = document.createElement('div');
  badge.textContent = '⭐ PREMIUM';
  badge.style.cssText = `
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255,255,255,0.95);
    color: #764ba2;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  `;

  // Business name
  const name = document.createElement('h3');
  name.textContent = business.name || business.business_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  name.style.cssText = `
    color: white;
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 8px 0;
    line-height: 1.3;
  `;

  // Cuisine/category
  const cuisine = document.createElement('div');
  cuisine.textContent = business.cuisine || business.category || 'Restaurant';
  cuisine.style.cssText = `
    color: rgba(255,255,255,0.85);
    font-size: 13px;
    margin-bottom: 12px;
    font-weight: 500;
  `;

  // Description
  const desc = document.createElement('p');
  desc.textContent = business.description || business.about || 'Featured Gulf Coast dining experience';
  desc.style.cssText = `
    color: rgba(255,255,255,0.9);
    font-size: 13px;
    margin: 0 0 12px 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `;

  // View button
  const button = document.createElement('button');
  button.textContent = 'View Details →';
  button.style.cssText = `
    background: white;
    color: #764ba2;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = 'none';
  });

  // Click handler
  card.addEventListener('click', () => {
    // Track click
    if (window.trackBusinessClick) {
      window.trackBusinessClick(business.business_id, business.name, 'premium_featured_click');
    }

    // Navigate to profile
    window.location.href = `profile.html?id=${business.business_id}`;
  });

  // Assemble card
  card.appendChild(badge);
  card.appendChild(name);
  card.appendChild(cuisine);
  card.appendChild(desc);
  card.appendChild(button);

  return card;
}

/**
 * Auto-scroll the carousel
 */
function startAutoScroll(carousel) {
  let scrollPosition = 0;
  const scrollSpeed = 1; // pixels per frame
  const cardWidth = 280 + 16; // card width + gap

  setInterval(() => {
    scrollPosition += scrollSpeed;
    carousel.scrollLeft = scrollPosition;

    // Reset when reaching end
    if (scrollPosition >= carousel.scrollWidth - carousel.clientWidth) {
      scrollPosition = 0;
    }
  }, 50); // 20 FPS
}

/**
 * Initialize when businesses are loaded
 */
if (window.allBusinesses && window.allBusinesses.length > 0) {
  initPremiumFeaturedCarousel();
} else {
  window.addEventListener('allBusinessesUpdated', () => {
    initPremiumFeaturedCarousel();
  });
}

// Re-initialize if businesses reload
window.addEventListener('businessesRefreshed', () => {
  initPremiumFeaturedCarousel();
});

console.log('✨ Premium Featured Carousel initialized');
