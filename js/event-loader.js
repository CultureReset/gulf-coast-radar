// Gulf Coast Radar - Event Loader
// Automatically loads all events from /data/events/ folder

class EventLoader {
  constructor() {
    this.events = [];
    this.loaded = false;
    this.loadPromise = null;
  }

  async loadAllEvents() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadEvents();
    return this.loadPromise;
  }

  async _loadEvents() {
    try {
      const indexResponse = await fetch('/data/events/index.json');

      if (!indexResponse.ok) {
        console.warn('No event index found, using fallback');
        await this.loadKnownEvents();
        return this.events;
      }

      const index = await indexResponse.json();
      console.log(`Loading ${index.files.length} events...`);

      const loadPromises = index.files.map(filename =>
        this.loadEventFile(filename)
      );

      await Promise.all(loadPromises);

      this.loaded = true;
      console.log(`✅ Loaded ${this.events.length} events`);

      window.dispatchEvent(new CustomEvent('eventsLoaded', {
        detail: { events: this.events }
      }));

      return this.events;

    } catch (error) {
      console.error('Error loading events:', error);
      await this.loadKnownEvents();
      return this.events;
    }
  }

  async loadEventFile(filename) {
    try {
      const response = await fetch(`/data/events/${filename}`);
      if (!response.ok) {
        console.warn(`Failed to load ${filename}`);
        return null;
      }

      const event = await response.json();

      if (!event.id || !event.title) {
        console.warn(`Invalid event in ${filename}`);
        return null;
      }

      this.events.push(event);
      return event;

    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return null;
    }
  }

  async loadKnownEvents() {
    const knownFiles = [
      'hangout-live-music.json',
      'hangout-taco-tuesday.json'
    ];

    const loadPromises = knownFiles.map(filename =>
      this.loadEventFile(filename).catch(() => null)
    );

    await Promise.all(loadPromises);
  }

  // Get all events
  getEvents() {
    return this.events;
  }

  // Get events by category
  getByCategory(category) {
    return this.events.filter(e => e.category === category);
  }

  // Get event by ID
  getById(id) {
    return this.events.find(e => e.id === id);
  }

  // Get events by business
  getByBusiness(businessId) {
    return this.events.filter(e => e.businessId === businessId);
  }

  // Get recurring events
  getRecurring() {
    return this.events.filter(e => e.recurring === true);
  }

  // Get one-time events
  getOneTime() {
    return this.events.filter(e => !e.recurring);
  }

  // Get featured events
  getFeatured() {
    return this.events.filter(e => e.featured === true);
  }

  // Get events by date
  getByDate(date) {
    // For recurring events, check if they occur on this day
    return this.events.filter(e => {
      if (e.recurring) {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        return e.daysOfWeek && e.daysOfWeek.includes(dayName);
      } else {
        return e.date === date;
      }
    });
  }

  // Get events by date range
  getByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const events = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      events.push(...this.getByDate(dateStr));
    }

    return events;
  }

  // Search events
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.events.filter(e => {
      if (e.title.toLowerCase().includes(lowerQuery)) return true;
      if (e.description && e.description.toLowerCase().includes(lowerQuery)) return true;
      if (e.tags && e.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
      if (e.location && e.location.name.toLowerCase().includes(lowerQuery)) return true;
      return false;
    });
  }

  // Get events with tags
  getByTags(tags) {
    const searchTags = Array.isArray(tags) ? tags : [tags];
    return this.events.filter(e =>
      e.tags && searchTags.some(tag =>
        e.tags.some(eTag => eTag.toLowerCase().includes(tag.toLowerCase()))
      )
    );
  }

  // Get all categories
  getCategories() {
    const categories = new Set(this.events.map(e => e.category));
    return Array.from(categories);
  }

  // Get all tags
  getAllTags() {
    const tags = new Set();
    this.events.forEach(e => {
      if (e.tags) {
        e.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }
}

// Create global instance
window.eventLoader = new EventLoader();

// Auto-load on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.eventLoader.loadAllEvents();
  });
} else {
  window.eventLoader.loadAllEvents();
}

// For backward compatibility
window.gulfCoastEvents = [];

window.addEventListener('eventsLoaded', (event) => {
  window.gulfCoastEvents = event.detail.events;
  console.log('gulfCoastEvents array updated with', window.gulfCoastEvents.length, 'events');
});
