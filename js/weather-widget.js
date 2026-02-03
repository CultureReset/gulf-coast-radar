// Weather Widget with Beach Flag Status
// Gulf Coast Radar - Weather and Beach Conditions

class WeatherWidget {
  constructor() {
    this.currentWeather = null;
    this.beachFlags = this.loadBeachFlags();
    this.weatherAPIKey = null; // User can add their own API key
    this.init();
  }

  // Initialize widget
  async init() {
    // Load beach flag status from localStorage
    this.beachFlags = this.loadBeachFlags();
  }

  // Load beach flag status from localStorage
  loadBeachFlags() {
    try {
      const stored = localStorage.getItem('gcr_beach_flags');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading beach flags:', error);
    }

    // Default flag status
    return {
      gulfShores: {
        color: 'green',
        description: 'Low hazard, calm conditions',
        updatedAt: new Date().toISOString()
      },
      orangeBeach: {
        color: 'green',
        description: 'Low hazard, calm conditions',
        updatedAt: new Date().toISOString()
      }
    };
  }

  // Save beach flags to localStorage
  saveBeachFlags() {
    try {
      localStorage.setItem('gcr_beach_flags', JSON.stringify(this.beachFlags));
    } catch (error) {
      console.error('Error saving beach flags:', error);
    }
  }

  // Update beach flag status (admin function)
  updateBeachFlag(location, color, description) {
    if (!this.beachFlags[location]) {
      this.beachFlags[location] = {};
    }

    this.beachFlags[location] = {
      color: color,
      description: description || this.getDefaultFlagDescription(color),
      updatedAt: new Date().toISOString()
    };

    this.saveBeachFlags();
  }

  // Get default description for flag color
  getDefaultFlagDescription(color) {
    const descriptions = {
      'green': 'Low hazard, calm conditions',
      'yellow': 'Medium hazard, moderate surf and/or currents',
      'red': 'High hazard, rough conditions, strong surf and/or currents',
      'double-red': 'Water closed to public',
      'purple': 'Dangerous marine life present'
    };
    return descriptions[color] || 'Unknown conditions';
  }

  // Get flag emoji
  getFlagEmoji(color) {
    const emojis = {
      'green': '🟢',
      'yellow': '🟡',
      'red': '🔴',
      'double-red': '🔴🔴',
      'purple': '🟣'
    };
    return emojis[color] || '⚪';
  }

  // Get flag display color
  getFlagColor(color) {
    const colors = {
      'green': '#10b981',
      'yellow': '#f59e0b',
      'red': '#ef4444',
      'double-red': '#dc2626',
      'purple': '#a855f7'
    };
    return colors[color] || '#6b7280';
  }

  // Fetch weather from API (requires API key)
  async fetchWeather(lat = 30.2707, lng = -87.6009) {
    // Default to Gulf Shores coordinates

    if (!this.weatherAPIKey) {
      // Return mock data if no API key
      return this.getMockWeather();
    }

    try {
      // Using OpenWeatherMap API (free tier available)
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.weatherAPIKey}&units=imperial`;

      const response = await fetch(url);
      const data = await response.json();

      this.currentWeather = {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        timestamp: Date.now()
      };

      return this.currentWeather;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return this.getMockWeather();
    }
  }

  // Get mock weather data (for demo without API key)
  getMockWeather() {
    return {
      temp: 78,
      feelsLike: 82,
      humidity: 68,
      windSpeed: 10,
      description: 'partly cloudy',
      icon: '02d',
      waterTemp: 76,
      uvIndex: 8,
      timestamp: Date.now()
    };
  }

  // Show weather widget popup
  async showWeatherWidget() {
    // Remove existing widget if any
    const existing = document.getElementById('weather-widget-popup');
    if (existing) {
      existing.remove();
      return;
    }

    // Fetch current weather
    const weather = await this.fetchWeather();

    const popup = document.createElement('div');
    popup.id = 'weather-widget-popup';
    popup.className = 'weather-widget-popup';
    popup.innerHTML = `
      <div class="weather-widget-overlay" onclick="document.getElementById('weather-widget-popup').remove()"></div>
      <div class="weather-widget-content">
        <div class="weather-widget-header">
          <h3>🌊 Gulf Coast Conditions</h3>
          <button class="weather-widget-close" onclick="document.getElementById('weather-widget-popup').remove()">×</button>
        </div>

        <div class="weather-widget-body">
          ${this.renderCurrentWeather(weather)}
          ${this.renderBeachFlags()}
          ${this.renderBeachConditions()}
        </div>

        <div class="weather-widget-footer">
          <p class="weather-update-time">Updated: ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Animate in
    setTimeout(() => {
      popup.classList.add('active');
    }, 10);
  }

  renderCurrentWeather(weather) {
    return `
      <div class="weather-current">
        <div class="weather-temp-main">
          <div class="weather-temp">${weather.temp}°F</div>
          <div class="weather-description">${weather.description}</div>
        </div>
        <div class="weather-details">
          <div class="weather-detail-item">
            <span class="weather-detail-label">Feels Like</span>
            <span class="weather-detail-value">${weather.feelsLike}°F</span>
          </div>
          <div class="weather-detail-item">
            <span class="weather-detail-label">Humidity</span>
            <span class="weather-detail-value">${weather.humidity}%</span>
          </div>
          <div class="weather-detail-item">
            <span class="weather-detail-label">Wind</span>
            <span class="weather-detail-value">${weather.windSpeed} mph</span>
          </div>
        </div>
      </div>
    `;
  }

  renderBeachFlags() {
    return `
      <div class="beach-flags-section">
        <h4>🚩 Beach Flag Status</h4>
        <div class="beach-flags-grid">
          ${this.renderFlagCard('Gulf Shores', this.beachFlags.gulfShores)}
          ${this.renderFlagCard('Orange Beach', this.beachFlags.orangeBeach)}
        </div>
        <div class="flag-legend">
          <div class="flag-legend-item">
            <span class="flag-color" style="background: #10b981"></span>
            <span>Green - Low Hazard</span>
          </div>
          <div class="flag-legend-item">
            <span class="flag-color" style="background: #f59e0b"></span>
            <span>Yellow - Medium Hazard</span>
          </div>
          <div class="flag-legend-item">
            <span class="flag-color" style="background: #ef4444"></span>
            <span>Red - High Hazard</span>
          </div>
          <div class="flag-legend-item">
            <span class="flag-color" style="background: #dc2626"></span>
            <span>Double Red - Closed</span>
          </div>
          <div class="flag-legend-item">
            <span class="flag-color" style="background: #a855f7"></span>
            <span>Purple - Marine Life</span>
          </div>
        </div>
      </div>
    `;
  }

  renderFlagCard(location, flagData) {
    const emoji = this.getFlagEmoji(flagData.color);
    const color = this.getFlagColor(flagData.color);

    return `
      <div class="beach-flag-card" style="border-left: 4px solid ${color}">
        <div class="flag-location">${emoji} ${location}</div>
        <div class="flag-status" style="color: ${color}">${flagData.description}</div>
      </div>
    `;
  }

  renderBeachConditions() {
    // Mock water conditions (can be updated to pull from real API)
    const conditions = {
      waterTemp: 76,
      uvIndex: 8,
      sunrise: '6:24 AM',
      sunset: '7:45 PM'
    };

    return `
      <div class="beach-conditions-section">
        <h4>🏖️ Beach Conditions</h4>
        <div class="conditions-grid">
          <div class="condition-item">
            <div class="condition-icon">🌡️</div>
            <div class="condition-label">Water Temp</div>
            <div class="condition-value">${conditions.waterTemp}°F</div>
          </div>
          <div class="condition-item">
            <div class="condition-icon">☀️</div>
            <div class="condition-label">UV Index</div>
            <div class="condition-value">${conditions.uvIndex}/10</div>
          </div>
          <div class="condition-item">
            <div class="condition-icon">🌅</div>
            <div class="condition-label">Sunrise</div>
            <div class="condition-value">${conditions.sunrise}</div>
          </div>
          <div class="condition-item">
            <div class="condition-icon">🌇</div>
            <div class="condition-label">Sunset</div>
            <div class="condition-value">${conditions.sunset}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Create compact weather button for header/nav
  createWeatherButton() {
    const button = document.createElement('button');
    button.className = 'weather-btn-compact';
    button.innerHTML = '🌤️';
    button.title = 'View Weather & Beach Conditions';
    button.onclick = () => this.showWeatherWidget();
    return button;
  }

  // Admin function to update flags
  showFlagUpdateAdmin() {
    const modal = document.createElement('div');
    modal.className = 'flag-admin-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <h3>Update Beach Flags</h3>

        <div class="flag-update-section">
          <h4>Gulf Shores</h4>
          <select id="flag-gs-color">
            <option value="green">Green - Low Hazard</option>
            <option value="yellow">Yellow - Medium Hazard</option>
            <option value="red">Red - High Hazard</option>
            <option value="double-red">Double Red - Closed</option>
            <option value="purple">Purple - Marine Life</option>
          </select>
          <textarea id="flag-gs-desc" placeholder="Optional description"></textarea>
        </div>

        <div class="flag-update-section">
          <h4>Orange Beach</h4>
          <select id="flag-ob-color">
            <option value="green">Green - Low Hazard</option>
            <option value="yellow">Yellow - Medium Hazard</option>
            <option value="red">Red - High Hazard</option>
            <option value="double-red">Double Red - Closed</option>
            <option value="purple">Purple - Marine Life</option>
          </select>
          <textarea id="flag-ob-desc" placeholder="Optional description"></textarea>
        </div>

        <button onclick="weatherWidget.saveFlags()">Save Updates</button>
        <button onclick="this.closest('.flag-admin-modal').remove()">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  saveFlags() {
    const gsColor = document.getElementById('flag-gs-color').value;
    const gsDesc = document.getElementById('flag-gs-desc').value;
    const obColor = document.getElementById('flag-ob-color').value;
    const obDesc = document.getElementById('flag-ob-desc').value;

    this.updateBeachFlag('gulfShores', gsColor, gsDesc);
    this.updateBeachFlag('orangeBeach', obColor, obDesc);

    document.querySelector('.flag-admin-modal').remove();
    alert('Beach flags updated!');
  }
}

// Initialize global weather widget
const weatherWidget = new WeatherWidget();

// Homepage weather widget update function
async function updateHomepageWeather() {
  if (!document.getElementById('weather-widget')) {
    return; // Not on homepage
  }

  try {
    // Use Open-Meteo API (no key required, free)
    const lat = 30.2461; // Gulf Shores
    const lng = -87.7008;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Chicago`
    );

    if (!response.ok) {
      throw new Error('Weather fetch failed');
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    // Map WMO weather codes to icons
    const icon = getWeatherIconFromCode(current.weather_code);
    const description = getWeatherDescriptionFromCode(current.weather_code);

    // Update homepage widget
    document.getElementById('weather-temp').textContent = `${Math.round(current.temperature_2m)}°F`;
    document.getElementById('weather-icon').textContent = icon;
    document.getElementById('weather-condition').textContent = description;
    document.getElementById('weather-high').textContent = `${Math.round(daily.temperature_2m_max[0])}°`;
    document.getElementById('weather-low').textContent = `${Math.round(daily.temperature_2m_min[0])}°`;
    document.getElementById('weather-humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('weather-wind').textContent = `${Math.round(current.wind_speed_10m)} mph`;
    document.getElementById('weather-feels').textContent = `${Math.round(current.apparent_temperature)}°F`;

  } catch (error) {
    console.error('Error updating homepage weather:', error);
    const conditionEl = document.getElementById('weather-condition');
    if (conditionEl) {
      conditionEl.textContent = 'Unable to load';
    }
  }
}

function getWeatherIconFromCode(code) {
  // Check if it's daytime or nighttime
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour <= 20; // 6 AM to 8 PM is day

  console.log(`Weather code: ${code}, Hour: ${hour}, isDaytime: ${isDaytime}`);

  // WMO Weather interpretation codes with day/night variations
  if (code === 0) {
    const icon = isDaytime ? '☀️' : '🌙';
    console.log(`Code 0 (clear): returning ${icon}`);
    return icon;
  }
  if (code === 1) {
    const icon = isDaytime ? '🌤️' : '🌙';
    console.log(`Code 1 (mainly clear): returning ${icon}`);
    return icon;
  }
  if (code === 2 || code === 3) {
    const icon = isDaytime ? '⛅' : '☁️';
    console.log(`Code 2/3 (cloudy): returning ${icon}`);
    return icon;
  }
  if (code <= 48) return '🌫️'; // Fog (same day/night)
  if (code <= 67) return '🌧️'; // Rain (same day/night)
  if (code <= 77) return '❄️';  // Snow (same day/night)
  if (code <= 82) return '🌦️'; // Rain showers (same day/night)
  if (code <= 86) return '❄️';  // Snow showers (same day/night)
  if (code >= 95) return '⛈️';  // Thunderstorm (same day/night)
  return '☁️';
}

function getWeatherDescriptionFromCode(code) {
  // WMO Weather interpretation codes
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

// Auto-update homepage weather
if (document.getElementById('weather-widget')) {
  updateHomepageWeather();
  // Refresh every 30 minutes
  setInterval(updateHomepageWeather, 30 * 60 * 1000);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherWidget;
}
