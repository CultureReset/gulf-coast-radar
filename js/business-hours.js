// Business Hours Parser and Status Checker
// Parses hours strings like "Mon-Fri 11am-9pm" and determines if business is open

/**
 * Parse business hours string and check if currently open
 * @param {string} hoursString - Hours like "Mon-Fri 11am-9pm; Sat-Sun 10am-10pm"
 * @returns {object} { isOpen: boolean, closingSoon: boolean, opensAt: string, closesAt: string }
 */
function parseBusinessHours(hoursString) {
  if (!hoursString || hoursString === '—' || hoursString.toLowerCase() === 'closed') {
    return { isOpen: false, closingSoon: false, opensAt: null, closesAt: null, status: 'closed' };
  }

  // Special cases
  if (hoursString.toLowerCase().includes('24/7') || hoursString.toLowerCase().includes('24 hours')) {
    return { isOpen: true, closingSoon: false, opensAt: '24/7', closesAt: '24/7', status: 'open' };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  // Split by semicolon for multiple day ranges
  const segments = hoursString.split(';').map(s => s.trim());

  for (const segment of segments) {
    const result = parseSegment(segment, currentDay, currentTime);
    if (result) {
      return result;
    }
  }

  return { isOpen: false, closingSoon: false, opensAt: null, closesAt: null, status: 'closed' };
}

/**
 * Parse a single hours segment
 */
function parseSegment(segment, currentDay, currentTime) {
  // Match patterns like:
  // "Mon-Fri 11am-9pm"
  // "Tue–Fri 4 PM–6 PM"
  // "Sun-Thu 11am-9pm"
  // "Daily 10am-10pm"

  const dayPattern = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Daily|Everyday)/i;
  const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)/gi;

  // Extract days
  let daysMatch = segment.match(/^([A-Za-z]+(?:[-–][A-Za-z]+)?)\s+/);
  if (!daysMatch) return null;

  const daysString = daysMatch[1];
  const applicableDays = parseDays(daysString);

  if (!applicableDays.includes(currentDay)) {
    return null; // Not applicable today
  }

  // Extract times
  const times = [];
  let match;
  const regex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)/gi;

  while ((match = regex.exec(segment)) !== null) {
    times.push(match[0]);
  }

  if (times.length < 2) return null;

  const openTime = parseTime(times[0]);
  const closeTime = parseTime(times[1]);

  if (openTime === null || closeTime === null) return null;

  // Check if currently open
  const isOpen = currentTime >= openTime && currentTime < closeTime;
  const minutesUntilClose = closeTime - currentTime;
  const closingSoon = isOpen && minutesUntilClose <= 60 && minutesUntilClose > 0;

  return {
    isOpen,
    closingSoon,
    opensAt: times[0],
    closesAt: times[1],
    status: isOpen ? (closingSoon ? 'closing-soon' : 'open') : 'closed'
  };
}

/**
 * Parse day range into array of day numbers
 */
function parseDays(daysString) {
  const dayMap = {
    'sun': 0, 'sunday': 0,
    'mon': 1, 'monday': 1,
    'tue': 2, 'tuesday': 2,
    'wed': 3, 'wednesday': 3,
    'thu': 4, 'thursday': 4,
    'fri': 5, 'friday': 5,
    'sat': 6, 'saturday': 6
  };

  const lower = daysString.toLowerCase();

  if (lower === 'daily' || lower === 'everyday') {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  // Handle ranges like "Mon-Fri" or "Mon–Fri" (en-dash)
  const rangeMatch = lower.match(/^(\w+)[-–](\w+)$/);
  if (rangeMatch) {
    const start = dayMap[rangeMatch[1]];
    const end = dayMap[rangeMatch[2]];
    if (start !== undefined && end !== undefined) {
      const days = [];
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          days.push(i);
        }
      } else {
        // Wrap around (e.g., Sat-Mon)
        for (let i = start; i <= 6; i++) {
          days.push(i);
        }
        for (let i = 0; i <= end; i++) {
          days.push(i);
        }
      }
      return days;
    }
  }

  // Single day
  const day = dayMap[lower];
  return day !== undefined ? [day] : [];
}

/**
 * Parse time string to minutes since midnight
 */
function parseTime(timeString) {
  // Handle null/undefined timeString
  if (!timeString || typeof timeString !== 'string') return null;

  const match = timeString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!match) return null;

  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const meridiem = match[3].toLowerCase();

  // Convert to 24-hour format
  if (meridiem === 'pm' && hours !== 12) {
    hours += 12;
  } else if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Calculate time remaining in human-readable format
 */
function getTimeRemaining(minutes) {
  if (minutes < 0) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }
}

/**
 * Calculate time until opening in human-readable format
 */
function getTimeUntilOpen(opensAt) {
  if (!opensAt) return null;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openTime = parseTime(opensAt);

  if (openTime === null) return null;

  let minutesUntilOpen = openTime - currentTime;

  // If negative, it means it opens tomorrow
  if (minutesUntilOpen < 0) {
    minutesUntilOpen += 24 * 60; // Add 24 hours
    return `tomorrow at ${opensAt}`;
  }

  // If opens in less than 2 hours, show countdown
  if (minutesUntilOpen < 120) {
    return `in ${getTimeRemaining(minutesUntilOpen)}`;
  }

  // Otherwise show the time
  return `at ${opensAt}`;
}

/**
 * Helper function to handle array-based hours format from Google Sheets
 */
function getBusinessStatusFromArray(hoursArray) {
  const now = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  // Find today's hours
  const todayHours = hoursArray.find(h => h.day === currentDay);

  if (!todayHours || todayHours.closed) {
    return {
      badge: '🔒 Closed',
      text: '',
      class: 'status-closed'
    };
  }

  // Parse opening and closing times
  const openTime = parseTime(todayHours.open);
  const closeTime = parseTime(todayHours.close);

  if (openTime === null || closeTime === null) {
    return { badge: '', text: '', class: '' };
  }

  const isOpen = currentTime >= openTime && currentTime < closeTime;
  const closingSoon = isOpen && (closeTime - currentTime) <= 60; // Within 1 hour of closing

  if (isOpen) {
    const minutesUntilClose = closeTime - currentTime;
    const timeRemaining = getTimeRemaining(minutesUntilClose);

    if (closingSoon) {
      return {
        badge: `⏰ Open for ${timeRemaining}`,
        text: `Closes at ${todayHours.close}`,
        class: 'status-closing-soon'
      };
    } else {
      return {
        badge: `✅ Open for ${timeRemaining}`,
        text: `Closes at ${todayHours.close}`,
        class: 'status-open'
      };
    }
  } else if (currentTime < openTime) {
    const minutesUntilOpen = openTime - currentTime;
    return {
      badge: '🔒 Closed',
      text: `Opens ${formatOpensAt(todayHours.open, minutesUntilOpen)}`,
      class: 'status-closed'
    };
  } else {
    return {
      badge: '🔒 Closed',
      text: '',
      class: 'status-closed'
    };
  }
}

/**
 * Helper function to handle object-based hours format
 */
function getBusinessStatusFromObject(hoursObj) {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); // "monday", "tuesday", etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  // Get today's hours
  const todayHours = hoursObj[currentDay];

  if (!todayHours || todayHours.toLowerCase().includes('closed')) {
    return {
      badge: '🔒 Closed',
      text: '',
      class: 'status-closed'
    };
  }

  // Parse today's hours to check if currently open
  // Handle formats like "11:00 AM – 9:00 PM" or "11 AM–9 PM"
  const timeMatch = todayHours.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)/);

  if (!timeMatch) {
    return {
      badge: '',
      text: '',
      class: ''
    };
  }

  // Parse opening time
  let openHour = parseInt(timeMatch[1]);
  const openMin = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
  const openMeridiem = timeMatch[3].toLowerCase();
  if (openMeridiem === 'pm' && openHour !== 12) openHour += 12;
  if (openMeridiem === 'am' && openHour === 12) openHour = 0;
  const openTime = openHour * 60 + openMin;

  // Parse closing time
  let closeHour = parseInt(timeMatch[4]);
  const closeMin = timeMatch[5] ? parseInt(timeMatch[5]) : 0;
  const closeMeridiem = timeMatch[6].toLowerCase();
  if (closeMeridiem === 'pm' && closeHour !== 12) closeHour += 12;
  if (closeMeridiem === 'am' && closeHour === 12) closeHour = 0;
  let closeTime = closeHour * 60 + closeMin;

  // Handle closing times past midnight (e.g., 1 AM)
  if (closeTime < openTime) {
    closeTime += 24 * 60;
  }

  // Check if currently open
  const isOpen = currentTime >= openTime && currentTime < closeTime;
  const minutesUntilClose = closeTime - currentTime;

  if (isOpen) {
    const timeRemaining = getTimeRemaining(minutesUntilClose);
    const closingSoon = minutesUntilClose <= 60;

    // Format closing time
    const closeHour12 = closeHour > 12 ? closeHour - 12 : (closeHour === 0 ? 12 : closeHour);
    const closingTimeStr = `${closeHour12}${closeMin > 0 ? ':' + String(closeMin).padStart(2, '0') : ''} ${closeMeridiem.toUpperCase()}`;

    if (closingSoon) {
      return {
        badge: `⏰ Open for ${timeRemaining}`,
        text: `Closes at ${closingTimeStr}`,
        class: 'status-closing-soon'
      };
    } else {
      return {
        badge: `✅ Open for ${timeRemaining}`,
        text: `Closes at ${closingTimeStr}`,
        class: 'status-open'
      };
    }
  } else {
    // Closed - determine when it opens
    const openHour12 = openHour > 12 ? openHour - 12 : (openHour === 0 ? 12 : openHour);
    const openingTimeStr = `${openHour12}${openMin > 0 ? ':' + String(openMin).padStart(2, '0') : ''} ${openMeridiem.toUpperCase()}`;

    return {
      badge: '🔒 Closed',
      text: `Opens at ${openingTimeStr}`,
      class: 'status-closed'
    };
  }
}

/**
 * Get display status for UI with time remaining
 */
function getBusinessStatus(business) {
  if (!business.hours) {
    return { badge: '', text: '', class: '' };
  }

  // Handle array format from Google Sheets (day-by-day hours)
  if (Array.isArray(business.hours)) {
    return getBusinessStatusFromArray(business.hours);
  }

  // Handle object format (day-by-day hours)
  if (typeof business.hours === 'object' && !Array.isArray(business.hours)) {
    return getBusinessStatusFromObject(business.hours);
  }

  const status = parseBusinessHours(business.hours);

  // Calculate minutes until close
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const closeTime = parseTime(status.closesAt);
  const minutesUntilClose = closeTime ? closeTime - currentTime : null;

  if (status.isOpen && minutesUntilClose !== null) {
    const timeRemaining = getTimeRemaining(minutesUntilClose);

    if (status.closingSoon) {
      // Closing within 1 hour
      return {
        badge: `⏰ Open for ${timeRemaining}`,
        text: `Closes at ${status.closesAt}`,
        class: 'status-closing-soon'
      };
    } else {
      // Open normally
      return {
        badge: `✅ Open for ${timeRemaining}`,
        text: `Closes at ${status.closesAt}`,
        class: 'status-open'
      };
    }
  } else if (!status.isOpen && status.opensAt) {
    // Closed - show when it opens
    const openingIn = getTimeUntilOpen(status.opensAt);

    return {
      badge: `🔒 Closed`,
      text: `Opens ${openingIn}`,
      class: 'status-closed'
    };
  } else {
    return {
      badge: '🔒 Closed',
      text: '',
      class: 'status-closed'
    };
  }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseBusinessHours, getBusinessStatus };
}
