// ========================================
// Business AI Chat with Google Gemini
// Individual business conversational AI
// ========================================

class BusinessAI {
  constructor() {
    this.apiKey = (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.geminiApiKey) || '';
    this.model = (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.geminiModel) || 'gemini-pro';
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    this.conversationHistory = [];
    this.currentBusiness = null;
    this.isProcessing = false;
  }

  /**
   * Initialize the Business AI for a specific business
   * @param {Object} business - The business object with all details
   */
  initForBusiness(business) {
    this.currentBusiness = business;
    this.conversationHistory = [];
    console.log(`[Business AI] Initialized for: ${business.name}`);
  }

  /**
   * Build context prompt from business data
   * @returns {string} Context prompt for AI
   */
  buildBusinessContext() {
    if (!this.currentBusiness) {
      return 'No business data available.';
    }

    const business = this.currentBusiness;
    let context = `You are an AI assistant for ${business.name}`;

    if (business.city) {
      context += `, located in ${business.city}, ${business.state || 'Alabama'}`;
    }

    context += '.\n\n';
    context += 'Your job is to answer questions about this business in a friendly, conversational way.\n\n';
    context += '=== BUSINESS INFORMATION ===\n\n';

    // Basic Info
    if (business.description) {
      context += `Description: ${business.description}\n\n`;
    }

    if (business.category) {
      context += `Category: ${business.category}\n`;
    }

    if (business.cuisine) {
      context += `Cuisine: ${business.cuisine}\n`;
    }

    if (business.subcategory) {
      context += `Type: ${business.subcategory}\n`;
    }

    context += '\n';

    // Hours
    if (business.hours) {
      context += '=== HOURS ===\n';
      if (typeof business.hours === 'string') {
        context += business.hours + '\n\n';
      } else if (typeof business.hours === 'object') {
        Object.entries(business.hours).forEach(([day, hours]) => {
          context += `${day}: ${hours}\n`;
        });
        context += '\n';
      }
    }

    // Contact & Location
    context += '=== CONTACT & LOCATION ===\n';
    if (business.address) {
      context += `Address: ${business.address}\n`;
    }
    if (business.phone) {
      context += `Phone: ${business.phone}\n`;
    }
    if (business.website) {
      context += `Website: ${business.website}\n`;
    }
    context += '\n';

    // Menu
    if (business.menu && business.menu.length > 0) {
      context += '=== MENU ===\n';
      business.menu.forEach(item => {
        context += `- ${item.name}`;
        if (item.price) context += ` ($${item.price})`;
        if (item.description) context += `: ${item.description}`;
        context += '\n';
      });
      context += '\n';
    }

    // Drinks
    if (business.drinks && business.drinks.length > 0) {
      context += '=== DRINKS ===\n';
      business.drinks.forEach(drink => {
        context += `- ${drink.name}`;
        if (drink.price) context += ` ($${drink.price})`;
        if (drink.description) context += `: ${drink.description}`;
        context += '\n';
      });
      context += '\n';
    }

    // Happy Hour
    if (business.happy_hour) {
      context += '=== HAPPY HOUR ===\n';
      if (business.happy_hour.title) {
        context += `${business.happy_hour.title}\n`;
      }
      if (business.happy_hour.days) {
        context += `Days: ${business.happy_hour.days}\n`;
      }
      if (business.happy_hour.items && business.happy_hour.items.length > 0) {
        context += 'Specials:\n';
        business.happy_hour.items.forEach(item => {
          context += `- ${item.name}`;
          if (item.happy_hour_price) context += ` - $${item.happy_hour_price}`;
          if (item.regular_price) context += ` (reg. $${item.regular_price})`;
          if (item.description) context += `: ${item.description}`;
          context += '\n';
        });
      }
      context += '\n';
    }

    // Specials
    if (business.specials && business.specials.length > 0) {
      context += '=== SPECIALS ===\n';
      business.specials.forEach(special => {
        context += `- ${special.title || special.name}\n`;
        if (special.days) context += `  Days: ${special.days}\n`;
        if (special.description) context += `  ${special.description}\n`;
      });
      context += '\n';
    }

    // Events
    if (business.events && business.events.length > 0) {
      context += '=== UPCOMING EVENTS ===\n';
      business.events.forEach(event => {
        context += `- ${event.title || event.name}\n`;
        if (event.date) context += `  Date: ${event.date}\n`;
        if (event.time) context += `  Time: ${event.time}\n`;
        if (event.description) context += `  ${event.description}\n`;
      });
      context += '\n';
    }

    // Features & Amenities
    if (business.features && business.features.length > 0) {
      context += '=== FEATURES & AMENITIES ===\n';
      context += business.features.join(', ') + '\n\n';
    }

    // Price Level
    if (business.priceLevel) {
      const priceLabels = {
        1: 'Budget-friendly ($)',
        2: 'Moderate ($$)',
        3: 'Upscale ($$$)',
        4: 'Fine Dining ($$$$)'
      };
      context += `Price Range: ${priceLabels[business.priceLevel] || business.priceLevel}\n\n`;
    }

    // Instructions
    context += '=== INSTRUCTIONS ===\n';
    context += '- Be friendly, conversational, and helpful\n';
    context += '- Answer questions based on the data above\n';
    context += '- If you don\'t know something from the data, say "I don\'t have that information in my database, but you can call us to find out!"\n';
    context += '- Keep responses concise (2-3 sentences unless more detail is requested)\n';
    context += '- Use emojis occasionally to be friendly 😊\n';
    context += '- If asked about recommendations, suggest menu items or specials based on the data\n';
    context += '- For time-sensitive info (hours, events), always encourage them to call or check the website to confirm\n\n';

    return context;
  }

  /**
   * Send a message to Gemini and get response
   * @param {string} userMessage - The user's question
   * @returns {Promise<string>} AI response
   */
  async sendMessage(userMessage) {
    if (!this.apiKey) {
      return 'Sorry, the AI assistant is not configured yet. Please contact support or try again later.';
    }

    if (this.isProcessing) {
      return 'Please wait for the current response to finish...';
    }

    if (!this.currentBusiness) {
      return 'No business information loaded. Please refresh the page.';
    }

    this.isProcessing = true;

    try {
      // Build the full prompt with context
      const businessContext = this.buildBusinessContext();
      const fullPrompt = `${businessContext}\n\nUser question: ${userMessage}\n\nYour response:`;

      // Make API call to Gemini
      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Business AI] API Error:', error);

        if (response.status === 429) {
          return 'Sorry, we\'ve reached our API limit. Please try again in a minute. 🕐';
        }

        return 'Sorry, I\'m having trouble connecting right now. Please try again or call the business directly. 📞';
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Store in conversation history
        this.conversationHistory.push({
          user: userMessage,
          ai: aiResponse,
          timestamp: new Date().toISOString()
        });

        return aiResponse;
      } else {
        console.error('[Business AI] Unexpected response format:', data);
        return 'Sorry, I received an unexpected response. Please try again. 🔄';
      }

    } catch (error) {
      console.error('[Business AI] Error:', error);
      return 'Sorry, something went wrong. Please try again or contact the business directly. 😕';
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get suggested questions based on business data
   * @returns {Array<string>} Array of suggested questions
   */
  getSuggestedQuestions() {
    const suggestions = [];
    const business = this.currentBusiness;

    if (!business) return [];

    // Always include these
    suggestions.push("What are your hours?");
    suggestions.push("What's the vibe like?");

    // Add specific suggestions based on available data
    if (business.menu && business.menu.length > 0) {
      suggestions.push("What are your most popular dishes?");
    }

    if (business.happy_hour) {
      suggestions.push("Tell me about your happy hour");
    }

    if (business.events && business.events.length > 0) {
      suggestions.push("What events do you have coming up?");
    }

    if (business.features && business.features.includes('Live Music')) {
      suggestions.push("Do you have live music?");
    }

    if (business.features && business.features.includes('Outdoor Seating')) {
      suggestions.push("Do you have outdoor seating?");
    }

    if (business.category === 'Restaurant' || business.category === 'Dining') {
      suggestions.push("Do you have vegetarian options?");
      suggestions.push("Good for families?");
    }

    // Limit to 5 suggestions
    return suggestions.slice(0, 5);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('[Business AI] Conversation history cleared');
  }

  /**
   * Check if API is configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.businessAI = new BusinessAI();
  console.log('[Business AI] Initialized and ready');
}
