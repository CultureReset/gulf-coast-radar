/**
 * Gemini AI Backend for Gulf Coast Radar
 * Replaces Claude with Google's Gemini Pro
 * Includes voice input/output capabilities
 * 97% cheaper than Claude!
 */

// Configuration
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Get from Google AI Studio
const GEMINI_MODEL = 'gemini-pro';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Voice configuration
const ENABLE_VOICE_OUTPUT = true;
const ENABLE_VOICE_INPUT = true;
const VOICE_LANGUAGE = 'en-US';
const VOICE_NAME = 'en-US-Neural2-C'; // Google's best female voice

class GeminiAI {
  constructor() {
    this.conversationHistory = [];
    this.businessData = null;
    this.userPreferences = {};

    // Voice setup
    this.voiceEnabled = ENABLE_VOICE_OUTPUT;
    this.listeningEnabled = ENABLE_VOICE_INPUT;
    this.synthesis = window.speechSynthesis;
    this.recognition = null;

    this.init();
  }

  async init() {
    // Load business data from sheets/local
    await this.loadBusinessData();

    // Initialize voice if enabled
    if (this.listeningEnabled && 'webkitSpeechRecognition' in window) {
      this.setupVoiceRecognition();
    }
  }

  async loadBusinessData() {
    try {
      // Load merged business data
      const response = await fetch('data/merged-business-data.js');
      const text = await response.text();

      // Extract data from JS file
      const dataMatch = text.match(/const allBusinessData = (\[[\s\S]*?\]);/);
      if (dataMatch) {
        this.businessData = eval(dataMatch[1]);
        console.log(`✅ Loaded ${this.businessData.length} businesses for Gemini`);
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  }

  setupVoiceRecognition() {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = VOICE_LANGUAGE;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input:', transcript);
      this.processUserMessage(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
    };
  }

  startListening() {
    if (this.recognition) {
      this.recognition.start();
      console.log('🎤 Listening...');
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  async speak(text) {
    if (!this.voiceEnabled) return;

    // Use Web Speech API (built-in, free!)
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_LANGUAGE;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Try to use Google voices if available
    const voices = this.synthesis.getVoices();
    const googleVoice = voices.find(v => v.name.includes('Google') && v.lang === VOICE_LANGUAGE);
    if (googleVoice) {
      utterance.voice = googleVoice;
    }

    this.synthesis.speak(utterance);
  }

  async sendMessage(userMessage, userLocation = null) {
    console.log('Sending to Gemini:', userMessage);

    // Build context from business data
    const context = this.buildContext(userLocation);

    // Build prompt
    const prompt = this.buildPrompt(userMessage, context);

    // Call Gemini API
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
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
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE'
            }
          ]
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Add to conversation history
        this.conversationHistory.push({
          role: 'user',
          content: userMessage
        });
        this.conversationHistory.push({
          role: 'assistant',
          content: aiResponse
        });

        // Speak response if voice enabled
        if (this.voiceEnabled) {
          this.speak(aiResponse);
        }

        return {
          success: true,
          response: aiResponse,
          businesses: this.extractBusinessRecommendations(aiResponse)
        };
      } else {
        throw new Error('No response from Gemini');
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: error.message,
        response: "I'm having trouble connecting right now. Please try again."
      };
    }
  }

  buildContext(userLocation) {
    let context = `You are GCR AI, the intelligent assistant for Gulf Coast Radar, the ultimate guide to Gulf Shores and Orange Beach, Alabama.

You have access to ${this.businessData ? this.businessData.length : 0} local businesses including restaurants, attractions, services, and activities.

Current date: ${new Date().toLocaleDateString()}
Current time: ${new Date().toLocaleTimeString()}
`;

    if (userLocation) {
      context += `User location: ${userLocation.lat}, ${userLocation.lng}\n`;
    }

    // Add weather if available
    if (window.currentWeather) {
      context += `Current weather: ${window.currentWeather.temp}°F, ${window.currentWeather.description}\n`;
    }

    return context;
  }

  buildPrompt(userMessage, context) {
    let prompt = `${context}

User message: "${userMessage}"

Instructions:
1. Be friendly, enthusiastic, and helpful
2. Provide specific business recommendations with names
3. Include practical details (hours, location, specialties)
4. Mention if something is family-friendly, has outdoor seating, etc.
5. Keep responses concise (3-4 sentences max)
6. Always mention 2-3 specific businesses when relevant
7. If asking about food/drinks, mention price range
8. Include "perfect for..." statements

Available businesses to recommend:
`;

    // Add relevant businesses based on message
    if (this.businessData) {
      const relevantBusinesses = this.findRelevantBusinesses(userMessage);
      relevantBusinesses.slice(0, 10).forEach(business => {
        prompt += `\n- ${business.name} (${business.category}): ${business.description || ''} Rating: ${business.rating || 'N/A'}`;
      });
    }

    prompt += `\n\nProvide your recommendation:`;

    return prompt;
  }

  findRelevantBusinesses(userMessage) {
    if (!this.businessData) return [];

    const message = userMessage.toLowerCase();
    const keywords = {
      seafood: ['seafood', 'fish', 'shrimp', 'oyster', 'crab'],
      breakfast: ['breakfast', 'brunch', 'morning', 'pancake', 'waffle'],
      beach: ['beach', 'ocean', 'sand', 'water'],
      family: ['family', 'kid', 'children'],
      nightlife: ['bar', 'drink', 'cocktail', 'beer', 'wine', 'night'],
      upscale: ['upscale', 'fine dining', 'fancy', 'romantic', 'date']
    };

    let scored = this.businessData.map(business => {
      let score = 0;
      const searchText = `${business.name} ${business.category} ${business.subcategory} ${business.description}`.toLowerCase();

      // Keyword matching
      Object.keys(keywords).forEach(category => {
        keywords[category].forEach(keyword => {
          if (message.includes(keyword) && searchText.includes(keyword)) {
            score += 5;
          }
        });
      });

      // Category matching
      if (message.includes(business.category?.toLowerCase())) score += 10;
      if (message.includes(business.subcategory?.toLowerCase())) score += 8;

      // Rating boost
      if (business.rating >= 4.5) score += 3;
      if (business.rating >= 4.0) score += 1;

      return { ...business, score };
    });

    return scored
      .filter(b => b.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  extractBusinessRecommendations(aiResponse) {
    // Extract business names from response
    const businesses = [];

    if (this.businessData) {
      this.businessData.forEach(business => {
        if (aiResponse.includes(business.name)) {
          businesses.push(business);
        }
      });
    }

    return businesses;
  }

  async processUserMessage(message) {
    // Get user location
    let userLocation = null;
    if (navigator.geolocation) {
      try {
        const position = await this.getCurrentPosition();
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch (error) {
        console.error('Could not get location:', error);
      }
    }

    // Send to Gemini
    const result = await this.sendMessage(message, userLocation);

    // Dispatch event for UI to handle
    window.dispatchEvent(new CustomEvent('gemini-response', {
      detail: result
    }));

    return result;
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  clearConversation() {
    this.conversationHistory = [];
    console.log('Conversation history cleared');
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
    if (!enabled) {
      this.synthesis.cancel();
    }
  }

  setListeningEnabled(enabled) {
    this.listeningEnabled = enabled;
    if (!enabled) {
      this.stopListening();
    }
  }
}

// Global instance
window.geminiAI = new GeminiAI();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiAI;
}
