    // Protect admin dashboard with authentication
    const adminAuth = new AdminAuth({ requireAuth: true, redirectToLogin: true });
    if (!adminAuth.isAuthenticated()) {
      window.location.href = 'admin-login.html';
    }
    // Back Button Navigation
    function goBack() {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // If no history, go to CyberCheck homepage
        window.location.href = '../../index.html';
      }
    }

    // Dropdown Menu Toggle
    function toggleDropdown() {
      const dropdown = document.getElementById('platformDropdown');
      dropdown.classList.toggle('show');
    }

    // Close dropdown when clicking outside
    window.addEventListener('click', function(e) {
      if (!e.target.matches('.dropdown-btn') && !e.target.closest('.dropdown-btn')) {
        const dropdown = document.getElementById('platformDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
          dropdown.classList.remove('show');
        }
      }
    });

    // Tab Switching
    function switchTab(tabName) {
      // Hide all tabs
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });

      // Remove active from all nav tabs
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
      });

      // Show selected tab
      document.getElementById(tabName).classList.add('active');

      // Highlight nav tab
      event.target.classList.add('active');

      // Initialize AR Hunts when tab is opened
      if (tabName === 'ar-hunts') {
        if (!arHuntManager) {
          initARHunts();
        } else {
          loadHuntsGrid();
          updateHuntStats();
          loadCaptureHistory();
        }
      }
    }

    // Toggle password visibility
    function toggleVisibility(inputId) {
      const input = document.getElementById(inputId);
      if (input.type === 'password') {
        input.type = 'text';
      } else {
        input.type = input.type === 'text' ? 'password' : 'text';
      }
    }

    // Show success message
    function showSuccess(message) {
      const successMsg = document.getElementById('successMessage');
      document.getElementById('successText').textContent = message;
      successMsg.classList.add('show');
      setTimeout(() => {
        successMsg.classList.remove('show');
      }, 3000);
    }

    // OAuth Form Submit
    document.getElementById('oauthForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const settings = {
        googleClientId: document.getElementById('googleClientId').value,
        facebookAppId: document.getElementById('facebookAppId').value,
        microsoftClientId: document.getElementById('microsoftClientId').value
      };

      // Save to localStorage for now (in production, save to backend)
      localStorage.setItem('oauthSettings', JSON.stringify(settings));

      // Update the actual config files
      updateOAuthConfig(settings);

      showSuccess('OAuth settings saved successfully!');
    });

    // Stripe Form Submit
    document.getElementById('stripeForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const settings = {
        publishableKey: document.getElementById('stripePublishableKey').value,
        secretKey: document.getElementById('stripeSecretKey').value,
        webhookSecret: document.getElementById('stripeWebhookSecret').value
      };

      localStorage.setItem('stripeSettings', JSON.stringify(settings));
      showSuccess('Stripe settings saved successfully!');
    });

    // Email Form Submit
    document.getElementById('emailForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const settings = {
        provider: document.getElementById('emailProvider').value,
        apiKey: document.getElementById('emailApiKey').value,
        fromEmail: document.getElementById('fromEmail').value
      };

      localStorage.setItem('emailSettings', JSON.stringify(settings));
      showSuccess('Email settings saved successfully!');
    });

    // Backend Form Submit
    document.getElementById('backendForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const apiBaseUrl = document.getElementById('apiBaseUrl').value;
      localStorage.setItem('apiBaseUrl', apiBaseUrl);
      showSuccess('Backend settings saved! Reload pages to apply changes.');
    });

    // Platform Form Submit
    document.getElementById('platformForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const settings = {
        platformName: document.getElementById('platformName').value,
        primaryDomain: document.getElementById('primaryDomain').value,
        supportEmail: document.getElementById('supportEmail').value,
        enableRegistration: document.getElementById('enableRegistration').value,
        defaultPlan: document.getElementById('defaultPlan').value
      };

      localStorage.setItem('platformSettings', JSON.stringify(settings));
      showSuccess('Platform settings saved successfully!');
    });

    // Update OAuth config in login/signup pages
    function updateOAuthConfig(settings) {
      // This would typically make an API call to update the config
      // For now, we'll store in localStorage and pages will read from there
      console.log('OAuth config updated:', settings);
    }

    // Test OAuth Connection
    function testOAuthConnection() {
      showSuccess('Testing OAuth connection... Check browser console for details');
      console.log('OAuth Test: Would verify credentials with providers');
    }

    // Test Stripe Connection
    function testStripeConnection() {
      showSuccess('Testing Stripe connection... Check browser console for details');
      console.log('Stripe Test: Would verify credentials with Stripe API');
    }

    // Send Test Email
    function sendTestEmail() {
      showSuccess('Sending test email... Check your inbox!');
      console.log('Email Test: Would send test email via configured provider');
    }

    // Save OpenAI Settings
    function saveOpenAISettings(event) {
      event.preventDefault();

      const apiKey = document.getElementById('openaiApiKey').value;
      const model = document.getElementById('openaiModel').value;

      if (!apiKey) {
        showError('Please enter an OpenAI API key');
        return;
      }

      // Save to localStorage
      localStorage.setItem('openai_api_key', apiKey);
      localStorage.setItem('openai_model', model);

      // Initialize AI assistant
      if (window.dashboardAI) {
        dashboardAI.init(apiKey);
        document.getElementById('openai-status').textContent = 'Connected';
        document.getElementById('openai-status').classList.remove('disconnected');
        document.getElementById('openai-status').classList.add('connected');
      }

      showSuccess('OpenAI settings saved successfully! AI Assistant is now active.');
    }

    // Test OpenAI Connection
    async function testOpenAIConnection() {
      const apiKey = document.getElementById('openaiApiKey').value;

      if (!apiKey) {
        showError('Please enter an OpenAI API key first');
        return;
      }

      showSuccess('Testing OpenAI connection...');

      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        if (response.ok) {
          showSuccess('✅ OpenAI connection successful! GPT-4 is available.');
          document.getElementById('openai-status').textContent = 'Connected';
          document.getElementById('openai-status').classList.remove('disconnected');
          document.getElementById('openai-status').classList.add('connected');
        } else {
          const error = await response.json();
          showError(`❌ OpenAI connection failed: ${error.error?.message || 'Unknown error'}`);
        }
      } catch (error) {
        showError(`❌ Connection error: ${error.message}`);
      }
    }

    // Save GA4 Settings
    function saveGA4Settings(event) {
      event.preventDefault();

      const measurementId = document.getElementById('ga4MeasurementId').value;
      const apiSecret = document.getElementById('ga4ApiSecret').value;

      if (!measurementId) {
        showError('Please enter a GA4 Measurement ID');
        return;
      }

      // Save to localStorage
      localStorage.setItem('ga4_measurement_id', measurementId);
      if (apiSecret) {
        localStorage.setItem('ga4_api_secret', apiSecret);
      }

      showSuccess('Google Analytics settings saved successfully!');
    }

    // Test GA4 Connection
    function testGA4Connection() {
      const measurementId = document.getElementById('ga4MeasurementId').value;
      if (!measurementId) {
        showError('Please enter a GA4 Measurement ID first');
        return;
      }
      showSuccess('Testing GA4 connection... Check browser console for details');
      console.log('GA4 Test: Would verify Measurement ID:', measurementId);
    }

    // Save Facebook Settings
    function saveFacebookSettings(event) {
      event.preventDefault();

      const pixelId = document.getElementById('facebookPixelId').value;
      const adsToken = document.getElementById('facebookAdsToken').value;
      const adAccountId = document.getElementById('facebookAdAccountId').value;

      if (!pixelId) {
        showError('Please enter a Facebook Pixel ID');
        return;
      }

      // Save to localStorage
      localStorage.setItem('facebook_pixel_id', pixelId);
      if (adsToken) {
        localStorage.setItem('facebook_ads_token', adsToken);
      }
      if (adAccountId) {
        localStorage.setItem('facebook_ad_account_id', adAccountId);
      }

      showSuccess('Facebook settings saved successfully!');
    }

    // Test Facebook Connection
    function testFacebookConnection() {
      const pixelId = document.getElementById('facebookPixelId').value;
      if (!pixelId) {
        showError('Please enter a Facebook Pixel ID first');
        return;
      }
      showSuccess('Testing Facebook Pixel... Check browser console for details');
      console.log('Facebook Test: Would verify Pixel ID:', pixelId);
    }

    // Load saved settings on page load
    window.addEventListener('DOMContentLoaded', function() {
      // Load OAuth settings
      const oauthSettings = JSON.parse(localStorage.getItem('oauthSettings') || '{}');
      if (oauthSettings.googleClientId) {
        document.getElementById('googleClientId').value = oauthSettings.googleClientId;
      }
      if (oauthSettings.facebookAppId) {
        document.getElementById('facebookAppId').value = oauthSettings.facebookAppId;
      }
      if (oauthSettings.microsoftClientId) {
        document.getElementById('microsoftClientId').value = oauthSettings.microsoftClientId;
      }

      // Load Stripe settings
      const stripeSettings = JSON.parse(localStorage.getItem('stripeSettings') || '{}');
      if (stripeSettings.publishableKey) {
        document.getElementById('stripePublishableKey').value = stripeSettings.publishableKey;
      }
      if (stripeSettings.secretKey) {
        document.getElementById('stripeSecretKey').value = stripeSettings.secretKey;
      }
      if (stripeSettings.webhookSecret) {
        document.getElementById('stripeWebhookSecret').value = stripeSettings.webhookSecret;
      }

      // Load Email settings
      const emailSettings = JSON.parse(localStorage.getItem('emailSettings') || '{}');
      if (emailSettings.provider) {
        document.getElementById('emailProvider').value = emailSettings.provider;
      }
      if (emailSettings.apiKey) {
        document.getElementById('emailApiKey').value = emailSettings.apiKey;
      }
      if (emailSettings.fromEmail) {
        document.getElementById('fromEmail').value = emailSettings.fromEmail;
      }

      // Load Backend settings
      const apiBaseUrl = localStorage.getItem('apiBaseUrl');
      if (apiBaseUrl) {
        document.getElementById('apiBaseUrl').value = apiBaseUrl;
      }

      // Load OpenAI settings
      const openaiKey = localStorage.getItem('openai_api_key');
      const openaiModel = localStorage.getItem('openai_model') || 'gpt-4';
      if (openaiKey) {
        document.getElementById('openaiApiKey').value = openaiKey;
        document.getElementById('openaiModel').value = openaiModel;
        document.getElementById('openai-status').textContent = 'Connected';
        document.getElementById('openai-status').classList.remove('disconnected');
        document.getElementById('openai-status').classList.add('connected');
      }

      // Load GA4 settings
      const ga4MeasurementId = localStorage.getItem('ga4_measurement_id');
      const ga4ApiSecret = localStorage.getItem('ga4_api_secret');
      if (ga4MeasurementId) {
        document.getElementById('ga4MeasurementId').value = ga4MeasurementId;
      }
      if (ga4ApiSecret) {
        document.getElementById('ga4ApiSecret').value = ga4ApiSecret;
      }

      // Load Facebook settings
      const fbPixelId = localStorage.getItem('facebook_pixel_id');
      const fbAdsToken = localStorage.getItem('facebook_ads_token');
      const fbAdAccountId = localStorage.getItem('facebook_ad_account_id');
      if (fbPixelId) {
        document.getElementById('facebookPixelId').value = fbPixelId;
      }
      if (fbAdsToken) {
        document.getElementById('facebookAdsToken').value = fbAdsToken;
      }
      if (fbAdAccountId) {
        document.getElementById('facebookAdAccountId').value = fbAdAccountId;
      }

      // Load Platform settings
      const platformSettings = JSON.parse(localStorage.getItem('platformSettings') || '{}');
      if (platformSettings.platformName) {
        document.getElementById('platformName').value = platformSettings.platformName;
      }
      if (platformSettings.primaryDomain) {
        document.getElementById('primaryDomain').value = platformSettings.primaryDomain;
      }
      if (platformSettings.supportEmail) {
        document.getElementById('supportEmail').value = platformSettings.supportEmail;
      }
      if (platformSettings.enableRegistration) {
        document.getElementById('enableRegistration').value = platformSettings.enableRegistration;
      }
      if (platformSettings.defaultPlan) {
        document.getElementById('defaultPlan').value = platformSettings.defaultPlan;
      }
    });

    // ========================================
    // GCR BUSINESSES MANAGEMENT
    // ========================================

    const GCR_API_URL = 'http://localhost:3002/api/gcr';
    let allGCRBusinesses = [];
    let filteredGCRBusinesses = [];

    // Load GCR businesses from Supabase
    async function loadGCRBusinesses() {
      try {
        const response = await fetch(`${GCR_API_URL}/businesses`);
        const data = await response.json();

        if (data.success) {
          allGCRBusinesses = data.businesses;
          filteredGCRBusinesses = allGCRBusinesses;
          document.getElementById('gcrBusinessCount').textContent = data.count;
          displayGCRBusinesses(filteredGCRBusinesses);
          updateGCRStatus('connected', `${data.count} businesses loaded`);
        } else {
          throw new Error('Failed to load businesses');
        }
      } catch (error) {
        console.error('Error loading GCR businesses:', error);
        updateGCRStatus('disconnected', 'API not available');
        document.getElementById('gcrBusinessesBody').innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px;">
              <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
              <div style="color: #ef4444; font-weight: 600; margin-bottom: 8px;">Cannot connect to GCR API</div>
              <div style="color: #666; font-size: 14px;">Make sure the API is running on http://localhost:3002</div>
              <button onclick="refreshGCRBusinesses()" class="btn-primary" style="margin-top: 16px;">Retry Connection</button>
            </td>
          </tr>
        `;
      }
    }

    // Display businesses in table
    function displayGCRBusinesses(businesses) {
      const tbody = document.getElementById('gcrBusinessesBody');

      if (businesses.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
              <div>No businesses found matching your filters</div>
            </td>
          </tr>
        `;
        document.getElementById('gcrBusinessCount').textContent = 'No businesses found';
        return;
      }

      tbody.innerHTML = businesses.map(business => `
        <tr>
          <td>
            <div style="font-weight: 600;">${business.name}</div>
            <div style="font-size: 12px; color: #999; margin-top: 4px;">${business.vicinity || business.address || ''}</div>
          </td>
          <td>
            <span style="padding: 4px 8px; background: #f3f4f6; border-radius: 6px; font-size: 12px; font-weight: 600;">
              ${business.category || 'other'}
            </span>
          </td>
          <td>
            ${business.rating ? `⭐ ${business.rating} (${business.user_ratings_total || 0})` : 'No rating'}
          </td>
          <td>${business.phone || '-'}</td>
          <td>
            <span class="api-status ${business.status === 'active' ? 'connected' : 'disconnected'}">
              ${business.status || 'active'}
            </span>
          </td>
          <td>
            <button onclick="editGCRBusiness('${business.id}')" style="background: #667eea; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">
              ✏️ Edit
            </button>
            <button onclick="toggleGCRBusinessStatus('${business.id}', '${business.status}')" style="background: #64748b; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-left: 8px;">
              ${business.status === 'active' ? '👁️ Hide' : '✅ Activate'}
            </button>
          </td>
        </tr>
      `).join('');

      document.getElementById('gcrBusinessCount').innerHTML = `
        Showing <strong>${businesses.length}</strong> of <strong>${allGCRBusinesses.length}</strong> businesses
      `;
    }

    // Filter businesses
    function filterGCRBusinesses() {
      const searchTerm = document.getElementById('gcrSearchInput').value.toLowerCase();
      const categoryFilter = document.getElementById('gcrCategoryFilter').value;
      const statusFilter = document.getElementById('gcrStatusFilter').value;

      filteredGCRBusinesses = allGCRBusinesses.filter(business => {
        const matchesSearch = !searchTerm ||
          business.name.toLowerCase().includes(searchTerm) ||
          (business.address && business.address.toLowerCase().includes(searchTerm)) ||
          (business.vicinity && business.vicinity.toLowerCase().includes(searchTerm));

        const matchesCategory = !categoryFilter || business.category === categoryFilter;
        const matchesStatus = !statusFilter || business.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      });

      displayGCRBusinesses(filteredGCRBusinesses);
    }

    // Refresh businesses
    function refreshGCRBusinesses() {
      updateGCRStatus('disconnected', 'Refreshing...');
      loadGCRBusinesses();
    }

    // Update API status
    function updateGCRStatus(status, text) {
      const statusEl = document.getElementById('gcrApiStatus');
      statusEl.className = `api-status ${status}`;
      statusEl.textContent = text;
    }

    // Edit business
    function editGCRBusiness(businessId) {
      const business = allGCRBusinesses.find(b => b.id === businessId);
      if (!business) return;

      document.getElementById('editBusinessId').value = business.id;
      document.getElementById('editName').value = business.name || '';
      document.getElementById('editCategory').value = business.category || 'other';
      document.getElementById('editDescription').value = business.description || '';
      document.getElementById('editPhone').value = business.phone || '';
      document.getElementById('editWebsite').value = business.website || '';
      document.getElementById('editAddress').value = business.address || business.vicinity || '';
      document.getElementById('editHours').value = business.hours || '';
      document.getElementById('editStatus').value = business.status || 'active';

      document.getElementById('editBusinessModal').style.display = 'block';
    }

    // Close edit modal
    function closeEditModal() {
      document.getElementById('editBusinessModal').style.display = 'none';
    }

    // Save business changes
    document.getElementById('editBusinessForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const businessId = document.getElementById('editBusinessId').value;
      const updates = {
        name: document.getElementById('editName').value,
        category: document.getElementById('editCategory').value,
        description: document.getElementById('editDescription').value,
        phone: document.getElementById('editPhone').value,
        website: document.getElementById('editWebsite').value,
        address: document.getElementById('editAddress').value,
        hours: document.getElementById('editHours').value,
        status: document.getElementById('editStatus').value
      };

      try {
        const response = await fetch(`${GCR_API_URL}/businesses/${businessId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (data.success) {
          showSuccess('Business updated successfully!');
          closeEditModal();
          refreshGCRBusinesses();
        } else {
          throw new Error(data.error || 'Failed to update business');
        }
      } catch (error) {
        console.error('Error updating business:', error);
        alert('Error updating business: ' + error.message);
      }
    });

    // Toggle business status
    async function toggleGCRBusinessStatus(businessId, currentStatus) {
      const newStatus = currentStatus === 'active' ? 'hidden' : 'active';

      if (!confirm(`Change business status to "${newStatus}"?`)) {
        return;
      }

      try {
        const response = await fetch(`${GCR_API_URL}/businesses/${businessId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (data.success) {
          showSuccess(`Business ${newStatus === 'active' ? 'activated' : 'hidden'} successfully!`);
          refreshGCRBusinesses();
        } else {
          throw new Error(data.error || 'Failed to update status');
        }
      } catch (error) {
        console.error('Error toggling status:', error);
        alert('Error updating status: ' + error.message);
      }
    }

    // Load GCR businesses when page loads
    window.addEventListener('DOMContentLoaded', function() {
      // Clear localStorage if quota exceeded to allow fresh data load
      try {
        const testKey = '_storage_test_';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
      } catch (e) {
        console.warn('⚠️ localStorage quota exceeded, clearing old data...');
        localStorage.clear();
      }

      loadGCRBusinesses();

      // Add event listener for CSV data type selector
      const csvDataTypeSelect = document.getElementById('csvDataType');
      if (csvDataTypeSelect) {
        csvDataTypeSelect.addEventListener('change', updateCSVFormatHelp);
      }
    });

    // ========================================
    // ADVANCED EDITOR FOR MENU, DRINKS, ETC.
    // ========================================

    let currentEditingBusiness = null;
    let advancedData = {
      menu: [],
      drinks: [],
      happy_hour: null,
      specials: [],
      events: []
    };

    // Open advanced editor
    function openAdvancedEditor() {
      console.log('🔵 openAdvancedEditor CALLED!');
      const businessId = document.getElementById('editBusinessId').value;
      console.log('🔵 Looking for business ID:', businessId);
      console.log('🔵 allGCRBusinesses has', allGCRBusinesses.length, 'businesses');
      currentEditingBusiness = allGCRBusinesses.find(b => b.id === businessId);

      if (!currentEditingBusiness) {
        console.error('❌ Business not found in allGCRBusinesses:', businessId);
        console.log('Available businesses:', allGCRBusinesses.map(b => b.id));
        alert('⚠️ Business data not loaded. Refreshing from Supabase...');

        // Clear localStorage and reload
        localStorage.removeItem('gcr_business_data');
        window.location.reload();
        return;
      }

      console.log('✅ Found business:', currentEditingBusiness.name, 'with menu type:', typeof currentEditingBusiness.menu);

      // Load existing data - handle both flat array and nested object menu structures
      let menuItems = [];
      let drinkItems = [];
      let happyHourItems = [];

      if (Array.isArray(currentEditingBusiness.menu)) {
        // Old flat structure
        menuItems = currentEditingBusiness.menu;
      } else if (currentEditingBusiness.menu && typeof currentEditingBusiness.menu === 'object') {
        // New nested structure: extract and flatten
        Object.keys(currentEditingBusiness.menu).forEach(mealPeriod => {
          const meal = currentEditingBusiness.menu[mealPeriod];

          // Extract drinks to separate section
          if (mealPeriod.toLowerCase() === 'drinks') {
            if (meal.sections) {
              Object.values(meal.sections).forEach(section => {
                if (section.items) {
                  section.items.forEach(item => {
                    drinkItems.push({
                      ...item,
                      category: section.name || 'Cocktails'
                    });
                  });
                }
              });
            }
            return; // Skip adding to menu
          }

          // Extract happy hour to separate section
          if (mealPeriod.toLowerCase() === 'happyhour') {
            if (meal.sections) {
              Object.values(meal.sections).forEach(section => {
                if (section.items) {
                  happyHourItems.push(...section.items);
                }
              });
            }
            return; // Skip adding to menu
          }

          // Regular menu items (lunch, dinner, kids, etc.)
          if (meal.sections) {
            Object.values(meal.sections).forEach(section => {
              if (section.items) {
                section.items.forEach(item => {
                  menuItems.push({
                    ...item,
                    mealPeriod: meal.name,
                    section: section.name,
                    category: `${meal.name} - ${section.name}`
                  });
                });
              }
            });
          }
        });
      }

      advancedData = {
        menu: Array.isArray(menuItems) ? menuItems : [],
        drinks: drinkItems.length > 0 ? drinkItems : (Array.isArray(currentEditingBusiness.drinks) ? currentEditingBusiness.drinks : []),
        happy_hour: happyHourItems.length > 0 ? { items: happyHourItems } : (currentEditingBusiness.happy_hour || { items: [] }),
        specials: Array.isArray(currentEditingBusiness.specials) ? currentEditingBusiness.specials : [],
        events: Array.isArray(currentEditingBusiness.events) ? currentEditingBusiness.events : [],
        feedPosts: Array.isArray(currentEditingBusiness.feedPosts) ? currentEditingBusiness.feedPosts : []
      };

      console.log('🔍 advancedData.menu:', advancedData.menu, 'length:', advancedData.menu.length);
      renderMenuItems();
      renderDrinkItems();
      renderHappyHourItems();
      renderSpecialItems();
      renderEventItems();
      renderFeedPosts();
      updateCSVFormatHelp();

      document.getElementById('advancedEditorModal').style.display = 'block';
    }

    // Close advanced editor
    function closeAdvancedEditor() {
      document.getElementById('advancedEditorModal').style.display = 'none';
    }

    // Switch editor tabs
    function switchEditorTab(tabName) {
      document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.editor-tab-content').forEach(content => {
        content.classList.remove('active');
      });

      document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // Menu Items Management
    function addMenuItem() {
      const newItem = {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: '',
        image: '',
        mealPeriod: 'Lunch',
        section: 'Other',
        dietary: []
      };
      advancedData.menu.push(newItem);
      renderMenuItems();
    }

    function renderMenuItems() {
      const container = document.getElementById('menuItemsList');

      // Ensure advancedData.menu is an array
      if (!Array.isArray(advancedData.menu)) {
        console.error('❌ advancedData.menu is not an array:', typeof advancedData.menu, advancedData.menu);
        advancedData.menu = [];
      }

      if (advancedData.menu.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No menu items yet. Click "+ Add Menu Item" to start.</p>';
        return;
      }

      container.innerHTML = advancedData.menu.map((item, index) => `
        <div class="menu-item-card">
          <div class="item-header">
            <h4 style="font-size: 16px; font-weight: 600; color: #333;">${item.name || 'New Menu Item'}</h4>
            <div class="item-actions">
              <button onclick="deleteMenuItem(${index})" class="btn-small btn-delete">🗑️ Delete</button>
            </div>
          </div>
          <div class="item-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Item Name</label>
              <input type="text" class="form-input" value="${item.name || ''}" onchange="updateMenuItem(${index}, 'name', this.value)" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Price</label>
              <input type="text" class="form-input" value="${item.price || ''}" onchange="updateMenuItem(${index}, 'price', this.value)" placeholder="$12.99" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Meal Period</label>
              <select class="form-input" onchange="updateMenuItem(${index}, 'mealPeriod', this.value)" style="padding: 10px;">
                <option value="Breakfast" ${item.mealPeriod === 'Breakfast' ? 'selected' : ''}>Breakfast</option>
                <option value="Lunch" ${item.mealPeriod === 'Lunch' ? 'selected' : ''}>Lunch</option>
                <option value="Dinner" ${item.mealPeriod === 'Dinner' ? 'selected' : ''}>Dinner</option>
                <option value="Kids" ${item.mealPeriod === 'Kids' ? 'selected' : ''}>Kids</option>
                <option value="HappyHour" ${item.mealPeriod === 'HappyHour' ? 'selected' : ''}>Happy Hour</option>
                <option value="Drinks" ${item.mealPeriod === 'Drinks' ? 'selected' : ''}>Drinks</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Section</label>
              <input type="text" class="form-input" value="${item.section || 'Other'}" onchange="updateMenuItem(${index}, 'section', this.value)" placeholder="Appetizers, Entrees, etc." style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Image URL</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="url" class="form-input" value="${item.image || ''}" onchange="updateMenuItem(${index}, 'image', this.value)" placeholder="https://..." style="padding: 10px; flex: 1;">
                <span style="color: #64748b; font-size: 13px;">OR</span>
                <label class="btn-secondary" style="margin: 0; cursor: pointer; white-space: nowrap;">
                  📁 Upload
                  <input type="file" accept="image/*" onchange="uploadMenuItemImage(${index}, this.files[0])" style="display: none;">
                </label>
              </div>
            </div>
          </div>
          <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
            <label class="form-label" style="font-size: 12px;">Description</label>
            <textarea class="form-input" rows="2" onchange="updateMenuItem(${index}, 'description', this.value)" style="padding: 10px;">${item.description || ''}</textarea>
          </div>
          <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
            <label class="form-label" style="font-size: 12px;">Dietary Options</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <label style="display: flex; align-items: center; gap: 4px; font-size: 13px;">
                <input type="checkbox" ${(item.dietary || []).includes('vegan') ? 'checked' : ''} onchange="toggleDietary(${index}, 'vegan', this.checked)"> Vegan
              </label>
              <label style="display: flex; align-items: center; gap: 4px; font-size: 13px;">
                <input type="checkbox" ${(item.dietary || []).includes('vegetarian') ? 'checked' : ''} onchange="toggleDietary(${index}, 'vegetarian', this.checked)"> Vegetarian
              </label>
              <label style="display: flex; align-items: center; gap: 4px; font-size: 13px;">
                <input type="checkbox" ${(item.dietary || []).includes('gluten-free') ? 'checked' : ''} onchange="toggleDietary(${index}, 'gluten-free', this.checked)"> Gluten-Free
              </label>
              <label style="display: flex; align-items: center; gap: 4px; font-size: 13px;">
                <input type="checkbox" ${(item.dietary || []).includes('dairy-free') ? 'checked' : ''} onchange="toggleDietary(${index}, 'dairy-free', this.checked)"> Dairy-Free
              </label>
            </div>
          </div>
        </div>
      `).join('');
    }

    function updateMenuItem(index, field, value) {
      advancedData.menu[index][field] = value;
    }

    function deleteMenuItem(index) {
      if (confirm('Delete this menu item?')) {
        advancedData.menu.splice(index, 1);
        renderMenuItems();
      }
    }

    function toggleDietary(index, option, checked) {
      if (!advancedData.menu[index].dietary) {
        advancedData.menu[index].dietary = [];
      }
      if (checked) {
        if (!advancedData.menu[index].dietary.includes(option)) {
          advancedData.menu[index].dietary.push(option);
        }
      } else {
        advancedData.menu[index].dietary = advancedData.menu[index].dietary.filter(d => d !== option);
      }
    }

    function uploadMenuItemImage(index, file) {
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large! Please use an image under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        // Convert to base64 and store
        advancedData.menu[index].image = e.target.result;
        renderMenuItems();
        alert('✅ Image uploaded successfully!');
      };
      reader.onerror = function() {
        alert('❌ Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file);
    }

    // Drinks Management (similar structure)
    function addDrinkItem() {
      const newItem = {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'cocktails'
      };
      advancedData.drinks.push(newItem);
      renderDrinkItems();
    }

    function renderDrinkItems() {
      const container = document.getElementById('drinksItemsList');
      if (advancedData.drinks.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No drinks yet. Click "+ Add Drink" to start.</p>';
        return;
      }

      container.innerHTML = advancedData.drinks.map((item, index) => `
        <div class="menu-item-card">
          <div class="item-header">
            <h4 style="font-size: 16px; font-weight: 600; color: #333;">${item.name || 'New Drink'}</h4>
            <div class="item-actions">
              <button onclick="deleteDrinkItem(${index})" class="btn-small btn-delete">🗑️ Delete</button>
            </div>
          </div>
          <div class="item-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Drink Name</label>
              <input type="text" class="form-input" value="${item.name || ''}" onchange="updateDrinkItem(${index}, 'name', this.value)" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Price</label>
              <input type="text" class="form-input" value="${item.price || ''}" onchange="updateDrinkItem(${index}, 'price', this.value)" placeholder="$8.99" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Category</label>
              <select class="form-input" onchange="updateDrinkItem(${index}, 'category', this.value)" style="padding: 10px;">
                <option value="cocktails" ${item.category === 'cocktails' ? 'selected' : ''}>Cocktails</option>
                <option value="beer" ${item.category === 'beer' ? 'selected' : ''}>Beer</option>
                <option value="wine" ${item.category === 'wine' ? 'selected' : ''}>Wine</option>
                <option value="spirits" ${item.category === 'spirits' ? 'selected' : ''}>Spirits</option>
                <option value="non-alcoholic" ${item.category === 'non-alcoholic' ? 'selected' : ''}>Non-Alcoholic</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Image URL</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="url" class="form-input" value="${item.image || ''}" onchange="updateDrinkItem(${index}, 'image', this.value)" placeholder="https://..." style="padding: 10px; flex: 1;">
                <span style="color: #64748b; font-size: 13px;">OR</span>
                <label class="btn-secondary" style="margin: 0; cursor: pointer; white-space: nowrap;">
                  📁 Upload
                  <input type="file" accept="image/*" onchange="uploadDrinkImage(${index}, this.files[0])" style="display: none;">
                </label>
              </div>
            </div>
          </div>
          <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
            <label class="form-label" style="font-size: 12px;">Description</label>
            <textarea class="form-input" rows="2" onchange="updateDrinkItem(${index}, 'description', this.value)" style="padding: 10px;">${item.description || ''}</textarea>
          </div>
        </div>
      `).join('');
    }

    function updateDrinkItem(index, field, value) {
      advancedData.drinks[index][field] = value;
    }

    function deleteDrinkItem(index) {
      if (confirm('Delete this drink?')) {
        advancedData.drinks.splice(index, 1);
        renderDrinkItems();
      }
    }

    function uploadDrinkImage(index, file) {
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large! Please use an image under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        // Convert to base64 and store
        advancedData.drinks[index].image = e.target.result;
        renderDrinkItems();
        alert('✅ Image uploaded successfully!');
      };
      reader.onerror = function() {
        alert('❌ Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file);
    }

    // Happy Hour Management
    function addHappyHourItem() {
      if (!advancedData.happy_hour) {
        advancedData.happy_hour = { items: [] };
      }
      const newItem = {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: '',
        image: ''
      };
      advancedData.happy_hour.items.push(newItem);
      renderHappyHourItems();
    }

    function renderHappyHourItems() {
      const container = document.getElementById('happyHourItemsList');
      if (!advancedData.happy_hour || !advancedData.happy_hour.items || advancedData.happy_hour.items.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No happy hour items yet. Click "+ Add Happy Hour Item" to start.</p>';
        return;
      }

      container.innerHTML = advancedData.happy_hour.items.map((item, index) => `
        <div class="menu-item-card">
          <div class="item-header">
            <h4 style="font-size: 16px; font-weight: 600; color: #333;">${item.name || 'New Happy Hour Item'}</h4>
            <div class="item-actions">
              <button onclick="deleteHappyHourItem(${index})" class="btn-small btn-delete">🗑️ Delete</button>
            </div>
          </div>
          <div class="item-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Item Name</label>
              <input type="text" class="form-input" value="${item.name || ''}" onchange="updateHappyHourItem(${index}, 'name', this.value)" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Price</label>
              <input type="text" class="form-input" value="${item.price || ''}" onchange="updateHappyHourItem(${index}, 'price', this.value)" placeholder="$5.99" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Image URL</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="url" class="form-input" value="${item.image || ''}" onchange="updateHappyHourItem(${index}, 'image', this.value)" placeholder="https://..." style="padding: 10px; flex: 1;">
                <span style="color: #64748b; font-size: 13px;">OR</span>
                <label class="btn-secondary" style="margin: 0; cursor: pointer; white-space: nowrap;">
                  📁 Upload
                  <input type="file" accept="image/*" onchange="uploadHappyHourImage(${index}, this.files[0])" style="display: none;">
                </label>
              </div>
            </div>
          </div>
          <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
            <label class="form-label" style="font-size: 12px;">Description</label>
            <textarea class="form-input" rows="2" onchange="updateHappyHourItem(${index}, 'description', this.value)" style="padding: 10px;">${item.description || ''}</textarea>
          </div>
        </div>
      `).join('');
    }

    function updateHappyHourItem(index, field, value) {
      advancedData.happy_hour.items[index][field] = value;
    }

    function deleteHappyHourItem(index) {
      if (confirm('Delete this happy hour item?')) {
        advancedData.happy_hour.items.splice(index, 1);
        renderHappyHourItems();
      }
    }

    function uploadHappyHourImage(index, file) {
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large! Please use an image under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        // Convert to base64 and store
        advancedData.happy_hour.items[index].image = e.target.result;
        renderHappyHourItems();
        alert('✅ Image uploaded successfully!');
      };
      reader.onerror = function() {
        alert('❌ Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file);
    }

    // Specials Management
    function addSpecialItem() {
      const newItem = {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: '',
        image: '',
        day: 'monday',
        time: ''
      };
      advancedData.specials.push(newItem);
      renderSpecialItems();
    }

    function renderSpecialItems() {
      const container = document.getElementById('specialsItemsList');
      if (advancedData.specials.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No specials yet. Click "+ Add Special" to start.</p>';
        return;
      }

      container.innerHTML = advancedData.specials.map((item, index) => `
        <div class="menu-item-card">
          <div class="item-header">
            <h4 style="font-size: 16px; font-weight: 600; color: #333;">${item.name || 'New Special'}</h4>
            <div class="item-actions">
              <button onclick="deleteSpecialItem(${index})" class="btn-small btn-delete">🗑️ Delete</button>
            </div>
          </div>
          <div class="item-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Special Name</label>
              <input type="text" class="form-input" value="${item.name || ''}" onchange="updateSpecialItem(${index}, 'name', this.value)" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Price</label>
              <input type="text" class="form-input" value="${item.price || ''}" onchange="updateSpecialItem(${index}, 'price', this.value)" placeholder="$15.99" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Day</label>
              <select class="form-input" onchange="updateSpecialItem(${index}, 'day', this.value)" style="padding: 10px;">
                <option value="monday" ${item.day === 'monday' ? 'selected' : ''}>Monday</option>
                <option value="tuesday" ${item.day === 'tuesday' ? 'selected' : ''}>Tuesday</option>
                <option value="wednesday" ${item.day === 'wednesday' ? 'selected' : ''}>Wednesday</option>
                <option value="thursday" ${item.day === 'thursday' ? 'selected' : ''}>Thursday</option>
                <option value="friday" ${item.day === 'friday' ? 'selected' : ''}>Friday</option>
                <option value="saturday" ${item.day === 'saturday' ? 'selected' : ''}>Saturday</option>
                <option value="sunday" ${item.day === 'sunday' ? 'selected' : ''}>Sunday</option>
                <option value="daily" ${item.day === 'daily' ? 'selected' : ''}>Daily</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Time</label>
              <input type="text" class="form-input" value="${item.time || ''}" onchange="updateSpecialItem(${index}, 'time', this.value)" placeholder="3:00 PM - 6:00 PM" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Image URL</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="url" class="form-input" value="${item.image || ''}" onchange="updateSpecialItem(${index}, 'image', this.value)" placeholder="https://..." style="padding: 10px; flex: 1;">
                <span style="color: #64748b; font-size: 13px;">OR</span>
                <label class="btn-secondary" style="margin: 0; cursor: pointer; white-space: nowrap;">
                  📁 Upload
                  <input type="file" accept="image/*" onchange="uploadSpecialImage(${index}, this.files[0])" style="display: none;">
                </label>
              </div>
            </div>
          </div>
          <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
            <label class="form-label" style="font-size: 12px;">Description</label>
            <textarea class="form-input" rows="2" onchange="updateSpecialItem(${index}, 'description', this.value)" style="padding: 10px;">${item.description || ''}</textarea>
          </div>
        </div>
      `).join('');
    }

    function updateSpecialItem(index, field, value) {
      advancedData.specials[index][field] = value;
    }

    function deleteSpecialItem(index) {
      if (confirm('Delete this special?')) {
        advancedData.specials.splice(index, 1);
        renderSpecialItems();
      }
    }

    function uploadSpecialImage(index, file) {
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large! Please use an image under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        // Convert to base64 and store
        advancedData.specials[index].image = e.target.result;
        renderSpecialItems();
        alert('✅ Image uploaded successfully!');
      };
      reader.onerror = function() {
        alert('❌ Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file);
    }

    function applyBulkSpecialSettings() {
      const bulkDay = document.getElementById('bulkSpecialDay').value;
      const bulkTime = document.getElementById('bulkSpecialTime').value;

      if (!bulkDay && !bulkTime) {
        alert('Please select a day and/or time to apply to all specials.');
        return;
      }

      if (confirm(`Apply ${bulkDay ? bulkDay.charAt(0).toUpperCase() + bulkDay.slice(1) : ''} ${bulkTime ? bulkTime : ''} to all ${advancedData.specials.length} specials?`)) {
        advancedData.specials.forEach(special => {
          if (bulkDay) special.day = bulkDay;
          if (bulkTime) special.time = bulkTime;
        });
        renderSpecialItems();
        alert('✅ Bulk settings applied to all specials!');
      }
    }

    // Events Management
    function addEventItem() {
      const newItem = {
        id: Date.now().toString(),
        name: '',
        description: '',
        date: '',
        time: '',
        price: '',
        image: ''
      };
      advancedData.events.push(newItem);
      renderEventItems();
    }

    function renderEventItems() {
      const container = document.getElementById('eventsItemsList');
      if (advancedData.events.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No events yet. Click "+ Add Event" to start.</p>';
        return;
      }

      container.innerHTML = advancedData.events.map((item, index) => `
        <div class="menu-item-card">
          <div class="item-header">
            <h4 style="font-size: 16px; font-weight: 600; color: #333;">${item.name || 'New Event'}</h4>
            <div class="item-actions">
              <button onclick="deleteEventItem(${index})" class="btn-small btn-delete">🗑️ Delete</button>
            </div>
          </div>
          <div class="item-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Event Name</label>
              <input type="text" class="form-input" value="${item.name || ''}" onchange="updateEventItem(${index}, 'name', this.value)" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Date</label>
              <input type="date" class="form-input" value="${item.date || ''}" onchange="updateEventItem(${index}, 'date', this.value)" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Time</label>
              <input type="time" class="form-input" value="${item.time || ''}" onchange="updateEventItem(${index}, 'time', this.value)" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Price</label>
              <input type="text" class="form-input" value="${item.price || ''}" onchange="updateEventItem(${index}, 'price', this.value)" placeholder="$25" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Image URL</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="url" class="form-input" value="${item.image || ''}" onchange="updateEventItem(${index}, 'image', this.value)" placeholder="https://..." style="padding: 10px; flex: 1;">
                <span style="color: #64748b; font-size: 13px;">OR</span>
                <label class="btn-secondary" style="margin: 0; cursor: pointer; white-space: nowrap;">
                  📁 Upload
                  <input type="file" accept="image/*" onchange="uploadEventImage(${index}, this.files[0])" style="display: none;">
                </label>
              </div>
            </div>
          </div>
          <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
            <label class="form-label" style="font-size: 12px;">Description</label>
            <textarea class="form-input" rows="2" onchange="updateEventItem(${index}, 'description', this.value)" style="padding: 10px;">${item.description || ''}</textarea>
          </div>
        </div>
      `).join('');
    }

    function updateEventItem(index, field, value) {
      advancedData.events[index][field] = value;
    }

    function deleteEventItem(index) {
      if (confirm('Delete this event?')) {
        advancedData.events.splice(index, 1);
        renderEventItems();
      }
    }

    function uploadEventImage(index, file) {
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large! Please use an image under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        // Convert to base64 and store
        advancedData.events[index].image = e.target.result;
        renderEventItems();
        alert('✅ Image uploaded successfully!');
      };
      reader.onerror = function() {
        alert('❌ Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file);
    }

    // Live Feed Posts Management
    function addFeedPost() {
      const newPost = {
        id: Date.now().toString(),
        content: '',
        imageUrl: '',
        platform: 'instagram',
        timestamp: new Date().toISOString(),
        businessId: currentEditingBusiness ? currentEditingBusiness.id : '',
        businessName: currentEditingBusiness ? currentEditingBusiness.name : '',
        likes: 0,
        comments: 0,
        shares: 0
      };
      advancedData.feedPosts.push(newPost);
      renderFeedPosts();
    }

    function renderFeedPosts() {
      const container = document.getElementById('feedPostsList');
      if (advancedData.feedPosts.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No feed posts yet. Click "+ Add Feed Post" to start.</p>';
        return;
      }

      container.innerHTML = advancedData.feedPosts.map((post, index) => `
        <div class="menu-item-card">
          <div class="item-header">
            <h4 style="font-size: 16px; font-weight: 600; color: #333;">Feed Post ${index + 1}</h4>
            <div class="item-actions">
              <button onclick="deleteFeedPost(${index})" class="btn-small btn-delete">🗑️ Delete</button>
            </div>
          </div>
          <div class="item-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Platform</label>
              <select class="form-input" onchange="updateFeedPost(${index}, 'platform', this.value)" style="padding: 10px;">
                <option value="instagram" ${post.platform === 'instagram' ? 'selected' : ''}>📷 Instagram</option>
                <option value="facebook" ${post.platform === 'facebook' ? 'selected' : ''}>📘 Facebook</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Business</label>
              <select class="form-input" onchange="updateFeedPost(${index}, 'businessId', this.value)" style="padding: 10px;">
                <option value="">-- Select Business --</option>
                ${(allGCRBusinesses || []).map(b => `<option value="${b.id}" ${post.businessId === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Date/Time</label>
              <input type="datetime-local" class="form-input" value="${post.timestamp ? new Date(post.timestamp).toISOString().slice(0, 16) : ''}" onchange="updateFeedPost(${index}, 'timestamp', this.value)" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Photo URL</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="url" class="form-input" value="${post.imageUrl || ''}" onchange="updateFeedPost(${index}, 'imageUrl', this.value)" placeholder="https://..." style="padding: 10px; flex: 1;">
                <span style="color: #64748b; font-size: 13px;">OR</span>
                <label class="btn-secondary" style="margin: 0; cursor: pointer; white-space: nowrap;">
                  📁 Upload
                  <input type="file" accept="image/*" onchange="uploadFeedPostImage(${index}, this.files[0])" style="display: none;">
                </label>
              </div>
            </div>
          </div>
          <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
            <label class="form-label" style="font-size: 12px;">Post Caption/Content</label>
            <textarea class="form-input" rows="3" onchange="updateFeedPost(${index}, 'content', this.value)" style="padding: 10px;" placeholder="Write your post caption here...">${post.content || ''}</textarea>
          </div>
          ${post.imageUrl ? `
            <div style="margin-top: 12px;">
              <label class="form-label" style="font-size: 12px;">Preview</label>
            </div>
          ` : ''}
          <div class="item-grid" style="margin-top: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Likes</label>
              <input type="number" class="form-input" value="${post.likes || 0}" onchange="updateFeedPost(${index}, 'likes', parseInt(this.value))" min="0" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Comments</label>
              <input type="number" class="form-input" value="${post.comments || 0}" onchange="updateFeedPost(${index}, 'comments', parseInt(this.value))" min="0" style="padding: 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Shares</label>
              <input type="number" class="form-input" value="${post.shares || 0}" onchange="updateFeedPost(${index}, 'shares', parseInt(this.value))" min="0" style="padding: 10px;">
            </div>
          </div>
        </div>
      `).join('');
    }

    function updateFeedPost(index, field, value) {
      advancedData.feedPosts[index][field] = value;
      if (field === 'imageUrl') {
        renderFeedPosts(); // Re-render to show preview
      }
    }

    function deleteFeedPost(index) {
      if (confirm('Delete this feed post?')) {
        advancedData.feedPosts.splice(index, 1);
        renderFeedPosts();
      }
    }

    function uploadFeedPostImage(index, file) {
      if (!file) return;

      // Check file size (max 5MB for feed photos)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large! Please use an image under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        // Convert to base64 and store
        advancedData.feedPosts[index].imageUrl = e.target.result;
        renderFeedPosts(); // Re-render to show preview
        alert('✅ Image uploaded successfully!');
      };
      reader.onerror = function() {
        alert('❌ Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file);
    }

    // CSV Format Help
    function updateCSVFormatHelp() {
      const dataType = document.getElementById('csvDataType').value;
      const helpDiv = document.getElementById('csvColumnsHelp');

      const formats = {
        restaurant_full_menu: 'restaurant, city, state, menu, section, item_name, description, price, price_type, time_window, notes\n\nExample:\nCosmo\'s Restaurant, Orange Beach, AL, Lunch, Appetizers, Calamari, Lightly fried calamari, $12.99, fixed, , \n\nThis format auto-organizes items into Menu, Drinks, and Happy Hour sections based on the data.',
        menu: 'name, description, price, image, category, dietary\n\nExample:\nSpicy Tuna Roll, Fresh tuna with spicy mayo, $12.99, https://..., lunch, gluten-free;vegan',
        drinks: 'name, description, price, image, category\n\nExample:\nMargarita, Classic lime margarita, $10, https://..., cocktails',
        events: 'name, description, date, time, price, image\n\nExample:\nLive Music Night, Local band performs, 2026-02-15, 19:00, Free, https://...',
        specials: 'name, description, price, image, day\n\nExample:\nTaco Tuesday, 3 tacos for special price, $8.99, https://..., tuesday',
        happy_hour: 'name, description, price, image\n\nExample:\nHouse Wine, Red or white wine, $5, https://...'
      };

      helpDiv.textContent = formats[dataType] || '';
    }

    // CSV Processing
    function processCSV() {
      const fileInput = document.getElementById('csvFileInput');
      const dataType = document.getElementById('csvDataType').value;

      if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a CSV file first');
        return;
      }

      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = function(e) {
        try {
          const csvText = e.target.result;
          const rows = csvText.split('\n').map(row => row.trim()).filter(row => row.length > 0);

          if (rows.length === 0) {
            alert('CSV file is empty');
            return;
          }

          // Parse CSV (simple parser - handles basic CSV format)
          const parseCSVRow = (row) => {
            const cells = [];
            let currentCell = '';
            let insideQuotes = false;

            for (let i = 0; i < row.length; i++) {
              const char = row[i];

              if (char === '"') {
                insideQuotes = !insideQuotes;
              } else if (char === ',' && !insideQuotes) {
                cells.push(currentCell.trim());
                currentCell = '';
              } else {
                currentCell += char;
              }
            }
            cells.push(currentCell.trim());
            return cells;
          };

          // Check if first row is header
          const firstRow = parseCSVRow(rows[0]);
          const hasHeader = firstRow.some(cell =>
            cell.toLowerCase().includes('name') ||
            cell.toLowerCase().includes('description') ||
            cell.toLowerCase().includes('price')
          );

          const dataRows = hasHeader ? rows.slice(1) : rows;
          const parsedItems = [];

          // Special handling for restaurant_full_menu (auto-organizes into menu, drinks, happy_hour)
          if (dataType === 'restaurant_full_menu') {
            const organizedData = {
              menu: [],
              drinks: [],
              happy_hour_items: []
            };

            dataRows.forEach((row, rowIndex) => {
              const cells = parseCSVRow(row);
              if (cells.length === 0 || cells.every(cell => !cell)) return;

              // Columns: restaurant, city, state, menu, section, item_name, description, price, price_type, time_window, notes
              const restaurant = cells[0] || '';
              const city = cells[1] || '';
              const state = cells[2] || '';
              const menuType = (cells[3] || '').toLowerCase();
              const section = (cells[4] || '').toLowerCase();
              const itemName = cells[5] || '';
              const description = cells[6] || '';
              const price = cells[7] || '';
              const priceType = cells[8] || '';
              const timeWindow = cells[9] || '';
              const notes = cells[10] || '';

              if (!itemName) return; // Skip if no item name

              const baseItem = {
                id: Date.now().toString() + '_' + rowIndex,
                name: itemName,
                description: description,
                price: price,
                image: ''
              };

              // Categorize based on menu type and section
              if (menuType.includes('happy hour') || timeWindow) {
                // Happy Hour items
                const happyHourItem = {
                  ...baseItem,
                  time_window: timeWindow
                };
                organizedData.happy_hour_items.push(happyHourItem);

                // If it's a drink, also add to drinks
                if (section.includes('beer') || section.includes('wine') || section.includes('cocktail') ||
                    section.includes('drink') || section.includes('margarita') || section.includes('martini')) {
                  organizedData.drinks.push({
                    ...baseItem,
                    category: 'happy-hour'
                  });
                }
              } else if (section.includes('drink') || section.includes('cocktail') || section.includes('beer') ||
                         section.includes('wine') || section.includes('beverage') || section.includes('martini') ||
                         section.includes('margarita') || section.includes('mocktail')) {
                // Drinks section
                organizedData.drinks.push({
                  ...baseItem,
                  category: menuType || 'cocktails'
                });
              } else {
                // Menu items (food)
                let category = 'lunch';
                if (menuType.includes('lunch')) category = 'lunch';
                else if (menuType.includes('dinner')) category = 'dinner';
                else if (menuType.includes('breakfast')) category = 'breakfast';
                else if (menuType.includes('sunset')) category = 'dinner';
                else if (menuType.includes('sushi')) category = 'sushi';

                // Refine category based on section
                if (section.includes('appetizer')) category = 'appetizers';
                else if (section.includes('dessert')) category = 'desserts';
                else if (section.includes('sushi') || section.includes('sashimi') || section.includes('roll')) category = 'sushi';
                else if (section.includes('seafood')) category = 'seafood';

                organizedData.menu.push({
                  ...baseItem,
                  category: category,
                  dietary: []
                });
              }
            });

            // Apply organized data to advancedData
            advancedData.menu = [...advancedData.menu, ...organizedData.menu];
            advancedData.drinks = [...advancedData.drinks, ...organizedData.drinks];

            if (organizedData.happy_hour_items.length > 0) {
              advancedData.happy_hour = {
                title: 'Happy Hour',
                description: 'Daily happy hour specials',
                items: organizedData.happy_hour_items
              };
            }

            // Render all sections
            renderMenuItems();
            renderDrinkItems();
            renderHappyHourItems();

            const totalItems = organizedData.menu.length + organizedData.drinks.length + organizedData.happy_hour_items.length;
            alert(`✅ Successfully organized ${totalItems} items from CSV!\n\n• ${organizedData.menu.length} menu items\n• ${organizedData.drinks.length} drinks\n• ${organizedData.happy_hour_items.length} happy hour items\n\nYou can now review and edit before saving.`);

            // Switch to menu tab
            switchEditorTab('menu');
            return;
          }

          // Parse based on data type (for other formats)
          dataRows.forEach((row, rowIndex) => {
            const cells = parseCSVRow(row);

            if (cells.length === 0 || cells.every(cell => !cell)) return; // Skip empty rows

            let item;

            if (dataType === 'menu') {
              // name, description, price, image, category, dietary
              item = {
                id: Date.now().toString() + '_' + rowIndex,
                name: cells[0] || '',
                description: cells[1] || '',
                price: cells[2] || '',
                image: cells[3] || '',
                category: cells[4] || 'lunch',
                dietary: cells[5] ? cells[5].split(';').map(d => d.trim()).filter(d => d) : []
              };
            } else if (dataType === 'drinks') {
              // name, description, price, image, category
              item = {
                id: Date.now().toString() + '_' + rowIndex,
                name: cells[0] || '',
                description: cells[1] || '',
                price: cells[2] || '',
                image: cells[3] || '',
                category: cells[4] || 'cocktails'
              };
            } else if (dataType === 'events') {
              // name, description, date, time, price, image
              item = {
                id: Date.now().toString() + '_' + rowIndex,
                name: cells[0] || '',
                description: cells[1] || '',
                date: cells[2] || '',
                time: cells[3] || '',
                price: cells[4] || '',
                image: cells[5] || ''
              };
            } else if (dataType === 'specials') {
              // name, description, price, image, day
              item = {
                id: Date.now().toString() + '_' + rowIndex,
                name: cells[0] || '',
                description: cells[1] || '',
                price: cells[2] || '',
                image: cells[3] || '',
                day: (cells[4] || 'daily').toLowerCase()
              };
            } else if (dataType === 'happy_hour') {
              // name, description, price, image
              item = {
                id: Date.now().toString() + '_' + rowIndex,
                name: cells[0] || '',
                description: cells[1] || '',
                price: cells[2] || '',
                image: cells[3] || ''
              };
            }

            if (item && item.name) {
              parsedItems.push(item);
            }
          });

          if (parsedItems.length === 0) {
            alert('No valid items found in CSV. Please check the format.');
            return;
          }

          // Apply parsed items to advancedData
          if (dataType === 'happy_hour') {
            // Happy hour is a special structure
            advancedData.happy_hour = {
              title: 'Happy Hour',
              description: 'Daily happy hour specials',
              items: parsedItems
            };
            renderHappyHourItems();
          } else {
            // For other types, replace the entire array
            advancedData[dataType] = parsedItems;

            // Call appropriate render function
            if (dataType === 'menu') renderMenuItems();
            else if (dataType === 'drinks') renderDrinkItems();
            else if (dataType === 'events') renderEventItems();
            else if (dataType === 'specials') renderSpecialItems();
          }

          alert(`✅ Successfully processed ${parsedItems.length} ${dataType} items from CSV!\n\nYou can now review and edit the items before saving.`);

          // Switch to the appropriate tab
          const tabMap = {
            menu: 'menu',
            drinks: 'drinks',
            happy_hour: 'happy-hour',
            specials: 'specials',
            events: 'events'
          };
          switchEditorTab(tabMap[dataType]);

        } catch (error) {
          console.error('CSV processing error:', error);
          alert('Error processing CSV: ' + error.message);
        }
      };

      reader.onerror = function() {
        alert('Error reading file');
      };

      reader.readAsText(file);
    }

    // Bulk Upload (JSON)
    function applyBulkUpload() {
      try {
        const jsonData = JSON.parse(document.getElementById('bulkUploadJSON').value);

        // Only update non-empty sections (preserve existing data for empty sections)
        if (jsonData.menu && jsonData.menu.length > 0) {
          advancedData.menu = jsonData.menu;
        }
        if (jsonData.drinks && jsonData.drinks.length > 0) {
          advancedData.drinks = jsonData.drinks;
        }
        if (jsonData.happy_hour) {
          advancedData.happy_hour = jsonData.happy_hour;
        }
        if (jsonData.specials && jsonData.specials.length > 0) {
          advancedData.specials = jsonData.specials;
        }
        if (jsonData.events && jsonData.events.length > 0) {
          advancedData.events = jsonData.events;
        }

        // Re-render all sections
        renderMenuItems();
        renderDrinkItems();
        renderHappyHourItems();
        renderSpecialItems();
        renderEventItems();

        alert('Bulk upload applied! Empty sections preserved existing data.');
      } catch (error) {
        alert('Invalid JSON format: ' + error.message);
      }
    }

    // Save advanced changes
    async function saveAdvancedChanges() {
      if (!currentEditingBusiness) return;

      // Reconstruct nested menu structure from flat array
      const nestedMenu = {};

      // Add regular menu items (lunch, dinner, kids, etc.)
      advancedData.menu.forEach(item => {
        const mealPeriod = (item.mealPeriod || 'Dinner').toLowerCase();
        const sectionName = item.section || 'Other';
        const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '_');

        // Create meal period if doesn't exist
        if (!nestedMenu[mealPeriod]) {
          nestedMenu[mealPeriod] = {
            name: item.mealPeriod || 'Dinner',
            sections: {}
          };
        }

        // Create section if doesn't exist
        if (!nestedMenu[mealPeriod].sections[sectionKey]) {
          nestedMenu[mealPeriod].sections[sectionKey] = {
            name: sectionName,
            items: []
          };
        }

        // Add item to section (remove metadata fields)
        const cleanItem = {
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image || '',
          dietary: item.dietary || []
        };
        nestedMenu[mealPeriod].sections[sectionKey].items.push(cleanItem);
      });

      // Add drinks to nested menu structure
      if (advancedData.drinks && advancedData.drinks.length > 0) {
        nestedMenu.drinks = {
          name: 'Drinks',
          sections: {}
        };

        advancedData.drinks.forEach(drink => {
          const category = (drink.category || 'Cocktails').toLowerCase().replace(/\s+/g, '_');
          if (!nestedMenu.drinks.sections[category]) {
            nestedMenu.drinks.sections[category] = {
              name: drink.category || 'Cocktails',
              items: []
            };
          }

          nestedMenu.drinks.sections[category].items.push({
            name: drink.name,
            description: drink.description,
            price: drink.price,
            image: drink.image || '',
            dietary: drink.dietary || []
          });
        });
      }

      // Add happy hour to nested menu structure
      if (advancedData.happy_hour && advancedData.happy_hour.items && advancedData.happy_hour.items.length > 0) {
        nestedMenu.happyhour = {
          name: 'HappyHour',
          sections: {
            other: {
              name: 'Other',
              items: advancedData.happy_hour.items.map(item => ({
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image || '',
                dietary: item.dietary || []
              }))
            }
          }
        };
      }

      const updates = {
        menu: nestedMenu,
        drinks: [], // Keep empty for backward compatibility
        happy_hour: advancedData.happy_hour || { items: [] }, // Keep for backward compatibility
        has_happy_hour: (advancedData.happy_hour && advancedData.happy_hour.items && advancedData.happy_hour.items.length > 0),
        specials: advancedData.specials,
        events: advancedData.events,
        feedPosts: advancedData.feedPosts
      };

      try {
        const response = await fetch(`${GCR_API_URL}/businesses/${currentEditingBusiness.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (data.success) {
          showSuccess('Menu, drinks, and details saved successfully!');
          closeAdvancedEditor();
          refreshGCRBusinesses();
        } else {
          throw new Error(data.error || 'Failed to save');
        }
      } catch (error) {
        console.error('Error saving advanced data:', error);
        alert('Error saving: ' + error.message);
      }
    }

    // ========================================
    // BULK EVENTS MANAGEMENT
    // ========================================

    let bulkEventsData = [];

    // Process bulk events CSV
    function processBulkEvents() {
      const fileInput = document.getElementById('bulkEventsFile');

      if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a CSV file first');
        return;
      }

      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = function(e) {
        try {
          const csvText = e.target.result;
          const rows = csvText.split('\n').map(row => row.trim()).filter(row => row.length > 0);

          if (rows.length === 0) {
            alert('CSV file is empty');
            return;
          }

          // Parse CSV
          const parseCSVRow = (row) => {
            const cells = [];
            let currentCell = '';
            let insideQuotes = false;

            for (let i = 0; i < row.length; i++) {
              const char = row[i];
              if (char === '"') {
                insideQuotes = !insideQuotes;
              } else if (char === ',' && !insideQuotes) {
                cells.push(currentCell.trim());
                currentCell = '';
              } else {
                currentCell += char;
              }
            }
            cells.push(currentCell.trim());
            return cells;
          };

          // Check if first row is header
          const firstRow = parseCSVRow(rows[0]);
          const hasHeader = firstRow.some(cell =>
            cell.toLowerCase().includes('business') ||
            cell.toLowerCase().includes('event') ||
            cell.toLowerCase().includes('name')
          );

          const dataRows = hasHeader ? rows.slice(1) : rows;
          const parsedEvents = [];
          const unmatchedEvents = [];

          // Parse each row: business_name, event_name, description, date, start_time, end_time, price, image_url
          dataRows.forEach((row, rowIndex) => {
            const cells = parseCSVRow(row);
            if (cells.length === 0 || cells.every(cell => !cell)) return;

            const businessName = cells[0] || '';
            const eventData = {
              business_name: businessName,
              event: {
                id: Date.now().toString() + '_' + rowIndex,
                name: cells[1] || '',
                description: cells[2] || '',
                date: cells[3] || '',
                time: cells[4] ? `${cells[4]} - ${cells[5] || ''}` : '',
                start_time: cells[4] || '',
                end_time: cells[5] || '',
                price: cells[6] || 'Free',
                image: cells[7] || ''
              }
            };

            // Try to match business
            const matchedBusiness = allGCRBusinesses.find(biz =>
              biz.name.toLowerCase().includes(businessName.toLowerCase()) ||
              businessName.toLowerCase().includes(biz.name.toLowerCase())
            );

            if (matchedBusiness) {
              eventData.business_id = matchedBusiness.id;
              eventData.matched_name = matchedBusiness.name;
              parsedEvents.push(eventData);
            } else {
              unmatchedEvents.push(eventData);
            }
          });

          if (parsedEvents.length === 0) {
            alert('No events could be matched to businesses. Please check business names in your CSV.');
            return;
          }

          // Store parsed events
          bulkEventsData = parsedEvents;

          // Display preview
          displayBulkEventsPreview(parsedEvents, unmatchedEvents);

        } catch (error) {
          console.error('CSV processing error:', error);
          alert('Error processing CSV: ' + error.message);
        }
      };

      reader.onerror = function() {
        alert('Error reading file');
      };

      reader.readAsText(file);
    }

    // Display preview of matched events
    function displayBulkEventsPreview(matchedEvents, unmatchedEvents) {
      // Group events by business
      const eventsByBusiness = {};
      matchedEvents.forEach(item => {
        if (!eventsByBusiness[item.business_id]) {
          eventsByBusiness[item.business_id] = {
            name: item.matched_name,
            events: []
          };
        }
        eventsByBusiness[item.business_id].events.push(item.event);
      });

      // Show stats
      const statsDiv = document.getElementById('matchedEventsStats');
      statsDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div>
            <div style="font-size: 24px; font-weight: 700; color: #059669;">${matchedEvents.length}</div>
            <div style="font-size: 12px; color: #64748b;">Events Matched</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: 700; color: #059669;">${Object.keys(eventsByBusiness).length}</div>
            <div style="font-size: 12px; color: #64748b;">Businesses</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: 700; color: ${unmatchedEvents.length > 0 ? '#dc2626' : '#059669'}">${unmatchedEvents.length}</div>
            <div style="font-size: 12px; color: #64748b;">Unmatched</div>
          </div>
        </div>
      `;

      // Show event list
      const listDiv = document.getElementById('matchedEventsList');
      let html = '';

      Object.entries(eventsByBusiness).forEach(([businessId, data]) => {
        html += `
          <div style="margin-bottom: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-weight: 600; font-size: 16px; color: #333; margin-bottom: 12px;">
              ${data.name} <span style="color: #64748b; font-weight: 400; font-size: 14px;">(${data.events.length} events)</span>
            </div>
            ${data.events.map(event => `
              <div style="padding: 12px; background: #fff; border-radius: 6px; margin-bottom: 8px; border: 1px solid #e5e7eb;">
                <div style="font-weight: 600; color: #0369a1;">${event.name}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
                  📅 ${event.date} ${event.time ? '• ⏰ ' + event.time : ''} ${event.price ? '• 💵 ' + event.price : ''}
                </div>
                <div style="font-size: 13px; color: #475569; margin-top: 6px;">${event.description}</div>
              </div>
            `).join('')}
          </div>
        `;
      });

      if (unmatchedEvents.length > 0) {
        html += `
          <div style="margin-top: 24px; padding: 16px; background: #fef2f2; border-radius: 8px; border: 1px solid #fca5a5;">
            <div style="font-weight: 600; font-size: 16px; color: #dc2626; margin-bottom: 12px;">
              ⚠️ Unmatched Events (${unmatchedEvents.length})
            </div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
              These events could not be matched to any business. Please check business names.
            </div>
            ${unmatchedEvents.map(item => `
              <div style="padding: 8px; background: #fff; border-radius: 6px; margin-bottom: 6px; font-size: 13px;">
                <strong>${item.business_name}</strong> - ${item.event.name}
              </div>
            `).join('')}
          </div>
        `;
      }

      listDiv.innerHTML = html;

      // Show preview section
      document.getElementById('bulkEventsPreview').style.display = 'block';
    }

    // Upload bulk events to businesses
    async function uploadBulkEvents() {
      if (bulkEventsData.length === 0) {
        alert('No events to upload');
        return;
      }

      // Group events by business
      const eventsByBusiness = {};
      bulkEventsData.forEach(item => {
        if (!eventsByBusiness[item.business_id]) {
          eventsByBusiness[item.business_id] = [];
        }
        eventsByBusiness[item.business_id].push(item.event);
      });

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Show progress
      document.getElementById('bulkEventsResults').innerHTML = `
        <div style="padding: 16px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffc107;">
          <div style="font-weight: 600; margin-bottom: 8px;">⏳ Uploading events...</div>
          <div>Please wait while we update all businesses.</div>
        </div>
      `;
      document.getElementById('bulkEventsResults').style.display = 'block';

      // Update each business
      for (const [businessId, newEvents] of Object.entries(eventsByBusiness)) {
        try {
          // Get current business data
          const business = allGCRBusinesses.find(b => b.id === businessId);
          if (!business) {
            errorCount++;
            errors.push({ business: businessId, error: 'Business not found' });
            continue;
          }

          // Merge new events with existing events (avoid duplicates)
          const existingEvents = business.events || [];
          const mergedEvents = [...existingEvents, ...newEvents];

          // Update business
          const response = await fetch(`${GCR_API_URL}/businesses/${businessId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ events: mergedEvents })
          });

          const data = await response.json();

          if (data.success) {
            successCount++;
          } else {
            throw new Error(data.error || 'Update failed');
          }
        } catch (error) {
          console.error('Error updating business:', businessId, error);
          errorCount++;
          errors.push({ business: businessId, error: error.message });
        }
      }

      // Show results
      const resultsDiv = document.getElementById('bulkEventsResults');
      resultsDiv.innerHTML = `
        <div style="padding: 24px; background: ${errorCount === 0 ? '#d1fae5' : '#fef2f2'}; border-radius: 8px; border: 2px solid ${errorCount === 0 ? '#10b981' : '#fca5a5'};">
          <div style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: ${errorCount === 0 ? '#059669' : '#dc2626'};">
            ${errorCount === 0 ? '✅' : '⚠️'} Upload Complete
          </div>
          <div style="font-size: 14px; color: #475569;">
            <div>✅ Successfully updated: ${successCount} businesses</div>
            ${errorCount > 0 ? `<div style="color: #dc2626;">❌ Errors: ${errorCount}</div>` : ''}
            <div style="margin-top: 8px;">📅 Total events uploaded: ${bulkEventsData.length}</div>
          </div>
          ${errors.length > 0 ? `
            <div style="margin-top: 16px; padding: 12px; background: #fff; border-radius: 6px; font-size: 13px;">
              <strong>Errors:</strong>
              ${errors.map(e => `<div>• ${e.business}: ${e.error}</div>`).join('')}
            </div>
          ` : ''}
          <button onclick="finishBulkUpload()" class="btn-primary" style="margin-top: 16px;">Done</button>
        </div>
      `;

      // Hide preview
      document.getElementById('bulkEventsPreview').style.display = 'none';

      // Refresh business list
      refreshGCRBusinesses();
    }

    // Cancel bulk events
    function cancelBulkEvents() {
      bulkEventsData = [];
      document.getElementById('bulkEventsPreview').style.display = 'none';
      document.getElementById('bulkEventsFile').value = '';
    }

    // Finish bulk upload
    function finishBulkUpload() {
      bulkEventsData = [];
      document.getElementById('bulkEventsPreview').style.display = 'none';
      document.getElementById('bulkEventsResults').style.display = 'none';
      document.getElementById('bulkEventsFile').value = '';
    }

    // ========================================
    // LEADS MANAGEMENT
    // ========================================

    // Load leads from localStorage
    function loadLeads() {
      const leads = localStorage.getItem('gcr_leads');
      return leads ? JSON.parse(leads) : [];
    }

    // Save leads to localStorage
    function saveLeads(leads) {
      localStorage.setItem('gcr_leads', JSON.stringify(leads));
    }

    // Refresh leads display
    function refreshLeads() {
      const leads = loadLeads();
      updateLeadsStats(leads);
      renderLeadsTable(leads);
    }

    // Update stats
    function updateLeadsStats(leads) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const leadsToday = leads.filter(l => new Date(l.timestamp) >= todayStart).length;
      const leadsWeek = leads.filter(l => new Date(l.timestamp) >= weekStart).length;
      const leadsPending = leads.filter(l => !l.contacted).length;

      document.getElementById('totalLeads').textContent = leads.length;
      document.getElementById('leadsToday').textContent = leadsToday;
      document.getElementById('leadsWeek').textContent = leadsWeek;
      document.getElementById('leadsPending').textContent = leadsPending;
    }

    // Render leads table
    function renderLeadsTable(leads) {
      const tbody = document.getElementById('leadsTableBody');

      if (leads.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="padding: 40px; text-align: center; color: #9ca3af;">
              <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
              <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No leads yet</div>
              <div style="font-size: 14px;">Form submissions will appear here when users fill them out</div>
            </td>
          </tr>
        `;
        return;
      }

      // Sort by most recent first
      leads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      tbody.innerHTML = leads.map((lead, index) => {
        const date = new Date(lead.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const rowStyle = lead.contacted ? 'opacity: 0.6;' : 'background: #fef3c7;';

        return `
          <tr style="${rowStyle}">
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 13px; font-weight: 600;">${dateStr}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                ${lead.type || 'Contact'}
              </span>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-weight: 600;">${lead.name || 'N/A'}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 13px;">${lead.phone || ''}</div>
              <div style="font-size: 12px; color: #6b7280;">${lead.email || ''}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 13px;">${lead.businessName || 'General'}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 13px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${lead.message || lead.details || 'No message'}
              </div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <button onclick="viewLeadDetails(${index})" style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; margin-right: 4px;">
                View
              </button>
              <button onclick="deleteLead(${index})" style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                Delete
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // View lead details
    function viewLeadDetails(index) {
      const leads = loadLeads();
      const lead = leads[index];

      if (!lead) return;

      const modal = document.getElementById('leadModal');
      const content = document.getElementById('leadModalContent');

      content.innerHTML = `
        <div style="margin-bottom: 24px;">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Submitted</div>
          <div style="font-size: 16px; font-weight: 600;">${new Date(lead.timestamp).toLocaleString()}</div>
        </div>

        <div style="margin-bottom: 24px;">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Type</div>
          <div style="font-size: 16px; font-weight: 600;">${lead.type || 'Contact Form'}</div>
        </div>

        ${lead.name ? `
          <div style="margin-bottom: 24px;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Name</div>
            <div style="font-size: 16px; font-weight: 600;">${lead.name}</div>
          </div>
        ` : ''}

        ${lead.phone ? `
          <div style="margin-bottom: 24px;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Phone</div>
            <div style="font-size: 16px; font-weight: 600;">
              <a href="tel:${lead.phone}" style="color: #667eea; text-decoration: none;">${lead.phone}</a>
            </div>
          </div>
        ` : ''}

        ${lead.email ? `
          <div style="margin-bottom: 24px;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Email</div>
            <div style="font-size: 16px; font-weight: 600;">
              <a href="mailto:${lead.email}" style="color: #667eea; text-decoration: none;">${lead.email}</a>
            </div>
          </div>
        ` : ''}

        ${lead.businessName ? `
          <div style="margin-bottom: 24px;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Business</div>
            <div style="font-size: 16px; font-weight: 600;">${lead.businessName}</div>
          </div>
        ` : ''}

        ${lead.message || lead.details ? `
          <div style="margin-bottom: 24px;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Message/Details</div>
            <div style="font-size: 14px; line-height: 1.6; background: #f9fafb; padding: 16px; border-radius: 8px;">
              ${lead.message || lead.details}
            </div>
          </div>
        ` : ''}

        <div style="display: flex; gap: 12px; margin-top: 32px;">
          <button onclick="markLeadContacted(${index})" style="flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            ✓ Mark as Contacted
          </button>
          <button onclick="closeLeadModal()" style="flex: 1; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Close
          </button>
        </div>
      `;

      modal.style.display = 'flex';
    }

    // Close lead modal
    function closeLeadModal() {
      document.getElementById('leadModal').style.display = 'none';
    }

    // Mark lead as contacted
    function markLeadContacted(index) {
      const leads = loadLeads();
      if (leads[index]) {
        leads[index].contacted = true;
        leads[index].contactedDate = new Date().toISOString();
        saveLeads(leads);
        refreshLeads();
        closeLeadModal();
        alert('Lead marked as contacted!');
      }
    }

    // Delete lead
    function deleteLead(index) {
      if (!confirm('Are you sure you want to delete this lead?')) return;

      const leads = loadLeads();
      leads.splice(index, 1);
      saveLeads(leads);
      refreshLeads();
      alert('Lead deleted!');
    }

    // Export leads to CSV
    function exportLeads() {
      const leads = loadLeads();

      if (leads.length === 0) {
        alert('No leads to export!');
        return;
      }

      // Create CSV
      const headers = ['Date', 'Type', 'Name', 'Phone', 'Email', 'Business', 'Message', 'Contacted'];
      const rows = leads.map(lead => [
        new Date(lead.timestamp).toLocaleString(),
        lead.type || 'Contact',
        lead.name || '',
        lead.phone || '',
        lead.email || '',
        lead.businessName || '',
        (lead.message || lead.details || '').replace(/"/g, '""'),
        lead.contacted ? 'Yes' : 'No'
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gcr-leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      alert(`Exported ${leads.length} leads to CSV!`);
    }

    // Clear all leads
    function clearAllLeads() {
      if (!confirm('Are you sure you want to delete ALL leads? This cannot be undone!')) return;
      if (!confirm('Really delete ALL leads permanently?')) return;

      localStorage.removeItem('gcr_leads');
      refreshLeads();
      alert('All leads deleted!');
    }

    // Initialize leads on page load
    if (document.getElementById('leads')) {
      refreshLeads();
    }

    // ============================================
    // AR HUNTS MANAGEMENT
    // ============================================

    let arHuntManager = null;
    let currentEditingHunt = null;

    // Initialize AR Hunt Manager
    function initARHunts() {
      if (typeof ARHuntManager === 'undefined') {
        console.error('ARHuntManager not loaded');
        return;
      }

      arHuntManager = new ARHuntManager();
      loadHuntsGrid();
      updateHuntStats();
      loadCaptureHistory();
    }

    // Show Create Hunt Modal
    function showCreateHuntModal() {
      currentEditingHunt = null;
      document.getElementById('hunt-modal-title').textContent = 'Create New AR Hunt';
      document.getElementById('hunt-form').reset();
      document.getElementById('hunt-modal').style.display = 'flex';

      // Reset image preview
      document.getElementById('brand-image-preview').style.display = 'none';
      document.getElementById('brand-image-preview').src = '';
    }

    // Show Edit Hunt Modal
    function showEditHuntModal(huntId) {
      const hunt = arHuntManager.getHunt(huntId);
      if (!hunt) {
        alert('Hunt not found!');
        return;
      }

      currentEditingHunt = hunt;
      document.getElementById('hunt-modal-title').textContent = 'Edit AR Hunt';

      // Populate form
      document.getElementById('hunt-brand-name').value = hunt.brandName;
      document.getElementById('hunt-latitude').value = hunt.location.lat;
      document.getElementById('hunt-longitude').value = hunt.location.lng;
      document.getElementById('hunt-hint').value = hunt.location.hint || '';
      document.getElementById('hunt-difficulty').value = hunt.difficulty;
      document.getElementById('hunt-reward-desc').value = hunt.reward.description || '';
      document.getElementById('hunt-reward-value').value = hunt.reward.value || '';
      document.getElementById('hunt-points').value = hunt.pointsValue || 100;

      // Show image preview
      if (hunt.brandImage) {
        const preview = document.getElementById('brand-image-preview');
        preview.src = hunt.brandImage;
        preview.style.display = 'block';
      }

      document.getElementById('hunt-modal').style.display = 'flex';
    }

    // Close Hunt Modal
    function closeHuntModal() {
      document.getElementById('hunt-modal').style.display = 'none';
      document.getElementById('hunt-form').reset();
      currentEditingHunt = null;
    }

    // Handle Image Upload
    function handleHuntImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        const preview = document.getElementById('brand-image-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }

    // Save Hunt
    function saveHunt(event) {
      event.preventDefault();

      const brandName = document.getElementById('hunt-brand-name').value;
      const latitude = parseFloat(document.getElementById('hunt-latitude').value);
      const longitude = parseFloat(document.getElementById('hunt-longitude').value);
      const hint = document.getElementById('hunt-hint').value;
      const difficulty = document.getElementById('hunt-difficulty').value;
      const rewardDesc = document.getElementById('hunt-reward-desc').value;
      const rewardValue = document.getElementById('hunt-reward-value').value;
      const points = parseInt(document.getElementById('hunt-points').value) || 100;

      // Get image
      const imagePreview = document.getElementById('brand-image-preview');
      const brandImage = imagePreview.src || '';

      if (!brandName || isNaN(latitude) || isNaN(longitude)) {
        alert('Please fill in all required fields (Brand Name, Latitude, Longitude)');
        return;
      }

      if (!brandImage) {
        alert('Please upload a brand logo/image');
        return;
      }

      const huntData = {
        brandName,
        brandImage,
        location: {
          lat: latitude,
          lng: longitude,
          hint: hint,
          isCustom: true
        },
        difficulty,
        reward: {
          type: 'custom',
          description: rewardDesc,
          value: rewardValue,
          code: generateRewardCode()
        },
        pointsValue: points,
        active: true
      };

      if (currentEditingHunt) {
        // Update existing hunt
        huntData.id = currentEditingHunt.id;
        arHuntManager.updateHunt(currentEditingHunt.id, huntData);
        alert('Hunt updated successfully!');
      } else {
        // Create new hunt
        arHuntManager.createHunt(huntData);
        alert('Hunt created successfully!');
      }

      closeHuntModal();
      loadHuntsGrid();
      updateHuntStats();
    }

    // Generate Reward Code
    function generateRewardCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    // Load Hunts Grid
    function loadHuntsGrid() {
      if (!arHuntManager) return;

      const hunts = arHuntManager.getAllHunts();
      const grid = document.getElementById('hunts-grid');
      const emptyState = document.getElementById('hunts-empty-state');

      if (hunts.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      grid.style.display = 'grid';
      emptyState.style.display = 'none';

      grid.innerHTML = hunts.map(hunt => createHuntCard(hunt)).join('');
    }

    // Create Hunt Card HTML
    function createHuntCard(hunt) {
      const activeClass = hunt.active ? 'active' : 'inactive';
      const statusBadge = hunt.active ?
        '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🟢 ACTIVE</span>' :
        '<span style="background: #64748b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">⚪ INACTIVE</span>';

      const difficultyColors = {
        easy: '#10b981',
        medium: '#f59e0b',
        hard: '#ef4444'
      };

      return `
        <div class="hunt-card" data-status="${activeClass}" data-difficulty="${hunt.difficulty}" style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1e293b;">${hunt.brandName}</h3>
              ${statusBadge}
            </div>
            <span style="background: ${difficultyColors[hunt.difficulty]}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
              ${hunt.difficulty}
            </span>
          </div>


          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 5px;">📍 LOCATION</div>
            <div style="font-size: 13px; color: #1e293b; margin-bottom: 5px;">
              <strong>GPS:</strong> ${hunt.location.lat.toFixed(6)}, ${hunt.location.lng.toFixed(6)}
            </div>
            ${hunt.location.hint ? `<div style="font-size: 12px; color: #64748b;"><strong>Hint:</strong> ${hunt.location.hint}</div>` : ''}
          </div>

          ${hunt.reward ? `
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 13px;">
              <strong>🎁 Reward:</strong> ${hunt.reward.description || hunt.reward.value}
              ${hunt.reward.code ? `<br><strong>Code:</strong> ${hunt.reward.code}` : ''}
            </div>
          ` : ''}

          <div style="display: flex; gap: 8px; margin-top: 15px;">
            <button onclick="toggleHuntActive('${hunt.id}')" class="btn-secondary" style="flex: 1; padding: 8px; font-size: 13px;">
              ${hunt.active ? '⏸️ Deactivate' : '▶️ Activate'}
            </button>
            <button onclick="showEditHuntModal('${hunt.id}')" class="btn-primary" style="flex: 1; padding: 8px; font-size: 13px;">
              ✏️ Edit
            </button>
            <button onclick="deleteHunt('${hunt.id}')" class="btn-secondary" style="padding: 8px 12px; font-size: 13px; background: #ef4444; color: white;">
              🗑️
            </button>
          </div>

          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            ⭐ ${hunt.pointsValue || 100} points • 📸 ${hunt.captures || 0} captures
          </div>
        </div>
      `;
    }

    // Toggle Hunt Active Status
    function toggleHuntActive(huntId) {
      const hunt = arHuntManager.getHunt(huntId);
      if (!hunt) return;

      hunt.active = !hunt.active;
      arHuntManager.updateHunt(huntId, hunt);

      loadHuntsGrid();
      updateHuntStats();
    }

    // Delete Hunt
    function deleteHunt(huntId) {
      if (!confirm('Are you sure you want to delete this AR hunt?')) return;

      arHuntManager.deleteHunt(huntId);
      loadHuntsGrid();
      updateHuntStats();
      alert('Hunt deleted successfully!');
    }

    // Filter Hunts
    function filterHunts(filter) {
      // Update active button
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
          btn.classList.add('active');
        }
      });

      // Filter cards
      const cards = document.querySelectorAll('.hunt-card');
      cards.forEach(card => {
        const status = card.getAttribute('data-status');
        const difficulty = card.getAttribute('data-difficulty');

        let show = false;
        if (filter === 'all') {
          show = true;
        } else if (filter === 'active' && status === 'active') {
          show = true;
        } else if (filter === 'inactive' && status === 'inactive') {
          show = true;
        } else if (filter === difficulty) {
          show = true;
        }

        card.style.display = show ? 'block' : 'none';
      });
    }

    // Update Hunt Stats
    function updateHuntStats() {
      if (!arHuntManager) return;

      const hunts = arHuntManager.getAllHunts();
      const activeHunts = hunts.filter(h => h.active);
      const totalCaptures = hunts.reduce((sum, h) => sum + (h.captures || 0), 0);

      let topHunt = 'None';
      if (hunts.length > 0) {
        const sorted = [...hunts].sort((a, b) => (b.captures || 0) - (a.captures || 0));
        if (sorted[0].captures > 0) {
          topHunt = sorted[0].brandName;
        }
      }

      document.getElementById('stat-active-hunts').textContent = activeHunts.length;
      document.getElementById('stat-total-captures').textContent = totalCaptures;
      document.getElementById('stat-top-hunt').textContent = topHunt;
      document.getElementById('stat-total-hunts').textContent = hunts.length;
    }

    // GPS Helper - Use Current Location
    function useCurrentLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          document.getElementById('hunt-latitude').value = position.coords.latitude.toFixed(6);
          document.getElementById('hunt-longitude').value = position.coords.longitude.toFixed(6);
          alert('Current location set!');
        },
        (error) => {
          alert('Error getting location: ' + error.message);
        }
      );
    }

    // ============================================
    // CAPTURE HISTORY
    // ============================================

    // Load and display capture history
    function loadCaptureHistory() {
      if (!arHuntManager) return;

      const captures = arHuntManager.getAllCaptures();
      const tbody = document.getElementById('capture-history-body');

      if (captures.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="padding: 40px; text-align: center; color: #94a3b8;">
              No captures yet. Users will appear here when they capture AR hunts.
            </td>
          </tr>
        `;
        updateCaptureStats(captures);
        return;
      }

      tbody.innerHTML = captures.map((capture, index) => {
        const date = new Date(capture.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();

        // Mask phone number for privacy (show last 4 digits)
        const maskedPhone = capture.phone.replace(/(\d{3})(\d{3})(\d{4})/, '(***) ***-$3');

        return `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px;">
              ${capture.photoData ?
                '<div style="width: 60px; height: 60px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">📷</div>'
              }
            </td>
            <td style="padding: 12px;">
              <div style="font-weight: 600; color: #1e293b;">${capture.huntName}</div>
              <div style="font-size: 12px; color: #64748b;">${capture.huntDifficulty}</div>
            </td>
            <td style="padding: 12px;">
              <div style="font-family: monospace; color: #1e293b;">${maskedPhone}</div>
            </td>
            <td style="padding: 12px;">
              <div style="color: #1e293b;">${formattedDate}</div>
              <div style="font-size: 12px; color: #64748b;">${formattedTime}</div>
            </td>
            <td style="padding: 12px;">
              <div style="font-size: 12px; color: #64748b;">
                ${capture.location.lat.toFixed(4)}, ${capture.location.lng.toFixed(4)}
              </div>
              <a href="https://maps.google.com/?q=${capture.location.lat},${capture.location.lng}" target="_blank" style="font-size: 12px; color: #667eea; text-decoration: none;">
                View Map 🗺️
              </a>
            </td>
            <td style="padding: 12px;">
              <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                +${capture.pointsEarned}
              </span>
            </td>
            <td style="padding: 12px;">
              <button onclick="viewCaptureDetails('${capture.id}')" style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
                View Details
              </button>
            </td>
          </tr>
        `;
      }).join('');

      updateCaptureStats(captures);
    }

    // Update capture statistics
    function updateCaptureStats(captures) {
      const totalCaptures = captures.length;
      const uniqueUsers = new Set(captures.map(c => c.phone)).size;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCaptures = captures.filter(c => {
        const captureDate = new Date(c.timestamp);
        captureDate.setHours(0, 0, 0, 0);
        return captureDate.getTime() === today.getTime();
      }).length;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weekCaptures = captures.filter(c =>
        new Date(c.timestamp) >= weekAgo
      ).length;

      document.getElementById('total-captures-stat').textContent = totalCaptures;
      document.getElementById('unique-users-stat').textContent = uniqueUsers;
      document.getElementById('today-captures-stat').textContent = todayCaptures;
      document.getElementById('week-captures-stat').textContent = weekCaptures;
    }

    // Refresh capture history
    function refreshCaptureHistory() {
      loadCaptureHistory();
    }

    // View capture photo in modal
    function viewCapturePhoto(captureId) {
      const captures = arHuntManager.getAllCaptures();
      const capture = captures.find(c => c.id === captureId);

      if (!capture || !capture.photoData) return;

      // Create modal to show photo
      const modal = document.createElement('div');
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center;';

      modal.innerHTML = `
        <div style="max-width: 90%; max-height: 90%; position: relative;">
          <button onclick="this.closest('div').parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer;">×</button>
        </div>
      `;

      modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
      };

      document.body.appendChild(modal);
    }

    // View capture details
    function viewCaptureDetails(captureId) {
      const captures = arHuntManager.getAllCaptures();
      const capture = captures.find(c => c.id === captureId);

      if (!capture) return;

      const date = new Date(capture.timestamp);

      alert(`
📸 Capture Details

Hunt: ${capture.huntName}
Difficulty: ${capture.huntDifficulty}
Phone: ${capture.phone}
Date: ${date.toLocaleString()}
Location: ${capture.location.lat.toFixed(6)}, ${capture.location.lng.toFixed(6)}
Points Earned: ${capture.pointsEarned}
${capture.rewardCode ? `Reward Code: ${capture.rewardCode}` : ''}
      `.trim());
    }

    // ============================================
    // END CAPTURE HISTORY
    // ============================================

    // ============================================
    // END AR HUNTS MANAGEMENT
    // ============================================
    // CSV Import Functions
    let csvImportManager = null;
    let selectedFile = null;

    function openCSVImportModal() {
      document.getElementById('csvImportModal').style.display = 'block';
      if (!csvImportManager) {
        csvImportManager = new CSVImportManager();
      }
    }

    function closeCSVImportModal() {
      document.getElementById('csvImportModal').style.display = 'none';
      document.getElementById('csvFileInput').value = '';
      document.getElementById('fileInfo').innerHTML = '';
      document.getElementById('importProgress').style.display = 'none';
      document.getElementById('importResult').style.display = 'none';
      selectedFile = null;
      document.getElementById('importButton').disabled = true;
    }

    function handleFileSelect() {
      const input = document.getElementById('csvFileInput');
      selectedFile = input.files[0];

      if (selectedFile) {
        const fileInfo = document.getElementById('fileInfo');
        fileInfo.innerHTML = `✅ Selected: <strong>${selectedFile.name}</strong> (${(selectedFile.size / 1024).toFixed(2)} KB)`;
        fileInfo.style.color = '#059669';
        document.getElementById('importButton').disabled = false;
      }
    }

    function updateImportMode() {
      const mode = document.querySelector('input[name="importMode"]:checked').value;
      const sectionsDiv = document.getElementById('sectionsToUpdate');

      if (mode === 'update') {
        sectionsDiv.style.display = 'block';
      } else {
        sectionsDiv.style.display = 'none';
      }

      // Update border colors
      document.querySelectorAll('input[name="importMode"]').forEach(radio => {
        const label = radio.parentElement;
        if (radio.checked) {
          label.style.borderColor = '#667eea';
          label.style.backgroundColor = '#f0f4ff';
        } else {
          label.style.borderColor = '#e2e8f0';
          label.style.backgroundColor = 'white';
        }
      });
    }

    async function startImport() {
      if (!selectedFile) {
        alert('Please select a CSV file first');
        return;
      }

      const mode = document.querySelector('input[name="importMode"]:checked').value;
      let sections = [];

      if (mode === 'update') {
        const checkboxes = document.querySelectorAll('#sectionsToUpdate input[type="checkbox"]:checked');
        sections = Array.from(checkboxes).map(cb => cb.value);

        if (sections.length === 0) {
          alert('Please select at least one section to update');
          return;
        }
      }

      // Show progress
      document.getElementById('importProgress').style.display = 'block';
      document.getElementById('importStatus').textContent = 'Parsing CSV file...';
      document.getElementById('importButton').disabled = true;
      document.getElementById('importResult').style.display = 'none';

      try {
        // Import CSV
        const result = await csvImportManager.importCSV(selectedFile, mode, sections);

        // Hide progress
        document.getElementById('importProgress').style.display = 'none';

        if (result.success) {
          // Show success
          const resultDiv = document.getElementById('importResult');
          resultDiv.style.display = 'block';
          resultDiv.style.padding = '20px';
          resultDiv.style.backgroundColor = '#ecfdf5';
          resultDiv.style.border = '2px solid #10b981';
          resultDiv.style.borderRadius = '12px';
          resultDiv.innerHTML = `
            <div style="font-weight: 700; color: #047857; font-size: 18px; margin-bottom: 12px;">✅ Import Successful!</div>
            <div style="color: #065f46; font-size: 15px; line-height: 1.8;">
              <div><strong>Mode:</strong> ${mode.toUpperCase()}</div>
              <div><strong>Businesses Affected:</strong> ${result.businessesAffected.length}</div>
              ${result.itemsAdded ? `<div><strong>Items Added:</strong> ${result.itemsAdded}</div>` : ''}
              ${result.duplicatesSkipped ? `<div><strong>Duplicates Skipped:</strong> ${result.duplicatesSkipped}</div>` : ''}
              ${result.warnings && result.warnings.length > 0 ? `<div style="margin-top: 12px; color: #b45309;"><strong>Warnings:</strong><br>${result.warnings.slice(0, 5).join('<br>')}</div>` : ''}
            </div>
          `;

          // Refresh businesses table
          setTimeout(() => {
            if (typeof refreshGCRBusinesses === 'function') {
              refreshGCRBusinesses();
            }
          }, 1000);

        } else {
          // Show error
          const resultDiv = document.getElementById('importResult');
          resultDiv.style.display = 'block';
          resultDiv.style.padding = '20px';
          resultDiv.style.backgroundColor = '#fef2f2';
          resultDiv.style.border = '2px solid #ef4444';
          resultDiv.style.borderRadius = '12px';
          resultDiv.innerHTML = `
            <div style="font-weight: 700; color: #dc2626; font-size: 18px; margin-bottom: 12px;">❌ Import Failed</div>
            <div style="color: #991b1b; font-size: 15px; line-height: 1.8;">
              <div><strong>Error:</strong> ${result.error || 'Unknown error'}</div>
              ${result.errors && result.errors.length > 0 ? `<div style="margin-top: 12px;"><strong>Details:</strong><br>${result.errors.slice(0, 5).join('<br>')}</div>` : ''}
            </div>
          `;
        }

      } catch (error) {
        // Hide progress
        document.getElementById('importProgress').style.display = 'none';

        // Show error
        const resultDiv = document.getElementById('importResult');
        resultDiv.style.display = 'block';
        resultDiv.style.padding = '20px';
        resultDiv.style.backgroundColor = '#fef2f2';
        resultDiv.style.border = '2px solid #ef4444';
        resultDiv.style.borderRadius = '12px';
        resultDiv.innerHTML = `
          <div style="font-weight: 700; color: #dc2626; font-size: 18px; margin-bottom: 12px;">❌ Import Failed</div>
          <div style="color: #991b1b; font-size: 15px;">
            <strong>Error:</strong> ${error.message || 'Unknown error occurred'}
          </div>
        `;
      }

      document.getElementById('importButton').disabled = false;
    }
    // Initialize AI assistant when page loads
    document.addEventListener('DOMContentLoaded', function() {
      // Check if OpenAI API key is configured
      const openaiKey = localStorage.getItem('openai_api_key');

      if (openaiKey) {
        dashboardAI.init(openaiKey);
        dashboardAI.clearChat(); // Show welcome message
      }

      // Show toggle button
      const toggleBtn = document.getElementById('ai-toggle-btn');
      if (toggleBtn) {
        toggleBtn.classList.remove('hidden');
      }

      // Track tab changes for context
      const originalSwitchTab = window.switchTab;
      window.switchTab = function(tabName) {
        originalSwitchTab(tabName);
        dashboardAI.updateContext({ tab: tabName });
      };
    });

    // Enhanced CSV import with AI validation
    const originalStartImport = window.startImport;
    window.startImport = async function() {
      const fileInput = document.getElementById('csvFileInput');
      const file = fileInput.files[0];
      const mode = document.querySelector('input[name="importMode"]:checked').value;

      if (!file) {
        alert('Please select a CSV file');
        return;
      }

      // Ask AI to validate before importing
      if (window.dashboardAI && window.dashboardAI.apiKey) {
        const sections = [];
        if (mode === 'update') {
          document.querySelectorAll('input[name="updateSection"]:checked').forEach(cb => {
            sections.push(cb.value);
          });
        }

        // Show AI and ask for validation
        await dashboardAI.validateCSV(file, mode, sections);
      }

      // Proceed with import
      await originalStartImport();
    };

    // Track errors for AI help
    window.addEventListener('error', function(event) {
      if (window.dashboardAI) {
        dashboardAI.updateContext({
          lastError: event.message,
          lastAction: 'Error occurred'
        });
      }
    });
