// Multi-Agent AI System - Restaurant-Specific Agents + Coordinator
// Each restaurant has its own specialized AI that knows the complete menu
// The coordinator AI queries multiple restaurant agents for accurate results

class RestaurantAgent {
  constructor(business, apiKey, provider = 'openai') {
    this.business = business;
    this.apiKey = apiKey;
    this.provider = provider;
    this.systemPrompt = this.createRestaurantPrompt();
  }

  // Create a specialized prompt for this specific restaurant
  createRestaurantPrompt() {
    const b = this.business;

    // Include COMPLETE menu (not just samples)
    const fullMenu = b.menu ? b.menu.map(item => {
      return `${item.name} - ${item.price || 'Price varies'}${item.description ? ` (${item.description})` : ''}`;
    }).join('\n') : 'No menu available';

    const fullDrinks = b.drinks ? b.drinks.map(drink => {
      return `${drink.name} - ${drink.price || 'Price varies'}${drink.description ? ` (${drink.description})` : ''}`;
    }).join('\n') : 'No drinks menu available';

    return `You are a specialized menu expert for ${b.name} ONLY. You know everything about this restaurant.

RESTAURANT DETAILS:
Name: ${b.name}
Location: ${b.location}
Address: ${b.address || 'Not provided'}
Phone: ${b.phone || 'Not provided'}
Cuisine: ${b.cuisine || 'Not specified'}
Rating: ${b.rating || 'N/A'}/5
Price Level: ${b.priceLevel || 'N/A'}
Description: ${b.description || 'No description'}
${b.hours ? `Hours: ${typeof b.hours === 'object' ? JSON.stringify(b.hours) : b.hours}` : ''}

COMPLETE FOOD MENU (${b.menu ? b.menu.length : 0} items):
${fullMenu}

COMPLETE DRINKS MENU (${b.drinks ? b.drinks.length : 0} items):
${fullDrinks}

${b.specialties ? `SPECIALTIES: ${Array.isArray(b.specialties) ? b.specialties.join(', ') : b.specialties}` : ''}
${b.tags ? `TAGS: ${Array.isArray(b.tags) ? b.tags.join(', ') : b.tags}` : ''}
${b.happyHour ? `HAPPY HOUR: ${b.happyHour}` : ''}

YOUR JOB:
1. Answer questions about ${b.name}'s menu, hours, location, and offerings
2. Search the COMPLETE menu for specific items or ingredients
3. Be precise - if an item isn't on the menu, say so
4. If you find a match, provide the exact item name, price, description, and category
5. NEVER make up menu items - only use what's listed above

RESPONSE FORMAT:
When asked if the restaurant has something:
- YES: "Yes, ${b.name} has [item name] - [price] ([description])"
- NO: "No, ${b.name} does not have [item] on the menu"
- SIMILAR: "No [exact item], but we have [similar item] - [price]"

Be accurate and helpful. This is ${b.name}'s specialized assistant.`;
  }

  // Query this specific restaurant's menu
  async query(userQuestion) {
    try {
      const response = await this.makeAPICall(userQuestion);
      return {
        restaurant: this.business.name,
        restaurantId: this.business.id,
        answer: response,
        hasMatch: !response.toLowerCase().includes('does not have')
      };
    } catch (error) {
      console.error(`Error querying ${this.business.name}:`, error);
      return {
        restaurant: this.business.name,
        restaurantId: this.business.id,
        answer: `Error checking ${this.business.name}`,
        hasMatch: false,
        error: true
      };
    }
  }

  async makeAPICall(userQuestion) {
    if (this.provider === 'openai') {
      return await this.queryOpenAI(userQuestion);
    }
    throw new Error(`Provider ${this.provider} not yet implemented for restaurant agents`);
  }

  async queryOpenAI(userQuestion) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userQuestion }
        ],
        temperature: 0.3, // Lower temperature for more precise matching
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

class CoordinatorAI {
  constructor(apiKey, provider = 'openai') {
    this.apiKey = apiKey;
    this.provider = provider;
    this.restaurantAgents = [];
    this.businessData = null;
  }

  // Initialize with all businesses and create specialized agents
  initializeWithData(businesses) {
    this.businessData = businesses;

    // Create a restaurant agent for each restaurant
    this.restaurantAgents = businesses
      .filter(b => b.category === 'restaurants')
      .map(b => new RestaurantAgent(b, this.apiKey, this.provider));

    console.log(`✅ Multi-Agent AI initialized: ${this.restaurantAgents.length} restaurant agents created`);
  }

  // Check if query is about menu items/food
  isMenuQuery(query) {
    const menuKeywords = [
      'menu', 'food', 'dish', 'meal', 'eat', 'have', 'serve', 'offer',
      'chicken', 'beef', 'pork', 'fish', 'seafood', 'shrimp', 'crab', 'lobster',
      'pasta', 'pizza', 'burger', 'sandwich', 'salad', 'soup', 'appetizer',
      'steak', 'tacos', 'sushi', 'wings', 'ribs', 'oysters',
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
      'breakfast', 'lunch', 'dinner', 'brunch', 'dessert'
    ];

    const queryLower = query.toLowerCase();
    return menuKeywords.some(keyword => queryLower.includes(keyword));
  }

  // Query all restaurant agents in parallel
  async queryAllRestaurants(userQuestion) {
    console.log(`🔍 Coordinator: Asking ${this.restaurantAgents.length} restaurants about: "${userQuestion}"`);

    const startTime = Date.now();

    // Query all restaurants in parallel
    const promises = this.restaurantAgents.map(agent => agent.query(userQuestion));
    const results = await Promise.all(promises);

    const elapsed = Date.now() - startTime;
    console.log(`✅ All restaurants responded in ${elapsed}ms`);

    // Filter to only restaurants that have what the user wants
    const matches = results.filter(r => r.hasMatch && !r.error);

    console.log(`📊 Found ${matches.length} restaurants with matches`);

    return {
      query: userQuestion,
      totalQueried: this.restaurantAgents.length,
      matches: matches,
      noMatches: results.filter(r => !r.hasMatch && !r.error),
      errors: results.filter(r => r.error),
      responseTime: elapsed
    };
  }

  // Smart query router - decides whether to use multi-agent or traditional approach
  async query(userMessage) {
    // If it's a menu query, use multi-agent system
    if (this.isMenuQuery(userMessage)) {
      console.log('🤖 Using multi-agent system for menu query');
      const results = await this.queryAllRestaurants(userMessage);
      return this.formatMultiAgentResponse(results);
    }

    // For non-menu queries, use traditional approach
    console.log('🤖 Using traditional AI for general query');
    return null; // Signal to use traditional backend
  }

  // Format multi-agent results into a user-friendly response
  formatMultiAgentResponse(results) {
    if (results.matches.length === 0) {
      return {
        text: `I searched all ${results.totalQueried} restaurant menus and couldn't find an exact match for your request. ${results.noMatches.length > 0 ? 'Some restaurants have similar items - would you like me to show those?' : ''}`,
        matches: [],
        source: 'multi-agent'
      };
    }

    // Format the matches
    let responseText = `I found ${results.matches.length} restaurant${results.matches.length > 1 ? 's' : ''} with what you're looking for:\n\n`;

    results.matches.forEach((match, index) => {
      responseText += `${index + 1}. **${match.restaurant}**\n${match.answer}\n\n`;
    });

    responseText += `Would you like details about any of these restaurants?`;

    return {
      text: responseText,
      matches: results.matches.map(m => ({
        restaurantId: m.restaurantId,
        restaurantName: m.restaurant,
        details: m.answer
      })),
      source: 'multi-agent',
      responseTime: results.responseTime
    };
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CoordinatorAI, RestaurantAgent };
}
