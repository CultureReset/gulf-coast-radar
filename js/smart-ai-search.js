/**
 * Smart AI Search Extension
 * Adds AI-powered natural language search with voice responses
 * Integrates with existing GlobalSearch class
 */

// Extend GlobalSearch with AI capabilities
(function() {
  // Wait for GlobalSearch to be defined
  const waitForSearch = setInterval(() => {
    if (typeof GlobalSearch !== 'undefined') {
      clearInterval(waitForSearch);
      enhanceSearchWithAI();
    }
  }, 100);

  function enhanceSearchWithAI() {
    console.log('🤖 Enhancing search with AI capabilities...');

    // Store original methods
    const originalSearchBusinesses = GlobalSearch.prototype.searchBusinesses;
    const originalStartVoiceSearch = GlobalSearch.prototype.startVoiceSearch;
    const originalPerformSearch = GlobalSearch.prototype.performSearch;

    // Add AI search flag
    GlobalSearch.prototype.useAISearch = true;
    GlobalSearch.prototype.voiceResponseEnabled = true;

    // Enhanced AI-powered business search
    GlobalSearch.prototype.searchBusinessesWithAI = async function(query) {
      console.log('🔍 Using AI-powered search for:', query);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.results) {
          console.log(`✅ AI search found ${data.results.length} results`);

          // Transform AI results to match expected format
          return {
            businesses: data.results.map(result => ({
              ...result,
              matchScore: result._searchScore || 0,
              matchType: result._matches?.[0]?.field || 'ai',
              aiMatches: result._matches
            })),
            categories: new Set(data.results.map(r => r.category).filter(Boolean)),
            locations: new Set(data.results.map(r => r.location).filter(Boolean)),
            tags: new Set(data.results.flatMap(r => r.tags || []))
          };
        }

        throw new Error('No results from AI');

      } catch (error) {
        console.warn('⚠️ AI search failed, using fallback:', error.message);
        // Fallback to original client-side search
        return originalSearchBusinesses.call(this, query);
      }
    };

    // Voice response with TTS
    GlobalSearch.prototype.speakResults = function(query, results) {
      if (!this.voiceResponseEnabled) return;
      if (!window.ttsManager) {
        console.warn('TTS not available');
        return;
      }

      const count = results.businesses?.length || 0;

      if (count === 0) {
        window.ttsManager.speak(`I couldn't find any matches for ${query}. Try a different search term.`);
        return;
      }

      // Build natural response
      let response = '';

      if (count === 1) {
        const biz = results.businesses[0];
        response = `I found ${biz.name}`;
        if (biz.location) response += ` in ${biz.location}`;
        if (biz.category) response += `, a ${biz.category.replace(/-/g, ' ')}`;
        response += '.';
      } else {
        response = `I found ${count} matches for ${query}. `;

        // Mention top 3 results
        const topResults = results.businesses.slice(0, 3);
        const names = topResults.map(b => b.name);

        if (names.length === 2) {
          response += `Top matches are ${names[0]} and ${names[1]}.`;
        } else if (names.length === 3) {
          response += `Top matches are ${names[0]}, ${names[1]}, and ${names[2]}.`;
        } else {
          response += `Here are the top results.`;
        }
      }

      window.ttsManager.speak(response);
    };

    // Enhanced voice search with AI response
    GlobalSearch.prototype.startVoiceSearch = function() {
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
        voiceBtn.classList.add('listening');
      }

      // Speak confirmation
      if (window.ttsManager) {
        window.ttsManager.speak('Listening...', { rate: 1.1, volume: 0.7 });
      }

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice input:', transcript);

        if (this.searchInput) {
          this.searchInput.value = transcript;
          this.currentQuery = transcript;

          // Perform AI search
          await this.performSearch(true); // Pass true to enable voice response
        }
      };

      recognition.onend = () => {
        if (voiceBtn) {
          voiceBtn.style.color = '#4A90E2';
          voiceBtn.classList.remove('listening');
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (voiceBtn) {
          voiceBtn.style.color = '#4A90E2';
          voiceBtn.classList.remove('listening');
        }

        if (window.ttsManager) {
          window.ttsManager.speak('Sorry, I didn\'t catch that. Please try again.');
        }
      };
    };

    // Enhanced performSearch with AI and voice
    GlobalSearch.prototype.performSearch = async function(enableVoiceResponse = false) {
      if (!this.currentQuery) {
        this.showRecentSearches();
        return;
      }

      // Reset to page 1 when query changes
      this.currentPage = 1;

      let results;

      // Use AI search if enabled
      if (this.useAISearch) {
        const businessResults = await this.searchBusinessesWithAI(this.currentQuery);

        // Still search menu items and drinks locally
        const menuResults = this.searchMenuItems ? this.searchMenuItems(this.currentQuery) : [];
        const drinkResults = this.searchDrinks ? this.searchDrinks(this.currentQuery) : [];

        results = {
          ...businessResults,
          menuItems: menuResults,
          drinks: drinkResults
        };

        // Speak results if voice search was used
        if (enableVoiceResponse && this.voiceResponseEnabled) {
          this.speakResults(this.currentQuery, results);
        }
      } else {
        // Fallback to original search
        results = this.searchEverything(this.currentQuery);
      }

      this.allResults = results; // Store all results for pagination
      this.displayResults(results);
    };

    console.log('✅ AI search enhancements loaded');
    console.log('   - Natural language understanding');
    console.log('   - Voice search with responses');
    console.log('   - Backend AI-powered ranking');
  }
})();

// Initialize TTS Manager globally
window.addEventListener('DOMContentLoaded', () => {
  if (typeof TTSVoiceManager !== 'undefined') {
    window.ttsManager = new TTSVoiceManager();
    console.log('✅ Voice manager initialized');
  }
});
