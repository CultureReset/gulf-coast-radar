// Beach Flag Status Widget
// Displays current beach conditions and safety information

class BeachFlagWidget {
  constructor(containerId = 'beach-flag-widget') {
    this.containerId = containerId;
    this.container = null;
    this.conditions = null;
  }

  async init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn('Beach flag widget container not found');
      return;
    }

    // Load initial conditions
    await this.updateConditions();

    // Listen for updates
    window.addEventListener('beachConditionsUpdated', () => {
      this.updateConditions();
    });

    // Refresh on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateConditions();
      }
    });
  }

  async updateConditions() {
    try {
      this.conditions = await beachConditionsAPI.getCurrentConditions();
      this.render();
    } catch (error) {
      console.error('Failed to update beach conditions:', error);
      this.renderError();
    }
  }

  render() {
    if (!this.container || !this.conditions) return;

    const formatted = beachConditionsAPI.formatForDisplay(this.conditions);
    const flag = formatted.flag;

    this.container.innerHTML = `
      <div class="beach-flag-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px; padding: 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);">
        <!-- Flag Status Header -->
        <div class="flag-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div class="flag-icon" style="font-size: 48px; line-height: 1;">
            ${flag.emoji}
          </div>
          <div class="flag-info" style="flex: 1;">
            <div class="flag-name" style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">
              ${flag.name}
            </div>
            <div class="flag-description" style="font-size: 14px; opacity: 0.9;">
              ${flag.description}
            </div>
          </div>
          <button class="refresh-btn" onclick="beachFlagWidget.updateConditions()"
                  style="background: rgba(255,255,255,0.2); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                  onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                  onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            🔄
          </button>
        </div>

        <!-- Safety Message -->
        <div class="safety-message" style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px; margin-bottom: 16px; font-size: 14px; line-height: 1.6;">
          ${formatted.safety}
        </div>

        <!-- Quick Stats Grid -->
        <div class="beach-stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
          <div class="stat-card" style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">🌊</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 2px;">Surf Height</div>
            <div style="font-size: 16px; font-weight: 600;">${formatted.details.surfHeight}</div>
          </div>
          <div class="stat-card" style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">🌡️</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 2px;">Water Temp</div>
            <div style="font-size: 16px; font-weight: 600;">${formatted.details.waterTemp}</div>
          </div>
          <div class="stat-card" style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">💨</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 2px;">Wind</div>
            <div style="font-size: 16px; font-weight: 600;">${formatted.details.wind}</div>
          </div>
          <div class="stat-card" style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">☀️</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 2px;">UV Index</div>
            <div style="font-size: 16px; font-weight: 600;">${formatted.details.uvIndex}</div>
          </div>
        </div>

        <!-- Expandable Details -->
        <details class="beach-details" style="cursor: pointer;">
          <summary style="font-size: 14px; font-weight: 600; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px; list-style: none; display: flex; align-items: center; justify-content: space-between;">
            <span>More Details</span>
            <span style="opacity: 0.7;">▼</span>
          </summary>
          <div style="margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 13px; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Rip Current Risk:</span>
              <span style="font-weight: 600; text-transform: capitalize;">${formatted.details.ripCurrent}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Water Quality:</span>
              <span style="font-weight: 600; text-transform: capitalize;">${formatted.details.waterQuality}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Tide:</span>
              <span style="font-weight: 600; text-transform: capitalize;">${formatted.details.tide}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Lifeguard:</span>
              <span style="font-weight: 600;">${formatted.details.lifeguard}</span>
            </div>
            ${this.conditions.jellyfish ? '<div style="margin-top: 8px; padding: 8px; background: rgba(255,200,0,0.2); border-radius: 6px;">🪼 Jellyfish present</div>' : ''}
            ${this.conditions.stingrays ? '<div style="margin-top: 8px; padding: 8px; background: rgba(255,200,0,0.2); border-radius: 6px;">Stingrays present - shuffle feet</div>' : ''}
          </div>
        </details>

        <!-- Last Updated -->
        <div class="last-updated" style="text-align: center; font-size: 11px; opacity: 0.7; margin-top: 12px;">
          Updated: ${new Date(this.conditions.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    `;
  }

  renderError() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="beach-flag-error" style="background: #fee; border: 1px solid #fcc; border-radius: 12px; padding: 16px; text-align: center; color: #c33;">
        <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
        <div style="font-weight: 600; margin-bottom: 8px;">Unable to load beach conditions</div>
        <button onclick="beachFlagWidget.updateConditions()"
                style="background: #c33; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Retry
        </button>
      </div>
    `;
  }

  // Get current conditions for other components
  getConditions() {
    return this.conditions;
  }

  // Compact version for navbar or sidebar
  renderCompact(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.conditions) return;

    const flag = beachConditionsAPI.getFlagInfo(this.conditions.flagStatus);

    container.innerHTML = `
      <div class="beach-flag-compact"
           style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(0,0,0,0.05); border-radius: 20px; cursor: pointer;"
           onclick="document.getElementById('${this.containerId}').scrollIntoView({behavior: 'smooth'})">
        <span style="font-size: 20px;">${flag.emoji}</span>
        <div style="font-size: 13px;">
          <div style="font-weight: 600; line-height: 1.2;">${flag.name}</div>
          <div style="font-size: 11px; opacity: 0.7;">${this.conditions.waterTemp}°F • ${this.conditions.surfHeight}ft</div>
        </div>
      </div>
    `;
  }
}

// Initialize global instance
const beachFlagWidget = new BeachFlagWidget();

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => beachFlagWidget.init());
} else {
  beachFlagWidget.init();
}
