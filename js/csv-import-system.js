/**
 * CSV Import System for GCR Business Data
 * Handles importing business data from CSV with 9 record types
 */

class CSVImportSystem {
  constructor() {
    this.recordTypes = {
      BUSINESS: 'BUSINESS',
      HOURS: 'HOURS',
      SERVICE_WINDOW: 'SERVICE_WINDOW',
      MENU_SECTION: 'MENU_SECTION',
      MENU_ITEM: 'MENU_ITEM',
      OPTION_GROUP: 'OPTION_GROUP',
      OPTION: 'OPTION',
      EVENT: 'EVENT',
      POLICY: 'POLICY'
    };

    this.menuTypes = ['breakfast', 'brunch', 'lunch', 'dinner', 'sunset', 'cocktails', 'wine', 'beer', 'desserts'];
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Parse CSV file and return structured data
   * @param {File} file - CSV file
   * @returns {Promise<Object>} Parsed business data
   */
  async parseCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const csvText = e.target.result;
          const rows = this.parseCSVText(csvText);
          const businesses = this.processRows(rows);

          if (this.errors.length > 0) {
            reject({
              errors: this.errors,
              warnings: this.warnings
            });
          } else {
            resolve({
              businesses: businesses,
              warnings: this.warnings
            });
          }
        } catch (error) {
          reject({ errors: [error.message] });
        }
      };

      reader.onerror = () => reject({ errors: ['Failed to read file'] });
      reader.readAsText(file);
    });
  }

  /**
   * Parse CSV text into rows
   */
  parseCSVText(csvText) {
    const lines = csvText.split('\n');
    const headers = this.parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = this.parseCSVLine(lines[i]);
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Parse single CSV line (handles quoted fields)
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Process rows into business objects
   */
  processRows(rows) {
    const businessesMap = new Map();

    // First pass: Create business objects
    rows.forEach(row => {
      if (row.RecordType === this.recordTypes.BUSINESS) {
        const businessId = row.BusinessID;
        businessesMap.set(businessId, this.createBusinessObject(row));
      }
    });

    // Second pass: Add all other data
    rows.forEach(row => {
      const businessId = row.BusinessID;
      const business = businessesMap.get(businessId);

      if (!business) {
        this.warnings.push(`No business found for ${row.RecordType} record with BusinessID: ${businessId}`);
        return;
      }

      switch (row.RecordType) {
        case this.recordTypes.HOURS:
          this.addHours(business, row);
          break;
        case this.recordTypes.SERVICE_WINDOW:
          this.addServiceWindow(business, row);
          break;
        case this.recordTypes.MENU_SECTION:
          this.addMenuSection(business, row);
          break;
        case this.recordTypes.MENU_ITEM:
          this.addMenuItem(business, row);
          break;
        case this.recordTypes.OPTION_GROUP:
          this.addOptionGroup(business, row);
          break;
        case this.recordTypes.OPTION:
          this.addOption(business, row);
          break;
        case this.recordTypes.EVENT:
          this.addEvent(business, row);
          break;
        case this.recordTypes.POLICY:
          this.addPolicy(business, row);
          break;
      }
    });

    return Array.from(businessesMap.values());
  }

  /**
   * Create base business object
   */
  createBusinessObject(row) {
    return {
      id: row.BusinessID || '',
      name: row.BusinessName || '',
      category: 'restaurants', // Default category
      cuisine: row.Cuisine || '',
      location: row.City || '',
      address: row.Address || '',
      coordinates: {
        lat: parseFloat(row.Latitude) || 0,
        lng: parseFloat(row.Longitude) || 0
      },
      phone: row.Phone || '',
      website: row.Website || '',
      image: row.ImageURL || '',
      rating: parseFloat(row.Rating) || 4.5,
      priceLevel: row.PriceLevel || '$$',
      tags: row.Tags ? row.Tags.split(',').map(t => t.trim()) : [],
      description: row.Description || '',
      hours: '',
      menus: {},
      happyHour: null,
      specials: [],
      events: [],
      policies: []
    };
  }

  /**
   * Add hours to business
   */
  addHours(business, row) {
    const days = row.DaysOfWeek || '';
    const startTime = row.StartTime || '';
    const endTime = row.EndTime || '';

    if (days && startTime && endTime) {
      business.hours = `${days} ${startTime}-${endTime}`;
    }
  }

  /**
   * Add service window (breakfast, lunch, dinner times)
   */
  addServiceWindow(business, row) {
    const serviceType = row.ServiceType ? row.ServiceType.toLowerCase() : '';
    const startTime = row.StartTime || '';
    const endTime = row.EndTime || '';

    if (!this.menuTypes.includes(serviceType)) {
      this.warnings.push(`Unknown service type: ${serviceType}`);
      return;
    }

    if (!business.menus[serviceType]) {
      business.menus[serviceType] = {
        name: this.capitalizeWords(serviceType),
        hours: `${startTime}-${endTime}`,
        sections: {}
      };
    }
  }

  /**
   * Add menu section
   */
  addMenuSection(business, row) {
    const menuId = row.MenuID ? row.MenuID.toLowerCase() : '';
    const menuName = row.MenuName || '';
    const sectionId = row.MenuSectionID || '';
    const sectionName = row.MenuSectionName || '';

    // Detect menu type from MenuID (e.g., "menu_lunch" -> "lunch")
    const menuType = this.detectMenuType(menuId, menuName);

    if (!menuType) {
      this.warnings.push(`Could not detect menu type from: ${menuId} / ${menuName}`);
      return;
    }

    // Initialize menu if not exists
    if (!business.menus[menuType]) {
      business.menus[menuType] = {
        name: this.capitalizeWords(menuType),
        hours: '',
        sections: {}
      };
    }

    // Add section
    const sectionKey = this.sanitizeKey(sectionName);
    if (!business.menus[menuType].sections[sectionKey]) {
      business.menus[menuType].sections[sectionKey] = {
        name: sectionName,
        items: []
      };

      // Check if this is kids meals section
      if (sectionName.toLowerCase().includes('kids')) {
        business.menus[menuType].sections[sectionKey].ageRestriction = row.AgeRestriction || '12 and under';
      }
    }
  }

  /**
   * Add menu item
   */
  addMenuItem(business, row) {
    const menuId = row.MenuID ? row.MenuID.toLowerCase() : '';
    const sectionName = row.MenuSectionName || '';
    const itemId = row.MenuItemID || '';
    const itemName = row.MenuItemName || '';
    const price = row.Price || '';
    const description = row.Description || '';
    const category = row.MenuItemType || '';

    // Detect menu type
    const menuType = this.detectMenuType(menuId, row.MenuName);

    if (!menuType) {
      this.warnings.push(`Could not detect menu type for item: ${itemName}`);
      return;
    }

    // Initialize menu if not exists
    if (!business.menus[menuType]) {
      business.menus[menuType] = {
        name: this.capitalizeWords(menuType),
        hours: '',
        sections: {}
      };
    }

    // Initialize section if not exists
    const sectionKey = this.sanitizeKey(sectionName);
    if (!business.menus[menuType].sections[sectionKey]) {
      business.menus[menuType].sections[sectionKey] = {
        name: sectionName,
        items: []
      };
    }

    // Create item object
    const item = {
      id: itemId,
      name: itemName,
      price: price === 'market' ? 'Market Price' : price,
      description: description,
      category: category,
      optionGroups: []
    };

    // Add to section
    business.menus[menuType].sections[sectionKey].items.push(item);

    // Check if this should also be in specials or happy hour
    if (row.IsHappyHourItem === 'TRUE' || row.IsHappyHourItem === 'true') {
      this.addToHappyHour(business, item, row);
    }

    if (row.IsSpecial === 'TRUE' || row.IsSpecial === 'true') {
      this.addToSpecials(business, item, menuType, row);
    }
  }

  /**
   * Add option group to most recent menu item
   */
  addOptionGroup(business, row) {
    const menuId = row.MenuID ? row.MenuID.toLowerCase() : '';
    const sectionName = row.MenuSectionName || '';
    const itemId = row.MenuItemID || '';
    const groupId = row.OptionGroupID || '';
    const groupName = row.OptionGroupName || '';
    const required = row.Required === 'TRUE' || row.Required === 'true';
    const minSelection = parseInt(row.MinSelection) || 0;
    const maxSelection = parseInt(row.MaxSelection) || 1;

    // Find the menu item
    const menuType = this.detectMenuType(menuId, row.MenuName);
    if (!menuType || !business.menus[menuType]) return;

    const sectionKey = this.sanitizeKey(sectionName);
    const section = business.menus[menuType].sections[sectionKey];
    if (!section) return;

    const item = section.items.find(i => i.id === itemId);
    if (!item) return;

    // Add option group
    item.optionGroups.push({
      id: groupId,
      name: groupName,
      required: required,
      minSelection: minSelection,
      maxSelection: maxSelection,
      options: []
    });
  }

  /**
   * Add option to most recent option group
   */
  addOption(business, row) {
    const menuId = row.MenuID ? row.MenuID.toLowerCase() : '';
    const sectionName = row.MenuSectionName || '';
    const itemId = row.MenuItemID || '';
    const groupId = row.OptionGroupID || '';
    const optionId = row.OptionID || '';
    const optionName = row.OptionName || '';
    const priceModifier = row.PriceModifier || '$0';

    // Find the menu item and option group
    const menuType = this.detectMenuType(menuId, row.MenuName);
    if (!menuType || !business.menus[menuType]) return;

    const sectionKey = this.sanitizeKey(sectionName);
    const section = business.menus[menuType].sections[sectionKey];
    if (!section) return;

    const item = section.items.find(i => i.id === itemId);
    if (!item) return;

    const group = item.optionGroups.find(g => g.id === groupId);
    if (!group) return;

    // Add option
    group.options.push({
      id: optionId,
      name: optionName,
      priceModifier: priceModifier
    });
  }

  /**
   * Add event (entertainment/activity, NOT price promotion)
   */
  addEvent(business, row) {
    const eventName = row.EventName || '';
    const description = row.Description || '';
    const day = row.DayOfWeek || '';
    const startTime = row.StartTime || '';
    const endTime = row.EndTime || '';
    const recurring = row.Recurring === 'TRUE' || row.Recurring === 'true';

    business.events.push({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: eventName,
      description: description,
      day: day,
      time: `${startTime} - ${endTime}`,
      startTime: startTime,
      endTime: endTime,
      recurring: recurring,
      daysOfWeek: day ? [day] : []
    });
  }

  /**
   * Add policy
   */
  addPolicy(business, row) {
    const policyType = row.PolicyType || '';
    const policyValue = row.PolicyValue || '';

    business.policies.push({
      type: policyType,
      value: policyValue
    });
  }

  /**
   * Add item to happy hour
   */
  addToHappyHour(business, item, row) {
    if (!business.happyHour) {
      business.happyHour = {
        schedule: row.HappyHourSchedule || '',
        days: [],
        startTime: row.HappyHourStart || '',
        endTime: row.HappyHourEnd || '',
        items: []
      };
    }

    business.happyHour.items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category
    });
  }

  /**
   * Add item to specials (price promotions, NOT events)
   */
  addToSpecials(business, item, menuType, row) {
    const specialName = row.SpecialName || `${this.capitalizeWords(menuType)} Special`;
    const schedule = row.SpecialSchedule || '';
    const days = row.SpecialDays ? row.SpecialDays.split(',').map(d => d.trim()) : [];
    const startTime = row.SpecialStart || '';
    const endTime = row.SpecialEnd || '';

    // Find or create special
    let special = business.specials.find(s => s.name === specialName);

    if (!special) {
      special = {
        id: `special_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: specialName,
        description: row.SpecialDescription || '',
        schedule: schedule,
        days: days,
        startTime: startTime,
        endTime: endTime,
        items: []
      };
      business.specials.push(special);
    }

    special.items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category
    });
  }

  /**
   * Detect menu type from MenuID or MenuName
   */
  detectMenuType(menuId, menuName) {
    const searchString = `${menuId} ${menuName}`.toLowerCase();

    for (const type of this.menuTypes) {
      if (searchString.includes(type)) {
        return type;
      }
    }

    return null;
  }

  /**
   * Sanitize key for object property
   */
  sanitizeKey(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  /**
   * Capitalize words
   */
  capitalizeWords(str) {
    return str.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.CSVImportSystem = CSVImportSystem;
}
