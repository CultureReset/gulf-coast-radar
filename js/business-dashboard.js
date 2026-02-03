// Business Owner Dashboard - Voice-Powered Profile Management
// Uses Web Speech API for voice-to-text input

class BusinessDashboard {
  constructor() {
    this.currentBusiness = null;
    this.currentUser = null;
    this.recognition = null;
    this.currentTranscriptId = null;

    // Initialize Web Speech API
    this.initSpeechRecognition();

    // Setup event listeners
    this.setupEventListeners();

    // Check if already logged in
    this.checkSession();
  }

  /**
   * Initialize Web Speech API
   */
  initSpeechRecognition() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Browser does not support Speech Recognition');
      document.getElementById('browserWarning').style.display = 'block';
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    // Event handlers
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the current transcript
      if (this.currentTranscriptId) {
        const transcriptEl = document.getElementById(this.currentTranscriptId);
        const currentText = transcriptEl.getAttribute('data-final-text') || '';
        transcriptEl.textContent = currentText + finalTranscript + interimTranscript;
        transcriptEl.setAttribute('data-final-text', currentText + finalTranscript);
        transcriptEl.classList.remove('empty');
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.stopRecording();

      if (event.error === 'no-speech') {
        this.showError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        this.showError('Microphone access denied. Please allow microphone access.');
      } else {
        this.showError('Speech recognition error. Please try again.');
      }
    };

    this.recognition.onend = () => {
      // Reset button state when recognition ends
      this.stopRecording();
    };
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
    document.getElementById('password').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

    // Voice buttons
    document.getElementById('voiceBtn1').addEventListener('click', () => this.toggleRecording('voiceBtn1', 'transcript1'));
    document.getElementById('voiceBtn2').addEventListener('click', () => this.toggleRecording('voiceBtn2', 'transcript2'));
    document.getElementById('voiceBtn3').addEventListener('click', () => this.toggleRecording('voiceBtn3', 'transcript3'));
    document.getElementById('voiceBtn4').addEventListener('click', () => this.toggleRecording('voiceBtn4', 'transcript4'));

    // Save buttons
    document.getElementById('saveCustomPrompt').addEventListener('click', () => this.saveCustomPrompt());
    document.getElementById('saveSituation').addEventListener('click', () => this.saveSituation());
    document.getElementById('saveDailySpecial').addEventListener('click', () => this.saveDailySpecial());

    // Clear buttons
    document.getElementById('clearCustomPrompt').addEventListener('click', () => this.clearTranscript('transcript1'));
    document.getElementById('clearSituation').addEventListener('click', () => {
      this.clearTranscript('transcript2');
      this.clearTranscript('transcript3');
    });
    document.getElementById('clearDailySpecial').addEventListener('click', () => this.clearTranscript('transcript4'));

    // Square POS Integration
    document.getElementById('connectSquareBtn').addEventListener('click', () => this.connectSquare());
    document.getElementById('disconnectSquareBtn').addEventListener('click', () => this.disconnectSquare());
  }

  /**
   * Toggle voice recording
   */
  toggleRecording(buttonId, transcriptId) {
    if (!this.recognition) {
      this.showError('Voice recognition not supported in this browser');
      return;
    }

    const button = document.getElementById(buttonId);
    const buttonText = document.getElementById(`${buttonId}Text`);

    if (this.currentTranscriptId === transcriptId) {
      // Stop recording
      this.stopRecording();
    } else {
      // Stop any existing recording
      if (this.currentTranscriptId) {
        this.stopRecording();
      }

      // Start new recording
      this.currentTranscriptId = transcriptId;
      button.classList.add('recording');
      buttonText.textContent = 'Stop Recording';

      try {
        this.recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        this.stopRecording();
      }
    }
  }

  /**
   * Stop recording
   */
  stopRecording() {
    if (!this.currentTranscriptId) return;

    try {
      this.recognition.stop();
    } catch (error) {
      // Already stopped
    }

    // Find the button for this transcript
    const buttonIds = ['voiceBtn1', 'voiceBtn2', 'voiceBtn3', 'voiceBtn4'];
    const transcriptIds = ['transcript1', 'transcript2', 'transcript3', 'transcript4'];
    const index = transcriptIds.indexOf(this.currentTranscriptId);

    if (index !== -1) {
      const buttonId = buttonIds[index];
      const button = document.getElementById(buttonId);
      const buttonText = document.getElementById(`${buttonId}Text`);

      button.classList.remove('recording');

      // Set button text based on which button it is
      const buttonTexts = ['Start Speaking', 'Describe Situation', 'Describe Response', 'Update Daily Special'];
      buttonText.textContent = buttonTexts[index];
    }

    this.currentTranscriptId = null;
  }

  /**
   * Clear transcript
   */
  clearTranscript(transcriptId) {
    const transcript = document.getElementById(transcriptId);
    transcript.textContent = transcript.getAttribute('data-placeholder') || 'Your words will appear here...';
    transcript.setAttribute('data-final-text', '');
    transcript.classList.add('empty');
  }

  /**
   * Check if user is already logged in
   */
  checkSession() {
    const session = localStorage.getItem('businessSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        this.currentUser = sessionData.user;
        this.currentBusiness = sessionData.business;
        this.showDashboard();
        this.loadBusinessData();
      } catch (error) {
        console.error('Invalid session data:', error);
        localStorage.removeItem('businessSession');
      }
    }
  }

  /**
   * Handle login
   */
  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showLoginError('Please enter both email and password');
      return;
    }

    // Show loading
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading"></span> Signing in...';

    try {
      // Authenticate with Google Sheets
      const authenticated = await this.authenticateUser(email, password);

      if (authenticated) {
        // Save session
        localStorage.setItem('businessSession', JSON.stringify({
          user: this.currentUser,
          business: this.currentBusiness
        }));

        // Show dashboard
        this.showDashboard();
        this.loadBusinessData();
      } else {
        this.showLoginError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showLoginError('Login failed. Please try again.');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  }

  /**
   * Authenticate user with Google Sheets
   */
  async authenticateUser(email, password) {
    try {
      // DEMO MODE: Allow test login for Square integration testing
      if (email === 'demo@test.com' && password === 'demo123') {
        console.log('✅ Demo mode login');
        this.currentUser = {
          email: 'demo@test.com',
          name: 'Demo Business Owner'
        };
        this.currentBusiness = {
          id: 'demo-business',
          name: 'Demo Restaurant',
          businessOwnerEmail: 'demo@test.com',
          businessOwnerName: 'Demo Business Owner'
        };
        return true;
      }

      // In production, this would call your Google Apps Script API
      // For now, we'll use a mock authentication that checks Google Sheets

      // Check if sheet loader is available
      if (!window.sheetLoader) {
        console.error('Sheet loader not available');
        return false;
      }

      // Load all businesses
      await window.sheetLoader.loadAllData();
      const businesses = window.sheetLoader.getBusinesses();

      // Find business with matching email
      const business = businesses.find(b =>
        b.businessOwnerEmail && b.businessOwnerEmail.toLowerCase() === email.toLowerCase()
      );

      if (!business) {
        console.log('No business found with email:', email);
        return false;
      }

      // In production, you'd verify the hashed password
      // For now, we'll do a simple comparison (NOT SECURE - for demo only)
      // TODO: Implement proper password hashing (bcrypt) on the backend
      if (business.businessOwnerPassword === password) {
        this.currentUser = {
          email: business.businessOwnerEmail,
          name: business.businessOwnerName || 'Business Owner'
        };
        this.currentBusiness = business;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  /**
   * Show login error
   */
  showLoginError(message) {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = message;
    errorEl.style.display = 'block';

    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }

  /**
   * Show dashboard
   */
  showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';

    // Update header
    document.getElementById('ownerName').textContent = this.currentUser.name;
    document.getElementById('businessName').textContent = this.currentBusiness.name;

    // Load Square POS connection status
    this.loadSquareStatus();
  }

  /**
   * Handle logout
   */
  handleLogout() {
    localStorage.removeItem('businessSession');
    this.currentUser = null;
    this.currentBusiness = null;

    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardScreen').style.display = 'none';

    // Clear form
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
  }

  /**
   * Load business data
   */
  async loadBusinessData() {
    try {
      // Load custom AI prompt
      if (this.currentBusiness.aiCustomPrompt) {
        const transcript1 = document.getElementById('transcript1');
        transcript1.textContent = this.currentBusiness.aiCustomPrompt;
        transcript1.setAttribute('data-final-text', this.currentBusiness.aiCustomPrompt);
        transcript1.classList.remove('empty');
      }

      // Load situations
      if (this.currentBusiness.aiSituations) {
        let situations = [];
        try {
          situations = JSON.parse(this.currentBusiness.aiSituations);
        } catch (error) {
          console.error('Error parsing situations:', error);
        }
        this.renderSituations(situations);
      }

      // Load daily special
      if (this.currentBusiness.dailySpecial) {
        document.getElementById('currentSpecialDisplay').style.display = 'block';
        document.getElementById('currentSpecialText').textContent = this.currentBusiness.dailySpecial;

        if (this.currentBusiness.dailySpecialUpdatedAt) {
          const date = new Date(this.currentBusiness.dailySpecialUpdatedAt);
          document.getElementById('currentSpecialTime').textContent = date.toLocaleString();
        }
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  }

  /**
   * Render situations list
   */
  renderSituations(situations) {
    const listEl = document.getElementById('situationsList');

    if (!situations || situations.length === 0) {
      listEl.innerHTML = '<p style="color: #95a5a6; font-style: italic;">No situations added yet.</p>';
      return;
    }

    listEl.innerHTML = situations.map(situation => `
      <div class="situation-item">
        <strong>Situation: ${situation.scenario}</strong>
        <p>${situation.aiResponse}</p>
        <button onclick="businessDashboard.deleteSituation('${situation.id}')">Delete</button>
      </div>
    `).join('');
  }

  /**
   * Save custom AI prompt
   */
  async saveCustomPrompt() {
    const transcript = document.getElementById('transcript1');
    const text = transcript.getAttribute('data-final-text') || transcript.textContent;

    if (!text || transcript.classList.contains('empty')) {
      this.showError('Please record a description first');
      return;
    }

    try {
      // Update business data
      this.currentBusiness.aiCustomPrompt = text;

      // Save to Google Sheets
      await this.updateBusinessInSheets({
        aiCustomPrompt: text
      });

      this.showSuccess('AI description saved successfully!');
    } catch (error) {
      console.error('Error saving custom prompt:', error);
      this.showError('Failed to save. Please try again.');
    }
  }

  /**
   * Save situation handler
   */
  async saveSituation() {
    const transcript2 = document.getElementById('transcript2');
    const transcript3 = document.getElementById('transcript3');

    const scenario = transcript2.getAttribute('data-final-text') || transcript2.textContent;
    const response = transcript3.getAttribute('data-final-text') || transcript3.textContent;

    if (!scenario || transcript2.classList.contains('empty')) {
      this.showError('Please describe the situation first');
      return;
    }

    if (!response || transcript3.classList.contains('empty')) {
      this.showError('Please describe how the AI should respond');
      return;
    }

    try {
      // Get existing situations
      let situations = [];
      if (this.currentBusiness.aiSituations) {
        try {
          situations = JSON.parse(this.currentBusiness.aiSituations);
        } catch (error) {
          situations = [];
        }
      }

      // Add new situation
      const newSituation = {
        id: `situation-${Date.now()}`,
        scenario: scenario,
        aiResponse: response,
        createdAt: new Date().toISOString()
      };

      situations.push(newSituation);

      // Update business data
      this.currentBusiness.aiSituations = JSON.stringify(situations);

      // Save to Google Sheets
      await this.updateBusinessInSheets({
        aiSituations: JSON.stringify(situations)
      });

      // Clear transcripts
      this.clearTranscript('transcript2');
      this.clearTranscript('transcript3');

      // Refresh situations list
      this.renderSituations(situations);

      this.showSuccess('Situation added successfully!');
    } catch (error) {
      console.error('Error saving situation:', error);
      this.showError('Failed to save situation. Please try again.');
    }
  }

  /**
   * Delete situation
   */
  async deleteSituation(situationId) {
    if (!confirm('Are you sure you want to delete this situation?')) {
      return;
    }

    try {
      // Get existing situations
      let situations = [];
      if (this.currentBusiness.aiSituations) {
        situations = JSON.parse(this.currentBusiness.aiSituations);
      }

      // Remove situation
      situations = situations.filter(s => s.id !== situationId);

      // Update business data
      this.currentBusiness.aiSituations = JSON.stringify(situations);

      // Save to Google Sheets
      await this.updateBusinessInSheets({
        aiSituations: JSON.stringify(situations)
      });

      // Refresh situations list
      this.renderSituations(situations);

      this.showSuccess('Situation deleted successfully!');
    } catch (error) {
      console.error('Error deleting situation:', error);
      this.showError('Failed to delete situation. Please try again.');
    }
  }

  /**
   * Save daily special
   */
  async saveDailySpecial() {
    const transcript = document.getElementById('transcript4');
    const text = transcript.getAttribute('data-final-text') || transcript.textContent;

    if (!text || transcript.classList.contains('empty')) {
      this.showError('Please record your daily special first');
      return;
    }

    try {
      const now = new Date().toISOString();

      // Update business data
      this.currentBusiness.dailySpecial = text;
      this.currentBusiness.dailySpecialUpdatedAt = now;

      // Save to Google Sheets
      await this.updateBusinessInSheets({
        dailySpecial: text,
        dailySpecialUpdatedAt: now
      });

      // Update display
      document.getElementById('currentSpecialDisplay').style.display = 'block';
      document.getElementById('currentSpecialText').textContent = text;
      document.getElementById('currentSpecialTime').textContent = new Date(now).toLocaleString();

      // Clear transcript
      this.clearTranscript('transcript4');

      this.showSuccess('Daily special updated successfully!');
    } catch (error) {
      console.error('Error saving daily special:', error);
      this.showError('Failed to update special. Please try again.');
    }
  }

  /**
   * Update business in Google Sheets
   */
  async updateBusinessInSheets(updates) {
    // In production, this would make an API call to your Google Apps Script
    // to update the specific business row

    // For now, we'll update locally and simulate a save
    // TODO: Implement actual Google Sheets API update

    console.log('Updating business in Google Sheets:', {
      businessId: this.currentBusiness.id,
      updates: updates
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update local business object
    Object.assign(this.currentBusiness, updates);

    // Update session
    localStorage.setItem('businessSession', JSON.stringify({
      user: this.currentUser,
      business: this.currentBusiness
    }));

    // In production, you would:
    // 1. Call your Google Apps Script API endpoint
    // 2. Pass businessId and updates
    // 3. The script would update the specific row in Google Sheets
    // Example:
    // const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=updateBusiness`, {
    //   method: 'POST',
    //   body: JSON.stringify({ businessId: this.currentBusiness.id, updates })
    // });
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    successEl.textContent = '✅ ' + message;
    successEl.style.display = 'block';

    setTimeout(() => {
      successEl.style.display = 'none';
    }, 5000);
  }

  /**
   * Show error message
   */
  showError(message) {
    alert(message); // Simple alert for now
    // TODO: Add better error UI
  }

  /**
   * Connect Square POS
   */
  connectSquare() {
    if (!this.currentBusiness) {
      this.showError('No business loaded');
      return;
    }

    console.log('🔌 Connecting to Square...');

    // Initiate OAuth flow
    // Business ID is passed so we know which business is connecting
    window.squareIntegration.connectSquare(this.currentBusiness.id);
  }

  /**
   * Disconnect Square POS
   */
  async disconnectSquare() {
    if (!confirm('Are you sure you want to disconnect Square? You will need to reconnect to use POS features.')) {
      return;
    }

    console.log('🔌 Disconnecting Square...');

    // Clear Square data
    await this.updateBusinessInSheets({
      squareConnected: false,
      squareAccessToken: '',
      squareRefreshToken: '',
      squareExpiresAt: '',
      squareMerchantId: '',
      squareLocationId: '',
      squareConnectedAt: ''
    });

    // Update UI
    this.updateSquareStatus(false);

    this.showSuccess('Square disconnected successfully');
  }

  /**
   * Update Square connection status in UI
   */
  updateSquareStatus(connected, data = null) {
    const connectBtn = document.getElementById('connectSquareBtn');
    const connectedSection = document.getElementById('squareConnected');

    if (connected && data) {
      connectBtn.style.display = 'none';
      connectedSection.style.display = 'block';

      document.getElementById('merchantId').textContent = data.merchantId || 'N/A';
      document.getElementById('locationName').textContent = data.locationName || 'N/A';
      document.getElementById('connectedAt').textContent = data.connectedAt ?
        new Date(data.connectedAt).toLocaleDateString() : 'N/A';
    } else {
      connectBtn.style.display = 'flex';
      connectedSection.style.display = 'none';
    }
  }

  /**
   * Check if Square connection exists and load status
   */
  loadSquareStatus() {
    if (!this.currentBusiness) return;

    if (this.currentBusiness.squareConnected) {
      this.updateSquareStatus(true, {
        merchantId: this.currentBusiness.squareMerchantId,
        locationName: this.currentBusiness.squareLocationName || 'Main Location',
        connectedAt: this.currentBusiness.squareConnectedAt
      });
    } else {
      this.updateSquareStatus(false);
    }

    // Check if returning from Square OAuth
    const squareConnectionData = localStorage.getItem('squareConnectionData');
    if (squareConnectionData) {
      try {
        const data = JSON.parse(squareConnectionData);
        console.log('✅ Square connection completed!', data);

        // Update business data
        this.updateBusinessInSheets(data);

        // Update UI
        this.updateSquareStatus(true, {
          merchantId: data.squareMerchantId,
          locationName: data.squareLocationName || 'Main Location',
          connectedAt: data.squareConnectedAt
        });

        this.showSuccess('Square connected successfully!');

        // Clear temporary data
        localStorage.removeItem('squareConnectionData');
      } catch (error) {
        console.error('Error processing Square connection:', error);
      }
    }
  }
}

// Initialize dashboard
const businessDashboard = new BusinessDashboard();
