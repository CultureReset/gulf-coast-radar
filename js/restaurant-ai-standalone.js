/**
 * STANDALONE Restaurant AI Assistant
 * Built specifically for restaurant profile demos
 * No dependencies on vacation planner code
 */

console.log('🍽️ Initializing standalone restaurant AI...');

class RestaurantAI {
  constructor(restaurantData) {
    this.restaurantData = restaurantData;
    this.conversation = [];
    this.isOpen = false;
    this.isListening = false;
    this.userPreferences = {}; // Track what we learn about the user

    // OpenAI API configuration (loaded from ai-config.js or window)
    this.apiKey = window.OPENAI_API_KEY || (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.apiKey) || '';

    this.init();
  }

  init() {
    // Create AI button
    this.createButton();
    // Create AI panel
    this.createPanel();
    // Set up speech recognition
    this.setupSpeechRecognition();

    console.log('✅ Restaurant AI initialized with', this.restaurantData.menu.length, 'menu items');
  }

  createButton() {
    const btn = document.createElement('button');
    btn.id = 'restaurant-ai-btn';
    btn.className = 'ai-assistant-btn';
    btn.innerHTML = '🤖';
    btn.setAttribute('aria-label', 'Restaurant AI Assistant');

    btn.addEventListener('click', () => this.togglePanel());

    document.body.appendChild(btn);
    this.btn = btn;
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'restaurant-ai-panel';
    panel.className = 'ai-assistant-panel';

    panel.innerHTML = `
      <div class="ai-panel-header">
        <span>🍽️ Your Server - Ask Me Anything!</span>
        <button class="ai-panel-close" onclick="restaurantAI.togglePanel()">×</button>
      </div>
      <div class="ai-panel-messages" id="restaurant-ai-messages"></div>
      <div class="ai-panel-input">
        <button class="ai-mic-btn" id="restaurant-ai-mic">🎤</button>
        <input type="text" id="restaurant-ai-input" placeholder="Ask about our menu...">
        <button class="ai-send-btn" id="restaurant-ai-send">Send</button>
      </div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;
    this.messagesContainer = document.getElementById('restaurant-ai-messages');

    // Set up input handlers
    document.getElementById('restaurant-ai-send').addEventListener('click', () => this.sendMessage());
    document.getElementById('restaurant-ai-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    document.getElementById('restaurant-ai-mic').addEventListener('click', () => this.toggleVoice());

    // Add initial greeting
    this.addMessage('assistant',
      "Hey there! I'm your virtual server at " + this.restaurantData.name +
      ". I can help you explore our menu, make recommendations, answer questions about dishes, and help you decide what sounds good. What can I help you with today?"
    );
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('active', this.isOpen);

    if (this.isOpen) {
      document.getElementById('restaurant-ai-input').focus();
    }
  }

  addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'assistant-message';
    messageDiv.textContent = text;

    this.messagesContainer.appendChild(messageDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    // Enhance assistant messages with food photos
    if (sender === 'assistant') {
      this.enhanceWithImages(messageDiv);
    }
  }

  async sendMessage() {
    const input = document.getElementById('restaurant-ai-input');
    const text = input.value.trim();

    if (!text) return;

    // Add user message
    this.addMessage('user', text);
    this.conversation.push({ role: 'user', content: text });

    input.value = '';

    // Get AI response
    const response = await this.getAIResponse(text);
    this.addMessage('assistant', response);
    this.conversation.push({ role: 'assistant', content: response });
  }

  async getAIResponse(userMessage) {
    try {
      const systemPrompt = this.createSystemPrompt();

      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversation.slice(-6), // Only keep last 6 messages for context
        { role: 'user', content: userMessage }
      ];

      console.log('🔄 Calling OpenAI API...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);

        // Check if it's an API key issue
        if (response.status === 401) {
          return "I'm having trouble connecting. The API key might need to be updated. Let me help you anyway! What are you in the mood for - seafood, steak, or something lighter?";
        }

        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Got AI response');
      return data.choices[0].message.content;

    } catch (error) {
      console.error('AI Error:', error);

      // Fallback to basic menu recommendations
      return this.getFallbackResponse(userMessage);
    }
  }

  getFallbackResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    // Greeting responses
    if (msg.match(/\b(hi|hey|hello|good morning|good evening)\b/)) {
      return "Hey! Welcome to The Sandbar Grill. I'm here to help you find something delicious. What are you in the mood for today - are you thinking something hearty, something lighter, or maybe something handheld?";
    }

    // Help/recommendations
    if (msg.includes('help') || msg.includes('recommend') || msg.includes('suggest') || msg.includes('good here') || msg.includes('find') || msg.includes('eat')) {
      // Track that they asked for help
      this.userPreferences.needsHelp = true;
      return "I'd love to help you decide! Let me ask you a few quick things: Are you super hungry or looking for something lighter? Do you prefer fried and crispy, or grilled? And what sounds better - seafood, steak, or a sandwich? Those will really help me narrow it down!";
    }

    // Shrimp queries
    if (msg.includes('shrimp')) {
      if (msg.includes('po') || msg.includes('boy') || msg.includes('sandwich')) {
        return "Great choice! The Gulf Shrimp Po'Boy is our #1 seller - six huge hand-breaded shrimp fried crispy on French bread with our housemade remoulade sauce. It's messy but so worth it! Comes with fries for $14.99.";
      }
      return "We've got some amazing shrimp options! The Po'Boy ($14.99) is our #1 seller - six jumbo shrimp on French bread. Or the Gulf Shrimp Platter ($21.99) gives you a full dozen shrimp - fried, grilled, or blackened, your choice. What sounds better?";
    }

    // Seafood
    if (msg.includes('seafood') || msg.includes('fish')) {
      this.userPreferences.likesSeafood = true;
      return "Perfect! We specialize in fresh Gulf seafood. Quick question - do you want something you can pick up and eat with your hands, or are you thinking more of a full plate with a fork? That'll help me narrow down between our Po'Boy vs our plated seafood entrees!";
    }

    // Light/lighter
    if (msg.includes('light') || msg.includes('not too heavy') || msg.includes('salad')) {
      return "Got it! For something lighter, I'd go with the Grilled Mahi Mahi ($24.99) with mango salsa - it's fresh and not heavy at all. Or the Blackened Red Snapper ($26.99) is amazing if you want a little Cajun kick. Both are super flavorful but won't weigh you down. Sound good?";
    }

    // Hungry/big appetite
    if (msg.includes('super hungry') || msg.includes('starving') || msg.includes('really hungry') || msg.includes('huge')) {
      return "Okay, so you're HUNGRY - I got you! The Seafood Platter ($32.99) is your answer. You get fried shrimp, oysters, scallops, AND fish with fries, coleslaw, and hushpuppies. It's massive. Or the Surf & Turf ($44.99) - filet mignon plus shrimp or lobster. Both will definitely fill you up!";
    }

    // Steak
    if (msg.includes('steak') || msg.includes('beef') || msg.includes('ribeye') || msg.includes('filet')) {
      return "Great choice! The Ribeye ($34.99) is 12 oz with amazing marbling - super juicy and flavorful. The Filet Mignon ($38.99) is 8 oz, wrapped in bacon, and incredibly tender. Both come with loaded baked potato and grilled veggies. Want bold flavor? Go ribeye. Want melt-in-your-mouth? Filet's your pick.";
    }

    // Spicy
    if (msg.includes('spicy') || msg.includes('hot') || msg.includes('kick')) {
      return "Perfect! The Firecracker Shrimp ($12.99) is exactly what you want - crispy fried shrimp tossed in our spicy-sweet sauce. Or the Blackened Red Snapper ($26.99) has that Cajun spice kick. Both pack heat without being overwhelming!";
    }

    // Fried
    if (msg.includes('fried') || msg.includes('crispy')) {
      this.userPreferences.likesFried = true;
      return "You're speaking my language! The Po'Boy ($14.99) is our #1 fried item - six jumbo shrimp on French bread with this insane remoulade sauce. Or go big with the Seafood Platter ($32.99) - fried shrimp, oysters, scallops, and fish. Are you looking for something handheld or a full plate with sides?";
    }

    // Grilled
    if (msg.includes('grilled') || msg.includes('healthy') || msg.includes('fresh')) {
      this.userPreferences.likesGrilled = true;
      return "Perfect! For grilled, the Mahi Mahi ($24.99) is incredible - topped with fresh mango salsa. Or the Grilled Salmon ($23.99) with teriyaki glaze. Both are super fresh and not heavy. Do you want something with a little spice, or more mild and sweet?";
    }

    // Handheld/sandwich
    if (msg.includes('hand') || msg.includes('sandwich') || msg.includes('burger') || msg.includes('casual')) {
      return "Great! For handheld, the Po'Boy ($14.99) is our #1 seller - fried shrimp on French bread. Or the Fish Tacos ($13.99) are awesome - three tacos with grilled or blackened fish and chipotle crema. Or if you want non-seafood, the Classic Burger ($12.99) is a solid half-pounder. What sounds good?";
    }

    // Full plate/formal
    if (msg.includes('plate') || msg.includes('fork') || msg.includes('entree') || msg.includes('dinner')) {
      return "Perfect! For a full plated entree, I'd go with either the Seafood Platter ($32.99) - fried shrimp, oysters, scallops, and fish. Or the Blackened Red Snapper ($26.99) with dirty rice and sautéed spinach. Both come with all the sides. Are you more in the mood for fried or blackened?";
    }

    // Daily specials / deals
    if (msg.includes('special') || msg.includes('deal') || msg.includes('today') ||
        msg.includes('monday') || msg.includes('tuesday') || msg.includes('wednesday') ||
        msg.includes('thursday') || msg.includes('friday') || msg.includes('saturday') || msg.includes('sunday')) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];

      // Check if asking about specific day
      let requestedDay = null;
      for (const day of days) {
        if (msg.includes(day.toLowerCase())) {
          requestedDay = day;
          break;
        }
      }

      // If asking about specific day
      if (requestedDay && this.restaurantData.dailySpecials) {
        const special = this.restaurantData.dailySpecials.find(s => s.day === requestedDay);
        if (special) {
          const isToday = requestedDay === today ? " - that's today!" : "";
          return `${requestedDay}'s special${isToday}: ${special.name} for ${special.price}! ${special.description}`;
        }
      }

      // Otherwise show today's special
      const todaySpecial = this.restaurantData.dailySpecials?.find(s => s.day === today);
      if (todaySpecial) {
        return `Today's ${today} special is awesome! ${todaySpecial.name} for ${todaySpecial.price} - ${todaySpecial.description} We also have Happy Hour daily 3-6pm with half off apps and drinks!`;
      }
      return "We have daily specials every day of the week! Want me to tell you about today's special or see what's coming up?";
    }

    // Drinks
    if (msg.includes('drink') || msg.includes('cocktail') || msg.includes('margarita') || msg.includes('beer')) {
      return "We've got some great drinks! The Bushwacker ($11.99) is Alabama's favorite - frozen, chocolatey, with rum. Perfect beach drink! Or our Sandbar Margarita ($9.99) with Patron Silver. Happy hour is 3-6pm daily with half off drinks!";
    }

    // Appetizers
    if (msg.includes('appetizer') || msg.includes('starter') || msg.includes('app')) {
      return "Great idea! The Oysters Rockefeller ($16.99) are amazing - six oysters with spinach, bacon, and parmesan. Or try the Crab Cakes ($18.99) with jumbo lump crab. Both are perfect for sharing!";
    }

    // Can't decide
    if (msg.includes('decide') || msg.includes('not sure') || msg.includes('don\\'t know')) {
      return "No worries! Let me ask you this - when you think about a perfect meal right now, are you picturing something you can pick up with your hands (like a sandwich), or something on a plate with a fork? And are you a fried seafood person or more grilled?";
    }

    // Price questions
    if (msg.includes('price') || msg.includes('cost') || msg.includes('expensive') || msg.includes('cheap')) {
      return "We've got options for every budget! Sandwiches run $12-17 (the Po'Boy at $14.99 is a steal!). Full seafood entrees are $20-40. Our Ribeye Steak is $34.99. Want me to recommend something in a specific price range?";
    }

    // What comes with
    if (msg.includes('come with') || msg.includes('comes with') || msg.includes('sides')) {
      return "Most entrees come with sides! The shrimp platter has fries, coleslaw, and hushpuppies. Steaks come with loaded baked potato and grilled veggies. Sandwiches all include fries. What dish are you curious about?";
    }

    // Default - always engaging with qualifying questions
    return "I'd love to help you decide! Let me ask you a few quick questions: Are you super hungry or looking for something lighter? Do you prefer fried and crispy, or grilled and fresh? And are you a seafood person, or more steak? Those three things will really help me point you in the right direction!";
  }

  createSystemPrompt() {
    return `You are a friendly, knowledgeable server at ${this.restaurantData.name}, a beachfront seafood restaurant in Gulf Shores, Alabama.

YOUR ROLE:
- Act like an experienced server/bartender who knows the menu inside and out
- Help guests decide what they want to eat and drink at ${this.restaurantData.name} ONLY
- Make personalized recommendations from OUR MENU based on their preferences
- Answer questions about ingredients, preparation, dietary options
- Be warm, friendly, and conversational like a real server
- Use casual, natural language (not overly formal)
- ONLY talk about ${this.restaurantData.name} - DO NOT recommend other restaurants or businesses

THE MENU:
${this.formatMenuForAI()}

DRINKS:
${this.formatDrinksForAI()}

DAILY SPECIALS:
${this.formatDailySpecialsForAI()}

HOW TO HELP GUESTS:
1. Ask qualifying questions about preferences
2. Make 2-3 specific recommendations with details
3. Explain WHY you're recommending each item
4. Share insider details: preparation, portion size, what pairs well
5. Be conversational and share what YOU would order
6. Keep responses concise (2-4 sentences typically)

IMPORTANT RULES:
- ONLY recommend items actually on ${this.restaurantData.name}'s menu
- NEVER recommend other restaurants - you only work at ${this.restaurantData.name}
- Don't make up dishes or prices
- Keep responses friendly and natural
- Don't end every response with a question`;
  }

  formatMenuForAI() {
    return this.restaurantData.menu.map(item =>
      `- ${item.name} (${item.price}) - ${item.description}`
    ).join('\n');
  }

  formatDrinksForAI() {
    return this.restaurantData.drinks.map(item =>
      `- ${item.name} (${item.price}) - ${item.description}`
    ).join('\n');
  }

  formatDailySpecialsForAI() {
    if (!this.restaurantData.dailySpecials || this.restaurantData.dailySpecials.length === 0) {
      return "No daily specials currently available.";
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    let specialsText = this.restaurantData.dailySpecials.map(special =>
      `- ${special.day}: ${special.name} (${special.price}) - ${special.description}`
    ).join('\n');

    specialsText += `\n\nToday is ${today}! Make sure to mention today's special when appropriate.`;

    return specialsText;
  }

  enhanceWithImages(messageElement) {
    const messageText = messageElement.textContent;
    const allItems = [
      ...this.restaurantData.menu,
      ...this.restaurantData.drinks,
      ...(this.restaurantData.dailySpecials || [])
    ];

    // Find mentioned items
    const mentionedItems = allItems.filter(item => {
      const pattern = new RegExp(item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return pattern.test(messageText);
    });

    if (mentionedItems.length > 0) {
      const gallery = document.createElement('div');
      gallery.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;';

      mentionedItems.forEach(item => {
        const card = document.createElement('div');
        card.style.cssText = 'border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s; cursor: pointer;';
        card.onmouseover = () => card.style.transform = 'scale(1.05)';
        card.onmouseout = () => card.style.transform = 'scale(1)';

        card.innerHTML = `
          <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover;">
          <div style="padding: 12px; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);">
            <div style="font-weight: 700; font-size: 15px; color: #111827;">${item.name}</div>
            <div style="font-size: 14px; color: #F59E0B; font-weight: 700;">${item.price}</div>
          </div>
        `;

        gallery.appendChild(card);
      });

      messageElement.appendChild(gallery);
    }
  }

  setupSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (event.results[0].isFinal) {
        document.getElementById('restaurant-ai-input').value = transcript;
        this.sendMessage();
        this.stopListening();
      }
    };

    this.recognition.onerror = () => this.stopListening();
    this.recognition.onend = () => this.stopListening();
  }

  toggleVoice() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!this.recognition) return;

    this.isListening = true;
    this.btn.classList.add('listening');
    document.getElementById('restaurant-ai-mic').textContent = '🔴';

    try {
      this.recognition.start();
    } catch (e) {
      this.stopListening();
    }
  }

  stopListening() {
    this.isListening = false;
    this.btn.classList.remove('listening');
    document.getElementById('restaurant-ai-mic').textContent = '🎤';

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

// Initialize when restaurant data is ready
if (window.DEMO_RESTAURANT) {
  window.restaurantAI = new RestaurantAI(window.DEMO_RESTAURANT);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.DEMO_RESTAURANT) {
      window.restaurantAI = new RestaurantAI(window.DEMO_RESTAURANT);
    }
  });
}
