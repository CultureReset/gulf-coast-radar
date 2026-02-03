/**
 * Business Concierge AI
 *
 * Extends VacationAssistant to create business-specific AI assistants.
 * Each business gets their own AI that knows:
 * - Their menu, prices, and popular dishes
 * - Hours of operation and special events
 * - Custom FAQs and business policies
 * - Live music schedule and entertainment
 *
 * Use cases:
 * - Profile page AI widget (tourist-facing)
 * - In-store kiosk mode (customer self-service ordering)
 * - Phone automation (Twilio voice integration)
 */

class BusinessConcierge extends VacationAssistant {
  constructor(businessId) {
    super();

    // Business-specific context
    this.businessId = businessId;
    this.businessConfig = null;
    this.mode = 'widget'; // widget, kiosk, phone
    this.isBusinessSpecific = true;

    // Load business configuration
    this.loadBusinessConfig();

    console.log(`🏪 Business Concierge initialized for: ${this.businessConfig?.name || businessId}`);

    // Create yellow floating button UI
    this.createUI();
  }

  // Create yellow floating button for business-specific AI
  createUI() {
    // Create floating assistant button (YELLOW for business-specific)
    const assistantBtn = document.createElement('button');
    assistantBtn.id = 'business-ai-assistant-btn';
    assistantBtn.className = 'ai-assistant-btn business-ai-btn';
    assistantBtn.innerHTML = '🎤';
    assistantBtn.setAttribute('aria-label', `${this.businessConfig?.name || 'Business'} AI Assistant`);
    assistantBtn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      border: none;
      font-size: 32px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255, 165, 0, 0.4);
      z-index: 9998;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    assistantBtn.addEventListener('mouseenter', () => {
      assistantBtn.style.transform = 'scale(1.1)';
      assistantBtn.style.boxShadow = '0 6px 30px rgba(255, 165, 0, 0.6)';
    });

    assistantBtn.addEventListener('mouseleave', () => {
      assistantBtn.style.transform = 'scale(1)';
      assistantBtn.style.boxShadow = '0 4px 20px rgba(255, 165, 0, 0.4)';
    });

    assistantBtn.addEventListener('click', () => this.toggleListening());

    document.body.appendChild(assistantBtn);
    this.assistantBtn = assistantBtn;
  }

  // Load business-specific configuration
  loadBusinessConfig() {
    if (typeof getBusinessAIConfig === 'function') {
      this.businessConfig = getBusinessAIConfig(this.businessId);

      if (!this.businessConfig) {
        console.error(`❌ No AI config found for business: ${this.businessId}`);
        return;
      }

      // Update conversation context
      this.conversationContext.businessId = this.businessId;
      this.conversationContext.businessName = this.businessConfig.name;

      console.log(`✅ Loaded AI config for ${this.businessConfig.name}`);
    } else {
      console.error('❌ getBusinessAIConfig function not found. Make sure business-ai-config.js is loaded.');
    }
  }

  // Override: Custom greeting for this business
  getGreeting() {
    if (this.businessConfig && this.businessConfig.aiPersonality.greeting) {
      return this.businessConfig.aiPersonality.greeting;
    }
    return `Welcome to ${this.businessConfig?.name || 'our business'}! How can I help you today?`;
  }

  // Override: Process user input with business-specific context
  async processUserInput(userInput) {
    if (!this.businessConfig) {
      return "I'm sorry, I'm not properly configured yet. Please try again later.";
    }

    const input = userInput.toLowerCase().trim();

    // Log conversation
    this.conversationContext.conversationHistory.push({
      role: 'user',
      message: userInput,
      timestamp: new Date()
    });

    // Business-specific intent detection
    let response = '';

    // Menu questions
    if (this.isMenuQuestion(input)) {
      response = this.handleMenuQuestion(input);
    }
    // Hours questions
    else if (this.isHoursQuestion(input)) {
      response = this.handleHoursQuestion(input);
    }
    // Popular/recommended dishes
    else if (this.isRecommendationQuestion(input)) {
      response = this.handleRecommendationQuestion(input);
    }
    // Live music questions
    else if (this.isLiveMusicQuestion(input)) {
      response = this.handleLiveMusicQuestion(input);
    }
    // Specials/deals questions
    else if (this.isSpecialsQuestion(input)) {
      response = this.handleSpecialsQuestion(input);
    }
    // Reservation questions
    else if (this.isReservationQuestion(input)) {
      response = this.handleReservationQuestion(input);
    }
    // Check FAQs
    else if (this.hasFAQMatch(input)) {
      response = this.getFAQAnswer(input);
    }
    // General business info
    else if (this.isGeneralInfoQuestion(input)) {
      response = this.handleGeneralInfoQuestion(input);
    }
    // Greeting/hello
    else if (input.match(/\b(hi|hello|hey|good morning|good evening)\b/)) {
      response = this.getGreeting();
    }
    // Thank you
    else if (input.match(/\b(thank you|thanks|appreciate)\b/)) {
      response = `You're very welcome! Anything else I can help you with at ${this.businessConfig.name}?`;
    }
    // Fallback - Try external AI or provide helpful response
    else {
      response = await this.handleUnknownQuestion(input);
    }

    // Log response
    this.conversationContext.conversationHistory.push({
      role: 'assistant',
      message: response,
      timestamp: new Date()
    });

    return response;
  }

  // === Intent Detection Methods ===

  isMenuQuestion(input) {
    return input.match(/\b(menu|food|dish|eat|meal|serve|have|cuisine|order)\b/);
  }

  isHoursQuestion(input) {
    return input.match(/\b(hours|open|close|time|when|operating)\b/);
  }

  isRecommendationQuestion(input) {
    return input.match(/\b(recommend|popular|best|favorite|suggest|good|try|signature)\b/);
  }

  isLiveMusicQuestion(input) {
    return input.match(/\b(music|band|live|entertainment|perform|play|tonight)\b/);
  }

  isSpecialsQuestion(input) {
    return input.match(/\b(special|deal|discount|offer|promotion|happy hour)\b/);
  }

  isReservationQuestion(input) {
    return input.match(/\b(reservation|book|table|seating|wait|waitlist)\b/);
  }

  isGeneralInfoQuestion(input) {
    return input.match(/\b(address|location|phone|call|parking|directions|where|find)\b/);
  }

  // === Response Handlers ===

  handleMenuQuestion(input) {
    const knowledge = this.businessConfig.knowledge;

    // Check for specific food types
    const foodKeywords = {
      'shrimp': 'seafood',
      'fish': 'seafood',
      'oyster': 'seafood',
      'seafood': 'seafood',
      'burger': 'burger',
      'sandwich': 'sandwich',
      'taco': 'taco',
      'salad': 'salad',
      'appetizer': 'appetizer',
      'dessert': 'dessert',
      'drink': 'drink'
    };

    let response = '';

    // Check for specific food type
    for (const [keyword, type] of Object.entries(foodKeywords)) {
      if (input.includes(keyword)) {
        const matchingDishes = knowledge.popularDishes.filter(dish =>
          dish.category.toLowerCase().includes(type) ||
          dish.name.toLowerCase().includes(keyword)
        );

        if (matchingDishes.length > 0) {
          response = `Great choice! Here are our ${type} options:\n\n`;
          matchingDishes.slice(0, 3).forEach(dish => {
            response += `**${dish.name}** - ${dish.price}\n${dish.description}\n\n`;
          });
          return response;
        }
      }
    }

    // General menu response - show popular dishes
    response = `Our menu features ${knowledge.menuCategories.join(', ')}. Here are some of our most popular dishes:\n\n`;

    const bestsellers = knowledge.popularDishes.filter(d => d.bestseller).slice(0, 3);
    const dishesToShow = bestsellers.length > 0 ? bestsellers : knowledge.popularDishes.slice(0, 3);

    dishesToShow.forEach(dish => {
      const badge = dish.bestseller ? '⭐ ' : '';
      response += `${badge}**${dish.name}** - ${dish.price}\n${dish.description}\n\n`;
    });

    response += `\nWhat sounds good to you? I can tell you more about any dish!`;

    return response;
  }

  handleHoursQuestion(input) {
    const hours = this.businessConfig.knowledge.hours;
    return `We're open ${hours.display}.\n\nWe'd love to see you! Anything else I can help with?`;
  }

  handleRecommendationQuestion(input) {
    const knowledge = this.businessConfig.knowledge;
    const bestsellers = knowledge.popularDishes.filter(d => d.bestseller || d.signature);

    if (bestsellers.length === 0) {
      return this.handleMenuQuestion(input);
    }

    let response = `Oh, you've got to try our favorites! Here's what people rave about:\n\n`;

    bestsellers.slice(0, 3).forEach((dish, index) => {
      response += `${index + 1}. **${dish.name}** - ${dish.price}\n${dish.description}\n\n`;
    });

    response += `Can't go wrong with any of these! What sounds best to you?`;

    return response;
  }

  handleLiveMusicQuestion(input) {
    const liveMusic = this.businessConfig.knowledge.liveMusic;

    if (!liveMusic.hasLiveMusic) {
      return `We don't currently have live music scheduled, but we have a great atmosphere! Check back with us for future events.`;
    }

    let response = `🎵 Yes! We have live music! ${liveMusic.schedule}\n\n`;
    response += `We feature ${liveMusic.genres.join(', ')}.\n\n`;
    response += `Check our events calendar to see who's playing tonight!`;

    return response;
  }

  handleSpecialsQuestion(input) {
    const specials = this.businessConfig.knowledge.specialOffers;

    if (!specials || specials.length === 0) {
      return `We don't have any specials running right now, but we always have great food and atmosphere! Check back often for deals.`;
    }

    let response = `💰 Here are our current specials:\n\n`;

    specials.forEach(special => {
      if (special.active) {
        response += `**${special.name}** - ${special.timeframe}\n${special.description}\n\n`;
      }
    });

    response += `Don't miss out! Anything else I can help with?`;

    return response;
  }

  handleReservationQuestion(input) {
    const knowledge = this.businessConfig.knowledge;
    const features = this.businessConfig.features;

    // Find reservation FAQ
    const reservationFAQ = knowledge.faqs.find(faq =>
      faq.q.toLowerCase().includes('reservation')
    );

    if (reservationFAQ) {
      return reservationFAQ.a;
    }

    // Default response
    if (features.makeReservations) {
      return `Yes, we take reservations! You can call us at ${this.businessConfig.contact.phone} or book online. We recommend making a reservation, especially on weekends!`;
    } else {
      return `We operate on a first-come, first-served basis. No reservations needed - just come on in! You can also check our current wait time before you arrive.`;
    }
  }

  handleGeneralInfoQuestion(input) {
    const contact = this.businessConfig.contact;
    let response = `📍 **${this.businessConfig.name}**\n\n`;
    response += `📍 Address: ${contact.address}\n`;
    response += `📞 Phone: ${contact.phone}\n`;
    response += `🌐 Website: ${contact.website}\n\n`;
    response += `Need directions? Just click the "Get Directions" button on our profile!`;

    return response;
  }

  async handleUnknownQuestion(input) {
    // Try to use external AI if available
    if (this.useExternalAI && this.aiBackend) {
      try {
        // STRICT SYSTEM PROMPT - Prevents hallucination
        const context = `You are the AI assistant for ${this.businessConfig.name}.

CRITICAL RULES:
1. ONLY use information from the JSON data below
2. NEVER make up menu items, prices, hours, or any details
3. If information is NOT in the data, say "I don't have that information. You can call us at ${this.businessConfig.contact.phone}"
4. Do NOT invent specials, deals, or promotions not listed
5. Keep responses friendly but brief (2-3 sentences max)
6. If asked about something not related to this business, politely redirect

BUSINESS DATA (THIS IS YOUR ONLY SOURCE OF TRUTH):
${JSON.stringify(this.businessConfig.knowledge, null, 2)}

Contact Info:
Phone: ${this.businessConfig.contact.phone}
Address: ${this.businessConfig.contact.address}

Now answer this customer question using ONLY the data above:`;

        const response = await this.aiBackend.getResponse(input, context);
        return response;
      } catch (error) {
        console.error('External AI error:', error);
      }
    }

    // Fallback response - no external AI available
    return `I'm not sure about that, but I'd be happy to help! You can ask me about:
- Our menu and popular dishes
- Hours of operation
- Live music schedule
- Special offers and deals
- Reservations
- Directions and contact info

What would you like to know?`;
  }

  // Check if user question matches any FAQ
  hasFAQMatch(input) {
    const faqs = this.businessConfig.knowledge.faqs;
    return faqs.some(faq =>
      input.includes(faq.q.toLowerCase().substring(0, 15)) ||
      this.calculateSimilarity(input, faq.q.toLowerCase()) > 0.5
    );
  }

  // Get FAQ answer
  getFAQAnswer(input) {
    const faqs = this.businessConfig.knowledge.faqs;

    // Find best matching FAQ
    let bestMatch = null;
    let bestScore = 0;

    faqs.forEach(faq => {
      const score = this.calculateSimilarity(input, faq.q.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    });

    if (bestMatch && bestScore > 0.3) {
      return bestMatch.a;
    }

    return null;
  }

  // Simple similarity calculation (word overlap)
  calculateSimilarity(str1, str2) {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    let matches = 0;

    words1.forEach(word => {
      if (words2.includes(word) && word.length > 3) {
        matches++;
      }
    });

    return matches / Math.max(words1.length, words2.length);
  }

  // === Mode-Specific Methods ===

  // Set mode (widget, kiosk, phone)
  setMode(mode) {
    this.mode = mode;
    console.log(`🔄 Mode changed to: ${mode}`);

    // Adjust behavior based on mode
    if (mode === 'kiosk') {
      // Kiosk mode: Show more visual cards, enable ordering
      this.showVisualInterface = true;
    } else if (mode === 'phone') {
      // Phone mode: Voice-only, no visual elements
      this.showVisualInterface = false;
    } else {
      // Widget mode: Balance of text and visuals
      this.showVisualInterface = true;
    }
  }

  // Generate business summary for display
  getBusinessSummary() {
    if (!this.businessConfig) return null;

    const knowledge = this.businessConfig.knowledge;
    return {
      name: this.businessConfig.name,
      description: knowledge.description,
      hours: knowledge.hours.display,
      phone: this.businessConfig.contact.phone,
      address: this.businessConfig.contact.address,
      features: knowledge.features,
      hasLiveMusic: knowledge.liveMusic.hasLiveMusic,
      tier: this.businessConfig.tier
    };
  }

  // Get menu for display (kiosk mode)
  getFullMenu() {
    if (!this.businessConfig) return [];
    return this.businessConfig.knowledge.popularDishes;
  }

  // Get specials for display
  getActiveSpecials() {
    if (!this.businessConfig) return [];
    return this.businessConfig.knowledge.specialOffers.filter(s => s.active);
  }
}

// Initialize business concierge on profile pages
function initBusinessConcierge() {
  // Check if we're on a profile page
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get('id');

  if (!businessId) {
    console.log('Not on a business profile page');
    return null;
  }

  // Check if this business has AI enabled
  if (typeof hasAIEnabled === 'function' && !hasAIEnabled(businessId)) {
    console.log(`Business ${businessId} does not have AI enabled`);
    return null;
  }

  // Create business concierge instance
  const concierge = new BusinessConcierge(businessId);

  // Make it globally accessible
  window.businessConcierge = concierge;

  console.log(`✅ Business Concierge ready for ${businessId}`);
  return concierge;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBusinessConcierge);
} else {
  initBusinessConcierge();
}
