    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Y1X3LN2FSB');
    // Get query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    // XAI Grok API configuration (loaded from ai-config.js)
    const XAI_API_KEY = (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.grokApiKey) || '';
    const XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

    async function parseWithGrok(query) {
      try {
        const systemPrompt = `You are helping search a business directory for Gulf Coast Radar (restaurants, activities, hotels, shopping in Orange Beach & Gulf Shores, Alabama).

Understand the user's complete question and extract what they need.

Return JSON: {"keywords": ["all relevant search terms"], "timing": "today/tomorrow/null", "filters": {"category": "restaurants/activities/coffee-sweets/hotels/null", "features": ["outdoor seating", "kid-friendly", etc]}}

Extract ALL relevant terms - food items, activities, business types, features they want.`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(XAI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${XAI_API_KEY}`,
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

        if (!response.ok) return null;

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

    async function performSearch() {
      if (!query) {
        window.location.href = 'index.html';
        return;
      }

      document.getElementById('search-query').textContent = `"${query}"`;
      document.getElementById('search-meta').textContent = 'AI is analyzing your question...';

      // Use AI to parse query
      const grokParsed = await parseWithGrok(query);

      // Show AI insights
      if (grokParsed && grokParsed.keywords) {
        document.getElementById('ai-insight').innerHTML = `
          <div class="ai-insight">
            <div class="ai-insight-title">🤖 AI understood your search:</div>
            <div class="ai-keywords">
              ${grokParsed.keywords.map(kw => `<span class="ai-keyword">${kw}</span>`).join('')}
            </div>
          </div>
        `;
      }

      // Search businesses
      const businesses = typeof allBusinesses !== 'undefined' ? allBusinesses : [];
      const results = searchBusinesses(businesses, query, grokParsed);

      document.getElementById('search-meta').textContent = `Found ${results.length} results`;
      displayResults(results);
    }

    function searchBusinesses(businesses, query, grokParsed) {
      const queryLower = query.toLowerCase();
      const stopwords = ['i', 'im', 'i\'m', 'looking', 'for', 'a', 'an', 'the', 'to', 'go', 'get', 'need', 'want', 'find', 'list', 'of', 'show', 'me', 'some', 'any', 'can', 'you', 'tell', 'place', 'that', 'has', 'on', 'with', 'where', 'is', 'are', 'there'];
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2 && !stopwords.includes(w));

      const results = [];

      businesses.forEach(business => {
        let score = 0;
        const matchedTerms = [];
        const matchedItems = {
          menuItems: [],
          drinks: [],
          happyHours: [],
          specials: [],
          events: []
        };

        // AI keywords (PRIMARY)
        if (grokParsed && grokParsed.keywords) {
          const keywords = Array.isArray(grokParsed.keywords) ? grokParsed.keywords : [grokParsed.keywords];

          keywords.forEach(keyword => {
            const keyLower = keyword.toLowerCase();

            // Check menu
            if (business.menu && Array.isArray(business.menu)) {
              business.menu.forEach(item => {
                if (item.name?.toLowerCase().includes(keyLower) ||
                    item.description?.toLowerCase().includes(keyLower)) {
                  score += 50;
                  matchedTerms.push(`AI matched menu: ${item.name}`);
                  if (!matchedItems.menuItems.find(m => m.name === item.name)) {
                    matchedItems.menuItems.push(item);
                  }
                }
              });
            }

            // Check drinks
            if (business.drinks && Array.isArray(business.drinks)) {
              business.drinks.forEach(item => {
                if (item.name?.toLowerCase().includes(keyLower) ||
                    item.description?.toLowerCase().includes(keyLower)) {
                  score += 50;
                  matchedTerms.push(`AI matched drink: ${item.name}`);
                  if (!matchedItems.drinks.find(m => m.name === item.name)) {
                    matchedItems.drinks.push(item);
                  }
                }
              });
            }

            // Check happy hours
            const hhData = business.happy_hour || business.happyHours || [];
            const hhArray = Array.isArray(hhData) ? hhData : (hhData.items || []);
            if (hhArray.length > 0) {
              hhArray.forEach(item => {
                const itemText = [
                  item.name, item.item, item.deals,
                  item.description, item.days
                ].filter(Boolean).join(' ').toLowerCase();

                if (itemText.includes(keyLower)) {
                  score += 40;
                  const displayName = item.name || item.item || item.deals || 'Happy Hour';
                  matchedTerms.push(`AI matched happy hour: ${displayName}`);
                  if (!matchedItems.happyHours.find(m => JSON.stringify(m) === JSON.stringify(item))) {
                    matchedItems.happyHours.push(item);
                  }
                }
              });
            }

            // Check tags
            if (business.tags && business.tags.some(tag => tag.toLowerCase().includes(keyLower))) {
              score += 30;
              matchedTerms.push(`Has feature: ${keyword}`);
            }
          });
        }

        // Fallback keyword search
        queryWords.forEach(word => {
          if (business.name?.toLowerCase().includes(word)) {
            score += 50;
            matchedTerms.push(`"${word}" in business name`);
          }
          if (business.category?.toLowerCase().includes(word)) {
            score += 30;
            matchedTerms.push(`"${word}" matches category`);
          }
          if (business.cuisine?.toLowerCase().includes(word)) {
            score += 30;
            matchedTerms.push(`"${word}" matches cuisine`);
          }
          if (business.description?.toLowerCase().includes(word) ||
              business.about?.toLowerCase().includes(word)) {
            score += 20;
          }
          if (business.tags && business.tags.some(tag => tag.toLowerCase().includes(word))) {
            score += 25;
            matchedTerms.push(`"${word}" in features`);
          }

          // Search menu items
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

          // Search drinks
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

        if (score >= 20) {
          results.push({ business, score, matchedTerms, matchedItems });
        }
      });

      results.sort((a, b) => b.score - a.score);
      return results;
    }

    // Check if business is currently open
    function isOpenNow(hours) {
      if (!hours || typeof hours !== 'object') return null;

      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentTime = now.getHours() * 100 + now.getMinutes();

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[dayOfWeek];

      const todayHours = hours[todayName];
      if (!todayHours) return null;

      if (todayHours === 'Closed' || todayHours.toLowerCase() === 'closed') {
        return false;
      }

      const timeRanges = todayHours.split(',').map(range => range.trim());

      for (const range of timeRanges) {
        const match = range.match(/(\d{1,2}):(\d{2})\s*(AM|PM).*?(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
          let [_, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = match;

          startHour = parseInt(startHour);
          endHour = parseInt(endHour);
          if (startPeriod.toUpperCase() === 'PM' && startHour !== 12) startHour += 12;
          if (startPeriod.toUpperCase() === 'AM' && startHour === 12) startHour = 0;
          if (endPeriod.toUpperCase() === 'PM' && endHour !== 12) endHour += 12;
          if (endPeriod.toUpperCase() === 'AM' && endHour === 12) endHour = 0;

          const startTime = startHour * 100 + parseInt(startMin);
          const endTime = endHour * 100 + parseInt(endMin);

          if (currentTime >= startTime && currentTime <= endTime) {
            return true;
          }
        }
      }

      return false;
    }

    async function displayResults(results) {
      const container = document.getElementById('results');

      if (results.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-title">No results found</div>
            <div class="empty-description">Try searching for restaurants, menu items, activities, or locations</div>
          </div>
        `;
        return;
      }

      // Get user location for distance calculation
      let userLoc = null;
      try {
        userLoc = await getUserLocation();
      } catch (e) {
        console.log('Could not get user location');
      }

      // Calculate distances if we have user location
      if (userLoc) {
        for (const result of results) {
          const business = result.business;
          if (business.location && business.location.lat && business.location.lng) {
            try {
              const distance = await calculateDrivingDistance(userLoc, business.location);
              result.distance = distance;
            } catch (e) {
              // Skip if distance calc fails
            }
          }
        }
      }

      container.innerHTML = results.map(result => {
        const business = result.business;
        const matchedItems = result.matchedItems;
        const openStatus = isOpenNow(business.hours);
        const distance = result.distance;

        return `
          <div class="business-card">
            <div class="business-header">
              <div>
                <div class="business-name" onclick="window.location.href='profile.html?id=${business.id}'">${business.name}</div>
                <div class="business-category">${business.cuisine || business.category}</div>
                <div class="business-meta">
                  ${business.rating ? `<span>⭐ ${business.rating}</span>` : ''}
                  ${business.priceLevel ? `<span>${business.priceLevel}</span>` : ''}
                  ${distance ? `<span style="color: #047857; font-weight: 600;">📍 ${distance.miles} mi (${distance.duration} min)</span>` : ''}
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                ${openStatus === true ? `<div class="open-badge" style="background: #10b981; color: white; font-weight: 600;">🟢 Open Now</div>` :
                  openStatus === false ? `<div class="open-badge" style="background: #ef4444; color: white; font-weight: 600;">🔴 Closed</div>` :
                  business.hours ? `<div class="open-badge" style="background: #6b7280; color: white;">⏰ Check Hours</div>` : ''}
              </div>
            </div>

            <div class="business-info">
              ${business.address ? `<div class="info-row"><span class="info-icon">📍</span><span>${business.address}</span></div>` : ''}
              ${business.phone ? `<div class="info-row"><span class="info-icon">📞</span><span>${business.phone}</span></div>` : ''}
            </div>

            ${matchedItems.menuItems.length > 0 ? `
              <div class="matched-items">
                <div class="matched-items-title">🍽️ Menu Items (${matchedItems.menuItems.length})</div>
                ${matchedItems.menuItems.slice(0, 5).map(item => `
                  <div class="matched-item">
                    <div class="matched-item-name">${item.name}</div>
                    ${item.description ? `<div class="matched-item-desc">${item.description}</div>` : ''}
                    ${item.price ? `<div class="matched-item-price">${item.price}</div>` : ''}
                  </div>
                `).join('')}
                ${matchedItems.menuItems.length > 5 ? `<div style="text-align: center; padding-top: 8px; color: #92400e; font-size: 13px; font-weight: 600;">+${matchedItems.menuItems.length - 5} more items</div>` : ''}
              </div>
            ` : ''}

            ${matchedItems.drinks.length > 0 ? `
              <div class="matched-items drinks-section">
                <div class="matched-items-title">🍹 Drinks (${matchedItems.drinks.length})</div>
                ${matchedItems.drinks.slice(0, 5).map(item => `
                  <div class="matched-item">
                    <div class="matched-item-name">${item.name}</div>
                    ${item.description ? `<div class="matched-item-desc">${item.description}</div>` : ''}
                    ${item.price ? `<div class="matched-item-price">${item.price}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${matchedItems.happyHours.length > 0 ? `
              <div class="matched-items happy-hour-section">
                <div class="matched-items-title">🍻 Happy Hour Specials (${matchedItems.happyHours.length} items)</div>
                ${matchedItems.happyHours.map(item => `
                  <div class="matched-item">
                    ${item.days ? `<div style="font-weight: 600; color: #be123c; font-size: 13px; margin-bottom: 4px;">⏰ ${item.days}</div>` : ''}
                    <div class="matched-item-name">${item.name || item.item || item.deals || item.description || 'Happy Hour Special'}</div>
                    ${item.description && item.description !== (item.name || item.item || item.deals) ? `<div class="matched-item-desc">${item.description}</div>` : ''}
                    ${item.price ? `<div class="matched-item-price">${item.price}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${result.matchedTerms.length > 0 ? `
              <div class="why-matches">
                <div class="why-matches-title">Why this matches your search:</div>
                ${result.matchedTerms.slice(0, 5).map(term => `<div class="match-reason">${term}</div>`).join('')}
              </div>
            ` : ''}

            <div class="business-actions">
              <button class="btn btn-primary" onclick="window.location.href='profile.html?id=${business.id}'">View Profile</button>
              ${business.phone ? `<a href="tel:${business.phone}" class="btn btn-secondary">📞 Call</a>` : ''}
              ${business.website ? `<a href="${business.website}" target="_blank" class="btn btn-secondary">🌐 Website</a>` : ''}
              ${business.address ? `<a href="#" onclick="event.preventDefault(); window.open('https://maps.google.com/?q=${encodeURIComponent(business.address)}', '_blank')" class="btn btn-secondary">🗺️ Directions</a>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    function goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    }

    // Initialize when businesses are loaded
    window.addEventListener('allBusinessesUpdated', () => {
      performSearch();
    });

    // Also check if already loaded
    if (typeof allBusinesses !== 'undefined' && allBusinesses.length > 0) {
      performSearch();
    }
