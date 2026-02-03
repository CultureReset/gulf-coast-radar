// AI Ordering & Reservation Extension
// Extends VacationAssistant with ordering and reservation capabilities

// Add to ai-assistant.js by loading this file after it

(function() {
  // Wait for VacationAssistant to be available
  if (typeof VacationAssistant === 'undefined') {
    console.error('VacationAssistant not loaded - ordering extension cannot initialize');
    return;
  }

  // Store original analyzeIntent method
  const originalAnalyzeIntent = VacationAssistant.prototype.analyzeIntent;

  // Extend analyzeIntent to detect ordering/reservation intents
  VacationAssistant.prototype.analyzeIntent = function(command) {
    const lower = command.toLowerCase();

    // Detect ordering intent
    if (this.isOrderingIntent(lower)) {
      return this.parseOrderIntent(command);
    }

    // Detect reservation intent
    if (this.isReservationIntent(lower)) {
      return this.parseReservationIntent(command);
    }

    // Fall back to original intent analysis
    return originalAnalyzeIntent.call(this, command);
  };

  // Check if command is about ordering food
  VacationAssistant.prototype.isOrderingIntent = function(lower) {
    const orderKeywords = [
      'order', 'get me', 'i want', 'buy', 'purchase',
      'to-go', 'togo', 'takeout', 'take out', 'pickup',
      'deliver', 'delivery'
    ];

    const foodKeywords = [
      'food', 'meal', 'lunch', 'dinner', 'breakfast',
      'burger', 'pizza', 'taco', 'sandwich', 'fries',
      'drink', 'beer', 'margarita', 'cocktail'
    ];

    const hasOrderKeyword = orderKeywords.some(kw => lower.includes(kw));
    const hasFoodKeyword = foodKeywords.some(kw => lower.includes(kw));

    return hasOrderKeyword || (hasFoodKeyword && !lower.includes('find') && !lower.includes('where'));
  };

  // Check if command is about making a reservation
  VacationAssistant.prototype.isReservationIntent = function(lower) {
    const reservationKeywords = [
      'book', 'reserve', 'reservation', 'table',
      'party of', 'for 2', 'for 4', 'for 6',
      'tonight', 'tomorrow', 'this friday'
    ];

    return reservationKeywords.some(kw => lower.includes(kw));
  };

  // Parse order intent
  VacationAssistant.prototype.parseOrderIntent = function(command) {
    if (!window.aiOrderParser) {
      return { type: 'error', message: 'Order system not available' };
    }

    const parsed = aiOrderParser.parseOrderRequest(command, {
      businessName: this.conversationContext.lastBusinessName,
      menu: this.conversationContext.lastBusinessMenu
    });

    return {
      type: 'order_food',
      parsed: parsed,
      fullText: command
    };
  };

  // Parse reservation intent
  VacationAssistant.prototype.parseReservationIntent = function(command) {
    if (!window.aiOrderParser) {
      return { type: 'error', message: 'Reservation system not available' };
    }

    const parsed = aiOrderParser.parseReservationRequest(command, {
      businessName: this.conversationContext.lastBusinessName
    });

    return {
      type: 'make_reservation',
      parsed: parsed,
      fullText: command
    };
  };

  // Store original respondToIntent method
  const originalRespondToIntent = VacationAssistant.prototype.respondToIntent;

  // Extend respondToIntent to handle new intents
  VacationAssistant.prototype.respondToIntent = async function(intent) {
    // Handle ordering
    if (intent.type === 'order_food') {
      return await this.handleOrderIntent(intent);
    }

    // Handle reservations
    if (intent.type === 'make_reservation') {
      return await this.handleReservationIntent(intent);
    }

    // Fall back to original handler
    return await originalRespondToIntent.call(this, intent);
  };

  // Handle order intent
  VacationAssistant.prototype.handleOrderIntent = async function(intent) {
    const parsed = intent.parsed;

    // Check if user is logged in
    if (!window.sessionManager || !sessionManager.isLoggedIn()) {
      return "You'll need to sign in with your phone number before placing an order. Would you like me to help you sign in?";
    }

    // Low confidence - ask for clarification
    if (parsed.confidence < 0.5) {
      return "I'm not sure I understood that order correctly. Could you tell me:\n1. Which restaurant?\n2. What items do you want?\n3. To-go or dine-in?";
    }

    // Missing business name
    if (!parsed.businessName) {
      return "Which restaurant would you like to order from?";
    }

    // Find the business
    const business = this.findBusinessByName(parsed.businessName);
    if (!business) {
      return `I couldn't find "${parsed.businessName}". Could you try again or say "show me restaurants"?`;
    }

    // Store for context
    this.conversationContext.lastBusinessName = business.name;
    this.conversationContext.lastBusinessMenu = business.menu || [];

    // No items specified or unmatched items
    if (parsed.items.length === 0 || parsed.items.every(item => item.matched === false)) {
      return `What would you like to order from ${business.name}? I can show you their menu if you'd like.`;
    }

    // Some items didn't match
    const unmatchedItems = parsed.items.filter(item => item.matched === false);
    if (unmatchedItems.length > 0) {
      const unmatchedNames = unmatchedItems.map(i => i.name).join(', ');
      return `I couldn't find "${unmatchedNames}" on ${business.name}'s menu. Would you like to see their full menu?`;
    }

    // Build order summary
    const matchedItems = parsed.items.filter(item => item.matched !== false);
    const itemsList = matchedItems.map(item => `${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})`).join('\n');
    const total = matchedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Confirm order
    return `Great! Here's your order from ${business.name}:\n\n${itemsList}\n\nTotal: $${total.toFixed(2)}\n${parsed.orderType === 'togo' ? 'To-Go' : 'Dine-In'}\n\nShould I place this order? Say "yes" to confirm or "change order" to modify.`;
  };

  // Handle reservation intent
  VacationAssistant.prototype.handleReservationIntent = async function(intent) {
    const parsed = intent.parsed;

    // Check if user is logged in
    if (!window.sessionManager || !sessionManager.isLoggedIn()) {
      return "You'll need to sign in with your phone number before making a reservation. Would you like me to help you sign in?";
    }

    // Low confidence - ask for clarification
    if (parsed.confidence < 0.7) {
      return "Let me make sure I have the details right. Could you tell me:\n1. Which restaurant?\n2. Date and time?\n3. How many people?";
    }

    // Missing business name
    if (!parsed.businessName) {
      return "Which restaurant would you like to book at?";
    }

    // Find the business
    const business = this.findBusinessByName(parsed.businessName);
    if (!business) {
      return `I couldn't find "${parsed.businessName}". Could you try again?`;
    }

    // Check if business accepts reservations
    if (!business.acceptsReservations && !business.reservationSystem && !business.reservationSystems) {
      return `${business.name} doesn't currently accept reservations through Gulf Coast Radar. You can call them directly at ${business.phone || 'their listed number'}.`;
    }

    // Store for context
    this.conversationContext.lastBusinessName = business.name;

    // Check availability
    if (!window.reservationIntegrationManager) {
      return "Reservation system is not available right now. Please try again later.";
    }

    try {
      const availabilityResults = await reservationIntegrationManager.checkAllPlatforms(parsed, business);

      const anyAvailable = availabilityResults.some(r => r.available);

      if (!anyAvailable) {
        // Show alternatives
        const alternatives = availabilityResults.flatMap(r => r.alternatives).slice(0, 3);
        if (alternatives.length > 0) {
          const altList = alternatives.map(alt => `• ${alt.time}`).join('\n');
          return `That time is fully booked. Here are nearby times available:\n${altList}\n\nWould you like one of these instead?`;
        } else {
          return `Sorry, ${business.name} is fully booked for ${parsed.date} at ${parsed.time}. Would you like to try a different date or time?`;
        }
      }

      // Format date nicely
      const dateObj = new Date(parsed.date + 'T' + parsed.time);
      const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      // Show which platforms have availability
      const availablePlatforms = availabilityResults.filter(r => r.available).map(r => r.platform);

      return `Great news! ${business.name} is available on ${dateStr} at ${timeStr} for ${parsed.partySize} guests.\n\nAvailable on: ${availablePlatforms.join(', ')}\n\n${parsed.notes ? `Special requests: ${parsed.notes}\n\n` : ''}Should I book this reservation? Say "yes" to confirm.`;

    } catch (error) {
      console.error('Reservation check error:', error);
      return `I had trouble checking availability. Please try again or call ${business.name} directly.`;
    }
  };

  // Helper: Find business by name (fuzzy matching)
  VacationAssistant.prototype.findBusinessByName = function(businessName) {
    if (typeof allBusinesses === 'undefined') return null;

    const cleanName = businessName.toLowerCase().trim();

    // Exact match
    let business = allBusinesses.find(b => b.name.toLowerCase() === cleanName);
    if (business) return business;

    // Partial match
    business = allBusinesses.find(b => b.name.toLowerCase().includes(cleanName));
    if (business) return business;

    // Word match
    const searchWords = cleanName.split(' ');
    business = allBusinesses.find(b => {
      const businessWords = b.name.toLowerCase().split(' ');
      return searchWords.some(word => businessWords.includes(word));
    });

    return business;
  };

  console.log('✅ AI Ordering & Reservation Extension Loaded');
})();
