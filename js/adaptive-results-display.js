/**
 * Adaptive Results Display
 * Changes how results are shown based on query intent
 * Like hatch-new: food query → show menu items, event query → show events
 */

(function() {
  // Wait for GlobalSearch to be defined
  const waitForSearch = setInterval(() => {
    if (typeof GlobalSearch !== 'undefined') {
      clearInterval(waitForSearch);
      enhanceResultsDisplay();
    }
  }, 100);

  function enhanceResultsDisplay() {
    console.log('🎨 Enhancing results display with adaptive layouts...');

    // Override displayResults with adaptive version
    GlobalSearch.prototype.displayResults = function(results) {
      if (!this.suggestionsContainer) return;

      // Determine query intent
      const intent = this.detectIntent(this.currentQuery, results);
      console.log('🎯 Detected intent:', intent);

      let html = '';

      // Build UI based on intent
      switch(intent.primary) {
        case 'menu':
          html = this.displayMenuFocused(results, intent);
          break;
        case 'drinks':
          html = this.displayDrinksFocused(results, intent);
          break;
        case 'events':
          html = this.displayEventsFocused(results, intent);
          break;
        case 'business':
          html = this.displayBusinessFocused(results, intent);
          break;
        case 'mixed':
          html = this.displayMixedResults(results, intent);
          break;
        default:
          html = this.displayBusinessFocused(results, intent);
      }

      this.suggestionsContainer.innerHTML = html;
      this.suggestionsContainer.style.display = 'block';

      // Track search
      if (typeof window.trackSearch === 'function') {
        const totalResults = (results.businesses?.length || 0) +
                            (results.menuItems?.length || 0) +
                            (results.drinks?.length || 0);
        window.trackSearch(this.currentQuery, totalResults);
      }
    };

    // Detect what the user is looking for
    GlobalSearch.prototype.detectIntent = function(query, results) {
      const lowerQuery = query.toLowerCase();

      // Food-related keywords
      const foodKeywords = ['burger', 'pizza', 'taco', 'sandwich', 'salad', 'pasta',
                           'seafood', 'steak', 'chicken', 'fish', 'shrimp', 'oyster',
                           'appetizer', 'dessert', 'menu', 'food', 'dish', 'meal'];

      // Drink keywords
      const drinkKeywords = ['beer', 'wine', 'cocktail', 'drink', 'beverage', 'margarita',
                            'whiskey', 'vodka', 'rum', 'tequila', 'champagne', 'sangria'];

      // Event keywords
      const eventKeywords = ['event', 'live music', 'band', 'concert', 'trivia',
                            'karaoke', 'tonight', 'tomorrow', 'weekend', 'show'];

      // Business keywords
      const businessKeywords = ['restaurant', 'bar', 'cafe', 'place', 'spot', 'location'];

      const menuCount = results.menuItems?.length || 0;
      const drinksCount = results.drinks?.length || 0;
      const businessCount = results.businesses?.length || 0;
      const eventsCount = results.events?.length || 0;

      // Score each intent
      let scores = {
        menu: 0,
        drinks: 0,
        events: 0,
        business: 0
      };

      // Check keywords
      foodKeywords.forEach(kw => {
        if (lowerQuery.includes(kw)) scores.menu += 10;
      });

      drinkKeywords.forEach(kw => {
        if (lowerQuery.includes(kw)) scores.drinks += 10;
      });

      eventKeywords.forEach(kw => {
        if (lowerQuery.includes(kw)) scores.events += 10;
      });

      businessKeywords.forEach(kw => {
        if (lowerQuery.includes(kw)) scores.business += 5;
      });

      // Weight by result counts
      if (menuCount > 0) scores.menu += menuCount * 2;
      if (drinksCount > 0) scores.drinks += drinksCount * 2;
      if (businessCount > 0) scores.business += businessCount;
      if (eventsCount > 0) scores.events += eventsCount * 3;

      // Determine primary intent
      const maxScore = Math.max(scores.menu, scores.drinks, scores.events, scores.business);
      let primary = 'business'; // default

      if (maxScore === scores.menu && menuCount > 0) primary = 'menu';
      else if (maxScore === scores.drinks && drinksCount > 0) primary = 'drinks';
      else if (maxScore === scores.events && eventsCount > 0) primary = 'events';
      else if (maxScore === scores.business && businessCount > 0) primary = 'business';

      // If multiple types have good results, it's mixed
      const hasMultipleTypes = [menuCount > 0, drinksCount > 0, businessCount > 0].filter(Boolean).length > 1;
      if (hasMultipleTypes && maxScore < 20) primary = 'mixed';

      return {
        primary,
        scores,
        counts: { menuCount, drinksCount, businessCount, eventsCount }
      };
    };

    // Display: Menu items prominently
    GlobalSearch.prototype.displayMenuFocused = function(results, intent) {
      let html = `<div class="search-results-adaptive">`;

      // Header
      html += `<div class="results-header">
        <h3>🍽️ Menu Items (${intent.counts.menuCount})</h3>
      </div>`;

      // Menu items grid
      if (results.menuItems && results.menuItems.length > 0) {
        html += `<div class="menu-items-grid">`;

        results.menuItems.slice(0, 12).forEach(item => {
          html += `
            <div class="menu-item-card" onclick="window.location.href='profile.html?id=${item.businessId}'">
              <div class="menu-item-content">
                <div class="menu-item-name">${item.name}</div>
                ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
                <div class="menu-item-meta">
                  <span class="menu-item-price">${item.price || ''}</span>
                  ${item.category ? `<span class="menu-item-category">${item.category}</span>` : ''}
                </div>
                <div class="menu-item-business">
                  📍 ${item.businessName} ${item.businessLocation ? `• ${item.businessLocation}` : ''}
                </div>
              </div>
            </div>
          `;
        });

        html += `</div>`;
      }

      // Also show businesses if relevant
      if (results.businesses && results.businesses.length > 0) {
        html += `<div class="results-section">
          <h4>🏪 Restaurants serving this (${results.businesses.length})</h4>
          <div class="business-chips">`;

        results.businesses.slice(0, 6).forEach(biz => {
          html += `
            <div class="business-chip" onclick="window.location.href='profile.html?id=${biz.id}'">
              ${biz.name}
              ${biz.location ? `<span class="location-badge">${biz.location}</span>` : ''}
            </div>
          `;
        });

        html += `</div></div>`;
      }

      html += `</div>`;
      return html;
    };

    // Display: Drinks prominently
    GlobalSearch.prototype.displayDrinksFocused = function(results, intent) {
      let html = `<div class="search-results-adaptive">`;

      html += `<div class="results-header">
        <h3>🍹 Drinks (${intent.counts.drinksCount})</h3>
      </div>`;

      if (results.drinks && results.drinks.length > 0) {
        html += `<div class="drinks-grid">`;

        results.drinks.slice(0, 12).forEach(drink => {
          html += `
            <div class="drink-card" onclick="window.location.href='profile.html?id=${drink.businessId}'">
              <div class="drink-content">
                <div class="drink-name">${drink.name}</div>
                ${drink.description ? `<div class="drink-description">${drink.description}</div>` : ''}
                <div class="drink-meta">
                  <span class="drink-price">${drink.price || ''}</span>
                  ${drink.category ? `<span class="drink-category">${drink.category}</span>` : ''}
                </div>
                <div class="drink-business">
                  📍 ${drink.businessName}
                </div>
              </div>
            </div>
          `;
        });

        html += `</div>`;
      }

      html += `</div>`;
      return html;
    };

    // Display: Events prominently
    GlobalSearch.prototype.displayEventsFocused = function(results, intent) {
      let html = `<div class="search-results-adaptive">`;

      html += `<div class="results-header">
        <h3>🎉 Events (${intent.counts.eventsCount})</h3>
      </div>`;

      // TODO: Add events display when events are in results
      html += `<div class="events-list">`;
      html += `<p>Events coming soon...</p>`;
      html += `</div>`;

      html += `</div>`;
      return html;
    };

    // Display: Businesses prominently (default)
    GlobalSearch.prototype.displayBusinessFocused = function(results, intent) {
      let html = `<div class="search-results-adaptive">`;

      if (results.businesses && results.businesses.length > 0) {
        html += `<div class="results-header">
          <h3>🏪 Businesses (${intent.counts.businessCount})</h3>
        </div>`;

        html += `<div class="business-cards">`;

        results.businesses.slice(0, 8).forEach(biz => {
          const image = biz.main_image || biz.image || biz.profile_pic || 'placeholder.jpg';
          html += `
            <div class="business-card-compact" onclick="window.location.href='profile.html?id=${biz.id}'">
              <div class="business-card-image" style="background-image: url('${image}')"></div>
              <div class="business-card-content">
                <div class="business-card-name">${biz.name}</div>
                ${biz.cuisine ? `<div class="business-card-cuisine">${biz.cuisine}</div>` : ''}
                <div class="business-card-meta">
                  ${biz.location ? `<span>📍 ${biz.location}</span>` : ''}
                  ${biz.priceLevel ? `<span>${biz.priceLevel}</span>` : ''}
                  ${biz.rating ? `<span>⭐ ${biz.rating}</span>` : ''}
                </div>
                ${biz.description ? `<div class="business-card-description">${biz.description.substring(0, 100)}${biz.description.length > 100 ? '...' : ''}</div>` : ''}
              </div>
            </div>
          `;
        });

        html += `</div>`;
      }

      html += `</div>`;
      return html;
    };

    // Display: Mixed results (multiple types)
    GlobalSearch.prototype.displayMixedResults = function(results, intent) {
      let html = `<div class="search-results-adaptive">`;

      // Show top 3 businesses
      if (results.businesses && results.businesses.length > 0) {
        html += `<div class="results-section">
          <h4>🏪 Businesses (${results.businesses.length})</h4>
          <div class="business-list-compact">`;

        results.businesses.slice(0, 3).forEach(biz => {
          html += `
            <div class="business-item-compact" onclick="window.location.href='profile.html?id=${biz.id}'">
              <strong>${biz.name}</strong>
              ${biz.location ? `<span class="location-badge">${biz.location}</span>` : ''}
              ${biz.description ? `<p>${biz.description.substring(0, 80)}...</p>` : ''}
            </div>
          `;
        });

        html += `</div></div>`;
      }

      // Show top menu items
      if (results.menuItems && results.menuItems.length > 0) {
        html += `<div class="results-section">
          <h4>🍽️ Menu Items (${results.menuItems.length})</h4>
          <div class="menu-list-compact">`;

        results.menuItems.slice(0, 6).forEach(item => {
          html += `
            <div class="menu-item-compact" onclick="window.location.href='profile.html?id=${item.businessId}'">
              <strong>${item.name}</strong> ${item.price ? `- ${item.price}` : ''}
              <span class="business-badge">${item.businessName}</span>
            </div>
          `;
        });

        html += `</div></div>`;
      }

      // Show top drinks
      if (results.drinks && results.drinks.length > 0) {
        html += `<div class="results-section">
          <h4>🍹 Drinks (${results.drinks.length})</h4>
          <div class="drinks-list-compact">`;

        results.drinks.slice(0, 6).forEach(drink => {
          html += `
            <div class="drink-item-compact" onclick="window.location.href='profile.html?id=${drink.businessId}'">
              <strong>${drink.name}</strong> ${drink.price ? `- ${drink.price}` : ''}
              <span class="business-badge">${drink.businessName}</span>
            </div>
          `;
        });

        html += `</div></div>`;
      }

      html += `</div>`;
      return html;
    };

    console.log('✅ Adaptive results display loaded');
  }
})();
