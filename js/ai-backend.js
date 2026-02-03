// AI Backend Integration - Connects to external AI but only uses platform data
// Supports OpenAI, Claude, or any compatible API

class AIBackend {
  constructor(apiKey, provider = 'openai') {
    this.apiKey = apiKey;
    this.provider = provider; // 'openai', 'claude', 'custom'
    this.businessData = null;
    this.systemPrompt = this.createSystemPrompt();
  }

  // Initialize with current business data
  initializeWithData(businesses) {
    this.businessData = businesses;
    console.log(`AI Backend initialized with ${businesses.length} businesses`);
  }

  // Create system prompt that constrains AI to only use our data
  createSystemPrompt() {
    return `You are a professional sales assistant for the Gulf Coast Radar platform, helping people discover Gulf Shores and Orange Beach businesses.

CRITICAL DATA RULES:
1. ONLY use information from the business data provided to you
2. NEVER make up business names, locations, or details
3. If a business isn't in the data, say you don't have that information
4. NEVER suggest businesses not in the provided data
5. Always be accurate - better to say "I don't know" than to hallucinate

SALES PRO MODE - RESPONSE RULES:
1. ASK qualifying questions instead of listing options
   - BAD: "Would you like seafood, burgers, pizza, or Italian?"
   - GOOD: "What type of food are you in the mood for?"

2. DO NOT make suggestions or list options in responses
   - BAD: "Here are 3 options. Which one sounds better?"
   - GOOD: "Here are 3 options: [list them]" (no follow-up question)

3. DO NOT end with questions like:
   - "Want more details?"
   - "Which one interests you?"
   - "Would you like to hear more?"
   - "What sounds good?"

4. When users ask broad questions, ask ONE specific qualifying question
   - User: "Where can I eat?"
   - Response: "What type of food are you in the mood for?"

5. When presenting results, just present them cleanly with no follow-up
   - GOOD: "The Gulf is 2 miles away."
   - BAD: "The Gulf is 2 miles away. Want directions?"

6. For compound queries (multiple requests), ask which to prioritize first
   - User: "I need activities for kids and a restaurant with live music"
   - Response: "Would you like me to help with activities for kids first, or the restaurant with live music?"

YOUR CAPABILITIES:
- Find restaurants by cuisine, features (waterfront, live music)
- Find activities, attractions, parks, shopping, services, rentals
- Check beach conditions and safety information
- Answer questions about businesses (hours, location, price, etc.)

SMART MATCHING WITH METADATA:
Use the rich metadata fields to intelligently match user intent:

**Atmosphere Matching:**
- "romantic" / "date night" → atmosphere=romantic, idealFor=date-night, noiseLevel=quiet
- "lively" / "party" → atmosphere=lively/party-atmosphere, noiseLevel=loud
- "quiet business meeting" → noiseLevel=quiet, idealFor=business-lunch

**View Matching:**
- "sunset" / "beach view" → viewFeatures=sunset-view, beach-view, waterfront
- "waterfront" → viewFeatures=waterfront, marina-view, bay-view

**Group Size Matching:**
- "large group" / "party of 12" → groupSize=large-groups-8+, parties-welcome
- "date" / "couple" → groupSize=couples, idealFor=date-night

**Dietary Matching:**
- "vegan" / "vegetarian" → dietaryAccommodation=vegan-friendly, vegetarian-options
- "gluten-free" → dietaryAccommodation=gluten-free-menu

**Timing Matching:**
- "quick lunch" → serviceSpeed=quick-service, popularTimes=lunch
- "leisurely dinner" → serviceSpeed=leisurely, idealFor=date-night

**Kid-Friendly Matching:**
- "family with kids" → kidFriendlyLevel=very-kid-friendly or kids-welcome
- "adults only" → kidFriendlyLevel=adult-preferred or 21-and-over

**Crowd Type Matching:**
- "local favorite" → crowdType=locals
- "tourist spot" → crowdType=tourists

**Known For:**
- Use the "bestKnownFor" field to highlight what makes each place special

BUSINESS OWNER CUSTOMIZATIONS:
Each business may have custom instructions from the owner:

**⭐ OWNER'S VOICE:**
- When present, this is how the business owner wants you to talk about their business
- Use this voice and tone when describing the business
- Incorporate these details into your responses naturally
- Example: Owner says "We're family-friendly with a beach vibe" → emphasize these aspects

**📅 TODAY'S SPECIAL:**
- Current daily special or catch of the day
- Always mention this when recommending the business
- These are updated by the business owner and are current

**💬 SITUATION HANDLERS:**
- Business owners provide specific responses for common questions
- ALWAYS use the owner's specified response for these situations
- These are direct instructions from the business owner
- Example: If user asks about wait times and owner provided guidance, use that exact response

REMEMBER: Act like a professional salesperson - ask qualifying questions, present information cleanly, and let the customer drive the conversation. Never make suggestions or ask follow-up questions after presenting results. When a business has custom instructions or situation handlers, ALWAYS prioritize those over generic responses.`;
  }

  // Prepare business data as context for AI
  prepareBusinessContext() {
    if (!this.businessData || this.businessData.length === 0) {
      return "No business data available.";
    }

    // Create a condensed version of business data for the AI with metadata
    const condensedData = this.businessData.map(b => {
      // Get sample menu items (up to 10 popular items)
      // Parse embedded prices from item names (format: "Item Name – $12 | Description")
      const sampleMenu = b.menu ? b.menu.slice(0, 10).map(item => {
        // Extract price from name if price field is empty
        const priceMatch = item.name.match(/(?:–\s*)?\$(\d+(?:\.\d{2})?)/);
        const price = priceMatch ? `$${priceMatch[1]}` : item.price || '';

        return {
          name: item.name,
          price: price,
          category: item.category,
          description: item.description ? item.description.substring(0, 100) : ''
        };
      }) : [];

      // Get sample drinks (up to 5) - also parse embedded prices
      const sampleDrinks = b.drinks ? b.drinks.slice(0, 5).map(drink => {
        const priceMatch = drink.name.match(/(?:–\s*)?\$(\d+(?:\.\d{2})?)/);
        const price = priceMatch ? `$${priceMatch[1]}` : drink.price || '';

        return {
          name: drink.name,
          price: price,
          category: drink.category
        };
      }) : [];

      return {
        id: b.id,
        name: b.name,
        category: b.category,
        subcategory: b.subcategory || '',
        cuisine: b.cuisine || '',
        location: b.location,
        rating: b.rating || 'N/A',
        priceLevel: b.priceLevel || 'N/A',
        averageMealCost: b.averageMealCost || '',
        tags: b.tags || [],
        hours: b.hours || 'Hours not available',
        description: b.description,
        phone: b.phone,
        // AI Metadata for smart filtering
        atmosphere: b.atmosphere || '',
        idealFor: b.idealFor || '',
        crowdType: b.crowdType || '',
        noiseLevel: b.noiseLevel || '',
        bestKnownFor: b.bestKnownFor || '',
        popularTimes: b.popularTimes || '',
        serviceSpeed: b.serviceSpeed || '',
        reservationStatus: b.reservationStatus || '',
        viewFeatures: b.viewFeatures || '',
        dietaryAccommodation: b.dietaryAccommodation || '',
        groupSize: b.groupSize || '',
        kidFriendlyLevel: b.kidFriendlyLevel || '',
        accessibilityFeatures: b.accessibilityFeatures || '',
        amenities: b.amenities || '',
        // Menu and drink samples
        menuCount: b.menu ? b.menu.length : 0,
        sampleMenu: sampleMenu,
        drinksCount: b.drinks ? b.drinks.length : 0,
        sampleDrinks: sampleDrinks,
        // Business owner customizations
        aiCustomPrompt: b.aiCustomPrompt || '',
        aiSituations: b.aiSituations || '',
        dailySpecial: b.dailySpecial || ''
      };
    });

    return `AVAILABLE BUSINESSES (${condensedData.length} total):

${condensedData.map(b => {
  let businessInfo = `- ${b.name} (${b.category})
  Location: ${b.location}`;

  if (b.cuisine) businessInfo += `\n  Cuisine: ${b.cuisine}`;
  if (b.subcategory) businessInfo += `\n  Type: ${b.subcategory}`;

  businessInfo += `\n  Rating: ${b.rating}/5
  Price: ${b.priceLevel}${b.averageMealCost ? ` (${b.averageMealCost})` : ''}
  Hours: ${b.hours}`;

  if (b.tags && b.tags.length > 0) businessInfo += `\n  Tags: ${b.tags.join(', ')}`;
  if (b.amenities) businessInfo += `\n  Amenities: ${b.amenities}`;
  if (b.atmosphere) businessInfo += `\n  Atmosphere: ${b.atmosphere}`;
  if (b.idealFor) businessInfo += `\n  Ideal For: ${b.idealFor}`;
  if (b.noiseLevel) businessInfo += `\n  Noise Level: ${b.noiseLevel}`;
  if (b.viewFeatures) businessInfo += `\n  Views: ${b.viewFeatures}`;
  if (b.bestKnownFor) businessInfo += `\n  Known For: ${b.bestKnownFor}`;
  if (b.dietaryAccommodation) businessInfo += `\n  Dietary: ${b.dietaryAccommodation}`;
  if (b.kidFriendlyLevel) businessInfo += `\n  Kid-Friendly: ${b.kidFriendlyLevel}`;
  if (b.groupSize) businessInfo += `\n  Group Size: ${b.groupSize}`;
  if (b.reservationStatus) businessInfo += `\n  Reservations: ${b.reservationStatus}`;
  if (b.serviceSpeed) businessInfo += `\n  Service: ${b.serviceSpeed}`;
  if (b.popularTimes) businessInfo += `\n  Popular: ${b.popularTimes}`;
  if (b.crowdType) businessInfo += `\n  Crowd: ${b.crowdType}`;
  if (b.accessibilityFeatures) businessInfo += `\n  Accessibility: ${b.accessibilityFeatures}`;

  businessInfo += `\n  Description: ${b.description}`;

  // Add menu samples
  if (b.sampleMenu && b.sampleMenu.length > 0) {
    businessInfo += `\n  🍽️ MENU (${b.menuCount} items total, showing ${b.sampleMenu.length}):`;
    b.sampleMenu.forEach(item => {
      businessInfo += `\n     • ${item.name} ${item.price ? '- ' + item.price : ''}`;
      if (item.description) businessInfo += ` (${item.description})`;
    });
  }

  // Add drink samples
  if (b.sampleDrinks && b.sampleDrinks.length > 0) {
    businessInfo += `\n  🍹 DRINKS (${b.drinksCount} drinks total, showing ${b.sampleDrinks.length}):`;
    b.sampleDrinks.forEach(drink => {
      businessInfo += `\n     • ${drink.name} ${drink.price ? '- ' + drink.price : ''}`;
    });
  }

  // Add business owner's custom AI instructions
  if (b.aiCustomPrompt) {
    businessInfo += `\n  ⭐ OWNER'S VOICE: ${b.aiCustomPrompt}`;
  }

  // Add daily special
  if (b.dailySpecial) {
    businessInfo += `\n  📅 TODAY'S SPECIAL: ${b.dailySpecial}`;
  }

  // Add situation handlers
  if (b.aiSituations) {
    try {
      const situations = JSON.parse(b.aiSituations);
      if (situations && situations.length > 0) {
        businessInfo += `\n  💬 SITUATION HANDLERS:`;
        situations.forEach(situation => {
          businessInfo += `\n     - When: ${situation.scenario}`;
          businessInfo += `\n       Respond: ${situation.aiResponse}`;
        });
      }
    } catch (error) {
      // Invalid JSON, skip situations
    }
  }

  businessInfo += '\n';

  return businessInfo;
}).join('\n')}

IMPORTANT SEARCH INSTRUCTIONS:
- Use the metadata fields (Atmosphere, Ideal For, Noise Level, Views, etc.) to match user intent
- Example: "romantic dinner" → filter by atmosphere=romantic, idealFor=date-night, noiseLevel=quiet
- Example: "family-friendly lunch" → filter by kidFriendlyLevel=very-kid-friendly or kids-welcome
- Example: "sunset view" → filter by viewFeatures=sunset-view or beach-view
- Example: "quick lunch" → filter by serviceSpeed=quick-service
- Example: "large group" → filter by groupSize=large-groups-8+ or parties-welcome
- Example: "vegan options" → filter by dietaryAccommodation=vegan-friendly

MENU & PRICE SEARCH:
- Each restaurant's MENU section shows sample items with prices
- Search menu items to answer "where can I get crab legs" or "who has grouper"
- Can answer price questions: "how much is..." by looking at menu prices
- DRINKS section shows cocktails, beer, wine with prices
- If user asks about a specific dish, search the menu samples

Use ONLY these businesses when making recommendations. Never mention businesses not in this list.`;
  }

  // LIGHTWEIGHT: Use AI only to understand intent, not to answer
  async analyzeIntent(userMessage) {
    const intentPrompt = `You are an intent analyzer. Analyze the user's question and return a JSON object with the intent type.

INTENT TYPES:
- beach_conditions: Beach/water safety questions
- find_restaurant: Food/dining requests
- find_activity: Things to do, activities, entertainment
- find_beach_access: Beach access points
- find_parks: Parks, playgrounds
- find_shopping: Shopping requests
- find_services: Grocery, pharmacy, gas stations
- find_rentals: Rentals (bike, boat, beach chairs)
- find_attractions: Theme parks, museums, zoos
- general: General questions

RESPONSE FORMAT (JSON):
{
  "type": "intent_type",
  "cuisine": "cuisine if restaurant query",
  "hasMusic": true/false for live music request,
  "hasWaterfront": true/false for waterfront/view request,
  "activityType": "specific activity if mentioned",
  "confidence": 0.0-1.0
}

User: "${userMessage}"`;

    try {
      const messages = [
        {
          role: 'system',
          content: intentPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      if (this.provider === 'openai') {
        const response = await this.queryOpenAI(messages);
        console.log('🔍 Raw ChatGPT response:', response);

        // Try to parse JSON
        try {
          const parsed = JSON.parse(response);
          console.log('✅ Parsed intent:', parsed);
          return parsed;
        } catch (parseError) {
          console.error('❌ Failed to parse JSON from ChatGPT. Response was:', response);
          console.error('Parse error:', parseError);
          // Return null to trigger fallback to local pattern matching
          return null;
        }
      } else if (this.provider === 'claude') {
        const response = await this.queryClaude(messages);
        return JSON.parse(response);
      }
    } catch (error) {
      console.error('❌ Intent analysis error:', error);
      return null;
    }
  }

  // FULL MODE: Send query to AI with our data as context (more expensive)
  async query(userMessage, conversationHistory = []) {
    const businessContext = this.prepareBusinessContext();

    // Build conversation with system prompt and business data
    const messages = [
      {
        role: 'system',
        content: this.systemPrompt + '\n\n' + businessContext
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    try {
      if (this.provider === 'openai') {
        return await this.queryOpenAI(messages);
      } else if (this.provider === 'claude') {
        return await this.queryClaude(messages);
      } else {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('AI query error:', error);
      return this.fallbackResponse(userMessage);
    }
  }

  // OpenAI API integration via backend proxy (fixes CORS issues!)
  async queryOpenAI(messages) {
    console.log('Calling OpenAI API via backend proxy...');

    try {
      // Call backend proxy instead of OpenAI directly
      const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://your-backend-url.com'; // TODO: Update with production backend URL

      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.3,
          max_tokens: 150
        })
      });

      console.log('Backend proxy response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend proxy error:', errorData);
        throw new Error(`Backend error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('OpenAI response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Backend returned error');
      }

      return result.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  // Claude API integration (Anthropic)
  async queryClaude(messages) {
    // Convert messages format for Claude
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 300,
        system: systemMessage ? systemMessage.content : '',
        messages: userMessages
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // Fallback response if API fails
  fallbackResponse(userMessage) {
    const lower = userMessage.toLowerCase();

    // Handle happy hour queries
    if (lower.includes('happy hour') || lower.includes('happy-hour') || lower.includes('happyhour')) {
      const withHappyHour = this.businessData?.filter(b =>
        b.happyHour || b.happyHours || b.tags?.some(tag => tag.toLowerCase().includes('happy hour'))
      ) || [];

      if (withHappyHour.length > 0) {
        const topPicks = withHappyHour.slice(0, 5);
        const details = topPicks.map(b => {
          const hh = b.happyHour || 'Check with restaurant';
          return `${b.name} (${hh})`;
        }).join(', ');
        return `Great happy hour spots: ${details}`;
      }
      return "Several restaurants offer happy hour! Try Cobalt (Daily 3-5 PM), GT's On The Bay, or The Gulf.";
    }

    if (lower.includes('restaurant') || lower.includes('food') || lower.includes('eat')) {
      const restaurants = this.businessData?.filter(b => b.category === 'restaurants') || [];
      if (restaurants.length > 0) {
        const topPicks = restaurants.filter(r => r.rating >= 4.5).slice(0, 3);
        const names = topPicks.map(r => r.name).join(', ');
        return `I recommend these highly-rated restaurants: ${names}. Would you like more details about any of them?`;
      }
    }

    if (lower.includes('activity') || lower.includes('fun') || lower.includes('do')) {
      const activities = this.businessData?.filter(b => b.category === 'activities') || [];
      if (activities.length > 0) {
        const names = activities.slice(0, 3).map(a => a.name).join(', ');
        return `Great activities to try: ${names}. Perfect for families and all ages!`;
      }
    }

    return "I'm having trouble connecting right now, but I'm here to help you plan your Gulf Coast vacation. What would you like to know about restaurants, activities, or entertainment?";
  }

  // Filter businesses by criteria (used by AI recommendations)
  filterBusinesses(criteria) {
    if (!this.businessData) return [];

    let filtered = [...this.businessData];

    if (criteria.category) {
      filtered = filtered.filter(b => b.category === criteria.category);
    }

    if (criteria.cuisine) {
      filtered = filtered.filter(b =>
        b.cuisine && b.cuisine.toLowerCase().includes(criteria.cuisine.toLowerCase())
      );
    }

    if (criteria.tags) {
      filtered = filtered.filter(b =>
        b.tags && b.tags.some(tag =>
          criteria.tags.some(searchTag =>
            tag.toLowerCase().includes(searchTag.toLowerCase())
          )
        )
      );
    }

    if (criteria.minRating) {
      filtered = filtered.filter(b => b.rating && b.rating >= criteria.minRating);
    }

    if (criteria.priceLevel) {
      filtered = filtered.filter(b => b.priceLevel === criteria.priceLevel);
    }

    return filtered;
  }
}

// Export for use in ai-assistant.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIBackend;
}
