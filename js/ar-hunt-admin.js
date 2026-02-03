// AR Hunt Admin Interface
// Dashboard for creating and managing AR scavenger hunts

class ARHuntAdmin {
  constructor() {
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.updateStats();
    this.renderHunts();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderHunts();
      });
    });
  }

  // Update statistics cards
  updateStats() {
    const stats = arHuntManager.getStats();

    document.getElementById('stat-active-hunts').textContent = stats.activeHunts;
    document.getElementById('stat-total-captures').textContent = stats.totalCaptures;
    document.getElementById('stat-top-hunt').textContent = stats.topHunt;
    document.getElementById('stat-businesses').textContent = stats.participatingBusinesses;
  }

  // Render hunts grid
  renderHunts() {
    const grid = document.getElementById('hunts-grid');
    const emptyState = document.getElementById('empty-state');

    let hunts = arHuntManager.getAllHunts();

    // Apply filter
    if (this.currentFilter === 'active') {
      hunts = hunts.filter(h => h.active);
    } else if (this.currentFilter === 'inactive') {
      hunts = hunts.filter(h => !h.active);
    }

    if (hunts.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'flex';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = hunts.map(hunt => this.renderHuntCard(hunt)).join('');
  }

  // Render individual hunt card
  renderHuntCard(hunt) {
    const statusClass = hunt.active ? 'status-active' : 'status-inactive';
    const statusText = hunt.active ? 'Active' : 'Inactive';

    return `
      <div class="hunt-card ${!hunt.active ? 'inactive' : ''}">
        <div class="hunt-card-header">
          <div class="hunt-brand-preview">
            ${hunt.brandImage ? `<img src="${hunt.brandImage}" alt="${hunt.brandName}">` : '🏢'}
          </div>
          <div class="hunt-status ${statusClass}">${statusText}</div>
        </div>

        <div class="hunt-card-body">
          <h3 class="hunt-title">${hunt.brandName}</h3>
          <p class="hunt-description">${hunt.description || 'No description'}</p>

          <div class="hunt-meta">
            <div class="hunt-meta-item">
              <span class="hunt-meta-icon">📍</span>
              <span class="hunt-meta-text">${hunt.location.address || 'Custom location'}${hunt.location.isCustom ? ' <span style="background: #8b5cf6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 8px;">📍 CUSTOM</span>' : ''}</span>
            </div>
            <div class="hunt-meta-item">
              <span class="hunt-meta-icon">🎁</span>
              <span class="hunt-meta-text">${hunt.reward.description || hunt.reward.value}</span>
            </div>
            <div class="hunt-meta-item">
              <span class="hunt-meta-icon">⭐</span>
              <span class="hunt-meta-text">${hunt.pointsValue} points</span>
            </div>
            <div class="hunt-meta-item">
              <span class="hunt-meta-icon">👥</span>
              <span class="hunt-meta-text">${hunt.captureCount} captures</span>
            </div>
          </div>

          <div class="hunt-location-hint">
            <strong>Hint:</strong> ${hunt.location.hint || 'No hint provided'}
          </div>

          <div class="hunt-reward-code">
            <strong>Reward Code:</strong> <code>${hunt.reward.code}</code>
            <button class="btn-copy-code" onclick="arHuntAdmin.copyCode('${hunt.reward.code}')">Copy</button>
          </div>
        </div>

        <div class="hunt-card-actions">
          <button class="btn-icon" onclick="arHuntAdmin.moveHuntLocation('${hunt.id}')" title="Move Location">
            📍
          </button>
          <button class="btn-icon" onclick="arHuntAdmin.editHunt('${hunt.id}')" title="Edit">
            ✏️
          </button>
          <button class="btn-icon" onclick="arHuntAdmin.toggleActive('${hunt.id}')" title="Toggle Active">
            ${hunt.active ? '⏸️' : '▶️'}
          </button>
          <button class="btn-icon btn-danger" onclick="arHuntAdmin.deleteHunt('${hunt.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  // Show create hunt modal
  showCreateHuntModal() {
    const modal = document.createElement('div');
    modal.className = 'hunt-modal';
    modal.id = 'create-hunt-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="document.getElementById('create-hunt-modal').remove()"></div>
      <div class="modal-content hunt-modal-content">
        <div class="modal-header">
          <h2>🎯 Create New AR Hunt</h2>
          <button class="modal-close" onclick="document.getElementById('create-hunt-modal').remove()">×</button>
        </div>

        <form id="create-hunt-form" class="hunt-form">
          <div class="form-section">
            <h3>Brand Information</h3>

            <div class="form-group">
              <label>Business (Optional)</label>
              <select name="businessId" id="hunt-business">
                <option value="">- Select Business -</option>
                ${this.renderBusinessOptions()}
              </select>
            </div>

            <div class="form-group">
              <label>Brand Name *</label>
              <input type="text" name="brandName" id="hunt-brand-name" placeholder="e.g., The Hangout" required>
            </div>

            <div class="form-group">
              <label>Brand Image/Logo *</label>
              <input type="file" id="hunt-brand-image" accept="image/*" required>
              <div id="image-preview" class="image-preview"></div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="Short description of the hunt"></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>📍 Location (Where to Hide)</h3>

            <div class="form-group" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 16px; border-radius: 8px; border-left: 4px solid #0284c7; margin-bottom: 20px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; color: #0284c7;">
                <input type="checkbox" id="use-custom-location" onchange="arHuntAdmin.toggleLocationMode()" style="width: auto;">
                📍 Use Custom Location (Hide AR at different place)
              </label>
              <small style="display: block; margin-top: 8px; color: #475569; line-height: 1.5;">
                Uncheck to use the selected business location. Check to place the AR object anywhere else in the world!
                <a href="https://maps.google.com" target="_blank" style="color: #0284c7;">Get coordinates from Google Maps →</a>
              </small>
            </div>

            <div id="location-fields">
              <div class="form-group">
                <label>Latitude *</label>
                <input type="number" name="lat" id="hunt-lat" step="0.000001" placeholder="30.2707" required>
                <small>North/South coordinate (use Google Maps to find)</small>
              </div>

              <div class="form-group">
                <label>Longitude *</label>
                <input type="number" name="lng" id="hunt-lng" step="0.000001" placeholder="-87.6009" required>
                <small>East/West coordinate (use Google Maps to find)</small>
              </div>

              <div class="form-group">
                <label>Address (Optional)</label>
                <input type="text" name="address" id="hunt-address" placeholder="e.g., Pensacola Beach Pier">
              </div>

              <div class="form-group">
                <label>Location Hint *</label>
                <input type="text" name="hint" placeholder="e.g., Look for the floating sign near the pier entrance" required>
                <small>This hint helps users find the AR item</small>
              </div>

              <div style="display: flex; gap: 10px;">
                <button type="button" class="btn-secondary" onclick="arHuntAdmin.getCurrentLocation()">
                  📍 Use Current Location
                </button>
                <button type="button" class="btn-secondary" onclick="arHuntAdmin.useBusinessLocation()">
                  🏢 Use Selected Business Location
                </button>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>🎁 Reward</h3>

            <div class="form-group">
              <label>Reward Type *</label>
              <select name="rewardType" required>
                <option value="discount">Discount/Coupon</option>
                <option value="freeItem">Free Item</option>
                <option value="points">Bonus Points</option>
                <option value="badge">Special Badge</option>
              </select>
            </div>

            <div class="form-group">
              <label>Reward Value *</label>
              <input type="text" name="rewardValue" placeholder="e.g., 10% off" required>
            </div>

            <div class="form-group">
              <label>Reward Description</label>
              <input type="text" name="rewardDescription" placeholder="e.g., 10% off your next meal">
            </div>

            <div class="form-group">
              <label>Points Value *</label>
              <input type="number" name="pointsValue" value="100" min="10" step="10" required>
              <small>Points awarded for capturing this hunt</small>
            </div>
          </div>

          <div class="form-section">
            <h3>⚙️ Settings</h3>

            <div class="form-group">
              <label>Difficulty</label>
              <select name="difficulty">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" name="featured">
                <span>Featured Hunt (Show first)</span>
              </label>
            </div>

            <div class="form-group">
              <label>Max Captures (Optional)</label>
              <input type="number" name="maxCaptures" placeholder="Leave empty for unlimited">
              <small>Limit how many times this hunt can be captured</small>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary btn-large">Create Hunt</button>
            <button type="button" class="btn-secondary" onclick="document.getElementById('create-hunt-modal').remove()">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup form handlers
    this.setupFormHandlers();
  }

  setupFormHandlers() {
    // Image preview
    const imageInput = document.getElementById('hunt-brand-image');
    const imagePreview = document.getElementById('image-preview');

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imagePreview.innerHTML = `<img src="${event.target.result}" alt="Brand preview">`;
          imagePreview.dataset.image = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // Form submission
    const form = document.getElementById('create-hunt-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateHunt(new FormData(form));
    });
  }

  handleCreateHunt(formData) {
    const imagePreview = document.getElementById('image-preview');
    const brandImage = imagePreview.dataset.image;

    if (!brandImage) {
      alert('Please upload a brand image');
      return;
    }

    // Check if using custom location
    const useCustomLocation = document.getElementById('use-custom-location').checked;
    const businessId = formData.get('businessId');

    // Determine if location is custom or business location
    let isCustom = useCustomLocation;
    if (businessId && !useCustomLocation) {
      const business = allBusinesses.find(b => b.id === businessId);
      if (business && business.coordinates) {
        // Compare coordinates to see if they match business location
        const lat = parseFloat(formData.get('lat'));
        const lng = parseFloat(formData.get('lng'));
        isCustom = Math.abs(lat - business.coordinates.lat) > 0.0001 ||
                   Math.abs(lng - business.coordinates.lng) > 0.0001;
      }
    }

    const huntData = {
      businessId: businessId || null,
      brandName: formData.get('brandName'),
      brandImage: brandImage,
      description: formData.get('description'),
      location: {
        lat: parseFloat(formData.get('lat')),
        lng: parseFloat(formData.get('lng')),
        address: formData.get('address'),
        hint: formData.get('hint'),
        isCustom: isCustom
      },
      reward: {
        type: formData.get('rewardType'),
        value: formData.get('rewardValue'),
        description: formData.get('rewardDescription')
      },
      difficulty: formData.get('difficulty'),
      pointsValue: parseInt(formData.get('pointsValue')),
      featured: formData.get('featured') === 'on',
      maxCaptures: formData.get('maxCaptures') ? parseInt(formData.get('maxCaptures')) : null
    };

    const hunt = arHuntManager.createHunt(huntData);

    document.getElementById('create-hunt-modal').remove();

    this.updateStats();
    this.renderHunts();

    alert(`✅ Hunt created successfully!\n\nReward Code: ${hunt.reward.code}\n\nKeep this code safe - users will need it to redeem their reward.`);
  }

  renderBusinessOptions() {
    if (typeof allBusinesses === 'undefined') {
      return '<option value="">No businesses loaded</option>';
    }

    return allBusinesses.map(b =>
      `<option value="${b.id}">${b.name}</option>`
    ).join('');
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.querySelector('input[name="lat"]').value = position.coords.latitude.toFixed(6);
        document.querySelector('input[name="lng"]').value = position.coords.longitude.toFixed(6);
        document.getElementById('use-custom-location').checked = true;
        alert('✅ Current location set!');
      },
      (error) => {
        alert('Error getting location: ' + error.message);
      }
    );
  }

  toggleLocationMode() {
    const checkbox = document.getElementById('use-custom-location');
    const fields = document.getElementById('location-fields');

    if (!checkbox.checked) {
      // Using business location - try to auto-fill
      this.useBusinessLocation();
    }
  }

  useBusinessLocation() {
    const businessSelect = document.getElementById('hunt-business');
    const businessId = businessSelect.value;

    if (!businessId) {
      alert('⚠️ Please select a business first');
      document.getElementById('use-custom-location').checked = false;
      return;
    }

    const business = allBusinesses.find(b => b.id === businessId);
    if (!business || !business.coordinates) {
      alert('⚠️ Selected business does not have coordinates');
      return;
    }

    // Fill in business location
    document.getElementById('hunt-lat').value = business.coordinates.lat;
    document.getElementById('hunt-lng').value = business.coordinates.lng;
    document.getElementById('hunt-address').value = business.address || business.name;

    // Uncheck custom location
    document.getElementById('use-custom-location').checked = false;

    alert('✅ Using business location:\n' + business.name + '\n' + business.address);
  }

  moveHuntLocation(huntId) {
    const hunt = arHuntManager.getHunt(huntId);
    if (!hunt) return;

    const newLat = prompt(`Enter new Latitude:\n\nCurrent: ${hunt.location.lat}`, hunt.location.lat);
    if (!newLat) return;

    const newLng = prompt(`Enter new Longitude:\n\nCurrent: ${hunt.location.lng}`, hunt.location.lng);
    if (!newLng) return;

    const newHint = prompt(`Enter new location hint:\n\nCurrent: ${hunt.location.hint}`, hunt.location.hint);

    arHuntManager.moveHunt(huntId, {
      lat: parseFloat(newLat),
      lng: parseFloat(newLng),
      address: hunt.location.address,
      hint: newHint || hunt.location.hint
    });

    this.renderHunts();
    alert('✅ Hunt location moved!');
  }

  editHunt(huntId) {
    // For now, simple edit - could expand to full modal later
    const hunt = arHuntManager.getHunt(huntId);
    if (!hunt) return;

    const newHint = prompt(`Edit location hint:`, hunt.location.hint);
    if (newHint !== null) {
      arHuntManager.updateHunt(huntId, {
        location: {
          ...hunt.location,
          hint: newHint
        }
      });
    }

    const newRewardDesc = prompt(`Edit reward description:`, hunt.reward.description);
    if (newRewardDesc !== null) {
      arHuntManager.updateHunt(huntId, {
        reward: {
          ...hunt.reward,
          description: newRewardDesc
        }
      });
    }

    this.renderHunts();
  }

  toggleActive(huntId) {
    arHuntManager.toggleHuntActive(huntId);
    this.updateStats();
    this.renderHunts();
  }

  deleteHunt(huntId) {
    const hunt = arHuntManager.getHunt(huntId);
    if (!hunt) return;

    if (confirm(`Delete hunt "${hunt.brandName}"?\n\nThis cannot be undone.`)) {
      arHuntManager.deleteHunt(huntId);
      this.updateStats();
      this.renderHunts();
    }
  }

  copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      alert(`✅ Code copied: ${code}`);
    });
  }
}

// Initialize admin interface
const arHuntAdmin = new ARHuntAdmin();
