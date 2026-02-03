// AI Order Parser - Extracts menu items and details from natural language
// Handles phrases like "Order 2 shrimp tacos and a margarita from The Hangout"

class AIOrderParser {
  constructor() {
    this.quantityWords = {
      'one': 1, 'a': 1, 'an': 1,
      'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'couple': 2, 'few': 3, 'several': 3, 'dozen': 12
    };

    this.orderTypeKeywords = {
      togo: ['to-go', 'togo', 'takeout', 'pickup', 'carry out', 'take out'],
      dinein: ['dine in', 'dine-in', 'eat in', 'dining', 'for here'],
      delivery: ['deliver', 'delivery', 'bring']
    };
  }

  /**
   * Parse natural language order request
   * @param {string} userInput - "Order 2 shrimp tacos and a margarita from The Hangout to-go"
   * @param {Object} context - Current business context (if on profile page)
   * @returns {Object} Parsed order details
   */
  parseOrderRequest(userInput, context = {}) {
    const input = userInput.toLowerCase();

    // Extract business name (if not in context)
    const businessName = context.businessName || this.extractBusinessName(input);

    // Extract order type
    const orderType = this.extractOrderType(input);

    // Extract items with quantities
    const items = this.extractItems(input, context.menu);

    // Extract special instructions
    const specialInstructions = this.extractSpecialInstructions(input);

    // Extract time preferences
    const timePreference = this.extractTimePreference(input);

    return {
      businessName: businessName,
      orderType: orderType,
      items: items,
      specialInstructions: specialInstructions,
      timePreference: timePreference,
      rawInput: userInput,
      confidence: this.calculateConfidence(items, businessName)
    };
  }

  /**
   * Extract business name from input
   */
  extractBusinessName(input) {
    const patterns = [
      /from\s+([a-z\s]+?)(?:\s+to-go|\s+for|\s+and|\s*$)/i,
      /at\s+([a-z\s]+?)(?:\s+to-go|\s+for|\s+and|\s*$)/i,
      /order from\s+([a-z\s]+)/i
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return this.cleanBusinessName(match[1]);
      }
    }

    return null;
  }

  cleanBusinessName(name) {
    return name
      .replace(/\b(the|restaurant|bar|grill|cafe)\b/gi, '')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract order type (to-go, dine-in, delivery)
   */
  extractOrderType(input) {
    for (const [type, keywords] of Object.entries(this.orderTypeKeywords)) {
      for (const keyword of keywords) {
        if (input.includes(keyword)) {
          return type;
        }
      }
    }
    return 'togo'; // Default
  }

  /**
   * Extract menu items with quantities
   */
  extractItems(input, menu = []) {
    const items = [];

    // Common patterns:
    // "2 shrimp tacos"
    // "a burger"
    // "one margarita"
    // "shrimp tacos and a margarita"

    // Split by "and", "with", comma
    const segments = input.split(/\s+and\s+|\s+with\s+|,\s*/);

    for (const segment of segments) {
      const item = this.extractSingleItem(segment, menu);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Extract single item with quantity
   */
  extractSingleItem(segment, menu) {
    // Try to extract quantity
    let quantity = 1;
    let itemName = segment.trim();

    // Check for numeric quantity: "2 shrimp tacos"
    const numericMatch = segment.match(/^(\d+)\s+(.+)/);
    if (numericMatch) {
      quantity = parseInt(numericMatch[1]);
      itemName = numericMatch[2];
    } else {
      // Check for word quantity: "one shrimp taco"
      for (const [word, num] of Object.entries(this.quantityWords)) {
        if (segment.startsWith(word + ' ')) {
          quantity = num;
          itemName = segment.substring(word.length).trim();
          break;
        }
      }
    }

    // Clean item name
    itemName = itemName
      .replace(/\b(order|get|want|need|like|have)\b/gi, '')
      .trim();

    if (!itemName) return null;

    // Try to match with menu items
    let menuItem = null;
    if (menu && menu.length > 0) {
      menuItem = this.findBestMenuMatch(itemName, menu);
    }

    if (menuItem) {
      return {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity,
        matchConfidence: menuItem.matchScore || 0.8
      };
    } else {
      // Return unmatched item (AI will ask for clarification)
      return {
        name: itemName,
        quantity: quantity,
        matched: false,
        matchConfidence: 0.3
      };
    }
  }

  /**
   * Find best matching menu item using fuzzy matching
   */
  findBestMenuMatch(itemName, menu) {
    let bestMatch = null;
    let bestScore = 0;

    const cleanName = itemName.toLowerCase();

    for (const menuItem of menu) {
      const menuName = menuItem.name.toLowerCase();

      // Exact match
      if (cleanName === menuName) {
        return { ...menuItem, matchScore: 1.0 };
      }

      // Contains match
      if (menuName.includes(cleanName) || cleanName.includes(menuName)) {
        const score = 0.9;
        if (score > bestScore) {
          bestMatch = menuItem;
          bestScore = score;
        }
        continue;
      }

      // Word match (e.g., "shrimp tacos" matches "Grilled Shrimp Tacos")
      const cleanWords = cleanName.split(' ');
      const menuWords = menuName.split(' ');
      const matchingWords = cleanWords.filter(word =>
        menuWords.some(menuWord => menuWord.includes(word) || word.includes(menuWord))
      );

      if (matchingWords.length > 0) {
        const score = matchingWords.length / Math.max(cleanWords.length, menuWords.length);
        if (score > bestScore && score >= 0.5) {
          bestMatch = menuItem;
          bestScore = score;
        }
      }
    }

    if (bestMatch && bestScore >= 0.5) {
      return { ...bestMatch, matchScore: bestScore };
    }

    return null;
  }

  /**
   * Extract special instructions
   */
  extractSpecialInstructions(input) {
    const patterns = [
      /no\s+([a-z]+)/gi,
      /without\s+([a-z]+)/gi,
      /extra\s+([a-z]+)/gi,
      /add\s+([a-z]+)/gi,
      /please\s+(.+?)(?:\s+and|\s*$)/gi
    ];

    const instructions = [];

    for (const pattern of patterns) {
      const matches = input.matchAll(pattern);
      for (const match of matches) {
        instructions.push(match[0]);
      }
    }

    return instructions.join(', ');
  }

  /**
   * Extract time preference (ASAP, in 30 minutes, at 6pm, etc.)
   */
  extractTimePreference(input) {
    // ASAP
    if (/\basap\b|as soon as possible|right now|now/i.test(input)) {
      return { type: 'asap', time: null };
    }

    // Specific time: "at 6pm", "at 6:30", "for 6 o'clock"
    const timeMatch = input.match(/(?:at|for)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3] ? timeMatch[3].toLowerCase() : 'pm';

      if (period === 'pm' && hour < 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;

      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      return { type: 'specific', time: time };
    }

    // Relative time: "in 30 minutes", "in an hour"
    const relativeMatch = input.match(/in\s+(\d+|an?|one)\s+(minute|hour)s?/i);
    if (relativeMatch) {
      const amount = relativeMatch[1] === 'a' || relativeMatch[1] === 'an' || relativeMatch[1] === 'one' ? 1 : parseInt(relativeMatch[1]);
      const unit = relativeMatch[2].toLowerCase();

      const now = new Date();
      if (unit === 'hour') {
        now.setHours(now.getHours() + amount);
      } else {
        now.setMinutes(now.getMinutes() + amount);
      }

      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      return { type: 'relative', time: time, originalAmount: amount, originalUnit: unit };
    }

    return { type: 'asap', time: null };
  }

  /**
   * Parse reservation request
   * @param {string} userInput - "Book a table for 4 at The Hangout tomorrow at 7pm"
   */
  parseReservationRequest(userInput, context = {}) {
    const input = userInput.toLowerCase();

    // Extract business name
    const businessName = context.businessName || this.extractBusinessName(input);

    // Extract party size
    const partySize = this.extractPartySize(input);

    // Extract date
    const date = this.extractDate(input);

    // Extract time
    const time = this.extractReservationTime(input);

    // Extract special requests
    const notes = this.extractSpecialRequests(input);

    return {
      businessName: businessName,
      partySize: partySize,
      date: date,
      time: time,
      notes: notes,
      rawInput: userInput,
      confidence: this.calculateReservationConfidence(businessName, partySize, date, time)
    };
  }

  /**
   * Extract party size
   */
  extractPartySize(input) {
    // "for 4", "party of 6", "table for 2"
    const patterns = [
      /(?:for|party of|table for)\s+(\d+)/i,
      /(\d+)\s+people/i,
      /(\d+)\s+guests/i
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return 2; // Default
  }

  /**
   * Extract date
   */
  extractDate(input) {
    const today = new Date();

    // "today"
    if (/\btoday\b/i.test(input)) {
      return this.formatDate(today);
    }

    // "tomorrow"
    if (/\btomorrow\b/i.test(input)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return this.formatDate(tomorrow);
    }

    // "this friday", "next monday"
    const dayMatch = input.match(/\b(this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dayMatch) {
      const targetDay = dayMatch[2].toLowerCase();
      const isNext = dayMatch[1].toLowerCase() === 'next';
      return this.getNextDayOfWeek(targetDay, isNext);
    }

    // Specific date: "on March 15", "on 3/15", "March 15th"
    const dateMatch = input.match(/(?:on\s+)?(\d{1,2})\/(\d{1,2})|([a-z]+)\s+(\d{1,2})/i);
    if (dateMatch) {
      if (dateMatch[1] && dateMatch[2]) {
        // MM/DD format
        const month = parseInt(dateMatch[1]) - 1;
        const day = parseInt(dateMatch[2]);
        const date = new Date(today.getFullYear(), month, day);
        if (date < today) {
          date.setFullYear(date.getFullYear() + 1);
        }
        return this.formatDate(date);
      } else if (dateMatch[3] && dateMatch[4]) {
        // "March 15" format
        const monthName = dateMatch[3];
        const day = parseInt(dateMatch[4]);
        const month = this.getMonthNumber(monthName);
        const date = new Date(today.getFullYear(), month, day);
        if (date < today) {
          date.setFullYear(date.getFullYear() + 1);
        }
        return this.formatDate(date);
      }
    }

    return this.formatDate(today);
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  getNextDayOfWeek(dayName, nextWeek = false) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());

    const today = new Date();
    const currentDay = today.getDay();

    let daysAhead = targetDay - currentDay;
    if (daysAhead <= 0 || nextWeek) {
      daysAhead += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysAhead);

    return this.formatDate(targetDate);
  }

  getMonthNumber(monthName) {
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
                    'july', 'august', 'september', 'october', 'november', 'december'];
    return months.indexOf(monthName.toLowerCase());
  }

  /**
   * Extract reservation time
   */
  extractReservationTime(input) {
    const timeMatch = input.match(/(?:at|for)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3] ? timeMatch[3].toLowerCase() : (hour < 12 ? 'am' : 'pm');

      if (period === 'pm' && hour < 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;

      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    // Default to 7pm
    return '19:00';
  }

  /**
   * Extract special requests for reservation
   */
  extractSpecialRequests(input) {
    const requests = [];

    if (/\bwindow\b/i.test(input)) requests.push('Window seat');
    if (/\bquiet\b/i.test(input)) requests.push('Quiet area');
    if (/\bpatio|outdoor\b/i.test(input)) requests.push('Outdoor seating');
    if (/\bbirth|birthday\b/i.test(input)) requests.push('Birthday celebration');
    if (/\banniversary\b/i.test(input)) requests.push('Anniversary celebration');
    if (/\bhigh\s*chair/i.test(input)) requests.push('High chair needed');
    if (/\bwheelchair/i.test(input)) requests.push('Wheelchair accessible');

    return requests.join(', ');
  }

  /**
   * Calculate confidence score for order parsing
   */
  calculateConfidence(items, businessName) {
    let score = 0;

    // Business name identified
    if (businessName) score += 0.3;

    // All items matched
    if (items.length > 0) {
      const matchedItems = items.filter(item => item.matched !== false);
      score += (matchedItems.length / items.length) * 0.7;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate confidence score for reservation parsing
   */
  calculateReservationConfidence(businessName, partySize, date, time) {
    let score = 0;

    if (businessName) score += 0.3;
    if (partySize > 0) score += 0.2;
    if (date) score += 0.25;
    if (time) score += 0.25;

    return score;
  }
}

// Create global instance
window.aiOrderParser = new AIOrderParser();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIOrderParser;
}
