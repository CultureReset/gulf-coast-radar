// AI Voice Assistant for Vacation Planning
// Uses Web Speech API for voice input/output and AI logic for itinerary planning

class VacationAssistant {
  constructor() {
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.voiceManager = null; // Enhanced TTS voice manager
    this.conversation = [];
    this.aiBackend = null; // External AI backend (optional)
    this.coordinatorAI = null; // Multi-agent coordinator for menu queries
    this.useExternalAI = false; // Flag to use external AI
    this.recognitionTimeout = null; // Timeout to stop listening
    this.lastTranscript = ''; // Store the last transcript
    this.isProcessing = false; // Prevent duplicate processing
    this.continuousMode = false; // Continuous conversation mode
    this.shouldRestartListening = false; // Flag to restart listening after speaking
    this.userLocation = null; // User's current location
    this.distancesCalculated = false; // Flag to track if distances are calculated

    // Conversational intelligence enhancements
    this.conversationContext = {
      lastIntent: null,
      lastCategory: null,
      awaitingClarification: false,
      clarificationFor: null,
      clarificationCount: 0,  // Track number of clarifying questions asked
      userPreferences: {},
      lastShownBusinesses: [],  // Consolidated: use this for all business tracking
      lastQueryType: null,
      conversationHistory: [],
      kidsAgeKnown: false,
      pendingQuery: null,
      pendingRequests: [],
      pendingSecondRequest: null,
      originalQuery: null
    };

    this.init();
    this.initializeVoiceManager();
    this.initializeAIBackend();
    this.requestLocationForDistances();
  }

  // Request location and calculate distances for all businesses
  async requestLocationForDistances() {
    try {
      console.log('🌍 Requesting user location for accurate distances...');

      // Request location permission
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log('✅ Got user location:', this.userLocation);

      // Calculate distances for all businesses
      if (typeof allBusinesses !== 'undefined' && allBusinesses.length > 0) {
        await this.calculateAllDistances();
      }
    } catch (error) {
      console.warn('⚠️ Could not get location:', error.message);
      // Continue without distances - will show "nearby" as fallback
    }
  }

  // Calculate accurate distances for all businesses
  async calculateAllDistances() {
    if (!this.userLocation || typeof allBusinesses === 'undefined' || !allBusinesses || allBusinesses.length === 0) return;

    console.log('📏 Calculating distances for', allBusinesses.length, 'businesses...');

    for (const business of allBusinesses) {
      try {
        // Get business coordinates
        const destination = this.getBusinessCoordinates(business);
        if (!destination) {
          // Use location name instead of "unknown distance"
          business.distanceText = business.location || 'nearby';
          business.distance = 999999;
          continue;
        }

        // Calculate straight-line distance (Haversine formula)
        const distance = this.calculateDistance(
          this.userLocation.lat,
          this.userLocation.lng,
          destination.lat,
          destination.lng
        );

        business.distance = distance;
        business.distanceText = distance < 1
          ? `${(distance * 5280).toFixed(0)} ft`
          : `${distance.toFixed(1)} mi`;
      } catch (error) {
        console.error(`Error calculating distance for ${business.name}:`, error);
        business.distanceText = 'nearby';
        business.distance = 999999;
      }
    }

    this.distancesCalculated = true;
    console.log('✅ All distances calculated!');
  }

  // Calculate distance using Haversine formula (straight-line distance in miles)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3958.8; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get business coordinates from business data
  getBusinessCoordinates(business) {
    // If business has coordinates, use them
    if (business.coordinates && business.coordinates.lat && business.coordinates.lng) {
      return business.coordinates;
    }

    // Try to parse from address
    const address = business.address ? business.address.toLowerCase() : '';

    // Perdido Beach Blvd (Orange Beach main road)
    if (address.includes('perdido beach blvd') || address.includes('perdido beach boulevard')) {
      const match = address.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[0]);
        if (num < 25000) return { lat: 30.2750, lng: -87.5850 };
        if (num < 26000) return { lat: 30.2765, lng: -87.5700 };
        if (num < 27000) return { lat: 30.2780, lng: -87.5600 };
        return { lat: 30.2790, lng: -87.5500 };
      }
    }

    // Gulf Shores locations
    if (business.location && business.location.toLowerCase().includes('gulf shores')) {
      return { lat: 30.2460, lng: -87.7008 };
    }

    // Orange Beach locations
    if (business.location && business.location.toLowerCase().includes('orange beach')) {
      return { lat: 30.2904, lng: -87.5723 };
    }

    // Default to Gulf Shores center
    return { lat: 30.2460, lng: -87.7008 };
  }

  // Initialize enhanced voice manager
  async initializeVoiceManager() {
    if (typeof TTSVoiceManager !== 'undefined') {
      this.voiceManager = new TTSVoiceManager();
      console.log('🎙️ Enhanced TTS voice manager initialized');
    } else {
      console.warn('⚠️ TTSVoiceManager not found, using basic speech synthesis');
    }
  }

  // Initialize external AI backend if configured
  initializeAIBackend() {
    // Check if AIBackend class is available and API key is configured
    console.log('Initializing AI Backend...');
    console.log('AIBackend available?', typeof AIBackend !== 'undefined');
    console.log('CoordinatorAI available?', typeof CoordinatorAI !== 'undefined');
    console.log('AI_CONFIG available?', typeof window.AI_CONFIG !== 'undefined');
    console.log('API Key present?', window.AI_CONFIG?.apiKey ? 'Yes (length: ' + window.AI_CONFIG.apiKey.length + ')' : 'No');

    if (typeof AIBackend !== 'undefined' && window.AI_CONFIG && window.AI_CONFIG.apiKey) {
      console.log('Creating AIBackend instance...');
      this.aiBackend = new AIBackend(window.AI_CONFIG.apiKey, window.AI_CONFIG.provider || 'openai');

      // Also initialize multi-agent coordinator if available
      if (typeof CoordinatorAI !== 'undefined') {
        console.log('Creating CoordinatorAI instance for menu queries...');
        this.coordinatorAI = new CoordinatorAI(window.AI_CONFIG.apiKey, window.AI_CONFIG.provider || 'openai');
      }

      // Initialize with business data when available
      if (typeof allBusinesses !== 'undefined' && allBusinesses && allBusinesses.length > 0) {
        this.aiBackend.initializeWithData(allBusinesses);
        if (this.coordinatorAI) {
          this.coordinatorAI.initializeWithData(allBusinesses);
        }
        this.useExternalAI = true;
        console.log('✅ External AI backend initialized with', allBusinesses.length, 'businesses');
      } else {
        // Wait for data to load
        console.log('Waiting for business data to load...');
        setTimeout(() => {
          if (typeof allBusinesses !== 'undefined' && allBusinesses && allBusinesses.length > 0) {
            this.aiBackend.initializeWithData(allBusinesses);
            if (this.coordinatorAI) {
              this.coordinatorAI.initializeWithData(allBusinesses);
            }
            this.useExternalAI = true;
            console.log('✅ External AI backend initialized (delayed) with', allBusinesses.length, 'businesses');
          } else {
            console.warn('⚠️ Business data still not loaded after delay');
          }
        }, 1000);
      }
    } else {
      console.log('❌ Using local AI logic (no external API configured)');
      if (typeof AIBackend === 'undefined') console.warn('AIBackend class not loaded');
      if (!window.AI_CONFIG) console.warn('AI_CONFIG not found');
      if (!window.AI_CONFIG?.apiKey) console.warn('API key not configured');
    }
  }

  init() {
    // Check for Web Speech API support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Web Speech API not supported in this browser');
      this.createUnsupportedUI();
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // Will be set to true in continuous mode
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('Voice recognition started');
      this.isListening = true;
      this.updateUI('listening');

      // INTERRUPT DETECTION: If AI is speaking, stop it immediately
      if (this.isSpeaking) {
        console.log('User started speaking - interrupting AI');
        this.cancelSpeech();
      }
    };

    this.recognition.onend = () => {
      console.log('Voice recognition ended');
      this.isListening = false;

      // In continuous mode, restart listening after speaking completes
      if (this.shouldRestartListening && this.continuousMode && !this.isSpeaking) {
        console.log('Continuous mode: restarting listening...');
        this.shouldRestartListening = false;
        setTimeout(() => {
          if (this.continuousMode && !this.isListening && !this.isSpeaking) {
            try {
              this.recognition.start();
            } catch (error) {
              console.log('Could not restart listening:', error);
            }
          }
        }, 500); // Small delay to avoid race conditions
      } else {
        this.updateUI('idle');
      }
    };

    this.recognition.onresult = (event) => {
      // Clear any existing timeout
      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }

      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      console.log('Heard:', transcript);
      this.lastTranscript = transcript;

      if (event.results[0].isFinal) {
        console.log('Final transcript detected, processing...');
        // Stop listening and process the command
        this.recognition.stop();
        this.processVoiceCommand(transcript);
      } else {
        // Show interim results
        this.showTranscript(transcript, false);

        // Set a timeout to auto-process if no more speech
        this.recognitionTimeout = setTimeout(() => {
          console.log('Timeout reached, processing last transcript...');
          if (this.lastTranscript && this.isListening) {
            this.recognition.stop();
            this.processVoiceCommand(this.lastTranscript);
          }
        }, 5000); // Process after 5 seconds of silence - allows user to finish complete thoughts
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.updateUI('error');

      let errorMessage = "Sorry, there was an error with voice recognition.";

      switch(event.error) {
        case 'no-speech':
          errorMessage = "I didn't hear anything. Please try again.";
          break;
        case 'not-allowed':
          errorMessage = "Microphone access was denied. Please enable microphone permissions in your browser settings.";
          this.showPermanentError(errorMessage);
          break;
        case 'aborted':
          errorMessage = "Voice recognition was cancelled.";
          break;
        case 'audio-capture':
          errorMessage = "No microphone was found. Please connect a microphone and try again.";
          break;
        case 'network':
          errorMessage = "Network error occurred. Please check your internet connection.";
          break;
      }

      this.showError(errorMessage);
      console.log('Error details:', event.error, event.message);
    };

    this.createUI();
  }

  createUI() {
    // Create floating assistant button
    const assistantBtn = document.createElement('button');
    assistantBtn.id = 'ai-assistant-btn';
    assistantBtn.className = 'ai-assistant-btn';
    assistantBtn.innerHTML = '🎤';
    assistantBtn.setAttribute('aria-label', 'AI Voice Assistant');
    assistantBtn.title = 'Click to talk to vacation planning assistant';

    assistantBtn.addEventListener('click', () => this.toggleListening());
    document.body.appendChild(assistantBtn);

    // Create transcript/response panel
    const panel = document.createElement('div');
    panel.id = 'ai-assistant-panel';
    panel.className = 'ai-assistant-panel';
    panel.innerHTML = `
      <div class="ai-panel-header">
        <span>🤖 Vacation Planner</span>
        <div class="ai-panel-controls">
          <button class="ai-continuous-toggle" id="ai-continuous-toggle" title="Toggle continuous listening mode">
            <span class="toggle-icon">🔄</span>
            <span class="toggle-text">Stay On</span>
          </button>
          <button class="ai-panel-close" onclick="assistantInstance.closePanel()">×</button>
        </div>
      </div>
      <div class="ai-panel-messages" id="ai-messages"></div>
      <div class="ai-panel-status" id="ai-status">Click the microphone to start</div>
    `;
    document.body.appendChild(panel);

    // Add continuous mode toggle listener
    const continuousToggle = document.getElementById('ai-continuous-toggle');
    if (continuousToggle) {
      continuousToggle.addEventListener('click', () => this.toggleContinuousMode());
      this.updateContinuousToggle();
    }
  }

  async toggleListening() {
    if (this.isListening) {
      // Clear timeout when manually stopping
      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }
      this.continuousMode = false; // Disable continuous mode when manually stopped
      this.shouldRestartListening = false;
      this.recognition.stop();
    } else {
      this.openPanel();
      this.lastTranscript = ''; // Reset transcript

      try {
        // Request microphone permission explicitly
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());

        // Enable continuous mode after first activation
        if (!this.continuousMode) {
          this.continuousMode = true;
          console.log('Continuous conversation mode enabled');
        }

        // Now start voice recognition
        this.recognition.start();

        const statusDiv = document.getElementById('ai-status');
        if (statusDiv) {
          statusDiv.textContent = this.continuousMode
            ? 'Listening... (mic stays on) 🎙️'
            : 'Listening... speak now';
          statusDiv.style.color = '#6b7280';
        }
      } catch (error) {
        console.error('Microphone permission error:', error);

        let errorMessage = 'Could not access microphone. ';
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage += 'Please allow microphone access in your browser settings.';
          this.showPermanentError(errorMessage);
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No microphone found. Please connect a microphone.';
          this.showError(errorMessage);
        } else {
          errorMessage += error.message;
          this.showError(errorMessage);
        }
      }
    }
  }

  openPanel() {
    const panel = document.getElementById('ai-assistant-panel');
    panel.classList.add('active');
  }

  closePanel() {
    const panel = document.getElementById('ai-assistant-panel');
    panel.classList.remove('active');

    // Clear timeout when closing panel
    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
      this.recognitionTimeout = null;
    }

    // Disable continuous mode when closing
    this.continuousMode = false;
    this.shouldRestartListening = false;

    if (this.isListening) {
      this.recognition.stop();
    }

    // Cancel any ongoing speech
    this.cancelSpeech();
  }

  toggleContinuousMode() {
    this.continuousMode = !this.continuousMode;
    console.log('Continuous mode:', this.continuousMode ? 'ON' : 'OFF');

    this.updateContinuousToggle();

    // Update status message and visual indicator
    const statusDiv = document.getElementById('ai-status');
    if (statusDiv && !this.isListening && !this.isSpeaking) {
      statusDiv.textContent = this.continuousMode
        ? '🔄 Continuous mode ON - Mic stays on'
        : 'Click the microphone to start';

      // Add visual class for continuous mode
      if (this.continuousMode) {
        statusDiv.classList.add('continuous-active');
      } else {
        statusDiv.classList.remove('continuous-active');
      }
    }

    // If turning on continuous mode and already listening, keep listening after speech
    if (this.continuousMode && this.isListening) {
      this.shouldRestartListening = true;
    }
  }

  updateContinuousToggle() {
    const toggle = document.getElementById('ai-continuous-toggle');
    if (toggle) {
      if (this.continuousMode) {
        toggle.classList.add('active');
        toggle.title = 'Continuous mode ON - Mic stays on after responses';
      } else {
        toggle.classList.remove('active');
        toggle.title = 'Continuous mode OFF - Click to enable';
      }
    }
  }

  // Cancel ongoing speech synthesis (for interrupt detection)
  cancelSpeech() {
    if (this.isSpeaking) {
      console.log('Cancelling speech...');

      // Cancel speech synthesis
      if (this.voiceManager && this.voiceManager.cancel) {
        this.voiceManager.cancel();
      } else {
        window.speechSynthesis.cancel();
      }

      this.isSpeaking = false;
      this.updateUI('listening'); // Return to listening state
    }
  }

  createUnsupportedUI() {
    // Create a button that explains the browser doesn't support voice
    const assistantBtn = document.createElement('button');
    assistantBtn.id = 'ai-assistant-btn';
    assistantBtn.className = 'ai-assistant-btn';
    assistantBtn.innerHTML = '🎤';
    assistantBtn.setAttribute('aria-label', 'AI Voice Assistant (Not Supported)');
    assistantBtn.title = 'Voice assistant requires Chrome, Edge, or Safari';
    assistantBtn.style.background = '#9ca3af';
    assistantBtn.style.cursor = 'not-allowed';

    assistantBtn.addEventListener('click', () => {
      alert('Voice Assistant Not Supported\n\nYour browser doesn\'t support voice recognition. Please use:\n• Google Chrome\n• Microsoft Edge\n• Safari (with limitations)\n\nFirefox does not currently support the Web Speech API.');
    });

    document.body.appendChild(assistantBtn);
  }

  showError(message) {
    const messagesDiv = document.getElementById('ai-messages');
    if (messagesDiv) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'assistant-message';
      errorMsg.style.background = '#fee2e2';
      errorMsg.style.color = '#991b1b';
      errorMsg.innerHTML = `⚠️ ${message}`;
      messagesDiv.appendChild(errorMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    const statusDiv = document.getElementById('ai-status');
    if (statusDiv) {
      statusDiv.textContent = 'Error - Click microphone to try again';
      statusDiv.style.color = '#991b1b';
    }
  }

  showPermanentError(message) {
    this.showError(message);

    // Disable the microphone button
    const btn = document.getElementById('ai-assistant-btn');
    if (btn) {
      btn.style.background = '#9ca3af';
      btn.style.cursor = 'not-allowed';
      btn.title = 'Microphone access denied';
      btn.onclick = () => {
        alert('Microphone Access Required\n\nPlease enable microphone permissions in your browser settings to use the voice assistant.');
      };
    }
  }

  updateUI(state) {
    const btn = document.getElementById('ai-assistant-btn');
    const status = document.getElementById('ai-status');

    btn.classList.remove('listening', 'speaking', 'error');

    switch(state) {
      case 'listening':
        btn.classList.add('listening');
        btn.innerHTML = '🎙️';
        status.textContent = this.continuousMode ? 'Listening... (mic stays on) 🎙️' : 'Listening...';
        if (this.continuousMode) {
          status.classList.add('continuous-active');
        }
        break;
      case 'speaking':
        btn.classList.add('speaking');
        btn.innerHTML = '🔊';
        status.textContent = this.continuousMode ? 'Speaking... (talk to interrupt) 💬' : 'Speaking...';
        break;
      case 'error':
        btn.classList.add('error');
        status.textContent = 'Error - try again';
        setTimeout(() => {
          btn.classList.remove('error');
          status.textContent = 'Click the microphone to start';
        }, 2000);
        break;
      default:
        btn.innerHTML = '🎤';
        status.textContent = 'Click the microphone to start';
    }
  }

  showTranscript(text, isFinal) {
    const messagesDiv = document.getElementById('ai-messages');
    let lastMessage = messagesDiv.lastElementChild;

    if (!isFinal && lastMessage && lastMessage.classList.contains('user-message-interim')) {
      lastMessage.textContent = text;
    } else if (isFinal) {
      if (lastMessage && lastMessage.classList.contains('user-message-interim')) {
        lastMessage.remove();
      }
      const messageDiv = document.createElement('div');
      messageDiv.className = 'user-message';
      messageDiv.textContent = text;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } else {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'user-message-interim';
      messageDiv.textContent = text;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }

  addAssistantMessage(text) {
    const messagesDiv = document.getElementById('ai-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'assistant-message';
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async processVoiceCommand(command) {
    // Prevent duplicate processing
    if (this.isProcessing) {
      console.log('Already processing a command, skipping...');
      return;
    }

    this.isProcessing = true;
    console.log('Processing command:', command);

    // Clear timeout since we're processing now
    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
      this.recognitionTimeout = null;
    }

    this.showTranscript(command, true);
    this.conversation.push({ role: 'user', content: command });

    // Update UI to show processing
    const statusDiv = document.getElementById('ai-status');
    if (statusDiv) {
      statusDiv.textContent = 'Thinking...';
      statusDiv.style.color = '#8b5cf6';
    }

    let response;

    try {
      // Track AI question
      if (window.analyticsTracker) {
        const intentPreview = command.substring(0, 50);
        window.analyticsTracker.trackAIQuestion(intentPreview, 'processing');
      }

      // CHECK IF WE'RE IN THE MIDDLE OF A CONVERSATION FIRST
      // If waiting for clarification, use local pattern matching (it has context)
      if (this.conversationContext.awaitingClarification) {
        console.log('💬 Continuing conversation - awaiting clarification for:', this.conversationContext.clarificationFor);
        // Use local pattern matching which understands conversation context
        const intent = this.analyzeIntent(command);
        response = await this.generateDataOnlyResponse(intent);
      }
      // MULTI-AGENT MODE: Check if this is a menu query and route to coordinator
      else if (this.coordinatorAI && this.coordinatorAI.isMenuQuery(command)) {
        try {
          console.log('🍽️ Menu query detected - using multi-agent system...');
          const aiResponse = await this.coordinatorAI.query(command);

          if (aiResponse) {
            response = aiResponse;
            console.log('✅ Multi-agent response:', response.substring(0, 100) + '...');
          } else {
            throw new Error('Multi-agent system returned null');
          }
        } catch (error) {
          console.error('❌ Multi-agent query failed, using fallback:', error);
          // Fall back to local pattern matching
          const intent = this.analyzeIntent(command);
          response = await this.generateDataOnlyResponse(intent);
        }
      }
      // HYBRID MODE: Use ChatGPT for NEW questions only
      else if (this.useExternalAI && this.aiBackend && window.AI_CONFIG?.useHybridMode !== false) {
        try {
          console.log('🤖 Using ChatGPT for intent analysis...');
          // Use ChatGPT ONLY to understand what user is asking (lightweight, cheap)
          const aiIntent = await this.aiBackend.analyzeIntent(command);

          if (aiIntent && aiIntent.type) {
            console.log('✅ ChatGPT detected intent:', aiIntent);
            // Convert AI intent to local intent format
            const intent = {
              type: aiIntent.type,
              command: command,
              fullText: command.toLowerCase(),
              cuisine: aiIntent.cuisine || null,
              hasMusic: aiIntent.hasMusic || false,
              hasWaterfront: aiIntent.hasWaterfront || false,
              activityType: aiIntent.activityType || null
            };
            // Use LOCAL platform data to generate response (free, fast, Sales Pro mode)
            console.log('📊 Generating response from local data...');
            response = await this.generateDataOnlyResponse(intent);
            console.log('✅ Response generated:', response.substring(0, 100) + '...');
          } else {
            console.warn('⚠️ ChatGPT returned null/invalid intent, using local fallback');
            throw new Error('Could not parse intent from AI');
          }
        } catch (error) {
          console.error('❌ ChatGPT intent analysis failed, using local pattern matching:', error);
          // Fall back to local pattern matching
          const intent = this.analyzeIntent(command);
          response = await this.generateDataOnlyResponse(intent);
        }
      } else {
        // Use local pattern matching - DATA-ONLY responses
        console.log('📍 Using local pattern matching (no ChatGPT)');
        const intent = this.analyzeIntent(command);
        response = await this.generateDataOnlyResponse(intent);
      }

      console.log('Generated response:', response);

      this.addAssistantMessage(response);
      this.speak(response);
    } catch (error) {
      console.error('Error processing command:', error);
      const errorResponse = "Sorry, I encountered an error processing your request. Please try again.";
      this.addAssistantMessage(errorResponse);
      this.speak(errorResponse);
    } finally {
      this.isProcessing = false;
    }
  }

  // Smart search intent extraction (Google-like understanding)
  extractSearchIntent(lower, command) {
    // Check for specific food items that should trigger restaurant search
    const hasSpecificFood = this.extractCuisine(lower) !== null;

    // Restaurant keywords
    if (lower.includes('restaurant') || lower.includes('eat') || lower.includes('food') ||
        lower.includes('dine') || lower.includes('lunch') || lower.includes('dinner') ||
        lower.includes('breakfast') || lower.includes('place') || hasSpecificFood) {
      const cuisine = this.extractCuisine(lower);
      return {
        type: 'find_restaurant',
        command,
        fullText: lower,
        cuisine: cuisine,
        hasMusic: lower.includes('music') || lower.includes('live band'),
        hasWaterfront: lower.includes('waterfront') || lower.includes('water view') || lower.includes('beach'),
        needsReservation: lower.includes('reservation') || lower.includes('reserve') || lower.includes('book'),
        skipClarification: !!cuisine  // Skip clarifying questions if specific food/cuisine mentioned
      };
    }

    // Beach/water keywords
    if (lower.includes('beach') || lower.includes('boat') || lower.includes('marina') ||
        lower.includes('fishing') || lower.includes('water sport') || lower.includes('kayak') ||
        lower.includes('jet ski') || lower.includes('dolphin')) {
      if (lower.includes('access') || lower.includes('parking')) {
        return { type: 'find_beach_access', command, fullText: lower };
      }
      if (lower.includes('launch') || lower.includes('ramp')) {
        return { type: 'find_boat_launch', command, fullText: lower };
      }
      if (lower.includes('marina') || lower.includes('dock') || lower.includes('slip')) {
        return { type: 'find_marina', command, fullText: lower };
      }
      return { type: 'find_activity', command, fullText: lower };
    }

    // Parks
    if (lower.includes('park') || lower.includes('trail') || lower.includes('nature') ||
        lower.includes('playground') || lower.includes('dog park')) {
      return { type: 'find_parks', command, fullText: lower };
    }

    // Coffee shops
    if (lower.includes('coffee') || lower.includes('cafe') || lower.includes('espresso') ||
        lower.includes('latte') || lower.includes('cappuccino')) {
      return { type: 'find_coffee', command, fullText: lower };
    }

    // Sweets / Desserts
    if (lower.includes('sweet') || lower.includes('dessert') || lower.includes('ice cream') ||
        lower.includes('bakery') || lower.includes('donut') || lower.includes('cupcake') ||
        lower.includes('cookie') || lower.includes('candy')) {
      return { type: 'find_sweets', command, fullText: lower };
    }

    // Hotels / Accommodations
    if (lower.includes('hotel') || lower.includes('resort') || lower.includes('stay') ||
        lower.includes('accommodation') || lower.includes('lodging') || lower.includes('where to sleep')) {
      return { type: 'find_hotels', command, fullText: lower };
    }

    // Shopping
    if (lower.includes('shop') || lower.includes('store') || lower.includes('souvenir') ||
        lower.includes('gift') || lower.includes('bait') || lower.includes('tackle')) {
      return { type: 'find_shopping', command, fullText: lower };
    }

    // Rentals
    if (lower.includes('rent') || lower.includes('rental')) {
      return { type: 'find_rentals', command, fullText: lower };
    }

    // Services
    if (lower.includes('grocery') || lower.includes('pharmacy') || lower.includes('gas') ||
        lower.includes('medical') || lower.includes('doctor') || lower.includes('dentist')) {
      return { type: 'find_services', command, fullText: lower };
    }

    // Attractions
    if (lower.includes('attraction') || lower.includes('theme park') || lower.includes('zoo') ||
        lower.includes('museum') || lower.includes('fort')) {
      return { type: 'find_attractions', command, fullText: lower };
    }

    // Activities
    if (lower.includes('activity') || lower.includes('activities') || lower.includes('things to do') ||
        lower.includes('fun') || lower.includes('golf') || lower.includes('arcade')) {
      return { type: 'find_activity', command, fullText: lower };
    }

    // Music/Entertainment
    if (lower.includes('music') || lower.includes('entertainment') || lower.includes('nightlife') ||
        lower.includes('bar') || lower.includes('club')) {
      return { type: 'find_entertainment', command, fullText: lower };
    }

    // Default to general recommendation
    return { type: 'recommend', command, fullText: lower };
  }

  analyzeIntent(command) {
    const lower = command.toLowerCase();

    // STOP/CANCEL COMMANDS - Reset conversation and ask what they want
    const stopWords = ['stop', 'cancel', 'never mind', 'nevermind', 'start over', 'reset', 'forget it', 'go back'];
    if (stopWords.some(word => lower.includes(word))) {
      // Reset conversation context
      this.conversationContext.awaitingClarification = false;
      this.conversationContext.clarificationFor = null;
      this.conversationContext.clarificationCount = 0;
      this.conversationContext.userPreferences = {};
      this.conversationContext.originalQuery = null;
      this.conversationContext.lastShownBusinesses = [];

      return {
        type: 'greeting',
        command,
        fullText: lower,
        isReset: true
      };
    }

    // Check if user is responding to a clarification question
    if (this.conversationContext.awaitingClarification) {
      return this.handleClarificationResponse(lower);
    }

    // ========================================
    // PDF INTENT PATTERNS - 13 Structured Categories
    // ========================================

    // 2A - Crab legs intent
    if (lower.includes('crab legs') || lower.includes('snow crab') || lower.includes('king crab') ||
        (lower.includes('crab') && (lower.includes('get') || lower.includes('have') || lower.includes('eat') || lower.includes('all you can eat')))) {
      return {
        type: 'find_crab_legs',
        command,
        fullText: lower,
        isAllYouCanEat: lower.includes('all you can eat') || lower.includes('ayce') || lower.includes('buffet')
      };
    }

    // 2B - Oysters intent
    if (lower.includes('oyster')) {
      return {
        type: 'find_oysters',
        command,
        fullText: lower,
        style: lower.includes('raw') ? 'raw' :
                lower.includes('chargrilled') || lower.includes('char') ? 'chargrilled' :
                lower.includes('fried') ? 'fried' : null
      };
    }

    // 2C - Fish by type (grouper, snapper, mahi, etc.)
    const fishTypes = ['grouper', 'snapper', 'mahi', 'triggerfish', 'amberjack', 'redfish', 'blackened', 'grilled fish', 'fried fish'];
    const hasFishType = fishTypes.some(fish => lower.includes(fish));
    if (hasFishType) {
      const fishType = fishTypes.find(fish => lower.includes(fish));
      return {
        type: 'find_fish',
        command,
        fullText: lower,
        fishType: fishType,
        prepStyle: lower.includes('fried') ? 'fried' :
                   lower.includes('grilled') ? 'grilled' :
                   lower.includes('blackened') ? 'blackened' : null,
        spiceLevel: lower.includes('spicy') || lower.includes('hot') ? 'hot' :
                    lower.includes('mild') || lower.includes('no spice') ? 'mild' :
                    lower.includes('medium') || lower.includes('little kick') ? 'medium' : null
      };
    }

    // 6A - Bushwackers intent
    if (lower.includes('bushwacker') || lower.includes('bushwhacker')) {
      return {
        type: 'find_bushwackers',
        command,
        fullText: lower
      };
    }

    // 4A - Romantic/date night intent
    if (lower.includes('romantic') || lower.includes('date night') || lower.includes('date') ||
        lower.includes('anniversary') || lower.includes('special occasion')) {
      return {
        type: 'find_romantic',
        command,
        fullText: lower
      };
    }

    // 4B - Family meal intent
    if ((lower.includes('family') || lower.includes('kids') || lower.includes('children')) &&
        (lower.includes('eat') || lower.includes('restaurant') || lower.includes('dinner') || lower.includes('lunch'))) {
      return {
        type: 'find_family',
        command,
        fullText: lower
      };
    }

    // 7A - Happy hour intent
    if (lower.includes('happy hour') || (lower.includes('happy') && lower.includes('hour')) ||
        lower.includes('drink special') || lower.includes('beer special')) {
      return {
        type: 'find_happy_hour',
        command,
        fullText: lower
      };
    }

    // 7B - All-you-can-eat intent
    if (lower.includes('all you can eat') || lower.includes('ayce') || lower.includes('all-you-can-eat')) {
      return {
        type: 'find_all_you_can_eat',
        command,
        fullText: lower
      };
    }

    // 3A - Breakfast/brunch intent
    if (lower.includes('breakfast') || lower.includes('brunch')) {
      return {
        type: 'find_breakfast',
        command,
        fullText: lower
      };
    }

    // 6C - Sports bar intent
    if (lower.includes('watch') && lower.includes('game') || lower.includes('sports bar')) {
      return {
        type: 'find_sports_bar',
        command,
        fullText: lower
      };
    }

    // ========================================
    // END PDF INTENT PATTERNS
    // ========================================

    // Detect corrections or disagreements with AI's previous response
    const isCorrection = (lower.includes('not') || lower.includes("isn't") || lower.includes("ain't") || lower.includes("that's wrong") ||
                         lower.includes('incorrect') || lower.includes('wrong') || lower.includes('terrible') ||
                         lower.includes('bad') || lower.includes('no that')) &&
                        (lower.length < 50); // Short corrections only

    if (isCorrection) {
      // User is correcting something we said - acknowledge and ask how to help
      return {
        type: 'general',
        command,
        fullText: lower,
        isCorrection: true
      };
    }

    // Detect negative responses to previously shown options
    const isNegativeResponse = lower.match(/^(no|nope|none|neither|nah|not really|nothing|none of (them|those)|something else|different|not interested)$/i) ||
                                lower === 'none of them' || lower === 'none of those';

    if (isNegativeResponse && this.conversationContext.lastShownBusinesses && this.conversationContext.lastShownBusinesses.length > 0) {
      // User didn't like the options we showed - ask what else they want
      return this.handleClarificationResponse(lower);
    }

    // MULTI-QUESTION DETECTION: Check for compound queries with multiple questions

    // Detect repeated phrase patterns (e.g., "I'm looking for... I'm looking for... I'm looking for...")
    const repeatedPhrases = [
      /i'm looking for/g,
      /i am looking for/g,
      /looking for/g,
      /i need/g,
      /i want/g
    ];

    for (const pattern of repeatedPhrases) {
      const matches = lower.match(pattern);
      if (matches && matches.length >= 2) {
        return { type: 'compound_query', command, fullText: lower };
      }
    }

    // Detect conjunctions that indicate multiple requests
    const hasConjunction = lower.includes(' and ') || lower.includes(' also ') ||
                           lower.includes(' plus ') || lower.includes(' then ') ||
                           lower.includes(' or ') || lower.includes(', ');

    if (hasConjunction) {
      // Check if it's actually multiple distinct questions
      const questionCount = (lower.match(/\b(where|what|show|find|any|get|tell me|how)\b/g) || []).length;

      if (questionCount > 1 || this.hasMultipleTopics(lower)) {
        return { type: 'compound_query', command, fullText: lower };
      }
    }

    // Favorites queries
    if (lower.includes('favorite') || lower.includes('saved') || lower.includes('my places') ||
        lower.includes('what did i save') || lower.includes('show my')) {
      return { type: 'show_favorites', command, fullText: lower };
    }

    // ACTION INTENTS - User wants to perform an action with last shown business
    if (lower.includes('call') || lower.includes('phone number') || lower.includes('contact them')) {
      return { type: 'action_call', command, fullText: lower };
    }

    if (lower.includes('direction') || lower.includes('how do i get') || lower.includes('navigate') ||
        lower.includes('take me') || lower.includes('drive there')) {
      return { type: 'action_directions', command, fullText: lower };
    }

    if (lower.includes('hours') || lower.includes('open') || lower.includes('close') ||
        lower.includes('what time') && (lower.includes('open') || lower.includes('close'))) {
      return { type: 'action_hours', command, fullText: lower };
    }

    if (lower.includes('website') || lower.includes('web site') || lower.includes('online menu') ||
        lower.includes('order online')) {
      return { type: 'action_website', command, fullText: lower };
    }

    if (lower.includes('more info') || lower.includes('tell me more') || lower.includes('details')) {
      return { type: 'action_details', command, fullText: lower };
    }

    // Beach conditions & safety queries
    if (lower.includes('beach flag') || lower.includes('flag status') || lower.includes('beach condition') ||
        lower.includes('safe to swim') || lower.includes('safe to go in the water') ||
        lower.includes('water condition') || lower.includes('surf') || lower.includes('riptide') ||
        lower.includes('rip current') || lower.includes('jellyfish') || lower.includes('water temp') ||
        lower.includes('how\'s the beach') || lower.includes('beach safe') || lower.includes('swim today') ||
        lower.includes('beach nice') || lower.includes('beach good') || lower.includes('beach today') ||
        lower.includes('beach look') || (lower.includes('is') && lower.includes('beach')) ||
        (lower.includes('water') && (lower.includes('safe') || lower.includes('conditions')))) {
      return { type: 'beach_conditions', command, fullText: lower };
    }

    // SMART SEARCH: Handle generic "where can I" or "what" questions
    // Also check if user mentioned a specific food item - if so, search directly
    const hasSpecificFood = this.extractCuisine(lower) !== null;

    if (lower.startsWith('where ') || lower.startsWith('what ') || lower.startsWith('any ') ||
        lower.includes('show me') || lower.includes('find me') || lower.includes('find a') ||
        lower.includes('help me find') || lower.includes('looking for') ||
        (lower.includes('find') && hasSpecificFood) || hasSpecificFood) {
      // Try to extract what they're looking for
      return this.extractSearchIntent(lower, command);
    }

    // Multi-day planning (5 days, week, vacation)
    if (lower.match(/\d+\s*(day|night)/i) || lower.includes('week') || lower.includes('vacation') || lower.includes('trip')) {
      return { type: 'plan_trip', command, fullText: lower };
    }

    // DATA QUERY INTENTS - User wants to see specific business data
    if (lower.includes('menu') || (lower.includes('food') && (lower.includes('what') || lower.includes('show') || lower.includes('do they have')))) {
      return { type: 'query_menu', command, fullText: lower };
    }

    if (lower.includes('drink') && (lower.includes('what') || lower.includes('show') || lower.includes('do they have') || lower.includes('any'))) {
      return { type: 'query_drinks', command, fullText: lower };
    }

    if (lower.includes('happy hour') || lower.includes('specials') || lower.includes('deals') ||
        (lower.includes('today') && (lower.includes('special') || lower.includes('deal')))) {
      return { type: 'query_specials', command, fullText: lower };
    }

    if (lower.includes('event') || lower.includes('live music') || lower.includes('entertainment') ||
        (lower.includes('what') && (lower.includes('happening') || lower.includes('going on')))) {
      return { type: 'query_events', command, fullText: lower };
    }

    if (lower.includes('price') || lower.includes('how much') || lower.includes('cost') ||
        lower.includes('expensive') || lower.includes('cheap')) {
      return { type: 'query_prices', command, fullText: lower };
    }

    if (lower.includes('description') || lower.includes('about') || lower.includes('tell me about')) {
      return { type: 'query_description', command, fullText: lower };
    }

    // Check for multiple requests in one query
    const hasRestaurant = lower.includes('restaurant') || lower.includes('food') || lower.includes('eat') ||
                          lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast');
    const hasActivity = lower.includes('fishing') || lower.includes('activity') || lower.includes('things to do') ||
                        lower.includes('fun') || lower.includes('adventure');
    const hasMusic = lower.includes('music') || lower.includes('live band') || lower.includes('entertainment');
    const hasWaterfront = lower.includes('waterfront') || lower.includes('water') || lower.includes('beach') || lower.includes('ocean');
    const needsReservation = lower.includes('reservation') || lower.includes('reserve') || lower.includes('book a table') ||
                             lower.includes('make a reservation');

    // Complex query with multiple needs
    if ((hasRestaurant && hasActivity) || (hasRestaurant && hasMusic) || lower.includes('plan')) {
      return {
        type: 'complex_plan',
        command,
        fullText: lower,
        needsRestaurant: hasRestaurant,
        needsActivity: hasActivity,
        needsMusic: hasMusic,
        needsWaterfront: hasWaterfront,
        needsReservation: needsReservation,
        cuisine: this.extractCuisine(lower)
      };
    }

    // Restaurant search
    if (hasRestaurant || needsReservation) {
      return {
        type: 'find_restaurant',
        command,
        fullText: lower,
        cuisine: this.extractCuisine(lower),
        hasMusic: hasMusic,
        hasWaterfront: hasWaterfront,
        needsReservation: needsReservation
      };
    }

    // Activity search
    if (hasActivity) {
      return { type: 'find_activity', command, fullText: lower };
    }

    // Entertainment/Music
    if (hasMusic) {
      return { type: 'find_entertainment', command, fullText: lower };
    }

    // Hours check
    if (lower.includes('open') || lower.includes('hours') || lower.includes('when')) {
      return { type: 'check_hours', command };
    }

    // General recommendation
    if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('what should')) {
      return { type: 'recommend', command, fullText: lower };
    }

    // Beach access
    if (lower.includes('beach access') || lower.includes('public beach') || lower.includes('where can i access the beach') ||
        lower.includes('beach parking') || lower.includes('beach entrance')) {
      return { type: 'find_beach_access', command, fullText: lower };
    }

    // Boat launches
    if (lower.includes('boat launch') || lower.includes('boat ramp') || lower.includes('where can i launch') ||
        lower.includes('launch my boat') || lower.includes('put in my boat')) {
      return { type: 'find_boat_launch', command, fullText: lower };
    }

    // Marinas
    if (lower.includes('marina') || lower.includes('dock') || lower.includes('slip') || lower.includes('fuel dock')) {
      return { type: 'find_marina', command, fullText: lower };
    }

    // Theme parks and attractions
    if (lower.includes('theme park') || lower.includes('amusement') || lower.includes('waterpark') ||
        lower.includes('zoo') || lower.includes('attraction') || lower.includes('fort morgan') ||
        lower.includes('historic site') || lower.includes('museum')) {
      return { type: 'find_attractions', command, fullText: lower };
    }

    // Shopping (souvenirs, bait, tackle)
    if (lower.includes('souvenir') || lower.includes('gift shop') || lower.includes('bait') ||
        lower.includes('tackle') || lower.includes('fishing gear') || lower.includes('beach store')) {
      return { type: 'find_shopping', command, fullText: lower };
    }

    // Parks (includes dog parks)
    if (lower.includes('dog park') || lower.includes('park') || lower.includes('nature') ||
        lower.includes('trail') || lower.includes('hike') || lower.includes('walk') ||
        lower.includes('outdoor') || lower.includes('playground')) {
      return { type: 'find_parks', command, fullText: lower };
    }

    // Services (grocery, pharmacy, gas)
    if (lower.includes('grocery') || lower.includes('pharmacy') || lower.includes('gas station') ||
        lower.includes('convenience store') || lower.includes('store') || lower.includes('market')) {
      return { type: 'find_services', command, fullText: lower };
    }

    // Rentals (bikes, boats, beach gear, baby gear)
    if (lower.includes('rent') || lower.includes('rental') || lower.includes('bike') || lower.includes('kayak') ||
        lower.includes('paddleboard') || lower.includes('beach chair') || lower.includes('umbrella') ||
        lower.includes('baby gear') || lower.includes('stroller') || lower.includes('crib')) {
      return { type: 'find_rentals', command, fullText: lower };
    }

    // Greeting detection - BUT check if there's a real question after the greeting
    const startsWithGreeting = lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings|yo|sup|what's up|hiya)\b/i);
    if (startsWithGreeting || lower === 'hi' || lower === 'hello' || lower === 'hey') {
      // Check if there's more content after the greeting (e.g., "Hi, where can I eat?")
      const afterGreeting = lower.replace(/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings|yo|sup|what's up|hiya)[,\s]*/i, '').trim();

      if (afterGreeting.length > 0) {
        // There's a real question after the greeting - process it
        return this.analyzeIntent(afterGreeting);
      }

      // Just a greeting, no question
      return { type: 'greeting', command, fullText: lower, isFirstGreeting: this.conversation.length <= 1 };
    }

    // Thank you
    if (lower.includes('thank') || lower.includes('thanks')) {
      return { type: 'thanks', command };
    }

    return { type: 'general', command };
  }

  extractCuisine(text) {
    // Check for specific food items first (more specific = better match)
    const specificFoods = [
      'crab legs', 'snow crab', 'king crab', 'crab', 'lobster', 'shrimp', 'oysters', 'clams', 'mussels',
      'grouper', 'snapper', 'mahi', 'tuna', 'salmon', 'fish', 'fried fish',
      'steak', 'ribeye', 'filet', 'burger', 'burgers', 'cheeseburger',
      'tacos', 'taco', 'burrito', 'quesadilla', 'nachos', 'fajitas',
      'pasta', 'spaghetti', 'lasagna', 'ravioli', 'alfredo',
      'pizza', 'calzone', 'stromboli',
      'wings', 'chicken wings', 'buffalo wings', 'fried chicken', 'chicken tenders',
      'ribs', 'bbq', 'pulled pork', 'brisket',
      'gumbo', 'jambalaya', 'crawfish', 'po boy', 'po-boy',
      'salad', 'caesar salad', 'house salad',
      'soup', 'chowder', 'bisque',
      'sandwich', 'wrap', 'panini',
      'all you can eat', 'buffet'
    ];

    // Check specific foods (longest first to match "snow crab legs" before "crab")
    for (const food of specificFoods.sort((a, b) => b.length - a.length)) {
      if (text.includes(food)) return food;
    }

    // Then check broad cuisines
    const cuisines = ['seafood', 'italian', 'mexican', 'american', 'asian', 'chinese', 'japanese', 'thai', 'sushi', 'steakhouse', 'southern', 'cajun'];
    for (const cuisine of cuisines) {
      if (text.includes(cuisine)) return cuisine;
    }

    return null;
  }

  // Check if query contains multiple distinct topics
  hasMultipleTopics(text) {
    const topics = {
      food: ['restaurant', 'eat', 'food', 'dine', 'lunch', 'dinner', 'breakfast'],
      activities: ['activity', 'activities', 'things to do', 'fun', 'golf', 'arcade', 'kid', 'child', 'family'],
      beach: ['beach', 'water', 'boat', 'marina', 'fishing', 'kayak'],
      shopping: ['shop', 'store', 'souvenir', 'gift', 'bait'],
      services: ['grocery', 'pharmacy', 'gas', 'medical'],
      entertainment: ['music', 'entertainment', 'nightlife', 'bar', 'club'],
      parks: ['park', 'trail', 'nature', 'playground'],
      rentals: ['rent', 'rental', 'bike', 'bikes', 'bicycle', 'scooter', 'kayak rental', 'jet ski', 'charter', 'pontoon'],
      coffee: ['coffee', 'cafe', 'espresso', 'latte', 'cappuccino'],
      sweets: ['sweet', 'dessert', 'ice cream', 'bakery', 'donut', 'cupcake'],
      hotels: ['hotel', 'resort', 'stay', 'accommodation', 'lodging']
    };

    let topicCount = 0;
    for (const keywords of Object.values(topics)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        topicCount++;
      }
    }

    return topicCount >= 2;
  }

  // Conversational Intelligence: Handle clarification responses
  handleClarificationResponse(lower) {
    const clarificationType = this.conversationContext.clarificationFor;

    // Check if user is giving a NEW complete query instead of answering the clarification
    // If they say "I'm looking for" or "I want" with specific details, treat it as a new query
    const hasIntentPhrase = lower.includes('looking for') || lower.includes('i want') ||
                           lower.includes('find me') || lower.includes('show me') ||
                           lower.includes('place for') || lower.includes('somewhere with');

    const hasSpecificCuisine = this.extractCuisine(lower) !== null;
    const hasLocationDetail = lower.includes('waterfront') || lower.includes('music') ||
                             lower.includes('beach') || lower.includes('view');

    const isNewQuery = hasIntentPhrase && (hasSpecificCuisine || hasLocationDetail);

    if (isNewQuery) {
      // Reset clarification state and process as a new query
      this.conversationContext.awaitingClarification = false;
      this.conversationContext.clarificationCount = 0;
      this.conversationContext.clarificationFor = null;

      // Extract the full intent from the new query
      const hasWaterfront = lower.includes('waterfront') || lower.includes('water view') || lower.includes('beach');
      const hasMusic = lower.includes('music') || lower.includes('live band');
      const cuisine = this.extractCuisine(lower);

      return {
        type: 'find_restaurant',
        fullText: lower,
        cuisine: cuisine || null,
        hasWaterfront: hasWaterfront,
        hasMusic: hasMusic,
        skipClarification: true // Don't ask more questions
      };
    }

    // Check for negative responses (user doesn't like the options)
    const isNegative = lower.match(/^(no|nope|none|neither|nah|not really|nothing|none of (them|those)|something else|different)$/i) ||
                       lower === 'none of them' || lower === 'none of those';

    if (isNegative) {
      // User rejected the options - offer alternatives
      this.conversationContext.awaitingClarification = false;
    this.conversationContext.clarificationCount = 0;  // Reset counter after response
      this.conversationContext.clarificationCount = 0;  // Reset counter

      if (this.conversationContext.lastQueryType === 'activities' && this.conversationContext.lastShownBusinesses) {
        // Offer to show more activities
        if (typeof allBusinesses !== 'undefined' && allBusinesses) {
          const allActivities = allBusinesses.filter(b => b.category === 'activities');
          const shownIds = this.conversationContext.lastShownBusinesses.map(b => b.id);
          const remaining = allActivities.filter(b => !shownIds.includes(b.id));

          if (remaining.length > 0) {
            return {
              type: 'find_activity',
              fullText: 'show more activities',
              showDifferent: true
            };
          } else {
            // No more activities to show - ask for different category with context
            return {
              type: 'ask_different',
              fullText: lower,
              previousCategory: 'activities'
            };
          }
        }
      }

      // User rejected options for other categories
      return {
        type: 'ask_different',
        fullText: lower,
        previousCategory: this.conversationContext.lastQueryType || 'general'
      };
    }

    this.conversationContext.awaitingClarification = false;
    this.conversationContext.clarificationCount = 0;  // Reset counter after response

    if (clarificationType === 'food_type') {
      // User is clarifying what type of food they want
      const cuisine = this.extractCuisine(lower);

      // Also check for additional modifiers in their response
      const hasMusic = lower.includes('music') || lower.includes('live band') || lower.includes('entertainment');
      const hasWaterfront = lower.includes('waterfront') || lower.includes('water view') || lower.includes('beach') || lower.includes('ocean view');
      const needsReservation = lower.includes('reservation') || lower.includes('reserve') || lower.includes('book');

      // Check if user wants restaurants but doesn't care about cuisine
      const wantsVariety = lower.includes('something else') || lower.includes('anything') ||
                           lower.includes('everything') || lower.includes('varied') ||
                           lower.includes('don\'t care') || lower.includes('surprise me') ||
                           lower.includes('food') || lower.includes('restaurant') ||
                           lower.includes('that') || lower.includes('basically');

      if (wantsVariety) {
        // User wants restaurants but no specific cuisine - show popular ones
        return {
          type: 'find_restaurant',
          fullText: lower,
          cuisine: 'popular', // Special flag to show popular restaurants
          hasMusic: hasMusic,
          hasWaterfront: hasWaterfront,
          needsReservation: needsReservation,
          skipClarification: true // Don't ask again
        };
      }

      if (cuisine) {
        this.conversationContext.userPreferences.cuisine = cuisine;
        return {
          type: 'find_restaurant',
          fullText: lower,
          cuisine: cuisine,
          hasMusic: hasMusic,
          hasWaterfront: hasWaterfront,
          needsReservation: needsReservation
        };
      }

      // Check for common food keywords not in the main cuisine list
      if (lower.includes('seafood')) {
        return { type: 'find_restaurant', fullText: lower, cuisine: 'seafood', hasMusic, hasWaterfront, needsReservation };
      } else if (lower.includes('burger')) {
        return { type: 'find_restaurant', fullText: lower, cuisine: 'burgers', hasMusic, hasWaterfront, needsReservation };
      } else if (lower.includes('pizza')) {
        return { type: 'find_restaurant', fullText: lower, cuisine: 'pizza', hasMusic, hasWaterfront, needsReservation };
      } else if (lower.includes('taco') || lower.includes('mexican')) {
        return { type: 'find_restaurant', fullText: lower, cuisine: 'mexican', hasMusic, hasWaterfront, needsReservation };
      } else if (lower.includes('pasta') || lower.includes('italian')) {
        return { type: 'find_restaurant', fullText: lower, cuisine: 'italian', hasMusic, hasWaterfront, needsReservation };
      } else if (lower.includes('steak')) {
        return { type: 'find_restaurant', fullText: lower, cuisine: 'steakhouse', hasMusic, hasWaterfront, needsReservation };
      }

      // User said something else - show popular restaurants
      return {
        type: 'find_restaurant',
        fullText: lower,
        cuisine: 'popular',
        hasMusic,
        hasWaterfront,
        needsReservation,
        skipClarification: true
      };
    }

    if (clarificationType === 'category') {
      // User is clarifying what category they want
      if (lower.includes('restaurant') || lower.includes('food') || lower.includes('eat') || lower.includes('dine')) {
        return { type: 'find_restaurant', fullText: lower, cuisine: this.extractCuisine(lower) };
      } else if (lower.includes('activity') || lower.includes('activities') || lower.includes('things to do') || lower.includes('fun')) {
        return { type: 'find_activity', fullText: lower };
      } else if (lower.includes('shop') || lower.includes('shopping') || lower.includes('store')) {
        return { type: 'find_shopping', fullText: lower };
      } else if (lower.includes('park') || lower.includes('trail') || lower.includes('nature')) {
        return { type: 'find_parks', fullText: lower };
      } else if (lower.includes('beach') || lower.includes('water') || lower.includes('boat')) {
        return { type: 'find_activity', fullText: lower };
      }
      // Fall through to general
      return { type: 'general', fullText: lower };
    }

    if (clarificationType === 'compound_priority') {
      // User is choosing which request to handle first
      const pendingRequests = this.conversationContext.pendingRequests || [];
      const originalQuery = this.conversationContext.originalQuery || lower;

      // Check which one they want first
      if (lower.includes('rent') || lower.includes('bike') || lower.includes('bicycle') || lower.includes('scooter') || lower.includes('kayak')) {
        // They want rentals first
        this.conversationContext.awaitingClarification = false;
    this.conversationContext.clarificationCount = 0;  // Reset counter after response
        this.conversationContext.pendingSecondRequest = null;
        return { type: 'find_rentals', fullText: originalQuery };
      } else if (lower.includes('first') || lower.includes('activit') || lower.includes('kid') || lower.includes('fun') || lower.includes('thing')) {
        // They want activities first
        this.conversationContext.awaitingClarification = false;
    this.conversationContext.clarificationCount = 0;  // Reset counter after response
        this.conversationContext.pendingSecondRequest = null;
        return { type: 'find_activity', fullText: originalQuery };
      } else if (lower.includes('second') || lower.includes('restaurant') || lower.includes('food') || lower.includes('eat') || lower.includes('dine')) {
        // They want restaurant first
        this.conversationContext.awaitingClarification = false;
    this.conversationContext.clarificationCount = 0;  // Reset counter after response
        this.conversationContext.pendingSecondRequest = null;
        const hasMusic = originalQuery.includes('music');
        const hasWaterfront = originalQuery.includes('waterfront') || originalQuery.includes('water');
        return { type: 'find_restaurant', fullText: originalQuery, hasMusic, hasWaterfront };
      }

      // If unclear, try to match against pending requests
      for (let i = 0; i < pendingRequests.length; i++) {
        const request = pendingRequests[i].toLowerCase();
        if (request.includes('rent') && (lower.includes('rent') || lower.includes('bike'))) {
          return { type: 'find_rentals', fullText: originalQuery };
        } else if (request.includes('activit') && lower.includes('activit')) {
          return { type: 'find_activity', fullText: originalQuery };
        } else if (request.includes('restaurant') && (lower.includes('food') || lower.includes('eat'))) {
          return { type: 'find_restaurant', fullText: originalQuery };
        }
      }

      // If still unclear, default to first request
      if (pendingRequests[0]) {
        const firstRequest = pendingRequests[0].toLowerCase();
        if (firstRequest.includes('rent')) {
          return { type: 'find_rentals', fullText: originalQuery };
        } else if (firstRequest.includes('activit')) {
          return { type: 'find_activity', fullText: originalQuery };
        } else {
          return { type: 'find_restaurant', fullText: originalQuery };
        }
      }

      return { type: 'find_activity', fullText: originalQuery };
    }

    if (clarificationType === 'activity_type') {
      // User is clarifying what type of activity they want
      if (lower.includes('water') || lower.includes('boat') || lower.includes('kayak') || lower.includes('jet ski') || lower.includes('fishing') || lower.includes('charter')) {
        return { type: 'find_activity', fullText: 'water sports fishing ' + lower };
      } else if (lower.includes('park') || lower.includes('trail') || lower.includes('nature') || lower.includes('playground')) {
        return { type: 'find_parks', fullText: lower };
      } else if (lower.includes('golf') || lower.includes('mini golf')) {
        return { type: 'find_activity', fullText: 'golf ' + lower };
      } else if (lower.includes('arcade') || lower.includes('game') || lower.includes('indoor')) {
        return { type: 'find_activity', fullText: 'arcade ' + lower };
      } else if (lower.includes('family') || lower.includes('kid')) {
        return { type: 'find_activity', fullText: 'family activities ' + lower };
      } else if (lower.includes('outdoor') || lower.includes('adventure')) {
        return { type: 'find_activity', fullText: 'outdoor ' + lower };
      }
      return { type: 'find_activity', fullText: lower };
    }

    if (clarificationType === 'atmosphere') {
      if (lower.includes('casual') || lower.includes('relaxed') || lower.includes('beach')) {
        this.conversationContext.userPreferences.atmosphere = 'casual';
      } else if (lower.includes('fine') || lower.includes('fancy') || lower.includes('upscale')) {
        this.conversationContext.userPreferences.atmosphere = 'fine-dining';
      }

      // Preserve original query context (waterfront, music, etc.)
      const originalQuery = this.conversationContext.originalQuery || '';
      const hasWaterfront = originalQuery.includes('waterfront') || originalQuery.includes('water');
      const hasMusic = originalQuery.includes('music') || originalQuery.includes('live');
      const cuisine = this.conversationContext.userPreferences.cuisine || this.extractCuisine(originalQuery);

      return {
        type: 'find_restaurant',
        fullText: originalQuery + ' ' + lower,
        cuisine: cuisine,
        hasWaterfront: hasWaterfront,
        hasMusic: hasMusic,
        skipClarification: true  // Don't ask more questions - we have enough context now
      };
    }

    if (clarificationType === 'budget') {
      if (lower.includes('cheap') || lower.includes('casual') || lower.includes('budget') || lower.includes('inexpensive') || lower.includes('low')) {
        this.conversationContext.userPreferences.budget = '$';
      } else if (lower.includes('moderate') || lower.includes('mid') || lower.includes('medium') || lower.includes('average')) {
        this.conversationContext.userPreferences.budget = '$$';
      } else if (lower.includes('expensive') || lower.includes('high-end') || lower.includes('fine') || lower.includes('upscale')) {
        this.conversationContext.userPreferences.budget = '$$$';
      }
      return { type: 'find_restaurant', fullText: lower, cuisine: this.conversationContext.originalQuery || this.conversationContext.userPreferences.cuisine };
    }

    if (clarificationType === 'group_size') {
      if (lower.includes('solo') || lower.includes('alone') || lower.includes('myself') || lower.includes('just me')) {
        this.conversationContext.userPreferences.groupSize = 'solo';
      } else if (lower.includes('couple') || lower.includes('two') || lower.includes('2') || lower.includes('date')) {
        this.conversationContext.userPreferences.groupSize = 'couple';
      } else if (lower.includes('family') || lower.includes('kids') || lower.includes('children') || lower.includes('group')) {
        this.conversationContext.userPreferences.groupSize = 'family';
      }
      return { type: 'find_restaurant', fullText: lower };
    }

    if (clarificationType === 'occasion') {
      if (lower.includes('casual') || lower.includes('quick') || lower.includes('everyday')) {
        this.conversationContext.userPreferences.occasion = 'casual';
      } else if (lower.includes('date') || lower.includes('romantic') || lower.includes('special')) {
        this.conversationContext.userPreferences.occasion = 'date';
      } else if (lower.includes('family') || lower.includes('kids') || lower.includes('children')) {
        this.conversationContext.userPreferences.occasion = 'family';
      } else if (lower.includes('celebration') || lower.includes('birthday') || lower.includes('anniversary')) {
        this.conversationContext.userPreferences.occasion = 'celebration';
      } else if (lower.includes('that does not matter') || lower.includes('does not matter') || lower.includes('doesnt matter') || lower.includes("doesn't matter")) {
        // User doesn't care about occasion - skip to showing restaurants
        this.conversationContext.userPreferences.occasion = 'any';
      }

      // Extract cuisine from original query or current response
      const originalQuery = this.conversationContext.originalQuery || '';
      const cuisine = this.extractCuisine(originalQuery + ' ' + lower);

      // Preserve waterfront, music, and other context from original query
      const hasWaterfront = originalQuery.includes('waterfront') || originalQuery.includes('water');
      const hasMusic = originalQuery.includes('music') || originalQuery.includes('live');

      return {
        type: 'find_restaurant',
        fullText: originalQuery + ' ' + lower,
        cuisine: cuisine,
        hasWaterfront: hasWaterfront,
        hasMusic: hasMusic,
        skipClarification: lower.includes('that does not matter') || lower.includes('doesnt matter')
      };
    }

    if (clarificationType === 'priority') {
      if (lower.includes('closest') || lower.includes('near') || lower.includes('close')) {
        this.conversationContext.userPreferences.priority = 'distance';
      } else if (lower.includes('rated') || lower.includes('best') || lower.includes('top') || lower.includes('highest')) {
        this.conversationContext.userPreferences.priority = 'rating';
      }
      return { type: 'find_restaurant', fullText: lower, cuisine: this.conversationContext.originalQuery, skipClarification: true };
    }

    if (clarificationType === 'trip_length') {
      // Extract number of days
      const dayMatch = lower.match(/(\d+)\s*(day|night)/i);
      if (dayMatch) {
        this.conversationContext.userPreferences.tripDays = parseInt(dayMatch[1]);
      } else if (lower.includes('week')) {
        this.conversationContext.userPreferences.tripDays = 7;
      } else if (lower.includes('weekend')) {
        this.conversationContext.userPreferences.tripDays = 3;
      } else {
        // Try to extract any number
        const numMatch = lower.match(/\d+/);
        if (numMatch) {
          this.conversationContext.userPreferences.tripDays = parseInt(numMatch[0]);
        }
      }
      return { type: 'plan_trip', fullText: lower };
    }

    if (clarificationType === 'trip_priorities') {
      const priorities = [];
      if (lower.includes('beach')) priorities.push('beach');
      if (lower.includes('water') || lower.includes('activity') || lower.includes('activities')) priorities.push('activities');
      if (lower.includes('dining') || lower.includes('food') || lower.includes('restaurant')) priorities.push('dining');
      if (lower.includes('family') || lower.includes('kid') || lower.includes('attraction')) priorities.push('family');
      if (lower.includes('mix') || lower.includes('everything') || lower.includes('all')) priorities.push('mix');
      this.conversationContext.userPreferences.tripPriorities = priorities.length > 0 ? priorities : ['mix'];
      return { type: 'plan_trip', fullText: lower };
    }

    if (clarificationType === 'dining_style') {
      if (lower.includes('casual') || lower.includes('beach')) {
        this.conversationContext.userPreferences.diningStyle = 'casual';
      } else if (lower.includes('waterfront') || lower.includes('view')) {
        this.conversationContext.userPreferences.diningStyle = 'waterfront';
      } else if (lower.includes('happy hour') || lower.includes('deal')) {
        this.conversationContext.userPreferences.diningStyle = 'happy_hour';
      }
      return { type: 'plan_trip', fullText: lower };
    }

    if (clarificationType === 'restaurant_features') {
      // User is responding about waterfront or live music
      const hasWaterfront = lower.includes('waterfront') || lower.includes('water view') || lower.includes('water') || lower.includes('yes');
      const hasMusic = lower.includes('music') || lower.includes('live') || lower.includes('band') || lower.includes('yes');
      const neither = lower.includes('no') || lower.includes('neither') || lower.includes('closest') || lower.includes('just show');

      const originalQuery = this.conversationContext.originalQuery || '';
      const cuisine = this.conversationContext.originalQuery || this.conversationContext.userPreferences.cuisine || null;

      return {
        type: 'find_restaurant',
        fullText: originalQuery + ' ' + lower,
        cuisine: cuisine,
        hasWaterfront: hasWaterfront && !neither,
        hasMusic: hasMusic && !neither,
        skipClarification: true
      };
    }

    return { type: 'general', fullText: lower };
  }

  // Conversational Intelligence: Ask clarifying questions
  askClarifyingQuestion(intent) {
    // Limit clarifying questions to prevent infinite loops (max 2 per query)
    if (this.conversationContext.clarificationCount >= 2) {
      console.log('Max clarification questions reached, proceeding with best guess');
      this.conversationContext.clarificationCount = 0;
      return null;
    }

    // Restaurant queries - Ask progressive qualifying questions
    if (intent.type === 'find_restaurant') {
      // Skip if they already answered or don't want to specify
      if (intent.skipClarification) {
        this.conversationContext.clarificationCount = 0;  // Reset counter
        return null;
      }

      // STEP 1: Ask about occasion/purpose if not specified
      if (!this.conversationContext.userPreferences.occasion && !intent.fullText.includes('date') && !intent.fullText.includes('family') && !intent.fullText.includes('celebration')) {
        this.conversationContext.awaitingClarification = true;
        this.conversationContext.clarificationFor = 'occasion';
        this.conversationContext.clarificationCount++;
        this.conversationContext.originalQuery = intent.fullText;

        // Different question based on time of day - more conversational and sales-rep-like
        const hour = new Date().getHours();
        if (hour >= 11 && hour < 14) {
          return "I'd love to help you find the perfect spot! Is this for a quick lunch, a business meeting, or do you have time for a leisurely meal?";
        } else if (hour >= 17 && hour < 22) {
          return "Sounds great! What's the occasion tonight? Planning a date night, family dinner, or just a casual meal with friends?";
        } else {
          return "I'm excited to help! What brings you out today? Date night, family meal, celebration, or just grabbing a casual bite?";
        }
      }

      // STEP 2: Ask about group size if occasion is known but group size isn't
      if (!this.conversationContext.userPreferences.groupSize && !intent.fullText.includes('alone') && !intent.fullText.includes('family') && !intent.fullText.includes('group')) {
        // Already know it's a meal, now find out group size
        if (this.conversationContext.userPreferences.occasion === 'date') {
          // Skip group size for dates, we know it's 2 people
          this.conversationContext.userPreferences.groupSize = 'couple';
        } else {
          this.conversationContext.awaitingClarification = true;
          this.conversationContext.clarificationFor = 'group_size';
          return "Perfect! How many people are you looking for? Flying solo, dining as a couple, or bringing a group?";
        }
      }

      // STEP 3: Ask about cuisine type if not specified
      if (!intent.cuisine || intent.cuisine === '' || intent.cuisine === null) {
        // Don't ask if they specified other strong filters (music + waterfront)
        if (!(intent.hasMusic && intent.hasWaterfront)) {
          this.conversationContext.awaitingClarification = true;
          this.conversationContext.clarificationFor = 'food_type';

          // Personalized cuisine questions based on occasion - more engaging
          if (this.conversationContext.userPreferences.occasion === 'date') {
            return "Ooh, date night! What kind of food sounds romantic to you? We've got amazing seafood spots, intimate steakhouses, and cozy Italian restaurants!";
          } else if (this.conversationContext.userPreferences.groupSize === 'family') {
            return "Great! What type of food does everyone in the family enjoy? We've got everything from fresh seafood to classic burgers, pizza, Mexican, and more!";
          } else if (intent.hasMusic) {
            return "Live music - love it! What type of food would pair perfectly with your evening? Seafood, American classics, or something else?";
          } else if (intent.hasWaterfront) {
            return "Waterfront dining is the best! What type of cuisine are you in the mood for with that beautiful view?";
          } else {
            return "What type of food are you craving today? Fresh seafood, American favorites, Italian, Mexican, or something else?";
          }
        }
      }

      // STEP 4: Ask about atmosphere preference if cuisine is known
      if (intent.cuisine && !this.conversationContext.userPreferences.atmosphere && !intent.fullText.includes('casual') && !intent.fullText.includes('upscale') && !intent.fullText.includes('fine')) {
        this.conversationContext.awaitingClarification = true;
        this.conversationContext.clarificationFor = 'atmosphere';

        if (this.conversationContext.userPreferences.occasion === 'date') {
          return "Are you looking for upscale fine dining or a more relaxed waterfront spot?";
        } else {
          return "Casual beach vibe or something more upscale?";
        }
      }
    }

    // Activity queries - Ask for more specifics
    if (intent.type === 'find_activity') {
      if (intent.fullText.includes('fun') && !intent.fullText.includes('specific')) {
        this.conversationContext.awaitingClarification = true;
        this.conversationContext.clarificationFor = 'activity_type';

        // Ask better qualifying questions
        if (intent.fullText.includes('kid') || intent.fullText.includes('family')) {
          return "What kind of activities do your kids enjoy? Water sports, arcades, parks, or something else?";
        } else {
          return "What sounds fun to you? Water activities, outdoor adventures, shopping, or indoor entertainment?";
        }
      }
    }

    // General recommendation - Be more specific
    if (intent.type === 'recommend' && !intent.cuisine && !intent.fullText.includes('restaurant') && !intent.fullText.includes('activity')) {
      this.conversationContext.awaitingClarification = true;
      this.conversationContext.clarificationFor = 'category';

      // Better opening question
      const hour = new Date().getHours();
      if (hour >= 11 && hour < 15) {
        return "Are you looking for lunch spots or activities for the afternoon?";
      } else if (hour >= 17) {
        return "Are you looking for dinner or evening entertainment?";
      } else {
        return "What are you in the mood for? Restaurants, activities, or attractions?";
      }
    }

    return null;
  }

  // Conversational Intelligence: Remember context from previous exchanges
  updateConversationContext(intent) {
    this.conversationContext.lastIntent = intent.type;
    this.conversationContext.conversationHistory.push({
      intent: intent.type,
      timestamp: Date.now()
    });

    // Keep only last 10 exchanges
    if (this.conversationContext.conversationHistory.length > 10) {
      this.conversationContext.conversationHistory.shift();
    }
  }

  // Conversational Intelligence: Generate smart follow-ups
  // SALES PRO MODE: No follow-up questions or suggestions
  generateSmartFollowUp(intent, businessesShown) {
    return "";
  }

  // DATA-ONLY response generator (no hallucinations)
  async generateDataOnlyResponse(intent) {
    // Update conversation context
    this.updateConversationContext(intent);

    // TEMPLATE RULE: Show results FIRST, then ask refining questions AFTER
    // (Commented out pre-result clarification - violates template Section 9.1)
    // const clarifyingQuestion = this.askClarifyingQuestion(intent);
    // if (clarifyingQuestion) {
    //   return clarifyingQuestion;
    // }

    // Validate data exists before responding (except for beach conditions which doesn't need business data)
    if (intent.type !== 'beach_conditions' && (typeof allBusinesses === 'undefined' || !allBusinesses || allBusinesses.length === 0)) {
      return "I'm loading the business directory. Please wait a moment and try again.";
    }

    switch(intent.type) {
      case 'greeting':
        if (intent.isReset) {
          // User said stop/cancel - reset and ask what they want
          return "No problem! Let's start fresh. What are you looking for today?";
        } else if (intent.isFirstGreeting) {
          // Enhanced, conversational greeting
          return `Hey there! 👋 I'm your Gulf Coast Radar AI assistant!

I can help you discover amazing places in Orange Beach and Gulf Shores! Whether you're craving fresh seafood, looking for live music, or planning the perfect beach day, I'm here to help.

What brings you to the Gulf Coast today? Are you:
• 🍽️ Looking for a place to eat?
• 🎵 Searching for entertainment or events?
• 🏖️ Planning activities or attractions?
• 🍹 Finding happy hour deals?
• 🔍 Looking for something specific?

Just tell me what you're in the mood for! 🌊`;
        } else {
          return "Hey! What can I help you find? 🔍";
        }

      case 'thanks':
        return "You're welcome! Let me know if you need anything else.";

      case 'show_favorites':
        return this.getFavorites();

      case 'plan_day':
        return this.planDay();

      case 'plan_trip':
        return this.planTrip();

      case 'compound_query':
        return this.handleCompoundQuery(intent);

      case 'complex_plan':
        return this.handleComplexQuery(intent);

      case 'find_restaurant':
        return this.findRestaurants(intent.cuisine, intent.hasMusic, intent.hasWaterfront, intent.needsReservation);

      // PDF INTENT HANDLERS
      case 'find_crab_legs':
        return this.findCrabLegs(intent);

      case 'find_oysters':
        return this.findOysters(intent);

      case 'find_fish':
        return this.findFishByType(intent);

      case 'find_bushwackers':
        return this.findBushwackers(intent);

      case 'find_romantic':
        return this.findRomanticSpots(intent);

      case 'find_family':
        return this.findFamilyFriendly(intent);

      case 'find_happy_hour':
        return this.findHappyHour(intent);

      case 'find_all_you_can_eat':
        return this.findAllYouCanEat(intent);

      case 'find_breakfast':
        return this.findBreakfast(intent);

      case 'find_sports_bar':
        return this.findSportsBar(intent);

      case 'find_activity':
        return this.findActivities(intent.fullText, intent.showDifferent || false);

      case 'find_entertainment':
        return this.findEntertainment();

      case 'check_hours':
        return "I can help you check business hours. Which location would you like to know about?";

      case 'recommend':
        return this.giveRecommendation();

      case 'beach_conditions':
        return await this.getBeachConditions();

      case 'find_beach_access':
        return this.findBeachAccess();

      case 'find_boat_launch':
        return this.findBoatLaunches();

      case 'find_marina':
        return this.findMarinas();

      case 'find_attractions':
        return this.findAttractions(intent.fullText);

      case 'find_shopping':
        return this.findShopping(intent.fullText);

      case 'find_parks':
        return this.findParks(intent.fullText);

      case 'find_services':
        return this.findServices(intent.fullText);

      case 'find_rentals':
        return this.findRentals(intent.fullText);

      case 'find_coffee':
        return this.findCoffee(intent.fullText);

      case 'find_sweets':
        return this.findSweets(intent.fullText);

      case 'find_hotels':
        return this.findHotels(intent.fullText);

      // ACTION INTENTS
      case 'action_call':
        return this.handleCallAction(intent);

      case 'action_directions':
        return this.handleDirectionsAction(intent);

      case 'action_hours':
        return this.handleHoursAction(intent);

      case 'action_website':
        return this.handleWebsiteAction(intent);

      case 'action_details':
        return this.handleDetailsAction(intent);

      // DATA QUERY INTENTS
      case 'query_menu':
        return this.handleMenuQuery(intent);

      case 'query_drinks':
        return this.handleDrinksQuery(intent);

      case 'query_specials':
        return this.handleSpecialsQuery(intent);

      case 'query_events':
        return this.handleEventsQuery(intent);

      case 'query_prices':
        return this.handlePricesQuery(intent);

      case 'query_description':
        return this.handleDescriptionQuery(intent);

      case 'ask_different':
        // User didn't like the options - ask for different category with context
        const prevCat = intent.previousCategory || 'those';
        const altCategories = this.getAvailableCategories().filter(c => c !== prevCat);

        if (prevCat === 'activities') {
          return `I've shown you all the activities I have. What else can I help you find?`;
        } else if (prevCat === 'restaurants') {
          return `I've shown you all the matching restaurants. What else are you looking for?`;
        } else {
          return `I've shown you everything in that category. What else can I help you with?`;
        }

      case 'general':
        // Handle corrections gracefully
        if (intent.isCorrection) {
          return "Thanks for the feedback! What would you like to find?";
        }
        // Ask clarifying questions instead of listing everything
        return `I'd love to help! What are you in the mood for?

For example, you could say:
• "I'm looking for seafood"
• "Find me something with live music"
• "Where can I get crab legs?"
• "Show me waterfront restaurants"

What sounds good to you?`;

      default:
        return "Hmm, I'm not quite sure what you're looking for. Could you tell me more? For example: 'find seafood restaurants' or 'where can I get grouper?'";
    }
  }

  // Get list of categories that have actual data
  getAvailableCategories() {
    if (typeof allBusinesses === 'undefined') return [];

    const categories = [];
    const counts = {
      restaurants: allBusinesses.filter(b => b.category === 'restaurants').length,
      activities: allBusinesses.filter(b => b.category === 'activities').length,
      parks: allBusinesses.filter(b => b.category === 'parks' || b.category === 'park').length,
      attractions: allBusinesses.filter(b => b.category === 'attractions').length,
      shopping: allBusinesses.filter(b => b.category === 'shopping' || b.category === 'grocery').length,
      services: allBusinesses.filter(b => b.category === 'services').length,
      rentals: allBusinesses.filter(b => b.category === 'rentals').length,
      coffee: allBusinesses.filter(b => b.category === 'coffee').length,
      sweets: allBusinesses.filter(b => b.category === 'sweets').length,
      hotels: allBusinesses.filter(b => b.category === 'hotels').length
    };

    if (counts.restaurants > 0) categories.push('restaurants');
    if (counts.coffee > 0) categories.push('coffee shops');
    if (counts.sweets > 0) categories.push('desserts');
    if (counts.activities > 0) categories.push('activities');
    if (counts.parks > 0) categories.push('parks');
    if (counts.attractions > 0) categories.push('attractions');
    if (counts.shopping > 0) categories.push('shopping');
    if (counts.services > 0) categories.push('services');
    if (counts.rentals > 0) categories.push('rentals');
    if (counts.hotels > 0) categories.push('hotels');

    return categories;
  }

  generateResponse(intent) {
    // Fallback to data-only response
    return this.generateDataOnlyResponse(intent);
  }

  // Handle compound queries with multiple questions
  handleCompoundQuery(intent) {
    const text = intent.fullText;

    // Identify what they're asking for
    const hasKidsActivity = text.includes('kid') || text.includes('child') || text.includes('family');
    const hasRestaurant = text.includes('restaurant') || text.includes('food') || text.includes('eat') || text.includes('dine');
    const hasActivity = text.includes('fun') || text.includes('activity') || text.includes('things to do');
    const hasOutdoors = text.includes('outdoor') || text.includes('beach') || text.includes('park');
    const hasMusic = text.includes('music') || text.includes('live band');
    const hasWaterfront = text.includes('waterfront') || text.includes('water view');
    const hasRental = text.includes('rent') || text.includes('rental') || text.includes('bike') || text.includes('bicycle') || text.includes('scooter') || text.includes('kayak');
    const hasBudget = text.includes('cheap') || text.includes('affordable') || text.includes('budget') || text.includes('inexpensive') || text.includes('low cost') || text.includes('not expensive');

    // Store budget constraint for later use
    if (hasBudget) {
      this.conversationContext.userPreferences.budget = 'low';
    }

    // Build a list of what they're looking for
    const requests = [];

    // Add rental request if detected
    if (hasRental) {
      if (text.includes('bike') || text.includes('bicycle')) {
        requests.push('bike rentals');
      } else if (text.includes('kayak')) {
        requests.push('kayak rentals');
      } else if (text.includes('scooter')) {
        requests.push('scooter rentals');
      } else {
        requests.push('rentals');
      }
    }

    // Add activities request
    if ((hasKidsActivity || hasActivity) && hasOutdoors) {
      requests.push('outdoor activities for kids');
    } else if (hasKidsActivity || hasActivity) {
      requests.push('activities for kids');
    }

    // Add restaurant request
    if (hasRestaurant) {
      let restaurantDetails = [];
      if (hasWaterfront) restaurantDetails.push('waterfront');
      if (hasMusic) restaurantDetails.push('live music');
      if (hasBudget) restaurantDetails.push('affordable');

      if (restaurantDetails.length > 0) {
        requests.push(`${restaurantDetails.join(', ')} restaurant`);
      } else {
        requests.push('restaurant');
      }
    }

    // Instead of showing everything, ask which to tackle first
    if (requests.length > 1) {
      this.conversationContext.awaitingClarification = true;
      this.conversationContext.clarificationFor = 'compound_priority';
      this.conversationContext.pendingRequests = requests;
      this.conversationContext.originalQuery = text;

      // Create a more conversational response
      if (requests.length === 2) {
        return `I can help with both! You mentioned ${requests[0]} and ${requests[1]}. Would you like to start with ${requests[0]}, or ${requests[1]}?`;
      } else if (requests.length === 3) {
        return `I can help with all three! You mentioned ${requests[0]}, ${requests[1]}, and ${requests[2]}. Which would you like to start with?`;
      } else {
        return `I can help with all of that! You mentioned ${requests.join(', ')}. Which would you like me to help with first?`;
      }
    }

    // If only one request, handle it normally
    if (requests.length === 1) {
      if (hasRental) {
        return this.findRentals(text);
      } else if (hasKidsActivity || hasActivity) {
        return this.findActivities(text);
      } else if (hasRestaurant) {
        return this.findRestaurants(null, hasMusic, hasWaterfront, false);
      }
    }

    // Fallback if nothing matched
    return "What are you looking for?";
  }

  handleComplexQuery(intent) {
    let response = "";
    let sections = [];
    const businessesToShow = [];

    // Handle activities (like fishing)
    if (intent.needsActivity) {
      let activities;
      if (intent.fullText.includes('fishing')) {
        activities = this.getBusinessesByTag('fishing');
      } else {
        activities = this.getBusinessesByCategory('activities');
      }

      if (activities.length > 0) {
        // Sort by distance
        activities.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

        let section = `${activities.length} ${intent.fullText.includes('fishing') ? 'fishing options' : 'activities'} (closest to furthest):\n\n`;
        activities.forEach((b, i) => {
          section += `${i + 1}. ${b.name}`;
          if (b.distanceText) section += ` - ${b.distanceText} away`;
          section += `\n   ${b.description || 'Activity'}\n\n`;
        });
        sections.push(section);
        businessesToShow.push(...activities.slice(0, 3));
      }
    }

    // Handle breakfast
    if (intent.needsRestaurant && intent.fullText.includes('breakfast')) {
      const breakfastSpots = this.getBusinessesByTag('breakfast');
      if (breakfastSpots.length > 0) {
        // Sort by distance
        breakfastSpots.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

        let section = `${breakfastSpots.length} breakfast options (closest to furthest):\n\n`;
        breakfastSpots.forEach((b, i) => {
          section += `${i + 1}. ${b.name}`;
          if (b.distanceText) section += ` - ${b.distanceText} away`;
          section += `\n   ${b.description || b.cuisine || 'Restaurant'}\n\n`;
        });
        sections.push(section);
        businessesToShow.push(...breakfastSpots.slice(0, 3));
      }
    }

    // Handle dinner with music and waterfront
    if (intent.needsRestaurant && (intent.fullText.includes('dinner') || intent.fullText.includes('lunch'))) {
      let dinnerSpots = this.getBusinessesByCategory('restaurants');

      if (intent.needsMusic) {
        dinnerSpots = dinnerSpots.filter(b =>
          b.tags && (b.tags.includes('Live Music') || b.tags.includes('Entertainment'))
        );
      }

      if (intent.needsWaterfront) {
        dinnerSpots = dinnerSpots.filter(b =>
          b.tags && (b.tags.includes('Waterfront') || b.tags.includes('Beach') || b.description?.toLowerCase().includes('waterfront'))
        );
      }

      if (dinnerSpots.length > 0) {
        // Sort by distance
        dinnerSpots.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

        let label = 'dinner options';
        if (intent.needsMusic && intent.needsWaterfront) label += ' with live music and waterfront';
        else if (intent.needsMusic) label += ' with live music';
        else if (intent.needsWaterfront) label += ' with waterfront';

        let section = `${dinnerSpots.length} ${label} (closest to furthest):\n\n`;
        dinnerSpots.forEach((b, i) => {
          section += `${i + 1}. ${b.name}`;
          if (b.distanceText) section += ` - ${b.distanceText} away`;
          section += `\n   ${b.description || b.cuisine || 'Restaurant'}\n\n`;
        });
        sections.push(section);
        businessesToShow.push(...dinnerSpots.slice(0, 3));
      }
    }

    // Display profile cards
    if (businessesToShow.length > 0) {
      this.displayBusinessCards(businessesToShow);
    }

    if (sections.length > 0) {
      response = sections.join('');
    } else {
      response = "I couldn't find matches. What are you looking for?";
    }

    return response;
  }

  // Helper methods to get businesses for display (returns business objects, not text)
  findRestaurantsForDisplay(cuisine, hasMusic, hasWaterfront) {
    if (typeof allBusinesses === 'undefined') return [];

    let restaurants = allBusinesses.filter(b => b.category === 'restaurants');

    if (cuisine) {
      restaurants = restaurants.filter(r =>
        (r.cuisine && r.cuisine.toLowerCase().includes(cuisine)) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(cuisine))) ||
        // SEARCH MENU ITEMS AND DESCRIPTIONS
        (r.menu && r.menu.some(item =>
          (item.name && item.name.toLowerCase().includes(cuisine)) ||
          (item.description && item.description.toLowerCase().includes(cuisine)) ||
          (item.category && item.category.toLowerCase().includes(cuisine))
        )) ||
        (r.description && r.description.toLowerCase().includes(cuisine))
      );
    }

    if (hasMusic) {
      restaurants = restaurants.filter(r =>
        r.tags && (r.tags.includes('Live Music') || r.tags.includes('Entertainment'))
      );
    }

    if (hasWaterfront) {
      restaurants = restaurants.filter(r =>
        r.tags && (r.tags.includes('Waterfront') || r.tags.includes('Beach')) ||
        (r.description && r.description.toLowerCase().includes('waterfront'))
      );
    }

    // Sort by distance
    restaurants.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
    return restaurants;
  }

  findActivitiesForDisplay(query) {
    if (typeof allBusinesses === 'undefined') return [];

    let activities = allBusinesses.filter(b => b.category === 'activities');

    if (query && query.includes('fishing')) {
      activities = activities.filter(a =>
        (a.tags && a.tags.some(t => t.toLowerCase().includes('fish'))) ||
        (a.description && a.description.toLowerCase().includes('fish')) ||
        (a.name && a.name.toLowerCase().includes('fish'))
      );
    }

    // Sort by distance
    activities.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
    return activities;
  }

  // Display business profile cards in the UI
  displayBusinessCards(businesses) {
    if (!businesses || businesses.length === 0) return;

    const messagesDiv = document.getElementById('ai-messages');
    if (!messagesDiv) return;

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'ai-business-cards-container';

    businesses.forEach(business => {
      const card = document.createElement('div');
      card.className = 'ai-business-card';
      card.onclick = () => {
        window.location.href = `profile.html?id=${business.id}`;
      };

      let cardHTML = '';

      // Image
      if (business.image) {
        cardHTML += `<img src="${business.image}" alt="${business.name}" class="ai-card-image">`;
      }

      // Info
      cardHTML += `<div class="ai-card-info">`;
      cardHTML += `<h4 class="ai-card-name">${business.name}</h4>`;

      if (business.subcategory) {
        cardHTML += `<p class="ai-card-category">${business.subcategory}</p>`;
      }

      if (business.description) {
        cardHTML += `<p class="ai-card-description">${business.description.substring(0, 100)}${business.description.length > 100 ? '...' : ''}</p>`;
      }

      // Meta info
      cardHTML += `<div class="ai-card-meta">`;
      if (business.rating) {
        cardHTML += `<span class="ai-card-rating">⭐ ${business.rating}</span>`;
      }
      if (business.priceLevel) {
        cardHTML += `<span class="ai-card-price">${business.priceLevel}</span>`;
      }
      if (business.distanceText) {
        cardHTML += `<span class="ai-card-distance">📍 ${business.distanceText}</span>`;
      }
      cardHTML += `</div>`;

      // Additional profile data highlights
      cardHTML += `<div class="ai-card-highlights">`;

      // Show sample menu items (max 2)
      if (business.menu && business.menu.length > 0) {
        const sampleItems = business.menu.slice(0, 2);
        cardHTML += `<div class="ai-card-highlight"><strong>Menu:</strong> ${sampleItems.map(item => item.name).join(', ')}${business.menu.length > 2 ? ` +${business.menu.length - 2} more` : ''}</div>`;
      }

      // Show sample drinks (max 2)
      if (business.drinks && business.drinks.length > 0) {
        const sampleDrinks = business.drinks.slice(0, 2);
        cardHTML += `<div class="ai-card-highlight"><strong>Drinks:</strong> ${sampleDrinks.map(drink => drink.name).join(', ')}${business.drinks.length > 2 ? ` +${business.drinks.length - 2} more` : ''}</div>`;
      }

      // Show happy hour info
      if (business.happyHour && business.happyHours && business.happyHours.length > 0) {
        cardHTML += `<div class="ai-card-highlight"><strong>🍹 Happy Hour:</strong> ${business.happyHour}</div>`;
      }

      // Show upcoming events (max 1)
      if (business.events && business.events.length > 0) {
        const nextEvent = business.events[0];
        cardHTML += `<div class="ai-card-highlight"><strong>🎵 Event:</strong> ${nextEvent.name || nextEvent.title}${nextEvent.day ? ` - ${nextEvent.day}` : ''}</div>`;
      }

      // Show key tags (max 3)
      if (business.tags && business.tags.length > 0) {
        const keyTags = business.tags.slice(0, 3);
        cardHTML += `<div class="ai-card-tags">${keyTags.map(tag => `<span class="ai-tag">${tag}</span>`).join('')}</div>`;
      }

      cardHTML += `</div>`;
      cardHTML += `</div>`;

      card.innerHTML = cardHTML;
      cardsContainer.appendChild(card);
    });

    messagesDiv.appendChild(cardsContainer);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Track analytics for each business recommendation
    businesses.forEach(business => {
      if (window.analyticsTracker) {
        window.analyticsTracker.trackRecommendation(business.id, business.name, 'ai-voice-assistant');
      }
    });

    // Store references for potential follow-up questions
    this.conversationContext.lastShownBusinesses = businesses;
  }

  planDay() {
    if (typeof allBusinesses === 'undefined') {
      return "Let me help you plan your day! What would you like to do?";
    }

    const now = new Date();
    const hour = now.getHours();

    let timeOfDay, suggestion;

    // Get restaurants from actual data
    const restaurants = this.getBusinessesByCategory('restaurants', 4.0);
    const activities = this.getBusinessesByCategory('activities');

    if (hour < 12) {
      timeOfDay = 'morning';
      // Find breakfast spots
      const breakfastSpots = this.getBusinessesByTag('breakfast');
      if (breakfastSpots.length > 0) {
        const names = breakfastSpots.slice(0, 2).map(b => b.name).join(' or ');
        suggestion = `Good morning! For breakfast, I recommend ${names}.`;
      } else if (restaurants.length > 0) {
        const names = restaurants.slice(0, 2).map(b => b.name).join(' or ');
        suggestion = `Good morning! For breakfast, check out ${names}.`;
      } else {
        suggestion = "Good morning! What would you like to do today?";
      }
    } else if (hour < 17) {
      timeOfDay = 'afternoon';
      if (restaurants.length > 0 && activities.length > 0) {
        suggestion = `For lunch, check out ${restaurants[0].name}. Then explore activities like ${activities[0].name}.`;
      } else if (restaurants.length > 0) {
        suggestion = `For lunch, check out ${restaurants[0].name}.`;
      } else {
        suggestion = "Perfect afternoon for exploring!";
      }
    } else {
      timeOfDay = 'evening';
      const musicSpots = restaurants.filter(r => r.tags && r.tags.includes('Live Music'));
      if (musicSpots.length > 0) {
        const names = musicSpots.slice(0, 2).map(b => b.name).join(' or ');
        suggestion = `For dinner tonight, I suggest ${names} - they have live music!`;
      } else if (restaurants.length > 0) {
        const names = restaurants.slice(0, 2).map(b => b.name).join(' or ');
        suggestion = `For dinner tonight, try ${names}.`;
      } else {
        suggestion = "Perfect evening to explore!";
      }
    }

    return `Perfect! Let me help you plan your ${timeOfDay}. ${suggestion}`;
  }

  planTrip() {
    // SALES PRO MODE: Ask qualifying questions instead of dumping full itinerary
    this.conversationContext.awaitingClarification = true;

    // Ask about trip length first
    if (!this.conversationContext.userPreferences.tripDays) {
      this.conversationContext.clarificationFor = 'trip_length';
      return "I'd love to help plan your Gulf Coast trip! How many days will you be here?";
    }

    // Ask about kids and ages
    if (!this.conversationContext.kidsAgeKnown) {
      this.conversationContext.clarificationFor = 'kids_age';
      return "Are you traveling with kids? If so, how old are they?";
    }

    // Ask about budget
    if (!this.conversationContext.userPreferences.budget) {
      this.conversationContext.clarificationFor = 'budget';
      return "What's your budget - looking to keep it casual and affordable, moderate spending, or splurge on the experience?";
    }

    // Ask about priorities
    if (!this.conversationContext.userPreferences.tripPriorities) {
      this.conversationContext.clarificationFor = 'trip_priorities';
      return "What are your top priorities - beach time, water activities, dining experiences, family attractions, or a mix of everything?";
    }

    // Ask about dining preferences
    if (!this.conversationContext.userPreferences.diningStyle) {
      this.conversationContext.clarificationFor = 'dining_style';
      return "For dining, do you prefer casual beach spots, waterfront restaurants, or are you looking for happy hour deals?";
    }

    // If we have all the info, now we can create a plan
    return this.generateCustomTripPlan();
  }

  generateCustomTripPlan() {
    // Now that we have all the info, generate a customized plan
    const days = this.conversationContext.userPreferences.tripDays || 3;
    const hasKids = this.conversationContext.kidsAgeKnown;
    const budget = this.conversationContext.userPreferences.budget;

    let plan = `Perfect! Here's a ${days}-day plan customized for you:\n\n`;

    // Generate day-by-day based on preferences
    const restaurants = this.getBusinessesByCategory('restaurants');
    const activities = this.getBusinessesByCategory('activities');

    // Filter based on budget and family-friendly
    let filteredRestaurants = restaurants;
    if (budget) {
      filteredRestaurants = restaurants.filter(r => r.priceLevel === budget);
    }
    if (hasKids) {
      filteredRestaurants = filteredRestaurants.filter(r => r.tags && r.tags.includes('Family Friendly'));
    }

    // Simple plan for now - can be enhanced
    for (let day = 1; day <= Math.min(days, 3); day++) {
      plan += `Day ${day}: `;
      if (activities.length >= day) {
        plan += `${activities[day - 1].name}`;
      }
      if (filteredRestaurants.length >= day) {
        plan += `, dinner at ${filteredRestaurants[day - 1].name}`;
      }
      plan += `. `;
    }

    return plan.trim();
  }

  findRestaurants(cuisine, hasMusic, hasWaterfront, needsReservation = false) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find restaurants for you. Please wait a moment while I load the directory.";
    }

    let restaurants = allBusinesses.filter(b => b.category === 'restaurants');

    // SMART FILTERING: Exclude inappropriate businesses based on context (Template Example 11)
    const hour = new Date().getHours();
    const isDinner = hour >= 17 || cuisine === 'dinner'; // After 5pm or explicit dinner request
    const isDateNight = this.conversationContext.userPreferences.occasion === 'date';

    // Filter out coffee shops for dinner/date night
    if (isDinner || isDateNight) {
      restaurants = restaurants.filter(r => {
        const isCoffeeShop = r.category === 'coffee' ||
                            (r.tags && r.tags.some(t => t.toLowerCase().includes('coffee'))) ||
                            (r.name && r.name.toLowerCase().includes('coffee')) ||
                            (r.cuisine && r.cuisine.toLowerCase().includes('coffee'));
        return !isCoffeeShop; // Exclude coffee shops for dinner/dates
      });
    }

    // Filter out breakfast-only places for dinner
    if (isDinner) {
      restaurants = restaurants.filter(r => {
        const isBreakfastOnly = (r.tags && r.tags.some(t => t.toLowerCase().includes('breakfast only'))) ||
                                (r.description && r.description.toLowerCase().includes('breakfast only'));
        return !isBreakfastOnly;
      });
    }

    // Filter out fast food for date night (Template Example 11: date night should be "higher-end")
    if (isDateNight) {
      restaurants = restaurants.filter(r => {
        const isFastFood = (r.tags && r.tags.some(t => t.toLowerCase().includes('fast food'))) ||
                          (r.priceLevel && r.priceLevel === '$');
        return !isFastFood;
      });
    }

    // Sort by distance first (always show closest)
    restaurants.sort((a, b) => {
      const distA = a.distance || 999999;
      const distB = b.distance || 999999;
      return distA - distB;
    });

    // TEMPLATE RULE: If no criteria, show popular restaurants FIRST, then ask
    // (Don't ask questions before showing anything - show 2-3 options first)
    if (!cuisine && !hasMusic && !hasWaterfront && !needsReservation) {
      // Show top 3 popular restaurants, then ask for cuisine preference
      cuisine = 'popular'; // Will show popular restaurants below
      // Note: Will append follow-up question after showing results
    }

    // Filter by reservation availability FIRST if requested
    if (needsReservation) {
      restaurants = restaurants.filter(r => r.reservation);

      if (restaurants.length === 0) {
        return "None with online reservations, but you can call any restaurant! What type of food are you looking for?";
      }
    }

    // Filter by cuisine - USE ENHANCED MENU SEARCH
    if (cuisine && cuisine !== 'popular') {
      // First, try cross-menu search for specific food items
      const menuResults = this.searchAllMenus(cuisine);

      if (menuResults.length > 0) {
        // Found specific menu items! Show restaurants with those items
        console.log(`Found ${menuResults.length} restaurants with "${cuisine}" on their menu`);

        // Track menu search analytics
        if (window.analyticsTracker) {
          window.analyticsTracker.trackMenuSearch(cuisine, menuResults.length);
        }

        // Display top 3 results with menu items
        const showCount = Math.min(3, menuResults.length);
        this.displayBusinessCards(menuResults.slice(0, showCount).map(r => r.business));

        // Store for follow-up
        this.conversationContext.lastShownBusinesses = menuResults.slice(0, showCount).map(r => r.business);

        let response = `Found ${menuResults.length} place${menuResults.length > 1 ? 's' : ''} with "${cuisine}":\n\n`;

        menuResults.slice(0, showCount).forEach((result, idx) => {
          response += `${idx + 1}. **${result.business.name}** (${result.distanceText}):\n`;
          // Show first 2 matching items
          result.matches.slice(0, 2).forEach(item => {
            // Only show price if it's available and not "Price not listed"
            const priceText = (item.price && item.price !== 'Price not listed') ? ` - ${item.price}` : '';
            response += `   • ${item.name}${priceText}\n`;
          });
          if (result.matches.length > 2) {
            response += `   ...and ${result.matches.length - 2} more items\n`;
          }
          response += '\n';
        });

        if (menuResults.length > showCount) {
          response += `Plus ${menuResults.length - showCount} more restaurant${menuResults.length - showCount > 1 ? 's' : ''} have "${cuisine}" on their menu.`;
        }

        return response;
      }

      // Fallback to traditional cuisine/tag filtering if no menu matches
      restaurants = restaurants.filter(r =>
        (r.cuisine && r.cuisine.toLowerCase().includes(cuisine)) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(cuisine))) ||
        (r.description && r.description.toLowerCase().includes(cuisine))
      );
    } else if (cuisine === 'popular') {
      // Show popular restaurants - sort by rating
      restaurants.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA; // Higher rating first
        }
        // If same rating, use distance
        return (a.distance || 999999) - (b.distance || 999999);
      });
    }

    // Filter by live music
    if (hasMusic) {
      restaurants = restaurants.filter(r =>
        r.tags && (r.tags.includes('Live Music') || r.tags.includes('Entertainment'))
      );
    }

    // Filter by waterfront
    if (hasWaterfront) {
      restaurants = restaurants.filter(r =>
        r.tags && (r.tags.includes('Waterfront') || r.tags.includes('Beach')) ||
        (r.description && r.description.toLowerCase().includes('waterfront'))
      );
    }

    if (restaurants.length > 0) {
      // TEMPLATE RULE: Show results FIRST, then ask refining questions AFTER
      // (Commented out pre-result questions - violates template Section 9.1)

      // // SALES PRO MODE: Ask SMART qualifying questions based on what's available
      // // Check what we have available to narrow by
      // const hasPriceLevels = restaurants.some(r => r.priceLevel);
      // const hasWaterfrontOptions = restaurants.some(r => r.tags && (r.tags.includes('Waterfront') || r.tags.includes('Beach')));
      // const hasMusicOptions = restaurants.some(r => r.tags && r.tags.includes('Live Music'));
      // const hasFamilyOptions = restaurants.some(r => r.tags && r.tags.includes('Family Friendly'));
      //
      // if (restaurants.length > 5 && !hasMusic && !hasWaterfront && cuisine !== 'popular') {
      //   ... (asking questions before showing - REMOVED)
      // }

      // Display profile cards for top results (MAX 3)
      const showCount = Math.min(3, restaurants.length);
      this.displayBusinessCards(restaurants.slice(0, showCount));

      let response = '';

      // If user searched for specific food item (not just cuisine type), show matching menu items
      const searchedSpecificFood = cuisine && cuisine.length > 3 &&
        !['american', 'seafood', 'italian', 'mexican', 'asian', 'chinese', 'japanese', 'thai', 'indian', 'french', 'greek', 'mediterranean', 'bbq', 'barbecue', 'southern', 'cajun', 'steakhouse', 'burgers', 'pizza', 'sushi'].includes(cuisine.toLowerCase());

      if (searchedSpecificFood) {
        // User searched for specific food like "crab legs", "grouper", "tacos", etc.
        response = `Found ${restaurants.length === 1 ? 'this option' : restaurants.length + ' options'} with ${cuisine}:\n\n`;

        for (let i = 0; i < showCount; i++) {
          const r = restaurants[i];
          response += `${i + 1}. **${r.name}**`;

          // Find the menu items that matched the search
          const matchingItems = r.menu ? r.menu.filter(item =>
            (item.name && item.name.toLowerCase().includes(cuisine.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(cuisine.toLowerCase()))
          ) : [];

          if (matchingItems.length > 0) {
            // Show up to 2 matching menu items
            response += '\n';
            matchingItems.slice(0, 2).forEach(item => {
              response += `   • ${item.name}\n`;
            });
            if (matchingItems.length > 2) {
              response += `   • ...and ${matchingItems.length - 2} more ${cuisine} items\n`;
            }
          }

          response += `   ${r.distanceText || 'nearby'} • ${r.priceLevel || '$$'}\n`;
          if (i < showCount - 1) response += '\n';
        }
      } else {
        // General cuisine search - show restaurant names + AI Context V2 enhancements
        if (restaurants.length === 1) {
          const r = restaurants[0];
          response = `${r.name} is ${r.distanceText} away.`;

          // Add AI Context V2 rich details if available
          if (r.aiContextV2) {
            if (r.aiContextV2.knownFor) response += `\n\n${r.aiContextV2.knownFor}`;
            if (r.aiContextV2.insiderTip) response += `\n\n💡 Insider tip: ${r.aiContextV2.insiderTip}`;
          }
        } else if (restaurants.length === 2) {
          response = `Here are 2 options:\n- ${restaurants[0].name} (${restaurants[0].distanceText})\n- ${restaurants[1].name} (${restaurants[1].distanceText})`;
        } else if (restaurants.length === 3) {
          response = `Here are your top 3:\n1. ${restaurants[0].name} - ${restaurants[0].distanceText}\n2. ${restaurants[1].name} - ${restaurants[1].distanceText}\n3. ${restaurants[2].name} - ${restaurants[2].distanceText}`;

          // Add insider tip for top recommendation if available
          if (restaurants[0].aiContextV2 && restaurants[0].aiContextV2.insiderTip) {
            response += `\n\n💡 Insider tip for ${restaurants[0].name}: ${restaurants[0].aiContextV2.insiderTip}`;
          }
        } else {
          response = `Top 3 of ${restaurants.length} restaurants:\n1. ${restaurants[0].name} - ${restaurants[0].distanceText}\n2. ${restaurants[1].name} - ${restaurants[1].distanceText}\n3. ${restaurants[2].name} - ${restaurants[2].distanceText}`;

          // Add insider tip for top recommendation if available
          if (restaurants[0].aiContextV2 && restaurants[0].aiContextV2.insiderTip) {
            response += `\n\n💡 Insider tip for ${restaurants[0].name}: ${restaurants[0].aiContextV2.insiderTip}`;
          }
        }
      }

      // TEMPLATE RULE: Add ONE refining question AFTER showing results (not before)
      // Only ask if there are more than 3 results and no specific filters were applied
      if (restaurants.length > 3 && !hasMusic && !hasWaterfront && cuisine !== 'popular') {
        const hasWaterfrontOptions = restaurants.some(r => r.tags && (r.tags.includes('Waterfront') || r.tags.includes('Beach')));
        const hasMusicOptions = restaurants.some(r => r.tags && r.tags.includes('Live Music'));

        if (hasWaterfrontOptions || hasMusicOptions) {
          response += '\n\nWould you like me to narrow it down to waterfront or live music options?';
        }
      }

      return response;
    }

    // SMART FALLBACK - If strict filtering returned no results, try relaxing filters
    const allRestaurants = allBusinesses.filter(b => b.category === 'restaurants');

    if (allRestaurants.length > 0) {
      // Try relaxing filters one at a time to find matches
      console.log('⚠️ No results with strict filters, trying relaxed search...');

      // First try: Just cuisine (most important filter)
      if (cuisine && cuisine !== 'popular') {
        let relaxedResults = allRestaurants.filter(r =>
          (r.cuisine && r.cuisine.toLowerCase().includes(cuisine)) ||
          (r.tags && r.tags.some(t => t.toLowerCase().includes(cuisine))) ||
          (r.description && r.description.toLowerCase().includes(cuisine)) ||
          (r.menu && r.menu.some(item =>
            (item.name && item.name.toLowerCase().includes(cuisine)) ||
            (item.description && item.description.toLowerCase().includes(cuisine))
          ))
        );

        // Sort by distance
        relaxedResults.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

        if (relaxedResults.length > 0) {
          const showCount = Math.min(3, relaxedResults.length);
          this.displayBusinessCards(relaxedResults.slice(0, showCount));
          this.conversationContext.lastShownBusinesses = relaxedResults.slice(0, showCount);

          let response = `Found ${relaxedResults.length} place${relaxedResults.length > 1 ? 's' : ''} with ${cuisine}:\n\n`;
          relaxedResults.slice(0, showCount).forEach((r, idx) => {
            response += `${idx + 1}. ${r.name} – ${r.location || r.city || 'Orange Beach'}, ${r.priceLevel || '$$'}`;
            response += `\n   ${r.distanceText || 'nearby'}\n`;
            if (idx < showCount - 1) response += '\n';
          });

          // Explain what we found
          if (hasWaterfront) response += `\n\nNone of these show beachfront in their profile, but you can call to ask about their views!`;
          if (hasMusic) response += `\n\nNone have live music listed, but I can find music venues for after dinner?`;

          response += `\n\nWould you like me to search for something different, or get more details about these?`;

          return response;
        }
      }

      // Second try: Show closest restaurants and ask for clarification
      const closestRestaurants = allRestaurants
        .sort((a, b) => (a.distance || 999999) - (b.distance || 999999))
        .slice(0, 3);

      this.displayBusinessCards(closestRestaurants);
      this.conversationContext.lastShownBusinesses = closestRestaurants;

      let response = `I have ${allRestaurants.length} restaurants, but I want to find the perfect match for you!\n\n`;
      response += `Here are 3 popular nearby options:\n`;
      closestRestaurants.forEach((r, idx) => {
        response += `${idx + 1}. ${r.name} – ${r.cuisine || 'restaurant'}, ${r.priceLevel || '$$'}\n   ${r.distanceText || 'nearby'}\n`;
      });

      response += `\nTo narrow it down, what's most important to you?\n`;
      response += `• Type of food (seafood, burgers, Italian, etc.)?\n`;
      response += `• Price range (budget-friendly or splurge-worthy)?\n`;
      response += `• Atmosphere (casual, family-friendly, romantic)?`;

      return response;
    }

    return "I don't have restaurants in my directory yet. What else can I help you find?";
  }

  findActivities(fullText, showDifferent = false) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find activities for you.";
    }

    let activities = allBusinesses.filter(b => b.category === 'activities');

    // If showing different options, exclude previously shown ones
    if (showDifferent && this.conversationContext.lastShownBusinesses) {
      const shownIds = this.conversationContext.lastShownBusinesses.map(b => b.id);
      activities = activities.filter(b => !shownIds.includes(b.id));
    }

    // Sort by distance first
    activities.sort((a, b) => {
      const distA = a.distance || 999999;
      const distB = b.distance || 999999;
      return distA - distB;
    });

    // Check if asking about kids activities
    const isKidsQuery = fullText && (
      fullText.includes('kid') ||
      fullText.includes('child') ||
      fullText.includes('family')
    );

    // Ask follow-up question for kids activities
    if (isKidsQuery && !this.conversationContext.kidsAgeKnown) {
      this.conversationContext.awaitingClarification = true;
      this.conversationContext.clarificationFor = 'kids_age';
      this.conversationContext.pendingQuery = fullText;
      return "I'd love to help! How old are the kids? That way I can suggest the best activities for their age.";
    }

    // If no specific type mentioned, ask to narrow down (Sales Pro Mode: always ask for clarification)
    if (!fullText || (!fullText.includes('fish') && !fullText.includes('water') && !fullText.includes('golf') && !fullText.includes('arcade') && !fullText.includes('park'))) {
      // SALES PRO MODE: Ask qualifying questions even with smaller result sets
      if (activities.length > 2) {
        this.conversationContext.awaitingClarification = true;
        this.conversationContext.clarificationFor = 'activity_type';
        return `I have ${activities.length} activities. Are you looking for water sports, family-friendly activities, golf, or outdoor adventures?`;
      } else if (activities.length === 2) {
        this.conversationContext.awaitingClarification = true;
        this.conversationContext.clarificationFor = 'activity_type';
        return `I have a couple of activities nearby. What type are you looking for - water sports, family activities, or something else?`;
      }
    }

    // Filter by specific activity types
    if (fullText && fullText.includes('fishing')) {
      activities = activities.filter(a =>
        (a.tags && a.tags.some(t => t.toLowerCase().includes('fish'))) ||
        (a.description && a.description.toLowerCase().includes('fish')) ||
        (a.name && a.name.toLowerCase().includes('fish'))
      );
    }

    if (activities.length > 0) {
      // Display profile cards (max 3)
      const showCount = Math.min(3, activities.length);
      this.displayBusinessCards(activities.slice(0, showCount));

      // Store shown options for follow-up
      this.conversationContext.lastShownBusinesses = activities.slice(0, showCount);
      this.conversationContext.lastQueryType = 'activities';

      let response = '';

      // Helper function to get distance text
      const getDistText = (business) => {
        if (business.distanceText && business.distanceText !== 'undefined') {
          return business.distanceText;
        } else if (business.distance) {
          // Distance is already in miles from Haversine calculation
          return `${business.distance.toFixed(1)} miles away`;
        }
        return '';
      };

      // Add contextual recommendations with distances
      if (activities.length === 1) {
        const dist = getDistText(activities[0]);
        response = `${activities[0].name}${dist ? ' is ' + dist : ''}.`;
      } else if (activities.length === 2) {
        const dist0 = getDistText(activities[0]);
        const dist1 = getDistText(activities[1]);
        response = `Here are 2 options:\n- ${activities[0].name}${dist0 ? ' (' + dist0 + ')' : ''}\n- ${activities[1].name}${dist1 ? ' (' + dist1 + ')' : ''}`;
      } else if (activities.length === 3) {
        const dist0 = getDistText(activities[0]);
        const dist1 = getDistText(activities[1]);
        const dist2 = getDistText(activities[2]);
        response = `Here are your top 3:\n1. ${activities[0].name}${dist0 ? ' - ' + dist0 : ''}\n2. ${activities[1].name}${dist1 ? ' - ' + dist1 : ''}\n3. ${activities[2].name}${dist2 ? ' - ' + dist2 : ''}`;
      } else {
        const dist0 = getDistText(activities[0]);
        const dist1 = getDistText(activities[1]);
        response = `Found ${activities.length}. Closest: ${activities[0].name}${dist0 ? ' at ' + dist0 : ''}${dist1 ? ', then ' + activities[1].name + ' at ' + dist1 : ''}.`;
      }

      return response;
    }

    // If showing different options but found nothing, let them know
    if (showDifferent) {
      return "I've shown you all the activities I have in that category.";
    }

    return "I don't have activities in my directory yet. Try asking about restaurants, parks, or shopping!";
  }

  // Helper: Get businesses by category with optional min rating
  getBusinessesByCategory(category, minRating = 0) {
    if (typeof allBusinesses === 'undefined') return [];
    return allBusinesses.filter(b =>
      b.category === category && (!minRating || (b.rating && b.rating >= minRating))
    );
  }

  // Helper: Get businesses by tag
  getBusinessesByTag(tag) {
    if (typeof allBusinesses === 'undefined') return [];
    return allBusinesses.filter(b =>
      b.tags && b.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  // Helper: Get businesses that accept reservations
  getBusinessesWithReservations(category = null) {
    if (typeof allBusinesses === 'undefined') return [];
    let businesses = allBusinesses.filter(b => b.reservation);
    if (category) {
      businesses = businesses.filter(b => b.category === category);
    }
    return businesses;
  }

  // Helper: Check if business accepts reservations
  hasReservations(business) {
    return business && business.reservation;
  }

  // Helper: Parse menu/drink item to extract embedded prices
  // Many items have prices embedded in the name like "Tuna Dip – $12 | Description"
  parseMenuItem(item) {
    if (!item) return null;

    // Match patterns like "– $12", "Cup $9 / Bowl $13", or just "$12"
    const pricePattern = /(?:–\s*)?\$\d+(?:\.\d{2})?(?:\s*\/\s*\w+\s*\$\d+(?:\.\d{2})?)?/g;
    const prices = item.name.match(pricePattern);

    let price = item.price || '';
    let cleanName = item.name;

    // If price field is empty but we found prices in the name
    if ((!price || price === '') && prices && prices.length > 0) {
      // Extract all prices
      price = prices.join(', ').replace(/^–\s*/, '').trim();
      // Remove prices from name to get clean item name
      cleanName = item.name.replace(pricePattern, '').replace(/\s*–\s*$/, '').replace(/\s*\|\s*$/, '').trim();
    }

    // Handle market price
    let displayPrice = price || item.price || '';
    if (!displayPrice || displayPrice.trim() === '') {
      displayPrice = 'Price not listed';
    } else if (displayPrice.toLowerCase().includes('market') || displayPrice.toLowerCase() === 'mp') {
      displayPrice = 'Market Price';
    }

    return {
      name: cleanName || item.name,
      originalName: item.name,
      price: displayPrice,
      description: item.description || '',
      category: item.category || ''
    };
  }

  // Helper: Search all restaurant menus for a specific food item
  // Example: "where can I get crab legs?" searches ALL menus
  searchAllMenus(foodQuery) {
    if (typeof allBusinesses === 'undefined') return [];

    const query = foodQuery.toLowerCase();
    const results = [];

    // Search through all restaurants
    allBusinesses.filter(b => b.category === 'restaurants').forEach(business => {
      const matches = [];

      // Search menu items
      if (business.menu && business.menu.length > 0) {
        business.menu.forEach(item => {
          const parsed = this.parseMenuItem(item);
          const itemName = parsed.name.toLowerCase();
          const itemDesc = parsed.description.toLowerCase();
          const itemCategory = parsed.category.toLowerCase();

          // Check if query matches item name, description, or category
          if (itemName.includes(query) || itemDesc.includes(query) || itemCategory.includes(query)) {
            matches.push(parsed);
          }
        });
      }

      // Also search drinks if looking for beverages
      if (business.drinks && business.drinks.length > 0) {
        business.drinks.forEach(drink => {
          const parsed = this.parseMenuItem(drink);
          const drinkName = parsed.name.toLowerCase();

          if (drinkName.includes(query)) {
            matches.push({...parsed, isDrink: true});
          }
        });
      }

      // If this restaurant has matches, add to results
      if (matches.length > 0) {
        results.push({
          business: business,
          matches: matches,
          matchCount: matches.length,
          distance: business.distance || 999999,
          distanceText: business.distanceText || business.location || 'nearby'
        });
      }
    });

    // Sort by distance (closest first)
    results.sort((a, b) => a.distance - b.distance);

    return results;
  }

  // Get current beach conditions and safety information
  async getBeachConditions() {
    try {
      // TODO: Integrate with beach conditions API
      // For now, return a helpful message directing users to official sources
      return "For current beach conditions and flag status, please check:\n\n" +
             "🌊 Gulf Shores: www.gulfshoresal.gov/beach-safety\n" +
             "🌊 Orange Beach: www.orangebeachal.gov/beach-safety\n\n" +
             "Beach Safety Hotline: (251) 968-SAFE (7233)\n\n" +
             "Always check the flag color before entering the water!";

      /* DISABLED: API integration needed
      const conditions = await beachConditionsAPI.getCurrentConditions();
      const flag = beachConditionsAPI.getFlagInfo(conditions.flagStatus);

      // Build response
      let response = '';

      // Flag status
      response = `${flag.emoji} ${flag.name}. ${flag.description}. `;

      // Current conditions
      const details = [];
      if (conditions.waterTemp) {
        details.push(`Water temperature is ${conditions.waterTemp}°F`);
      }
      if (conditions.surfHeight) {
        details.push(`surf height ${conditions.surfHeight} feet`);
      }
      if (conditions.windSpeed) {
        details.push(`wind ${conditions.windSpeed} mph`);
      }

      if (details.length > 0) {
        response += details.join(', ') + '. ';
      }

      // Safety warnings
      const warnings = [];

      if (conditions.beachClosed) {
        return '🚫 Beach is CLOSED. Water is closed to public. Stay out of the water for your safety.';
      }

      if (conditions.flagStatus === 'double-red') {
        return '🔴🔴 DOUBLE RED FLAG. Do not enter the water. Dangerous conditions. The water is closed to the public.';
      }

      if (conditions.flagStatus === 'red') {
        warnings.push('High hazard conditions - swim at your own risk');
      }

      if (conditions.ripCurrentRisk === 'high') {
        warnings.push('high rip current risk');
      } else if (conditions.ripCurrentRisk === 'moderate') {
        warnings.push('moderate rip current risk');
      }

      if (conditions.jellyfish) {
        warnings.push('jellyfish present');
      }

      if (conditions.stingrays) {
        warnings.push('stingrays present - shuffle your feet when entering water');
      }

      if (!conditions.lifeguardOnDuty) {
        warnings.push('no lifeguard on duty');
      }

      if (warnings.length > 0) {
        response += '⚠️ ' + warnings.join(', ') + '.';
      } else if (conditions.flagStatus === 'green') {
        response += '✅ Good conditions for swimming and beach activities.';
      }

      return response;
      */
    } catch (error) {
      console.error('Beach conditions feature not yet available:', error);
      return "For current beach conditions and flag status, please check:\n\n" +
             "🌊 Gulf Shores: www.gulfshoresal.gov/beach-safety\n" +
             "🌊 Orange Beach: www.orangebeachal.gov/beach-safety\n\n" +
             "Beach Safety Hotline: (251) 968-SAFE (7233)";
    }
  }

  // Find beach access points
  findBeachAccess() {
    const beaches = this.getBusinessesBySubcategory('Beach Access');
    if (beaches.length === 0) {
      return "I don't have beach access points in my directory yet. Try asking about activities or boat launches!";
    }

    // Sort by distance
    beaches.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // Display cards (max 3)
    const showCount = Math.min(3, beaches.length);
    this.displayBusinessCards(beaches.slice(0, showCount));

    let response = '';

    if (beaches.length === 1) {
      response = `${beaches[0].name} is ${beaches[0].distanceText} away.`;
    } else if (beaches.length === 2) {
      response = `Here are 2 beach access points:\n- ${beaches[0].name} (${beaches[0].distanceText})\n- ${beaches[1].name} (${beaches[1].distanceText})`;
    } else {
      response = `Found ${beaches.length} beach access points. Closest: ${beaches[0].name} at ${beaches[0].distanceText}, then ${beaches[1].name} at ${beaches[1].distanceText}.`;
    }

    return response;
  }

  // Find boat launches
  findBoatLaunches() {
    const launches = this.getBusinessesBySubcategory('Boat Launch');
    if (launches.length === 0) {
      return "I don't have boat launches in my directory yet. Try asking about marinas or beach access!";
    }

    // Sort by distance
    launches.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // Display cards (max 3)
    const showCount = Math.min(3, launches.length);
    this.displayBusinessCards(launches.slice(0, showCount));

    let response = '';

    if (launches.length === 1) {
      response = `${launches[0].name} is ${launches[0].distanceText} away.`;
    } else if (launches.length === 2) {
      response = `Here are 2 boat launches:\n- ${launches[0].name} (${launches[0].distanceText})\n- ${launches[1].name} (${launches[1].distanceText})`;
    } else {
      response = `Found ${launches.length} boat launches. Closest: ${launches[0].name} at ${launches[0].distanceText}.`;
    }

    return response;
  }

  // Find parks
  findParks(query) {
    const parks = this.getBusinessesByCategory('parks');
    if (parks.length === 0) {
      return "I don't have parks in my directory yet. Try asking about activities, beaches, or restaurants!";
    }

    // Sort by distance
    parks.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // If no specific type mentioned and multiple parks, ask to narrow down
    if (!query || (!query.includes('dog') && !query.includes('state') && !query.includes('playground'))) {
      if (parks.length > 5) {
        const closest = parks[0];
        return `I have ${parks.length} parks. The closest is ${closest.name} at ${closest.distanceText}. What type of park are you looking for?`;
      }
    }

    // Filter by specific park type if mentioned
    let filtered = parks;
    if (query) {
      if (query.includes('dog')) {
        filtered = parks.filter(b => b.subcategory === 'Dog Park');
      } else if (query.includes('state')) {
        filtered = parks.filter(b => b.subcategory === 'State Park');
      } else if (query.includes('city') || query.includes('playground')) {
        filtered = parks.filter(b => b.subcategory === 'Park');
      }
    }

    if (filtered.length === 0) {
      return `I found ${parks.length} parks total, but none match that specific type.`;
    }

    // Display cards (max 3)
    const showCount = Math.min(3, filtered.length);
    this.displayBusinessCards(filtered.slice(0, showCount));

    let response = '';

    if (filtered.length === 1) {
      response = `${filtered[0].name} is ${filtered[0].distanceText} away.`;
    } else if (filtered.length === 2) {
      response = `Here are 2 parks:\n- ${filtered[0].name} (${filtered[0].distanceText})\n- ${filtered[1].name} (${filtered[1].distanceText})`;
    } else {
      response = `Found ${filtered.length} parks. Closest: ${filtered[0].name} at ${filtered[0].distanceText}.`;
    }

    return response;
  }

  // Find services (grocery, pharmacy, gas)
  findServices(query) {
    const services = this.getBusinessesByCategory('services');
    let filtered = services;

    if (query.includes('grocery') || query.includes('food') || query.includes('market')) {
      filtered = services.filter(b => b.subcategory === 'Grocery');
    } else if (query.includes('pharmacy') || query.includes('medicine')) {
      filtered = services.filter(b => b.subcategory === 'Pharmacy');
    } else if (query.includes('gas') || query.includes('fuel')) {
      filtered = services.filter(b => b.subcategory && b.subcategory.includes('Gas'));
    }

    if (filtered.length === 0) {
      if (services.length > 0) {
        return `I found ${services.length} services, but none match that specific criteria.`;
      }
      return "I don't have service locations in my current directory. Try asking about shopping or other categories.";
    }

    let response = `I found ${filtered.length} service location${filtered.length > 1 ? 's' : ''}:\n\n`;
    filtered.slice(0, 5).forEach((b, i) => {
      response += `${i + 1}. ${b.name}`;
      if (b.distanceText) {
        response += ` - ${b.distanceText} away`;
      }
      response += `\n   ${b.description}\n`;
    });
    return response;
  }

  // Find rentals
  findRentals(query) {
    const rentals = this.getBusinessesByCategory('rentals');

    if (rentals.length === 0) {
      return "I don't have rentals in my directory yet. Try asking about activities or shopping!";
    }

    // Sort by distance
    rentals.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // If no specific type mentioned, ask to narrow down
    if (!query || (!query.includes('bike') && !query.includes('boat') && !query.includes('beach') && !query.includes('baby'))) {
      if (rentals.length > 3) {
        const closest = rentals[0];
        return `I have ${rentals.length} rental services. The closest is ${closest.name} at ${closest.distanceText}. What type of rental are you looking for?`;
      }
    }

    // Filter by specific rental type if mentioned
    let filtered = rentals;
    if (query && query.includes('bike')) {
      filtered = rentals.filter(b => b.subcategory === 'Bike Rentals');
    } else if (query && (query.includes('boat') || query.includes('pontoon'))) {
      filtered = rentals.filter(b => b.subcategory === 'Boat Rentals');
    } else if (query && (query.includes('beach') || query.includes('chair') || query.includes('umbrella'))) {
      filtered = rentals.filter(b => b.subcategory === 'Beach Rentals');
    } else if (query && (query.includes('baby') || query.includes('stroller') || query.includes('crib'))) {
      filtered = rentals.filter(b => b.subcategory === 'Baby Gear Rentals');
    }

    if (filtered.length === 0) {
      return `I found ${rentals.length} rental services total, but none match that specific type.`;
    }

    // Display cards (max 3)
    const showCount = Math.min(3, filtered.length);
    this.displayBusinessCards(filtered.slice(0, showCount));

    let response = '';

    if (filtered.length === 1) {
      response = `${filtered[0].name} is ${filtered[0].distanceText} away.`;
    } else if (filtered.length === 2) {
      response = `Here are 2 rental services:\n- ${filtered[0].name} (${filtered[0].distanceText})\n- ${filtered[1].name} (${filtered[1].distanceText})`;
    } else {
      response = `Found ${filtered.length} rental services. Closest: ${filtered[0].name} at ${filtered[0].distanceText}.`;
    }

    return response;
  }

  // Find coffee shops
  findCoffee(query) {
    const coffeeShops = this.getBusinessesByCategory('coffee');

    if (coffeeShops.length === 0) {
      return "I don't have coffee shops in my directory yet. Try asking about restaurants or sweets!";
    }

    // Sort by distance
    coffeeShops.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // Display cards (max 3)
    const showCount = Math.min(3, coffeeShops.length);
    this.displayBusinessCards(coffeeShops.slice(0, showCount));

    let response = '';

    if (coffeeShops.length === 1) {
      response = `${coffeeShops[0].name} is ${coffeeShops[0].distanceText} away.`;
    } else if (coffeeShops.length === 2) {
      response = `Here are 2 coffee shops:\n- ${coffeeShops[0].name} (${coffeeShops[0].distanceText})\n- ${coffeeShops[1].name} (${coffeeShops[1].distanceText})`;
    } else {
      response = `Found ${coffeeShops.length} coffee shops. Closest: ${coffeeShops[0].name} at ${coffeeShops[0].distanceText}.`;
    }

    return response;
  }

  // Find sweets / dessert places
  findSweets(query) {
    const sweets = this.getBusinessesByCategory('sweets');

    if (sweets.length === 0) {
      return "I don't have dessert or sweets places in my directory yet. Try asking about restaurants or coffee shops!";
    }

    // Sort by distance
    sweets.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // Display cards (max 3)
    const showCount = Math.min(3, sweets.length);
    this.displayBusinessCards(sweets.slice(0, showCount));

    let response = '';

    if (sweets.length === 1) {
      response = `${sweets[0].name} is ${sweets[0].distanceText} away.`;
    } else if (sweets.length === 2) {
      response = `Here are 2 dessert places:\n- ${sweets[0].name} (${sweets[0].distanceText})\n- ${sweets[1].name} (${sweets[1].distanceText})`;
    } else {
      response = `Found ${sweets.length} dessert places. Closest: ${sweets[0].name} at ${sweets[0].distanceText}.`;
    }

    return response;
  }

  // Find hotels / accommodations
  findHotels(query) {
    const hotels = this.getBusinessesByCategory('hotels');

    if (hotels.length === 0) {
      return "I don't have hotels in my directory yet. Try asking about activities or restaurants!";
    }

    // Sort by distance
    hotels.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // Display cards (max 3)
    const showCount = Math.min(3, hotels.length);
    this.displayBusinessCards(hotels.slice(0, showCount));

    let response = '';

    if (hotels.length === 1) {
      response = `${hotels[0].name} is ${hotels[0].distanceText} away.`;
    } else if (hotels.length === 2) {
      response = `Here are 2 hotels:\n- ${hotels[0].name} (${hotels[0].distanceText})\n- ${hotels[1].name} (${hotels[1].distanceText})`;
    } else {
      response = `Found ${hotels.length} hotels. Closest: ${hotels[0].name} at ${hotels[0].distanceText}.`;
    }

    return response;
  }

  // Find marinas
  findMarinas() {
    const marinas = this.getBusinessesBySubcategory('Marina');
    const dockStores = this.getBusinessesBySubcategory('Dock Store');
    const all = [...marinas, ...dockStores];

    if (all.length === 0) {
      return "I don't have marinas in my current directory. Try asking about boat launches or other water activities.";
    }

    let response = `I found ${all.length} marina${all.length > 1 ? 's' : ''} and dock service${all.length > 1 ? 's' : ''}:\n\n`;
    all.slice(0, 5).forEach((b, i) => {
      response += `${i + 1}. ${b.name}`;
      if (b.distanceText) {
        response += ` - ${b.distanceText} away`;
      }
      if (b.tags && b.tags.length > 0) {
        response += `\n   Features: ${b.tags.slice(0, 3).join(', ')}`;
      }
      response += `\n`;
    });
    return response;
  }

  // Find attractions (theme parks, zoos, historic sites, museums)
  findAttractions(query) {
    const attractions = this.getBusinessesByCategory('attractions');

    if (attractions.length === 0) {
      return "I don't have attractions in my directory yet. Try asking about activities, parks, or restaurants!";
    }

    // Sort by distance
    attractions.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // If no specific type mentioned, ask to narrow down
    if (!query || (!query.includes('water') && !query.includes('theme') && !query.includes('zoo') && !query.includes('fort') && !query.includes('museum'))) {
      if (attractions.length > 3) {
        const closest = attractions[0];
        return `I have ${attractions.length} attractions. The closest is ${closest.name} at ${closest.distanceText}. What type of attraction are you interested in?`;
      }
    }

    // Filter by type if specific attraction mentioned
    let filtered = attractions;
    if (query) {
      if (query.includes('water') || query.includes('amusement') || query.includes('theme')) {
        filtered = attractions.filter(b =>
          b.subcategory === 'Attractions & Theme Parks' ||
          b.name.toLowerCase().includes('water') ||
          b.name.toLowerCase().includes('track')
        );
      } else if (query.includes('zoo') || query.includes('animal')) {
        filtered = attractions.filter(b => b.name.toLowerCase().includes('zoo'));
      } else if (query.includes('fort') || query.includes('historic') || query.includes('history')) {
        filtered = attractions.filter(b =>
          b.subcategory === 'Historic Sites & Landmarks' ||
          b.name.toLowerCase().includes('fort')
        );
      } else if (query.includes('museum')) {
        filtered = attractions.filter(b =>
          b.subcategory === 'Museums & Heritage Centers' ||
          b.name.toLowerCase().includes('museum')
        );
      }
    }

    if (filtered.length === 0) {
      return `I found ${attractions.length} attractions total, but none match that type.`;
    }

    // Display cards (max 3)
    const showCount = Math.min(3, filtered.length);
    this.displayBusinessCards(filtered.slice(0, showCount));

    let response = '';

    if (filtered.length === 1) {
      response = `${filtered[0].name} is ${filtered[0].distanceText} away.`;
    } else if (filtered.length === 2) {
      response = `Here are 2 attractions:\n- ${filtered[0].name} (${filtered[0].distanceText})\n- ${filtered[1].name} (${filtered[1].distanceText})`;
    } else {
      response = `Found ${filtered.length} attractions. Closest: ${filtered[0].name} at ${filtered[0].distanceText}.`;
    }

    return response;
  }

  // Find shopping (souvenirs, bait/tackle, beach stores)
  findShopping(query) {
    const shopping = this.getBusinessesByCategory('shopping');

    if (shopping.length === 0) {
      return "I don't have shopping locations in my directory yet. Try asking about restaurants or activities!";
    }

    // Sort by distance
    shopping.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // If no specific type mentioned, ask to narrow down
    if (!query || (!query.includes('bait') && !query.includes('tackle') && !query.includes('souvenir') && !query.includes('liquor') && !query.includes('gift'))) {
      if (shopping.length > 3) {
        const closest = shopping[0];
        return `I have ${shopping.length} shops. The closest is ${closest.name} at ${closest.distanceText}. What type of shop are you looking for?`;
      }
    }

    // Filter by type
    let filtered = shopping;
    if (query) {
      if (query.includes('bait') || query.includes('tackle') || query.includes('fishing')) {
        filtered = shopping.filter(b =>
          b.subcategory === 'Bait & Tackle' ||
          b.name.toLowerCase().includes('bait') ||
          b.name.toLowerCase().includes('tackle')
        );
      } else if (query.includes('souvenir') || query.includes('gift')) {
        filtered = shopping.filter(b =>
          b.subcategory === 'Souvenir/Beach Store' ||
          b.name.toLowerCase().includes('souvenir')
        );
      } else if (query.includes('liquor') || query.includes('alcohol') || query.includes('wine')) {
        filtered = shopping.filter(b => b.subcategory === 'Liquor Store');
      }
    }

    if (filtered.length === 0) {
      return `I found ${shopping.length} shops total, but none match that type.`;
    }

    // Display cards (max 3)
    const showCount = Math.min(3, filtered.length);
    this.displayBusinessCards(filtered.slice(0, showCount));

    let response = '';

    if (filtered.length === 1) {
      response = `${filtered[0].name} is ${filtered[0].distanceText} away.`;
    } else if (filtered.length === 2) {
      response = `Here are 2 shops:\n- ${filtered[0].name} (${filtered[0].distanceText})\n- ${filtered[1].name} (${filtered[1].distanceText})`;
    } else {
      response = `Found ${filtered.length} shops. Closest: ${filtered[0].name} at ${filtered[0].distanceText}.`;
    }

    return response;
  }

  // Helper: Get businesses by subcategory
  getBusinessesBySubcategory(subcategory) {
    if (typeof allBusinesses === 'undefined') return [];
    return allBusinesses.filter(b => b.subcategory === subcategory);
  }

  // Plan complete multi-day trip
  planCompleteTrip(intent) {
    const days = intent.fullText.match(/(\d+)\s*day/);
    const numDays = days ? parseInt(days[1]) : 3;

    const restaurants = this.getBusinessesByCategory('restaurants', 4.5);
    const activities = this.getBusinessesByCategory('activities');

    if (restaurants.length === 0 && activities.length === 0) {
      return "I'd love to help plan your trip! Let me gather information about available places. What are you most interested in?";
    }

    let plan = `Perfect! Here's a ${numDays}-day Gulf Coast itinerary: `;
    const suggestions = [];

    for (let day = 1; day <= Math.min(numDays, 3); day++) {
      let dayPlan = `Day ${day}: `;
      const dayActivities = [];

      if (activities.length > day - 1) {
        dayActivities.push(`visit ${activities[day - 1].name}`);
      }

      if (restaurants.length > day - 1) {
        dayActivities.push(`dine at ${restaurants[day - 1].name}`);
      }

      if (dayActivities.length > 0) {
        dayPlan += dayActivities.join(', ');
        suggestions.push(dayPlan);
      }
    }

    if (suggestions.length > 0) {
      plan += suggestions.join('. ') + '.';
    } else {
      plan = "I can help plan your vacation! What are you most interested in?";
    }

    return plan;
  }

  findEntertainment() {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find entertainment options. What type are you interested in?";
    }

    const entertainment = this.getBusinessesByCategory('entertainment');
    const musicSpots = this.getBusinessesByTag('live music');
    const allOptions = [...new Set([...entertainment, ...musicSpots])]; // Remove duplicates

    if (allOptions.length > 0) {
      // Sort by distance
      allOptions.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

      let response = `${allOptions.length} entertainment option${allOptions.length > 1 ? 's' : ''} (closest to furthest):\n\n`;

      allOptions.forEach((e, index) => {
        response += `${index + 1}. ${e.name}`;
        if (e.distanceText) response += ` - ${e.distanceText} away`;
        response += `\n   ${e.description || 'Entertainment'}\n\n`;
      });

      return response;
    }

    return "I don't have entertainment listings right now.";
  }

  giveRecommendation() {
    if (typeof allBusinesses === 'undefined') {
      return "I can help you find great places! What are you looking for - food, activities, or things to do?";
    }

    const restaurants = allBusinesses.filter(b => b.category === 'restaurants');
    const activities = allBusinesses.filter(b => b.category === 'activities');
    const parks = allBusinesses.filter(b => b.category === 'parks');

    // Sort by distance
    restaurants.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
    activities.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    // Count what we have
    const totalCount = restaurants.length + activities.length + parks.length;

    if (totalCount === 0) {
      return "I'm still loading my directory. What are you interested in?";
    }

    // Ask what they're interested in
    let response = `I have ${restaurants.length} restaurants, ${activities.length} activities, and ${parks.length} parks in my directory. `;

    if (restaurants.length > 0) {
      response += `The closest restaurant is ${restaurants[0].name} at ${restaurants[0].distanceText}. `;
    }

    response += "What are you in the mood for?";
    return response;
  }

  /**
   * Get user's saved favorites
   */
  getFavorites() {
    // Check if favorites manager is available
    if (typeof favoritesManager === 'undefined') {
      return "The favorites feature is not available right now.";
    }

    const count = favoritesManager.getCount();

    if (count === 0) {
      return "You haven't saved any places yet. When you find places you like, tap the heart icon to save them to your favorites!";
    }

    const favorites = favoritesManager.getFavoriteBusinesses();

    // Group by category
    const byCategory = {};
    favorites.forEach(b => {
      if (!byCategory[b.category]) {
        byCategory[b.category] = [];
      }
      byCategory[b.category].push(b);
    });

    let response = `You have ${count} saved place${count !== 1 ? 's' : ''}:\n\n`;

    // List by category with distances
    for (const [category, businesses] of Object.entries(byCategory)) {
      response += `${category}:\n`;

      // Sort by distance
      businesses.sort((a, b) => {
        const distA = a.distance || 999999;
        const distB = b.distance || 999999;
        return distA - distB;
      });

      businesses.forEach(b => {
        response += `• ${b.name}`;
        if (b.distanceText) {
          response += ` - ${b.distanceText} away`;
        }
        response += `\n`;
      });

      response += `\n`;
    }

    // No follow-up questions - just present the data
    return response.trim();
  }

  // Clean text for speech - remove markdown and formatting symbols
  cleanTextForSpeech(text) {
    let cleaned = text;

    // Remove markdown headers (##, ###, etc.) - must be first
    cleaned = cleaned.replace(/#+\s*/g, '');

    // Remove markdown bold (**text** or __text__)
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');

    // Remove markdown italic (*text* or _text_)
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

    // Remove markdown code blocks (```text```)
    cleaned = cleaned.replace(/```[^`]*```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

    // Remove list numbers (1., 2., etc.) anywhere
    cleaned = cleaned.replace(/\d+\.\s+/g, '');

    // Remove bullet points (-, •, *, etc.)
    cleaned = cleaned.replace(/[-•*]\s+/g, '');

    // Remove markdown links [text](url) - keep just text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove any remaining asterisks or underscores
    cleaned = cleaned.replace(/[\*_]/g, '');

    // Remove any hash symbols
    cleaned = cleaned.replace(/#/g, '');

    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Clean up multiple newlines and convert to periods
    cleaned = cleaned.replace(/\n+/g, '. ');

    // Clean up multiple periods
    cleaned = cleaned.replace(/\.+/g, '.');

    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  speak(text) {
    // Clean the text before speaking (remove markdown and formatting)
    const cleanedText = this.cleanTextForSpeech(text);

    // Use enhanced voice manager if available
    if (this.voiceManager) {
      this.voiceManager.speak(
        cleanedText,
        // onStart
        () => {
          this.isSpeaking = true;
          this.updateUI('speaking');
        },
        // onEnd
        () => {
          this.isSpeaking = false;

          // In continuous mode, restart listening after speaking
          if (this.continuousMode) {
            this.shouldRestartListening = true;
            setTimeout(() => {
              if (this.continuousMode && !this.isListening && !this.isSpeaking) {
                console.log('Restarting listening after speech...');
                try {
                  this.recognition.start();
                } catch (error) {
                  console.log('Could not restart listening:', error);
                  this.updateUI('idle');
                }
              }
            }, 500);
          } else {
            this.updateUI('idle');
          }
        },
        // onError
        (error) => {
          console.error('Speech synthesis error:', error);
          this.isSpeaking = false;

          // Try to restart listening even after error in continuous mode
          if (this.continuousMode) {
            this.shouldRestartListening = true;
            setTimeout(() => {
              if (this.continuousMode && !this.isListening) {
                try {
                  this.recognition.start();
                } catch (e) {
                  console.log('Could not restart after error:', e);
                }
              }
            }, 500);
          } else {
            this.updateUI('idle');
          }
        }
      );
    } else {
      // Fallback to basic speech synthesis
      const synthesis = window.speechSynthesis;
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.updateUI('speaking');
      };

      utterance.onend = () => {
        this.isSpeaking = false;

        // In continuous mode, restart listening after speaking
        if (this.continuousMode) {
          this.shouldRestartListening = true;
          setTimeout(() => {
            if (this.continuousMode && !this.isListening && !this.isSpeaking) {
              console.log('Restarting listening after speech...');
              try {
                this.recognition.start();
              } catch (error) {
                console.log('Could not restart listening:', error);
                this.updateUI('idle');
              }
            }
          }, 500);
        } else {
          this.updateUI('idle');
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.isSpeaking = false;

        // Try to restart listening even after error in continuous mode
        if (this.continuousMode) {
          this.shouldRestartListening = true;
          setTimeout(() => {
            if (this.continuousMode && !this.isListening) {
              try {
                this.recognition.start();
              } catch (e) {
                console.log('Could not restart after error:', e);
              }
            }
          }, 500);
        } else {
          this.updateUI('idle');
        }
      };

      synthesis.speak(utterance);
    }
  }

  // ======================
  // ACTION HANDLERS
  // ======================

  handleCallAction(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which business would you like to call? Please tell me which one you're interested in.";
    }

    if (!business.phone) {
      return `${business.name} doesn't have a phone number listed. Would you like their website or directions instead?`;
    }

    return `You can call ${business.name} at ${business.phone}. Would you like me to help with anything else?`;
  }

  handleDirectionsAction(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which business would you like directions to? Please tell me which one.";
    }

    if (!business.address) {
      return `I don't have the exact address for ${business.name}, but it's ${business.distanceText} away.`;
    }

    return `${business.name} is at ${business.address}, about ${business.distanceText} away. Opening maps now...`;
  }

  handleHoursAction(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which business's hours would you like to know? Please tell me which one.";
    }

    if (!business.hours) {
      return `I don't have the hours for ${business.name}. You can call them at ${business.phone || 'their listed number'} to confirm hours.`;
    }

    return `${business.name} is open ${business.hours}. Anything else you'd like to know?`;
  }

  handleWebsiteAction(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which business's website would you like? Please tell me which one.";
    }

    if (!business.website) {
      return `${business.name} doesn't have a website listed. Would you like their phone number or directions instead?`;
    }

    return `${business.name}'s website is ${business.website}. Opening it now...`;
  }

  handleDetailsAction(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which business would you like more details about? Please tell me which one.";
    }

    let details = `**${business.name}**\n\n`;

    if (business.description) {
      details += `${business.description}\n\n`;
    }

    if (business.rating) {
      details += `⭐ Rating: ${business.rating}\n`;
    }

    if (business.priceLevel) {
      details += `💰 Price: ${business.priceLevel}\n`;
    }

    if (business.hours) {
      details += `🕐 Hours: ${business.hours}\n`;
    }

    if (business.phone) {
      details += `📞 Phone: ${business.phone}\n`;
    }

    if (business.address) {
      details += `📍 Address: ${business.address}\n`;
    }

    if (business.tags && business.tags.length > 0) {
      details += `\n🏷️ Features: ${business.tags.join(', ')}`;
    }

    return details;
  }

  // ======================
  // DATA QUERY HANDLERS
  // ======================

  handleMenuQuery(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which restaurant's menu would you like to see? Please tell me which one.";
    }

    if (!business.menu || business.menu.length === 0) {
      return `${business.name} doesn't have a menu listed yet. You can call them at ${business.phone || 'their number'} or check their website.`;
    }

    // Check if they're asking about a specific item
    const query = intent.fullText.toLowerCase();
    let filteredMenu = business.menu;

    // Filter by category if mentioned
    if (query.includes('lunch')) {
      filteredMenu = business.menu.filter(item => item.category && item.category.toLowerCase().includes('lunch'));
    } else if (query.includes('dinner')) {
      filteredMenu = business.menu.filter(item => item.category && item.category.toLowerCase().includes('dinner'));
    } else if (query.includes('breakfast') || query.includes('brunch')) {
      filteredMenu = business.menu.filter(item => item.category && (item.category.toLowerCase().includes('breakfast') || item.category.toLowerCase().includes('brunch')));
    } else if (query.includes('appetizer')) {
      filteredMenu = business.menu.filter(item => item.type && item.type.toLowerCase().includes('appetizer'));
    } else if (query.includes('entree') || query.includes('main')) {
      filteredMenu = business.menu.filter(item => item.type && item.type.toLowerCase().includes('entree'));
    } else if (query.includes('seafood')) {
      filteredMenu = business.menu.filter(item => item.dietary && item.dietary.includes('Seafood') || item.description && item.description.toLowerCase().includes('seafood'));
    }

    if (filteredMenu.length === 0) {
      return `${business.name} has ${business.menu.length} items on their menu, but none match what you're looking for. Would you like to see their full menu?`;
    }

    let response = `**${business.name} Menu** (${filteredMenu.length} items):\n\n`;

    // Show up to 5 items
    const itemsToShow = filteredMenu.slice(0, 5);
    itemsToShow.forEach(item => {
      const parsed = this.parseMenuItem(item);
      response += `• ${parsed.name} - ${parsed.price}\n`;
      if (parsed.description) {
        response += `  ${parsed.description}\n`;
      }
    });

    if (filteredMenu.length > 5) {
      response += `\n...and ${filteredMenu.length - 5} more items. Click their profile to see the full menu!`;
    }

    return response;
  }

  handleDrinksQuery(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which place's drinks would you like to see? Please tell me which one.";
    }

    if (!business.drinks || business.drinks.length === 0) {
      return `${business.name} doesn't have a drink menu listed yet.`;
    }

    const query = intent.fullText.toLowerCase();
    let filteredDrinks = business.drinks;

    // Filter by type
    if (query.includes('beer')) {
      filteredDrinks = business.drinks.filter(drink => drink.type && drink.type.toLowerCase().includes('beer'));
    } else if (query.includes('wine')) {
      filteredDrinks = business.drinks.filter(drink => drink.type && drink.type.toLowerCase().includes('wine'));
    } else if (query.includes('cocktail') || query.includes('mixed drink')) {
      filteredDrinks = business.drinks.filter(drink => drink.type && drink.type.toLowerCase().includes('cocktail'));
    }

    if (filteredDrinks.length === 0) {
      return `${business.name} has ${business.drinks.length} drinks, but none match that type.`;
    }

    let response = `**${business.name} Drinks** (${filteredDrinks.length} items):\n\n`;

    const drinksToShow = filteredDrinks.slice(0, 5);
    drinksToShow.forEach(drink => {
      const parsed = this.parseMenuItem(drink);
      response += `• ${parsed.name} - ${parsed.price}\n`;
      if (parsed.description) {
        response += `  ${parsed.description}\n`;
      }
    });

    if (filteredDrinks.length > 5) {
      response += `\n...and ${filteredDrinks.length - 5} more drinks!`;
    }

    return response;
  }

  handleSpecialsQuery(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which place's specials would you like to see? Let me know which business you're asking about.";
    }

    // Check for happy hour specials
    if (business.happyHours && business.happyHours.length > 0) {
      let response = `**${business.name} Happy Hours:**\n`;
      if (business.happyHour) {
        response += `�� ${business.happyHour}\n\n`;
      }

      business.happyHours.forEach(special => {
        response += `• ${special.name}\n`;
        if (special.description) {
          response += `  ${special.description}\n`;
        }
      });

      return response;
    }

    // Check for other specials in menu (marked as specials)
    if (business.menu && business.menu.length > 0) {
      const specials = business.menu.filter(item =>
        item.category && (item.category.toLowerCase().includes('special') || item.category.toLowerCase().includes('happy hour'))
      );

      if (specials.length > 0) {
        let response = `**${business.name} Specials:**\n\n`;
        specials.slice(0, 5).forEach(item => {
          response += `• ${item.name} - ${item.price}\n`;
          if (item.description) {
            response += `  ${item.description}\n`;
          }
        });
        return response;
      }
    }

    return `${business.name} doesn't have specials listed right now. Would you like to see their menu or events?`;
  }

  handleEventsQuery(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which place's events would you like to see? Let me know which business.";
    }

    if (!business.events || business.events.length === 0) {
      return `${business.name} doesn't have any upcoming events listed.`;
    }

    let response = `**${business.name} Events:**\n\n`;

    // Show up to 3 events
    const eventsToShow = business.events.slice(0, 3);
    eventsToShow.forEach(event => {
      response += `🎵 ${event.name || event.title}\n`;
      if (event.day || event.date) {
        response += `   ${event.day || event.date}`;
        if (event.time || event.startTime) {
          response += ` at ${event.time || event.startTime}`;
        }
        response += `\n`;
      }
      if (event.description) {
        response += `   ${event.description}\n`;
      }
      if (event.price) {
        response += `   ${event.price}\n`;
      }
      response += `\n`;
    });

    if (business.events.length > 3) {
      response += `...and ${business.events.length - 3} more events! Click their profile to see all events.`;
    }

    return response;
  }

  handlePricesQuery(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which place's prices would you like to know about?";
    }

    let response = `**${business.name} Pricing:**\n\n`;

    if (business.priceLevel) {
      response += `💰 Price Level: ${business.priceLevel}\n`;
    }

    // Show sample prices from menu
    if (business.menu && business.menu.length > 0) {
      response += `\n**Sample Menu Prices:**\n`;
      const samples = business.menu.slice(0, 3);
      samples.forEach(item => {
        const parsed = this.parseMenuItem(item);
        response += `• ${parsed.name}: ${parsed.price}\n`;
      });
    }

    // Show drink prices
    if (business.drinks && business.drinks.length > 0) {
      response += `\n**Sample Drink Prices:**\n`;
      const samples = business.drinks.slice(0, 3);
      samples.forEach(drink => {
        const parsed = this.parseMenuItem(drink);
        response += `• ${parsed.name}: ${parsed.price}\n`;
      });
    }

    if (!business.priceLevel && (!business.menu || business.menu.length === 0)) {
      return `I don't have price information for ${business.name}. You can call them at ${business.phone || 'their number'} to ask.`;
    }

    return response;
  }

  handleDescriptionQuery(intent) {
    const business = this.getLastShownBusiness();
    if (!business) {
      return "Which business would you like to know more about?";
    }

    let response = `**About ${business.name}:**\n\n`;

    if (business.description) {
      // Extract relevant parts based on query
      const query = intent.fullText.toLowerCase();
      const description = business.description;

      // If asking about specific aspect, try to find relevant sentences
      if (query.includes('food') || query.includes('menu')) {
        const sentences = description.split(/[.!?]+/);
        const foodSentences = sentences.filter(s =>
          s.toLowerCase().includes('food') ||
          s.toLowerCase().includes('menu') ||
          s.toLowerCase().includes('dish') ||
          s.toLowerCase().includes('cuisine')
        );
        if (foodSentences.length > 0) {
          response += foodSentences.join('. ') + '.';
        } else {
          response += description;
        }
      } else if (query.includes('view') || query.includes('location')) {
        const sentences = description.split(/[.!?]+/);
        const viewSentences = sentences.filter(s =>
          s.toLowerCase().includes('view') ||
          s.toLowerCase().includes('water') ||
          s.toLowerCase().includes('beach') ||
          s.toLowerCase().includes('located')
        );
        if (viewSentences.length > 0) {
          response += viewSentences.join('. ') + '.';
        } else {
          response += description;
        }
      } else {
        response += description;
      }
    } else {
      response += "No description available.";
    }

    if (business.tags && business.tags.length > 0) {
      response += `\n\n🏷️ **Features:** ${business.tags.join(', ')}`;
    }

    return response;
  }

  // Get the last business shown to the user (for follow-up questions)
  getLastShownBusiness() {
    if (this.conversationContext.lastShownBusinesses && this.conversationContext.lastShownBusinesses.length > 0) {
      // Return the first one shown (most relevant)
      return this.conversationContext.lastShownBusinesses[0];
    }
    return null;
  }

  // ========================================
  // PDF INTENT HANDLER METHODS
  // Based on "0. Global narrowing logic (always allowed).pdf"
  // ========================================

  /**
   * Convert "$" symbols to "dollars" for speech output
   * Per PDF requirements
   */
  convertPricesToDollars(text) {
    // Replace price symbols with words
    text = text.replace(/\$\$\$\$/g, 'very high-end');
    text = text.replace(/\$\$\$/g, 'higher-end');
    text = text.replace(/\$\$/g, 'moderate');
    text = text.replace(/\$/g, 'budget');

    // Replace specific dollar amounts like "$10" with "10 dollars"
    text = text.replace(/\$(\d+)/g, '$1 dollars');

    return text;
  }

  /**
   * Generate smart follow-up questions based on search results
   * Helps narrow down exactly what the user wants
   */
  generateFollowUpQuestion(intent, results) {
    if (!results || results.length === 0) return '';

    const intentType = intent.type;

    // Generate 1-2 relevant follow-up questions based on intent
    switch(intentType) {
      case 'find_crab_legs':
        return "\n\nWould you like me to show you which ones have all-you-can-eat deals? Or do you want to know about pricing and portion sizes?";

      case 'find_oysters':
        if (!intent.style) {
          return "\n\nWould you prefer raw oysters on the half shell, char-grilled, or fried?";
        }
        return "\n\nWant to know which places have oyster happy hour specials?";

      case 'find_fish':
        return "\n\nWould you like me to check if any of these have daily specials, or would you like to know about their sides and preparation styles?";

      case 'find_bushwackers':
        return "\n\nWant to know which spot makes the strongest ones, or which has the best views?";

      case 'find_romantic':
        return "\n\nWould you like me to narrow it down to waterfront options, or show you places with live music?";

      case 'find_family':
        if (!this.conversationContext.kidsAgeKnown) {
          return "\n\nHow old are your kids? I can find places with play areas for little ones, or more sophisticated options for teens.";
        }
        return "\n\nWould you like to know which ones have kids-eat-free nights or special kids menus?";

      case 'find_happy_hour':
        return "\n\nAre you looking for food specials, drink specials, or both? And what time works best for you?";

      case 'find_all_you_can_eat':
        return "\n\nAre you specifically looking for seafood, or are you open to other options like pizza or Asian buffets?";

      case 'find_breakfast':
        return "\n\nAre you in the mood for a classic Southern breakfast, healthy options, or something beachy like a breakfast burrito?";

      case 'find_sports_bar':
        return "\n\nAre you watching a specific game today? I can check which bars are showing it and have the best game day specials.";

      case 'find_restaurant':
        const hasMultipleTypes = results.some(r => r.cuisine !== results[0].cuisine);
        if (hasMultipleTypes) {
          return "\n\nI found several different types. Would you like me to narrow it down by cuisine type, price range, or location?";
        }
        return "\n\nWant to know about their specialties, happy hour deals, or which ones take reservations?";

      default:
        return "\n\nWould you like more details about any of these, or should I suggest similar options?";
    }
  }

  /**
   * Generate smart suggestions for alternative options
   * Offers proactive ideas based on the current search
   */
  generateSmartSuggestions(intent) {
    const suggestions = [];

    switch(intent.type) {
      case 'find_crab_legs':
        suggestions.push("If you're into seafood, I can also show you the best places for oysters or fresh grouper");
        suggestions.push("Want to know about seafood buffets with multiple options?");
        break;

      case 'find_romantic':
        suggestions.push("I can also find sunset dining spots if you want spectacular views");
        suggestions.push("Looking for romantic activities after dinner, like moonlight cruises?");
        break;

      case 'find_family':
        suggestions.push("Want to know about family-friendly activities nearby after you eat?");
        suggestions.push("I can show you places with outdoor seating where kids can run around");
        break;

      case 'find_happy_hour':
        suggestions.push("I can also find reverse happy hours or late-night deals if those times work better");
        break;
    }

    if (suggestions.length > 0) {
      return "\n\n💡 " + suggestions[Math.floor(Math.random() * suggestions.length)];
    }
    return '';
  }

  /**
   * 2A - Find Crab Legs (PDF Page 3)
   * Query: 3_ALL_MENU_ITEMS for crab legs
   */
  findCrabLegs(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find crab legs for you.";
    }

    // Search menu items for crab legs
    let results = [];
    allBusinesses.forEach(business => {
      if (business.menu && business.menu.length > 0) {
        const crabItems = business.menu.filter(item =>
          (item.name && item.name.toLowerCase().includes('crab legs')) ||
          (item.name && (item.name.toLowerCase().includes('snow crab') || item.name.toLowerCase().includes('king crab'))) ||
          (item.description && item.description.toLowerCase().includes('crab legs'))
        );

        if (crabItems.length > 0) {
          results.push({
            business: business,
            items: crabItems,
            isAYCE: business.specials?.some(s => s.toLowerCase().includes('all you can eat') && s.toLowerCase().includes('crab'))
          });
        }
      }
    });

    // Sort by distance
    results.sort((a, b) => (a.business.distance || 999999) - (b.business.distance || 999999));

    if (results.length === 0) {
      return "I don't see crab legs on any menus right now. Would you like me to suggest some seafood restaurants you can call to ask?";
    }

    // Show top 2-3 options
    const showCount = Math.min(3, results.length);
    this.displayBusinessCards(results.slice(0, showCount).map(r => r.business));
    this.conversationContext.lastShownBusinesses = results.slice(0, showCount).map(r => r.business);

    let response = `Found ${results.length} place${results.length > 1 ? 's' : ''} with crab legs:\n\n`;

    results.slice(0, showCount).forEach((result, idx) => {
      const b = result.business;
      response += `${idx + 1}. ${b.name} – ${b.location || b.city || 'Orange Beach'}, `;

      // Add AYCE info if available
      if (result.isAYCE) {
        response += 'all-you-can-eat crab legs, ';
      } else {
        response += 'plate of crab legs, ';
      }

      // Add price info
      response += `${b.priceLevel || 'moderate'} prices`;
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    // Convert $ to "dollars" for speech
    response = this.convertPricesToDollars(response);

    // Add smart follow-up question
    response += this.generateFollowUpQuestion(intent, results);

    // Add smart suggestions
    response += this.generateSmartSuggestions(intent);

    return response;
  }

  /**
   * 2B - Find Oysters (PDF Page 3-4)
   * Query: 3_ALL_MENU_ITEMS for oysters by style
   */
  findOysters(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find oysters for you.";
    }

    const style = intent.style; // raw, chargrilled, fried, or null

    // Search menu items for oysters
    let results = [];
    allBusinesses.forEach(business => {
      if (business.menu && business.menu.length > 0) {
        let oysterItems = business.menu.filter(item =>
          (item.name && item.name.toLowerCase().includes('oyster')) ||
          (item.description && item.description.toLowerCase().includes('oyster'))
        );

        // Filter by style if specified
        if (style && oysterItems.length > 0) {
          oysterItems = oysterItems.filter(item => {
            const text = `${item.name} ${item.description}`.toLowerCase();
            if (style === 'raw') return text.includes('raw') || text.includes('half shell');
            if (style === 'chargrilled') return text.includes('chargrilled') || text.includes('char');
            if (style === 'fried') return text.includes('fried');
            return true;
          });
        }

        if (oysterItems.length > 0) {
          results.push({
            business: business,
            items: oysterItems
          });
        }
      }
    });

    // Sort by distance
    results.sort((a, b) => (a.business.distance || 999999) - (b.business.distance || 999999));

    if (results.length === 0) {
      // If no matches with style, ask for clarification
      if (!style) {
        this.conversationContext.awaitingClarification = true;
        this.conversationContext.clarificationFor = 'oyster_style';
        return "Are you looking for raw oysters on the half shell, chargrilled oysters, or fried oysters?";
      }
      return `I don't see ${style} oysters on menus right now. Would you like to try a different style?`;
    }

    // Show top 2-3 options
    const showCount = Math.min(3, results.length);
    this.displayBusinessCards(results.slice(0, showCount).map(r => r.business));
    this.conversationContext.lastShownBusinesses = results.slice(0, showCount).map(r => r.business);

    let response = `Found ${results.length} place${results.length > 1 ? 's' : ''} with ${style || ''} oysters:\n\n`;

    results.slice(0, showCount).forEach((result, idx) => {
      const b = result.business;
      const styleText = style ? `${style} oysters` : 'oysters';
      response += `${idx + 1}. ${b.name} – ${styleText} in ${b.location || b.city || 'Orange Beach'}, `;

      // Add vibe
      const isWaterfront = b.tags && b.tags.some(t => t.toLowerCase().includes('waterfront'));
      const isOysterBar = b.tags && b.tags.some(t => t.toLowerCase().includes('oyster bar') || t.toLowerCase().includes('raw bar'));
      if (isOysterBar) response += 'oyster bar, ';
      else if (isWaterfront) response += 'waterfront vibe, ';
      else response += 'coastal vibe, ';

      response += `${b.priceLevel || 'moderate'} prices`;
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    response = this.convertPricesToDollars(response);
    return response;
  }

  /**
   * 2C - Find Fish by Type (PDF Page 4)
   * Query: 3_ALL_MENU_ITEMS for specific fish + prep style + spice
   */
  findFishByType(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find that fish for you.";
    }

    const fishType = intent.fishType;
    const prepStyle = intent.prepStyle; // fried, grilled, blackened
    const spiceLevel = intent.spiceLevel; // mild, medium, hot

    // Search menu items for this fish type
    let results = [];
    allBusinesses.forEach(business => {
      if (business.menu && business.menu.length > 0) {
        let fishItems = business.menu.filter(item => {
          const text = `${item.name} ${item.description}`.toLowerCase();
          return text.includes(fishType);
        });

        // Filter by prep style if specified
        if (prepStyle && fishItems.length > 0) {
          fishItems = fishItems.filter(item => {
            const text = `${item.name} ${item.description}`.toLowerCase();
            return text.includes(prepStyle);
          });
        }

        // Filter by spice level if available in metadata
        if (spiceLevel && fishItems.length > 0) {
          fishItems = fishItems.filter(item => {
            if (item.spice_level) {
              return item.spice_level.toLowerCase() === spiceLevel;
            }
            // Fallback: check description for spice keywords
            const text = `${item.name} ${item.description}`.toLowerCase();
            if (spiceLevel === 'mild') return !text.includes('spicy') && !text.includes('hot');
            if (spiceLevel === 'hot') return text.includes('spicy') || text.includes('hot');
            return true;
          });
        }

        if (fishItems.length > 0) {
          results.push({
            business: business,
            items: fishItems
          });
        }
      }
    });

    // Sort by distance
    results.sort((a, b) => (a.business.distance || 999999) - (b.business.distance || 999999));

    if (results.length === 0) {
      // Ask for clarification if no prep style specified
      if (!prepStyle) {
        this.conversationContext.awaitingClarification = true;
        this.conversationContext.clarificationFor = 'fish_prep';
        return "Do you want it fried, grilled, or blackened? And do you want something mild, with just a little kick, or pretty spicy?";
      }
      return `I don't see ${prepStyle} ${fishType} on menus right now. Would you like a different preparation?`;
    }

    // Show top 2-3 options
    const showCount = Math.min(3, results.length);
    this.displayBusinessCards(results.slice(0, showCount).map(r => r.business));
    this.conversationContext.lastShownBusinesses = results.slice(0, showCount).map(r => r.business);

    let response = `Found ${results.length} place${results.length > 1 ? 's' : ''} with ${prepStyle || ''} ${fishType}:\n\n`;

    results.slice(0, showCount).forEach((result, idx) => {
      const b = result.business;
      const dishName = result.items[0].name;
      const spiceText = spiceLevel ? `, ${spiceLevel} spice` : '';
      response += `${idx + 1}. ${b.name} – ${dishName} in ${b.location || b.city || 'Orange Beach'}${spiceText}, coastal vibe, ${b.priceLevel || 'moderate'} prices`;
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    // Offer mild alternative if they want no spice
    if (spiceLevel === 'hot' && results.length > 0) {
      response += "\nWant a mild option instead? Just ask!";
    }

    response = this.convertPricesToDollars(response);
    return response;
  }

  /**
   * 6A - Find Bushwackers (PDF Page 9)
   * Query: 4_ALL_DRINKS for bushwackers
   */
  findBushwackers(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find bushwackers for you.";
    }

    // Search drinks for bushwackers
    let results = [];
    allBusinesses.forEach(business => {
      if (business.drinks && business.drinks.length > 0) {
        const bushwackerDrinks = business.drinks.filter(drink =>
          (drink.name && drink.name.toLowerCase().includes('bushwacker')) ||
          (drink.name && drink.name.toLowerCase().includes('bushwhacker')) ||
          (drink.description && drink.description.toLowerCase().includes('bushwacker'))
        );

        if (bushwackerDrinks.length > 0) {
          results.push({
            business: business,
            drinks: bushwackerDrinks
          });
        }
      }
    });

    // Sort by distance
    results.sort((a, b) => (a.business.distance || 999999) - (b.business.distance || 999999));

    if (results.length === 0) {
      return "I don't see bushwackers on drink menus right now. Most beach bars serve them though - would you like me to suggest some waterfront bars you can ask?";
    }

    // Show top 2-3 options
    const showCount = Math.min(3, results.length);
    this.displayBusinessCards(results.slice(0, showCount).map(r => r.business));
    this.conversationContext.lastShownBusinesses = results.slice(0, showCount).map(r => r.business);

    let response = `Found ${results.length} place${results.length > 1 ? 's' : ''} with bushwackers:\n\n`;

    results.slice(0, showCount).forEach((result, idx) => {
      const b = result.business;
      const isBeachBar = b.tags && b.tags.some(t => t.toLowerCase().includes('beach bar'));
      const isWaterfront = b.tags && b.tags.some(t => t.toLowerCase().includes('waterfront'));

      response += `${idx + 1}. ${b.name} – famous for their bushwackers, `;
      if (isWaterfront || isBeachBar) response += 'waterfront ';
      response += `in ${b.location || b.city || 'Orange Beach'}, `;
      response += isBeachBar ? 'beach bar vibe' : 'more of a bar vibe';
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    response = this.convertPricesToDollars(response);
    return response;
  }

  /**
   * 4A - Find Romantic Spots (PDF Page 6-7)
   * Query: 1_ALL_BUSINESS_INFO for romantic tags
   */
  findRomanticSpots(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find romantic spots for you.";
    }

    // Set context for smart filtering
    this.conversationContext.userPreferences.occasion = 'date';

    // Filter for romantic restaurants
    let restaurants = allBusinesses.filter(b => {
      if (b.category !== 'restaurants') return false;

      // Check tags for romantic indicators
      const hasRomanticTags = b.tags && b.tags.some(t => {
        const tag = t.toLowerCase();
        return tag.includes('romantic') || tag.includes('date night') ||
               tag.includes('upscale') || tag.includes('fine dining') ||
               tag.includes('quiet') || tag.includes('intimate');
      });

      // Check price level ($$-$$$$ for date night)
      const isPriceAppropriate = !b.priceLevel || b.priceLevel !== '$';

      // Exclude fast food and coffee shops
      const isCoffeeShop = b.category === 'coffee' ||
                           (b.tags && b.tags.some(t => t.toLowerCase().includes('coffee'))) ||
                           (b.name && b.name.toLowerCase().includes('coffee'));
      const isFastFood = b.tags && b.tags.some(t => t.toLowerCase().includes('fast food'));

      return (hasRomanticTags || isPriceAppropriate) && !isCoffeeShop && !isFastFood;
    });

    // Sort by rating and price level (higher-end first for dates)
    restaurants.sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      if (ratingB !== ratingA) return ratingB - ratingA;

      // Then by distance
      return (a.distance || 999999) - (b.distance || 999999);
    });

    if (restaurants.length === 0) {
      return "Let me find you a nice romantic spot. Do you want something on the water with a view, or you don't care as long as the food and atmosphere are nice?";
    }

    // Show top 2-3
    const showCount = Math.min(3, restaurants.length);
    this.displayBusinessCards(restaurants.slice(0, showCount));
    this.conversationContext.lastShownBusinesses = restaurants.slice(0, showCount);

    let response = `Perfect date night spots:\n\n`;

    restaurants.slice(0, showCount).forEach((b, idx) => {
      const isWaterfront = b.tags && b.tags.some(t => t.toLowerCase().includes('waterfront'));
      const isUpscale = b.priceLevel === '$$$' || b.priceLevel === '$$$$';

      response += `${idx + 1}. ${b.name} – `;
      if (isUpscale) response += 'upscale ';
      response += `${b.cuisine || 'restaurant'}`;
      if (isWaterfront) response += ' on the water';
      response += ` in ${b.location || b.city || 'Orange Beach'}, `;
      response += `${b.priceLevel || 'higher-end'}, great for anniversaries`;
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    response += "\nWould you like me to narrow it down to waterfront options?";
    response = this.convertPricesToDollars(response);
    return response;
  }

  /**
   * 4B - Find Family-Friendly (PDF Page 7)
   * Query: 1_ALL_BUSINESS_INFO for family-friendly tags
   */
  findFamilyFriendly(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find family-friendly places for you.";
    }

    // Filter for family-friendly restaurants
    let restaurants = allBusinesses.filter(b => {
      if (b.category !== 'restaurants') return false;

      // Check tags for family indicators
      const hasFamilyTags = b.tags && b.tags.some(t => {
        const tag = t.toLowerCase();
        return tag.includes('family') || tag.includes('kids menu') ||
               tag.includes('play area') || tag.includes('arcade') ||
               tag.includes('casual');
      });

      // Check for kids menu in menu items
      const hasKidsMenu = b.menu && b.menu.some(item =>
        item.category && item.category.toLowerCase().includes('kids')
      );

      return hasFamilyTags || hasKidsMenu;
    });

    // Sort by distance
    restaurants.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    if (restaurants.length === 0) {
      this.conversationContext.awaitingClarification = true;
      this.conversationContext.clarificationFor = 'family_preferences';
      return "I'd love to help! Do you want something on the water or just easy parking and a kids menu?";
    }

    // Show top 2-3
    const showCount = Math.min(3, restaurants.length);
    this.displayBusinessCards(restaurants.slice(0, showCount));
    this.conversationContext.lastShownBusinesses = restaurants.slice(0, showCount);

    let response = `Family-friendly spots:\n\n`;

    restaurants.slice(0, showCount).forEach((b, idx) => {
      const hasKidsMenu = b.menu && b.menu.some(item =>
        item.category && item.category.toLowerCase().includes('kids')
      );
      const hasPlayArea = b.tags && b.tags.some(t => t.toLowerCase().includes('play area') || t.toLowerCase().includes('arcade'));
      const isWaterfront = b.tags && b.tags.some(t => t.toLowerCase().includes('waterfront'));

      response += `${idx + 1}. ${b.name} – very kid-friendly, `;
      if (hasKidsMenu) response += 'kids menu, ';
      response += 'casual, ';
      if (hasPlayArea) response += 'games or activities, ';
      if (isWaterfront) response += 'on the water, loud enough that kids fit right in';
      else response += 'easy parking';
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    response = this.convertPricesToDollars(response);
    return response;
  }

  /**
   * 7A - Find Happy Hour (PDF Page 10-11)
   * Query: 5_ALL_HAPPY_HOUR
   */
  findHappyHour(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find happy hour deals for you.";
    }

    // Filter businesses with happy hour
    let results = allBusinesses.filter(b =>
      b.happyHour || (b.happyHours && b.happyHours.length > 0)
    );

    // Sort by distance
    results.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    if (results.length === 0) {
      return "I don't have happy hour info loaded yet. Are you looking for drink specials, food specials, or both? And what area are you in?";
    }

    // Show top 2-3
    const showCount = Math.min(3, results.length);
    this.displayBusinessCards(results.slice(0, showCount));
    this.conversationContext.lastShownBusinesses = results.slice(0, showCount);

    let response = `Happy hour deals:\n\n`;

    results.slice(0, showCount).forEach((b, idx) => {
      response += `${idx + 1}. From 3 to 6 p.m., ${b.name} has `;
      if (b.happyHours && b.happyHours.length > 0) {
        const special = b.happyHours[0];
        response += `${special.description || special.name} deals`;
      } else if (b.happyHour) {
        response += `${b.happyHour}`;
      }
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    response = this.convertPricesToDollars(response);
    return response;
  }

  /**
   * 7B - Find All-You-Can-Eat (PDF Page 11)
   * Query: 7_ALL_YOU_CAN_EAT
   */
  findAllYouCanEat(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find all-you-can-eat options for you.";
    }

    // Filter businesses with AYCE specials
    let results = allBusinesses.filter(b =>
      b.specials && b.specials.some(s => s.toLowerCase().includes('all you can eat'))
    );

    // Sort by distance
    results.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    if (results.length === 0) {
      return "What day are you planning to go, and do you want shrimp, crab, or something else?";
    }

    // Show top 2-3
    const showCount = Math.min(3, results.length);
    this.displayBusinessCards(results.slice(0, showCount));
    this.conversationContext.lastShownBusinesses = results.slice(0, showCount);

    let response = `All-you-can-eat options:\n\n`;

    results.slice(0, showCount).forEach((b, idx) => {
      const ayceSpecial = b.specials.find(s => s.toLowerCase().includes('all you can eat'));
      response += `${idx + 1}. On [day], ${b.name} does ${ayceSpecial} in the evening, moderate to higher-end prices, gets busy`;
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    response = this.convertPricesToDollars(response);
    return response;
  }

  /**
   * 3A - Find Breakfast/Brunch (PDF Page 5-6)
   * Query: 3_ALL_MENU_ITEMS + 2_ALL_HOURS for breakfast
   */
  findBreakfast(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find breakfast spots for you.";
    }

    // Filter for breakfast/brunch places
    let restaurants = allBusinesses.filter(b => {
      // Check tags
      const hasBreakfastTag = b.tags && b.tags.some(t => {
        const tag = t.toLowerCase();
        return tag.includes('breakfast') || tag.includes('brunch') || tag.includes('coffee');
      });

      // Check menu for breakfast items
      const hasBreakfastMenu = b.menu && b.menu.some(item => {
        const category = (item.category || '').toLowerCase();
        return category.includes('breakfast') || category.includes('brunch');
      });

      // Check hours (open before 9am)
      const opensEarly = b.hours && b.hours.monday_open &&
                         parseInt(b.hours.monday_open.split(':')[0]) < 9;

      return hasBreakfastTag || hasBreakfastMenu || opensEarly;
    });

    // Sort by distance
    restaurants.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    if (restaurants.length === 0) {
      this.conversationContext.awaitingClarification = true;
      this.conversationContext.clarificationFor = 'breakfast_type';
      return "Are you looking for a big sit-down breakfast or something quick and cheap? And what area are you in?";
    }

    // Show top 2-3
    const showCount = Math.min(3, restaurants.length);
    this.displayBusinessCards(restaurants.slice(0, showCount));
    this.conversationContext.lastShownBusinesses = restaurants.slice(0, showCount);

    let response = `Breakfast spots:\n\n`;

    restaurants.slice(0, showCount).forEach((b, idx) => {
      const isBrunch = b.tags && b.tags.some(t => t.toLowerCase().includes('brunch'));
      const isCasual = !b.priceLevel || b.priceLevel === '$' || b.priceLevel === '$$';

      response += `${idx + 1}. ${b.name} – `;
      if (isBrunch) response += 'brunch with coastal dishes and mimosas, more of a sit-down vibe';
      else if (isCasual) response += `casual breakfast café in ${b.location || b.city || 'Orange Beach'}, budget-friendly, good for families`;
      else response += 'breakfast spot with good food';
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    response = this.convertPricesToDollars(response);
    return response;
  }

  /**
   * 6C - Find Sports Bar (PDF Page 10)
   * Query: 1_ALL_BUSINESS_INFO for sports bar tags
   */
  findSportsBar(intent) {
    if (typeof allBusinesses === 'undefined') {
      return "Let me find sports bars for you.";
    }

    // Filter for sports bars
    let results = allBusinesses.filter(b => {
      const hasSportsBarTag = b.tags && b.tags.some(t => {
        const tag = t.toLowerCase();
        return tag.includes('sports bar') || tag.includes('game day') || tag.includes('sports');
      });

      return hasSportsBarTag;
    });

    // Sort by distance
    results.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));

    if (results.length === 0) {
      return "Do you care more about lots of TVs and beer, or good food plus the game?";
    }

    // Show top 2-3
    const showCount = Math.min(3, results.length);
    this.displayBusinessCards(results.slice(0, showCount));
    this.conversationContext.lastShownBusinesses = results.slice(0, showCount);

    let response = `Sports bars:\n\n`;

    results.slice(0, showCount).forEach((b, idx) => {
      response += `${idx + 1}. ${b.name} – sports bar with tons of TVs, wings and burgers, casual, noisy on game days`;
      response += `\n   ${b.distanceText || 'nearby'}\n\n`;
    });

    response = this.convertPricesToDollars(response);
    return response;
  }

  // ========================================
  // END PDF INTENT HANDLER METHODS
  // ========================================
}

// Initialize assistant when page loads
let assistantInstance;
document.addEventListener('DOMContentLoaded', () => {
  assistantInstance = new VacationAssistant();
});
