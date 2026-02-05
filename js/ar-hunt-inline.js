    // ============================================
    // DEBUG CONFIGURATION
    // ============================================
    const DEBUG_MODE = true; // Set to false for production
    const DEBUG_DISTANCE_KM = 10; // 10km for testing (vs 0.01km = 10m for production)

    function debugLog(message, data = null) {
      if (DEBUG_MODE) {
        console.log(`[AR Hunt Debug] ${message}`, data || '');
        updateDebugPanel(message, data);
      }
    }

    let debugMessages = [];
    function updateDebugPanel(message, data) {
      const panel = document.getElementById('debug-panel');
      const content = document.getElementById('debug-content');

      if (!panel || !content) return;

      // Show panel
      panel.style.display = 'block';

      // Add message
      const timestamp = new Date().toLocaleTimeString();
      debugMessages.unshift(`[${timestamp}] ${message}`);

      // Keep only last 10 messages
      if (debugMessages.length > 10) {
        debugMessages = debugMessages.slice(0, 10);
      }

      // Update display
      content.innerHTML = debugMessages.map(msg => `<div>${msg}</div>`).join('');
    }

    // Initialize AR Hunt Manager
    const arHuntManager = new ARHuntManager();
    let currentHunt = null;
    let userLocation = null;
    let arScene = null;
    let watchId = null;
    let userPhoneNumber = null;

    debugLog('AR Hunt initialized', { DEBUG_MODE, DEBUG_DISTANCE_KM });

    // ============================================
    // PHONE NUMBER MANAGEMENT
    // ============================================

    // Check if user has phone number on load
    function checkPhoneNumber() {
      const stored = localStorage.getItem('gcr_user_phone');
      if (stored) {
        userPhoneNumber = stored;
        return true;
      }
      return false;
    }

    // Save phone number
    function savePhoneNumber(event) {
      event.preventDefault();

      const phoneInput = document.getElementById('phone-input');
      const phone = phoneInput.value.trim();

      if (!phone) {
        alert('Please enter a phone number');
        return;
      }

      // Store phone number
      localStorage.setItem('gcr_user_phone', phone);
      userPhoneNumber = phone;

      debugLog('✅ Phone number saved', { phone });

      // Hide modal
      document.getElementById('phone-modal').style.display = 'none';

      // Load hunts
      loadHunts();
    }

    // Format phone number as user types
    document.addEventListener('DOMContentLoaded', () => {
      const phoneInput = document.getElementById('phone-input');
      if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
          let value = e.target.value.replace(/\D/g, '');
          if (value.length > 0) {
            if (value.length <= 3) {
              value = `(${value}`;
            } else if (value.length <= 6) {
              value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
              value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
          }
          e.target.value = value;
        });
      }
    });

    // ============================================
    // END PHONE NUMBER MANAGEMENT
    // ============================================

    // Load available hunts
    function loadHunts() {
      const hunts = arHuntManager.getActiveHunts();
      const huntsList = document.getElementById('hunts-list');

      if (hunts.length === 0) {
        huntsList.innerHTML = `
          <div class="hunt-card">
            <p style="text-align: center; color: #64748b;">No active hunts available. Check back soon!</p>
          </div>
        `;
        return;
      }

      huntsList.innerHTML = hunts.map(hunt => `
        <div class="hunt-card">
          <div class="hunt-card-header">
            <div class="hunt-brand">${hunt.brandName}</div>
            <span class="difficulty-badge difficulty-${hunt.difficulty}">${hunt.difficulty}</span>
          </div>

          ${hunt.description ? `<p style="color: #64748b; margin-bottom: 15px;">${hunt.description}</p>` : ''}

          <div class="hunt-clue">
            <div class="hunt-clue-label">🔍 Clue</div>
            <div class="hunt-clue-text">${hunt.location.hint}</div>
          </div>

          <div class="hunt-reward">
            <span>🎁</span>
            <span>${hunt.reward.description || hunt.reward.value}</span>
          </div>

          <button class="start-hunt-btn" onclick="startHunt('${hunt.id}')">
            Start Hunt 🎯
          </button>
        </div>
      `).join('');
    }

    // Start specific hunt
    function startHunt(huntId) {
      currentHunt = arHuntManager.getHunt(huntId);
      if (!currentHunt) {
        alert('Hunt not found!');
        debugLog('❌ Hunt not found', { huntId });
        return;
      }

      debugLog('🎯 Starting hunt', {
        huntId,
        brandName: currentHunt.brandName,
        location: currentHunt.location,
        difficulty: currentHunt.difficulty
      });

      // Hide selection, show AR view
      document.getElementById('hunt-selection').classList.add('hidden');
      document.getElementById('ar-view').classList.add('active');
      document.getElementById('loading').style.display = 'block';

      // Request permissions and start AR
      setTimeout(() => {
        initAR();
      }, 500);
    }

    // Initialize AR Camera
    function initAR() {
      arScene = document.querySelector('a-scene');
      debugLog('📷 Initializing AR camera...');

      // Wait for AR.js to be ready
      arScene.addEventListener('loaded', () => {
        document.getElementById('loading').style.display = 'none';
        debugLog('✅ AR scene loaded');

        // Start tracking user location
        startLocationTracking();

        // Add AR object to scene
        addARObject();
      });
    }

    // Add AR Object at GPS Location
    function addARObject() {
      const lat = currentHunt.location.lat;
      const lng = currentHunt.location.lng;

      // Create AR entity with brand image
      const arEntity = document.createElement('a-image');
      arEntity.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lng};`);
      arEntity.setAttribute('src', currentHunt.brandImage);
      arEntity.setAttribute('scale', '15 15 15');
      arEntity.setAttribute('look-at', '[gps-camera]');
      arEntity.setAttribute('id', 'ar-target');

      arScene.appendChild(arEntity);

      console.log(`AR object placed at: ${lat}, ${lng}`);
    }

    // Track User Location
    function startLocationTracking() {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your device');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          updateDistance();
        },
        (error) => {
          console.error('Location error:', error);
          document.getElementById('distance-indicator').textContent = 'Location unavailable';
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }

    // Calculate and Update Distance
    function updateDistance() {
      if (!userLocation || !currentHunt) return;

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        currentHunt.location.lat,
        currentHunt.location.lng
      );

      const distanceText = distance < 1
        ? `${Math.round(distance * 1000)}m away`
        : `${distance.toFixed(2)}km away`;

      const distanceThreshold = DEBUG_MODE ? DEBUG_DISTANCE_KM : 0.01;
      const indicator = document.getElementById('distance-indicator');

      indicator.textContent = DEBUG_MODE
        ? `${distanceText} [DEBUG: ${distanceThreshold}km threshold]`
        : distanceText;

      debugLog('Distance updated', {
        distance: distance.toFixed(3) + 'km',
        threshold: distanceThreshold + 'km',
        canCapture: distance < distanceThreshold,
        userLocation,
        huntLocation: currentHunt.location
      });

      // Show capture button when within threshold
      if (distance < distanceThreshold) {
        document.getElementById('capture-button').classList.add('visible');
        document.getElementById('capture-button').onclick = captureHunt;
        debugLog('✅ Capture button shown - within range!');
      } else {
        document.getElementById('capture-button').classList.remove('visible');
      }
    }

    // Calculate Distance (Haversine Formula)
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    // Capture Hunt (Take Photo)
    async function captureHunt() {
      debugLog('📸 Attempting to capture hunt...');

      // Verify user has phone number
      if (!userPhoneNumber) {
        debugLog('❌ No phone number found');
        alert('Please enter your phone number first');
        document.getElementById('phone-modal').style.display = 'flex';
        return;
      }

      debugLog('Phone number verified', { phone: userPhoneNumber });

      // Stop location tracking
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        debugLog('Location tracking stopped');
      }

      // Hide capture button
      document.getElementById('capture-button').classList.remove('visible');

      try {
        // Take photo
        debugLog('Taking photo from AR view...');
        const photoData = await takePhoto();
        debugLog(photoData ? '✅ Photo captured' : '⚠️ No photo data (will continue without photo)');

        // Record capture with phone number and photo
        debugLog('Recording capture...', {
          huntId: currentHunt.id,
          phone: userPhoneNumber,
          location: userLocation,
          hasPhoto: !!photoData
        });

        const result = arHuntManager.captureHunt(
          currentHunt.id,
          userPhoneNumber,
          userLocation,
          photoData
        );

        debugLog('Capture result', result);

        if (!result.success) {
          debugLog('❌ Capture failed', result);
          if (result.duplicate) {
            alert('You already captured this hunt! Try finding a different one.');
          } else {
            alert(result.error || 'Failed to capture hunt');
          }
          return;
        }

        debugLog('✅ Capture successful!', result);

        // Show success with reward info
        document.getElementById('success-message').textContent =
          `You earned ${result.totalPoints} points!`;

        if (result.reward) {
          const rewardInfo = document.getElementById('reward-info');
          const rewardText = document.getElementById('reward-text');
          const rewardCode = document.getElementById('reward-code');

          rewardText.textContent = result.reward.description || result.reward.value;

          if (result.reward.code) {
            rewardCode.textContent = `Code: ${result.reward.code}`;
            rewardCode.style.display = 'block';
          }

          rewardInfo.style.display = 'block';
        }

        document.getElementById('success-overlay').classList.add('show');

        // Vibrate phone (if supported)
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }

      } catch (error) {
        debugLog('❌ Capture error', error);
        console.error('Capture error:', error);
        alert(`Failed to capture: ${error.message || 'Unknown error'}. Check console for details.`);

        // Re-show capture button
        document.getElementById('capture-button').classList.add('visible');
      }
    }

    // Take photo using device camera
    async function takePhoto() {
      return new Promise((resolve, reject) => {
        // Get video element from A-Frame scene
        const video = document.querySelector('a-scene').components.screenshot.getCanvas('perspective');

        if (!video) {
          // Fallback: just record without photo
          console.warn('Could not access camera for photo');
          resolve(null);
          return;
        }

        try {
          // Create canvas to capture frame
          const canvas = document.createElement('canvas');
          const scene = document.querySelector('a-scene');
          const renderer = scene.renderer;

          canvas.width = renderer.domElement.width;
          canvas.height = renderer.domElement.height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(renderer.domElement, 0, 0);

          // Convert to base64
          const photoData = canvas.toDataURL('image/jpeg', 0.8);
          resolve(photoData);

        } catch (error) {
          console.error('Photo capture error:', error);
          // Continue without photo
          resolve(null);
        }
      });
    }

    // Back to Hunts
    function backToHunts() {
      document.getElementById('success-overlay').classList.remove('show');
      document.getElementById('ar-view').classList.remove('active');
      document.getElementById('hunt-selection').classList.remove('hidden');

      // Remove AR entity
      const arTarget = document.getElementById('ar-target');
      if (arTarget) arTarget.remove();

      // Reload hunts
      loadHunts();
    }

    // Go Home
    function goHome() {
      window.location.href = 'index.html';
    }

    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
      // Check if user has phone number
      if (checkPhoneNumber()) {
        // User has phone number, load hunts
        loadHunts();
      } else {
        // Show phone number modal
        document.getElementById('phone-modal').style.display = 'flex';
      }
    });
