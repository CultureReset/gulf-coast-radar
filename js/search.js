// Global Search Functionality for Gulf Coast Radar

class GlobalSearch {
  constructor() {
    this.searchInput = null;
    this.suggestionsContainer = null;
    this.overlay = null;
    this.currentQuery = '';
    this.recentSearches = this.loadRecentSearches();
    this.debounceTimer = null;
    this.currentHighlightIndex = -1;
    this.allBusinesses = typeof allBusinesses !== 'undefined' ? allBusinesses : [];

    // Pagination state
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.allResults = null;

    // XAI Grok API configuration
    // API key moved to ai-config.js for security
    this.XAI_API_KEY = (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.grokApiKey) || '';
    this.XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
    this.useAI = this.XAI_API_KEY !== ''; // Enable AI-powered search only if key is configured

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.createSearchHTML();
    this.attachEventListeners();
    this.setupKeyboardShortcuts();
    this.listenForBusinessUpdates();
  }

  listenForBusinessUpdates() {
    // Listen for when businesses are dynamically loaded
    window.addEventListener('allBusinessesUpdated', (event) => {
      console.log('🔍 Search updating with new business data...');
      this.allBusinesses = event.detail.businesses || [];
      console.log(`✅ Search now has ${this.allBusinesses.length} businesses`);
    });
  }

  // AI-powered query parser using Grok
  async parseWithGrok(query) {
    if (!this.useAI) return null;

    try {
      const systemPrompt = `You are helping search a business directory for Gulf Coast Radar (restaurants, activities, hotels, shopping in Orange Beach & Gulf Shores, Alabama).

Understand the user's complete question and extract what they need.

Return JSON: {"keywords": ["all relevant search terms"], "timing": "today/tomorrow/null", "filters": {"category": "restaurants/activities/coffee-sweets/hotels/null", "features": ["outdoor seating", "kid-friendly", etc]}}

Extract ALL relevant terms - food items, activities, business types, features they want.`;

      // 10 second timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(this.XAI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.XAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.1,
          max_tokens: 150
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.log('🤖 Grok API returned error:', response.status);
        return null;
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      if (!aiResponse) return null;

      const parsed = JSON.parse(aiResponse);
      console.log('🤖 Grok parsed:', parsed);
      return parsed;
    } catch (error) {
      console.log('🤖 Grok parsing skipped:', error.message);
      return null;
    }
  }

  createSearchHTML() {
    // Only add search bar on home page (index.html)
    const isHomePage = window.location.pathname === '/' ||
                       window.location.pathname.includes('index.html') ||
                       window.location.pathname === '';

    if (!isHomePage) return;

    // Find or create search container in header
    const header = document.querySelector('.gcr-header');
    if (!header) return;

    // Check if search already exists
    if (document.querySelector('.search-container')) return;

    const searchHTML = `
      <div class="search-container">
        <form class="search-form" id="search-form">
          <div class="search-input-wrapper">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>

            <input
              type="text"
              class="search-input"
              placeholder="Search restaurants, activities, locations..."
              autocomplete="off"
              aria-label="Search"
            />

            <button type="submit" class="search-submit-btn" aria-label="Search" title="Search">
              🔍
            </button>

            <button type="button" class="search-ai-btn" aria-label="Ask AI" title="Click to ask AI a question">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"/>
              </svg>
              <span style="font-weight: 700;">ASK AI</span>
            </button>
          </div>
        </form>

        <div class="search-suggestions" id="search-suggestions">
          <!-- Dynamic content -->
        </div>
      </div>

      <div class="search-overlay" id="search-overlay"></div>
    `;

    // Insert after category tabs
    const categoryTabs = header.querySelector('.category-tabs');
    if (categoryTabs) {
      categoryTabs.insertAdjacentHTML('afterend', searchHTML);
    } else {
      // Fallback: insert after site title if category tabs not found
      const siteTitle = header.querySelector('.site-title');
      if (siteTitle) {
        siteTitle.insertAdjacentHTML('afterend', searchHTML);
      }
    }

    // Cache references
    this.searchInput = document.querySelector('.search-input');
    this.suggestionsContainer = document.getElementById('search-suggestions');
    this.overlay = document.getElementById('search-overlay');
  }

  attachEventListeners() {
    if (!this.searchInput) return;

    // Form submit - go directly to results page
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query) {
          window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
        }
      });
    }

    // AI search button
    const aiBtn = document.querySelector('.search-ai-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.startAISearch();
      });
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.searchInput?.focus();
      }

      // Escape to close
      if (e.key === 'Escape') {
        this.closeSuggestions();
        this.searchInput?.blur();
      }
    });
  }

  handleInput(e) {
    this.currentQuery = e.target.value.trim();

    // Debounce search
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  handleFocus() {
    if (this.currentQuery) {
      this.performSearch();
    } else {
      this.showRecentSearches();
    }

    this.overlay?.classList.add('active');
  }

  handleBlur(e) {
    // Delay to allow click on suggestions
    setTimeout(() => {
      if (!document.activeElement?.closest('.search-container')) {
        this.closeSuggestions();
      }
    }, 200);
  }

  handleKeyDown(e) {
    const items = this.suggestionsContainer?.querySelectorAll('.suggestion-item, .recent-search-item');
    if (!items || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.currentHighlightIndex = Math.min(this.currentHighlightIndex + 1, items.length - 1);
      this.updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.currentHighlightIndex = Math.max(this.currentHighlightIndex - 1, -1);
      this.updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.currentHighlightIndex >= 0 && items[this.currentHighlightIndex]) {
        items[this.currentHighlightIndex].click();
      } else if (this.currentQuery) {
        this.goToSearchResults();
      }
    }
  }

  updateHighlight(items) {
    items.forEach((item, index) => {
      item.classList.toggle('highlighted', index === this.currentHighlightIndex);
    });

    // Scroll highlighted item into view
    if (this.currentHighlightIndex >= 0) {
      items[this.currentHighlightIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }

  async performSearch() {
    if (!this.currentQuery) {
      this.showRecentSearches();
      return;
    }

    // Show loading state
    if (this.suggestionsContainer) {
      this.suggestionsContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #6b7280;">
          <div style="font-size: 32px; margin-bottom: 10px;">🤖</div>
          <div style="font-size: 14px;">AI is understanding your query...</div>
        </div>
      `;
      this.suggestionsContainer.classList.add('active');
    }

    // Use AI to parse the query
    const grokParsed = await this.parseWithGrok(this.currentQuery);

    // Reset to page 1 when query changes
    this.currentPage = 1;
    const results = await this.searchEverything(this.currentQuery, grokParsed);
    this.allResults = results; // Store all results for pagination
    this.displayResults(results, grokParsed);
  }

  async searchEverything(query, grokParsed = null) {
    console.log('🔍 Searching for:', query);
    if (grokParsed) {
      console.log('🤖 AI Keywords:', grokParsed.keywords);
    }

    const queryLower = query.toLowerCase();

    // Remove stopwords
    const stopwords = ['i', 'im', 'i\'m', 'looking', 'for', 'a', 'an', 'the', 'to', 'go', 'get', 'need', 'want', 'find', 'list', 'of', 'show', 'me', 'some', 'any', 'can', 'you', 'tell', 'place', 'that', 'has', 'on', 'with', 'where', 'is', 'are', 'there'];
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2 && !stopwords.includes(w));

    const results = [];

    // Search each business with AI-powered scoring
    this.allBusinesses.forEach(business => {
      let score = 0;
      const matchedTerms = [];
      const matchedItems = {
        menuItems: [],
        drinks: [],
        happyHours: [],
        specials: [],
        events: []
      };

      // PRIMARY: Use AI keywords for intelligent matching
      if (grokParsed && grokParsed.keywords) {
        const keywords = Array.isArray(grokParsed.keywords) ? grokParsed.keywords : [grokParsed.keywords];

        keywords.forEach(keyword => {
          const keyLower = keyword.toLowerCase();
          const keyWords = keyLower.split(/\s+/).filter(w => w.length > 0);

          // Check menu items with precise matching
          if (business.menu && Array.isArray(business.menu)) {
            business.menu.forEach(item => {
              const itemName = item.name?.toLowerCase() || '';
              const itemDesc = item.description?.toLowerCase() || '';
              const combinedText = itemName + ' ' + itemDesc;

              // Exact phrase match gets highest priority
              if (combinedText.includes(keyLower)) {
                score += 100;
                matchedTerms.push(`AI matched: ${item.name}`);
                if (!matchedItems.menuItems.find(m => m.name === item.name)) {
                  matchedItems.menuItems.push(item);
                }
              }
              // For multi-word queries, require ALL words to be present
              else if (keyWords.length > 1) {
                const allWordsPresent = keyWords.every(word => combinedText.includes(word));
                if (allWordsPresent) {
                  score += 50;
                  matchedTerms.push(`AI matched: ${item.name}`);
                  if (!matchedItems.menuItems.find(m => m.name === item.name)) {
                    matchedItems.menuItems.push(item);
                  }
                }
              }
              // Single word can match partially
              else if (keyWords.length === 1 && combinedText.includes(keyWords[0])) {
                score += 40;
                matchedTerms.push(`AI matched: ${item.name}`);
                if (!matchedItems.menuItems.find(m => m.name === item.name)) {
                  matchedItems.menuItems.push(item);
                }
              }
            });
          }

          // Check drinks with precise matching
          if (business.drinks && Array.isArray(business.drinks)) {
            business.drinks.forEach(item => {
              const itemName = item.name?.toLowerCase() || '';
              const itemDesc = item.description?.toLowerCase() || '';
              const combinedText = itemName + ' ' + itemDesc;

              // Exact phrase match gets highest priority
              if (combinedText.includes(keyLower)) {
                score += 100;
                matchedTerms.push(`AI matched: ${item.name}`);
                if (!matchedItems.drinks.find(m => m.name === item.name)) {
                  matchedItems.drinks.push(item);
                }
              }
              // For multi-word queries, require ALL words to be present
              else if (keyWords.length > 1) {
                const allWordsPresent = keyWords.every(word => combinedText.includes(word));
                if (allWordsPresent) {
                  score += 50;
                  matchedTerms.push(`AI matched: ${item.name}`);
                  if (!matchedItems.drinks.find(m => m.name === item.name)) {
                    matchedItems.drinks.push(item);
                  }
                }
              }
              // Single word can match partially
              else if (keyWords.length === 1 && combinedText.includes(keyWords[0])) {
                score += 40;
                matchedTerms.push(`AI matched: ${item.name}`);
                if (!matchedItems.drinks.find(m => m.name === item.name)) {
                  matchedItems.drinks.push(item);
                }
              }
            });
          }

          // Check happy hours with precise matching
          const happyHourData = business.happy_hour || business.happyHours || [];
          const happyHourArray = Array.isArray(happyHourData) ? happyHourData : (happyHourData.items || []);
          if (happyHourArray.length > 0) {
            happyHourArray.forEach(item => {
              const itemName = (item.name || item.item || item.deals || '').toLowerCase();
              const itemDesc = item.description?.toLowerCase() || '';
              const itemDays = item.days?.toLowerCase() || '';
              const combinedText = itemName + ' ' + itemDesc + ' ' + itemDays;

              // Exact phrase match gets highest priority
              if (combinedText.includes(keyLower)) {
                score += 80;
                matchedTerms.push(`AI matched happy hour: ${item.name || item.item}`);
                if (!matchedItems.happyHours.find(m => m.name === (item.name || item.item))) {
                  matchedItems.happyHours.push(item);
                }
              }
              // For multi-word queries, require ALL words to be present
              else if (keyWords.length > 1) {
                const allWordsPresent = keyWords.every(word => combinedText.includes(word));
                if (allWordsPresent) {
                  score += 40;
                  matchedTerms.push(`AI matched happy hour: ${item.name || item.item}`);
                  if (!matchedItems.happyHours.find(m => m.name === (item.name || item.item))) {
                    matchedItems.happyHours.push(item);
                  }
                }
              }
              // Single word can match partially
              else if (keyWords.length === 1 && combinedText.includes(keyWords[0])) {
                score += 30;
                matchedTerms.push(`AI matched happy hour: ${item.name || item.item}`);
                if (!matchedItems.happyHours.find(m => m.name === (item.name || item.item))) {
                  matchedItems.happyHours.push(item);
                }
              }
            });
          }

          // Check tags/features
          if (business.tags && business.tags.some(tag => tag.toLowerCase().includes(keyLower))) {
            score += 30;
            matchedTerms.push(`AI matched feature: ${keyword}`);
          }
        });
      }

      // FALLBACK: Traditional keyword search
      queryWords.forEach(word => {
        // Business name (high value)
        if (business.name?.toLowerCase().includes(word)) {
          score += 50;
          matchedTerms.push(`"${word}" in business name`);
        }

        // Category
        if (business.category?.toLowerCase().includes(word)) {
          score += 30;
          matchedTerms.push(`"${word}" matches category`);
        }

        // Cuisine
        if (business.cuisine?.toLowerCase().includes(word)) {
          score += 30;
          matchedTerms.push(`"${word}" matches cuisine`);
        }

        // Description
        if (business.description?.toLowerCase().includes(word) ||
            business.about?.toLowerCase().includes(word)) {
          score += 20;
        }

        // Tags
        if (business.tags && business.tags.some(tag => tag.toLowerCase().includes(word))) {
          score += 25;
          matchedTerms.push(`"${word}" in tags`);
        }

        // Menu items (fallback)
        if (business.menu && Array.isArray(business.menu)) {
          business.menu.forEach(item => {
            if (item.name?.toLowerCase().includes(word)) {
              score += 30;
              if (!matchedItems.menuItems.find(m => m.name === item.name)) {
                matchedItems.menuItems.push(item);
                matchedTerms.push(`Menu: ${item.name}`);
              }
            }
          });
        }

        // Drinks (fallback)
        if (business.drinks && Array.isArray(business.drinks)) {
          business.drinks.forEach(item => {
            if (item.name?.toLowerCase().includes(word)) {
              score += 30;
              if (!matchedItems.drinks.find(m => m.name === item.name)) {
                matchedItems.drinks.push(item);
                matchedTerms.push(`Drink: ${item.name}`);
              }
            }
          });
        }
      });

      // Add to results if score is high enough
      if (score >= 20) {
        results.push({
          business,
          score,
          matchedTerms,
          matchedItems
        });
      }
    });

    // MULTI-MATCH BONUS: Boost businesses that match multiple criteria
    if (grokParsed && grokParsed.keywords && grokParsed.keywords.length > 1) {
      const keywords = Array.isArray(grokParsed.keywords) ? grokParsed.keywords : [grokParsed.keywords];

      results.forEach(result => {
        // Count how many different keywords this business matched
        let keywordMatchCount = 0;
        keywords.forEach(keyword => {
          const keyLower = keyword.toLowerCase();
          // Check if this business has any items matching this keyword
          const hasMenuMatch = result.matchedItems.menuItems.some(item =>
            (item.name?.toLowerCase() + ' ' + (item.description?.toLowerCase() || '')).includes(keyLower)
          );
          const hasDrinkMatch = result.matchedItems.drinks.some(item =>
            (item.name?.toLowerCase() + ' ' + (item.description?.toLowerCase() || '')).includes(keyLower)
          );
          const hasHappyHourMatch = result.matchedItems.happyHours.some(item =>
            ((item.name || item.item || '').toLowerCase() + ' ' + (item.description?.toLowerCase() || '')).includes(keyLower)
          );

          if (hasMenuMatch || hasDrinkMatch || hasHappyHourMatch) {
            keywordMatchCount++;
          }
        });

        // Give MASSIVE bonus for matching multiple criteria
        // This ensures businesses matching ALL criteria appear first
        if (keywordMatchCount >= 2) {
          result.score += (keywordMatchCount - 1) * 500; // +500 for 2nd match, +1000 for 3rd, etc.
          result.matchedTerms.unshift(`✨ Matches ${keywordMatchCount} of your criteria!`);
        }
      });
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    console.log(`✅ Found ${results.length} results`);

    return {
      businesses: results.slice(0, 6), // Top 6 for dropdown
      allResults: results, // All results for full page
      menuItems: [], // Keep for compatibility
      drinks: []
    };
  }

  searchMenuItems(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    this.allBusinesses.forEach(business => {
      if (!business.menu || business.menu.length === 0) return;

      business.menu.forEach(item => {
        let matchScore = 0;

        // Name match
        if (item.name.toLowerCase().includes(lowerQuery)) {
          matchScore += 10;
        }

        // Description match
        if (item.description?.toLowerCase().includes(lowerQuery)) {
          matchScore += 5;
        }

        // Category match
        if (item.category?.toLowerCase().includes(lowerQuery)) {
          matchScore += 3;
        }

        if (matchScore > 0) {
          results.push({
            ...item,
            businessId: business.id,
            businessName: business.name,
            businessLocation: business.location,
            businessImage: (business.images && business.images[0]) || business.image,
            matchScore,
            type: 'menu-item'
          });
        }
      });
    });

    // Sort by match score
    results.sort((a, b) => b.matchScore - a.matchScore);
    return results; // Return all results for pagination
  }

  searchDrinks(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    this.allBusinesses.forEach(business => {
      if (!business.drinks || business.drinks.length === 0) return;

      business.drinks.forEach(item => {
        let matchScore = 0;

        // Name match
        if (item.name.toLowerCase().includes(lowerQuery)) {
          matchScore += 10;
        }

        // Description match
        if (item.description?.toLowerCase().includes(lowerQuery)) {
          matchScore += 5;
        }

        // Category match
        if (item.category?.toLowerCase().includes(lowerQuery)) {
          matchScore += 3;
        }

        if (matchScore > 0) {
          results.push({
            ...item,
            businessId: business.id,
            businessName: business.name,
            businessLocation: business.location,
            businessImage: (business.images && business.images[0]) || business.image,
            matchScore,
            type: 'drink'
          });
        }
      });
    });

    // Sort by match score
    results.sort((a, b) => b.matchScore - a.matchScore);
    return results; // Return all results for pagination
  }

  searchBusinesses(query) {
    const lowerQuery = query.toLowerCase();
    const results = {
      businesses: [],
      categories: new Set(),
      locations: new Set(),
      tags: new Set()
    };

    this.allBusinesses.forEach(business => {
      let matchScore = 0;
      let matchType = null;

      // Name match (highest priority)
      if (business.name.toLowerCase().includes(lowerQuery)) {
        matchScore += 10;
        matchType = 'name';
      }

      // Cuisine match
      if (business.cuisine?.toLowerCase().includes(lowerQuery)) {
        matchScore += 8;
        matchType = matchType || 'cuisine';
      }

      // Category match
      if (business.category?.toLowerCase().includes(lowerQuery)) {
        matchScore += 6;
        matchType = matchType || 'category';
        results.categories.add(business.category);
      }

      // Location match
      if (business.location?.toLowerCase().includes(lowerQuery)) {
        matchScore += 7;
        matchType = matchType || 'location';
        results.locations.add(business.location);
      }

      // District match
      if (business.district?.toLowerCase().includes(lowerQuery)) {
        matchScore += 9;
        matchType = matchType || 'district';
        results.locations.add(business.district);
      }

      // Tags match
      if (business.tags) {
        business.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lowerQuery)) {
            matchScore += 5;
            matchType = matchType || 'tag';
            results.tags.add(tag);
          }
        });
      }

      // Description match
      if (business.description?.toLowerCase().includes(lowerQuery)) {
        matchScore += 3;
        matchType = matchType || 'description';
      }

      if (matchScore > 0) {
        results.businesses.push({
          ...business,
          matchScore,
          matchType
        });
      }
    });

    // Sort by match score
    results.businesses.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    results.businesses = results.businesses.slice(0, 6);

    return results;
  }

  displayResults(results, grokParsed = null) {
    if (!this.suggestionsContainer) return;

    let html = '';

    // Show AI insights if available
    if (grokParsed && grokParsed.keywords) {
      html += `
        <div style="padding: 12px; background: #ecfdf5; border-left: 3px solid #10b981; margin-bottom: 10px; font-size: 13px;">
          <strong style="color: #059669;">🤖 AI understood:</strong> ${grokParsed.keywords.join(', ')}
        </div>
      `;
    }

    // Show business results with matched items
    if (results.businesses && results.businesses.length > 0) {
      html += `
        <div class="suggestions-section">
          <div class="suggestions-header">Businesses (${results.businesses.length} found)</div>
      `;

      results.businesses.forEach(result => {
        const business = result.business;
        const matchedItems = result.matchedItems;

        html += `
          <div class="suggestion-item-enhanced" data-business-id="${business.id}" style="padding: 15px; border-bottom: 1px solid #e5e7eb; cursor: pointer;">
            <div style="display: flex; gap: 12px;">
              <div class="suggestion-icon business" style="font-size: 24px;">${this.getCategoryIcon(business.category)}</div>
              <div style="flex: 1;">
                <div class="suggestion-name" style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">
                  ${this.highlightMatch(business.name)}
                </div>
                <div class="suggestion-meta" style="font-size: 13px; color: #6b7280;">
                  ${business.cuisine || business.category} • ${business.location || business.address || ''}
                </div>
                ${business.rating ? `<div style="font-size: 12px; color: #f59e0b; margin-top: 4px;">⭐ ${business.rating}</div>` : ''}

                ${matchedItems.menuItems.length > 0 ? `
                  <div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 6px;">
                    <div style="font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 6px;">🍽️ Menu Items (${matchedItems.menuItems.length})</div>
                    ${matchedItems.menuItems.slice(0, 3).map(item => `
                      <div style="font-size: 12px; color: #78350f; margin-bottom: 4px;">
                        • ${this.highlightMatch(item.name)} ${item.price ? `- ${item.price}` : ''}
                      </div>
                    `).join('')}
                    ${matchedItems.menuItems.length > 3 ? `<div style="font-size: 11px; color: #92400e; margin-top: 4px;">+${matchedItems.menuItems.length - 3} more</div>` : ''}
                  </div>
                ` : ''}

                ${matchedItems.drinks.length > 0 ? `
                  <div style="margin-top: 10px; padding: 10px; background: #dbeafe; border-radius: 6px;">
                    <div style="font-size: 12px; font-weight: 600; color: #1e40af; margin-bottom: 6px;">🍹 Drinks (${matchedItems.drinks.length})</div>
                    ${matchedItems.drinks.slice(0, 3).map(item => `
                      <div style="font-size: 12px; color: #1e3a8a; margin-bottom: 4px;">
                        • ${this.highlightMatch(item.name)} ${item.price ? `- ${item.price}` : ''}
                      </div>
                    `).join('')}
                    ${matchedItems.drinks.length > 3 ? `<div style="font-size: 11px; color: #1e40af; margin-top: 4px;">+${matchedItems.drinks.length - 3} more</div>` : ''}
                  </div>
                ` : ''}

                ${matchedItems.happyHours.length > 0 ? `
                  <div style="margin-top: 10px; padding: 10px; background: #fce7f3; border-radius: 6px;">
                    <div style="font-size: 12px; font-weight: 600; color: #be123c; margin-bottom: 6px;">🍻 Happy Hour Specials (${matchedItems.happyHours.length})</div>
                    ${matchedItems.happyHours.slice(0, 2).map(item => `
                      <div style="font-size: 12px; color: #881337; margin-bottom: 4px;">
                        • ${this.highlightMatch(item.name || item.item || 'Happy Hour')} ${item.price ? `- ${item.price}` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                ${result.matchedTerms.length > 0 ? `
                  <div style="margin-top: 10px; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                    <div style="font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">Why this matches:</div>
                    ${result.matchedTerms.slice(0, 3).map(term => `
                      <div style="font-size: 11px; color: #6b7280;">• ${term}</div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }

    // View all results link
    if (results.allResults && results.allResults.length > 6) {
      html += `
        <a href="search-results.html?q=${encodeURIComponent(this.currentQuery)}" class="view-all-results">
          View all ${results.allResults.length} results for "${this.currentQuery}"
        </a>
      `;
    }

    // Empty state
    if (html === '' || (results.businesses && results.businesses.length === 0)) {
      html = `
        <div class="search-empty-state">
          <div class="search-empty-icon">🔍</div>
          <div class="search-empty-title">No results found</div>
          <div class="search-empty-description">Try searching for restaurants, menu items, activities, or locations</div>
        </div>
      `;
    }

    this.suggestionsContainer.innerHTML = html;
    this.suggestionsContainer.classList.add('active');
    this.currentHighlightIndex = -1;

    // Attach click handlers
    this.attachEnhancedSuggestionHandlers();
  }

  attachEnhancedSuggestionHandlers() {
    const businessCards = this.suggestionsContainer?.querySelectorAll('.suggestion-item-enhanced');

    businessCards?.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const businessId = card.dataset.businessId;
        if (businessId) {
          this.saveRecentSearch(this.currentQuery);
          window.location.href = `profile.html?id=${businessId}`;
        }
      });
    });
  }

  attachPaginationHandlers() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.displayResults(this.allResults);
          // Scroll to top of suggestions
          this.suggestionsContainer.scrollTop = 0;
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const allItems = [
          ...(this.allResults.menuItems || []),
          ...(this.allResults.drinks || [])
        ];
        const totalPages = Math.ceil(allItems.length / this.itemsPerPage);

        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.displayResults(this.allResults);
          // Scroll to top of suggestions
          this.suggestionsContainer.scrollTop = 0;
        }
      });
    }
  }

  createMenuItemSuggestion(item) {
    return `
      <button class="suggestion-item" data-menu-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
        <div class="suggestion-icon menu-item">🍽️</div>
        <div class="suggestion-content">
          <div class="suggestion-name">${this.highlightMatch(item.name)}</div>
          <div class="suggestion-meta">${item.businessName} • ${item.price}</div>
        </div>
        <div class="suggestion-badge">${item.category}</div>
      </button>
    `;
  }

  createDrinkSuggestion(item) {
    return `
      <button class="suggestion-item" data-drink-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
        <div class="suggestion-icon drink-item">🍹</div>
        <div class="suggestion-content">
          <div class="suggestion-name">${this.highlightMatch(item.name)}</div>
          <div class="suggestion-meta">${item.businessName} • ${item.price}</div>
        </div>
        <div class="suggestion-badge">${item.category}</div>
      </button>
    `;
  }

  createBusinessSuggestion(business) {
    const icon = this.getCategoryIcon(business.category);
    return `
      <button class="suggestion-item" data-business-id="${business.id}">
        <div class="suggestion-icon business">${icon}</div>
        <div class="suggestion-content">
          <div class="suggestion-name">${this.highlightMatch(business.name)}</div>
          <div class="suggestion-meta">${business.cuisine || business.category} • ${business.location}</div>
        </div>
        ${business.rating ? `<div class="suggestion-badge">⭐ ${business.rating}</div>` : ''}
      </button>
    `;
  }

  createCategorySuggestion(category) {
    const icon = this.getCategoryIcon(category);
    return `
      <button class="suggestion-item" data-category="${category}">
        <div class="suggestion-icon category">${icon}</div>
        <div class="suggestion-content">
          <div class="suggestion-name">${this.highlightMatch(category)}</div>
          <div class="suggestion-meta">Browse all ${category}</div>
        </div>
      </button>
    `;
  }

  createLocationSuggestion(location) {
    return `
      <button class="suggestion-item" data-location="${location}">
        <div class="suggestion-icon location">📍</div>
        <div class="suggestion-content">
          <div class="suggestion-name">${this.highlightMatch(location)}</div>
          <div class="suggestion-meta">View businesses in ${location}</div>
        </div>
      </button>
    `;
  }

  createTagSuggestion(tag) {
    return `
      <button class="suggestion-item" data-tag="${tag}">
        <div class="suggestion-icon tag">🏷️</div>
        <div class="suggestion-content">
          <div class="suggestion-name">${this.highlightMatch(tag)}</div>
          <div class="suggestion-meta">Filter by ${tag}</div>
        </div>
      </button>
    `;
  }

  getCategoryIcon(category) {
    const icons = {
      restaurants: '🍽️',
      activities: '🏄',
      'coffee-sweets': '☕',
      shopping: '🛍️',
      entertainment: '🎭',
      bars: '🍺',
      hotels: '🏨'
    };
    return icons[category] || '📍';
  }

  highlightMatch(text) {
    if (!this.currentQuery) return text;

    const regex = new RegExp(`(${this.currentQuery})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  attachSuggestionHandlers() {
    const suggestions = this.suggestionsContainer?.querySelectorAll('.suggestion-item');

    suggestions?.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();

        const businessId = item.dataset.businessId;
        const category = item.dataset.category;
        const location = item.dataset.location;
        const tag = item.dataset.tag;
        const menuItemData = item.dataset.menuItem;
        const drinkItemData = item.dataset.drinkItem;

        if (menuItemData) {
          // Menu item clicked - go to menu items results page
          try {
            const menuItem = JSON.parse(menuItemData);
            this.saveRecentSearch(this.currentQuery);
            window.location.href = `menu-search.html?q=${encodeURIComponent(this.currentQuery)}&type=menu`;
          } catch (error) {
            console.error('Error parsing menu item data:', error);
          }
        } else if (drinkItemData) {
          // Drink clicked - go to drinks results page
          try {
            const drink = JSON.parse(drinkItemData);
            this.saveRecentSearch(this.currentQuery);
            window.location.href = `menu-search.html?q=${encodeURIComponent(this.currentQuery)}&type=drinks`;
          } catch (error) {
            console.error('Error parsing drink data:', error);
          }
        } else if (businessId) {
          this.saveRecentSearch(this.currentQuery);
          window.location.href = `profile.html?id=${businessId}`;
        } else if (category) {
          this.saveRecentSearch(category);
          window.location.href = `${category}.html`;
        } else if (location || tag) {
          this.saveRecentSearch(location || tag);
          this.goToSearchResults(location || tag);
        }
      });
    });
  }

  showRecentSearches() {
    if (this.recentSearches.length === 0) {
      this.suggestionsContainer.innerHTML = `
        <div class="search-empty-state">
          <div class="search-empty-icon">🔍</div>
          <div class="search-empty-title">Start searching</div>
          <div class="search-empty-description">Try "seafood", "Orange Beach", or "happy hour"</div>
        </div>
      `;
      this.suggestionsContainer.classList.add('active');
      return;
    }

    const html = `
      <div class="suggestions-section">
        <div class="suggestions-header">Recent Searches</div>
        ${this.recentSearches.map((search, index) => `
          <div class="recent-search-item" data-search="${search}">
            <svg class="recent-search-icon" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
            </svg>
            <div class="recent-search-text">${search}</div>
            <button class="recent-search-delete" data-index="${index}" aria-label="Delete">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
        `).join('')}
      </div>
    `;

    this.suggestionsContainer.innerHTML = html;
    this.suggestionsContainer.classList.add('active');

    // Attach handlers
    const items = this.suggestionsContainer.querySelectorAll('.recent-search-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.recent-search-delete')) return;

        const search = item.dataset.search;
        this.searchInput.value = search;
        this.currentQuery = search;
        this.performSearch();
      });
    });

    // Delete buttons
    const deleteButtons = this.suggestionsContainer.querySelectorAll('.recent-search-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.deleteRecentSearch(index);
        this.showRecentSearches();
      });
    });
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.currentQuery = '';
      this.showRecentSearches();
      this.searchInput.focus();
    }
  }

  closeSuggestions() {
    this.suggestionsContainer?.classList.remove('active');
    this.overlay?.classList.remove('active');
    this.currentHighlightIndex = -1;
  }

  goToSearchResults(query = null) {
    const searchQuery = query || this.currentQuery;
    if (searchQuery) {
      this.saveRecentSearch(searchQuery);
      window.location.href = `search-results.html?q=${encodeURIComponent(searchQuery)}`;
    }
  }

  async startAISearch() {
    // Use Grok AI to parse and search with natural language
    if (typeof GrokSearch === 'undefined' || !window.grokSearch) {
      alert('Grok AI Search is loading... Please try again in a moment.');
      return;
    }

    // Check for voice recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback to text input if voice not supported
      const query = prompt('What are you looking for?');
      if (query) {
        await this.performGrokSearch(query);
      }
      return;
    }

    // Start voice recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // Show listening indicator
    if (this.searchInput) {
      this.searchInput.placeholder = '🎤 Listening...';
    }

    recognition.onresult = async (event) => {
      const query = event.results[0][0].transcript;
      console.log('🎤 Voice query:', query);

      if (this.searchInput) {
        this.searchInput.value = query;
        this.searchInput.placeholder = 'Search businesses...';
      }

      await this.performGrokSearch(query);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      if (this.searchInput) {
        this.searchInput.placeholder = 'Search businesses...';
      }
      alert('Voice recognition error. Please try again.');
    };

    recognition.onend = () => {
      if (this.searchInput) {
        this.searchInput.placeholder = 'Search businesses...';
      }
    };

    recognition.start();
  }

  async performGrokSearch(query) {
    if (!query || !window.grokSearch) return;

    // Show loading state
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = 'block';
      this.suggestionsContainer.innerHTML = '<div style="padding: 20px; text-align: center;">🤖 Searching with AI...</div>';
    }

    try {
      // Use Grok AI to search businesses
      const searchResults = await window.grokSearch.searchBusinesses(query, this.allBusinesses);

      // Format and display results
      if (searchResults && searchResults.results.length > 0) {
        const html = window.grokSearch.formatResults(searchResults);
        if (this.suggestionsContainer) {
          this.suggestionsContainer.innerHTML = html;
          this.suggestionsContainer.style.display = 'block';
        }
      } else {
        if (this.suggestionsContainer) {
          this.suggestionsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No results found. Try a different search.</div>';
        }
      }
    } catch (error) {
      console.error('Grok search error:', error);
      if (this.suggestionsContainer) {
        this.suggestionsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #ef4444;">Search error. Please try again.</div>';
      }
    }
  }

  startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    const voiceBtn = document.querySelector('.search-voice-btn');
    if (voiceBtn) {
      voiceBtn.style.color = '#EF4444';
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (this.searchInput) {
        this.searchInput.value = transcript;
        this.currentQuery = transcript;
        this.performSearch();
      }
    };

    recognition.onend = () => {
      if (voiceBtn) {
        voiceBtn.style.color = '#4A90E2';
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (voiceBtn) {
        voiceBtn.style.color = '#4A90E2';
      }
    };
  }

  // Recent searches management
  loadRecentSearches() {
    try {
      const saved = localStorage.getItem('gcr_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveRecentSearch(query) {
    if (!query) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase());

    // Add to beginning
    this.recentSearches.unshift(query);

    // Keep only last 10
    this.recentSearches = this.recentSearches.slice(0, 10);

    // Save to localStorage
    try {
      localStorage.setItem('gcr_recent_searches', JSON.stringify(this.recentSearches));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  }

  deleteRecentSearch(index) {
    this.recentSearches.splice(index, 1);
    try {
      localStorage.setItem('gcr_recent_searches', JSON.stringify(this.recentSearches));
    } catch (e) {
      console.error('Failed to delete recent search:', e);
    }
  }
}

// Initialize search when script loads
const globalSearch = new GlobalSearch();
