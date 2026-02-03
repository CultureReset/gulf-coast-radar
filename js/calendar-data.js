// Calendar & Events Data for Gulf Coast Radar
// Each business can have multiple events (live music, happy hours, specials, etc.)
// Event types: live-music, karaoke, trivia, bingo, happy-hour, special, comedy, open-mic, dj-night

const calendarEvents = [
  // Cobalt the Restaurant Events
  {
    id: "event-8",
    businessId: "cobalt-restaurant",
    businessName: "Cobalt Restaurant",
    type: "special",
    title: "Sunday Brunch",
    description: "Special brunch menu with bottomless mimosas",
    date: "2025-10-26",
    startTime: "10:00 AM",
    endTime: "2:00 PM",
    recurring: "sunday"
  },
  {
    id: "event-cobalt-1",
    businessId: "cobalt-restaurant",
    businessName: "Cobalt the Restaurant",
    type: "special",
    title: "Sunset Menu",
    description: "Special sunset menu with coastal favorites - appetizers, tacos, shrimp skewers, fish & chips, and more",
    date: "2025-10-24",
    startTime: "4:00 PM",
    endTime: "7:00 PM",
    recurring: "daily"
  },

  // Flora-Bama Ole River Grill Events
  {
    id: "event-flora-ole-1",
    businessId: "flora-bama-ole-river",
    businessName: "Flora-Bama Ole River Grill",
    type: "live-music",
    title: "Live Music Throughout the Week",
    description: "Enjoy live music performances in a laid-back waterfront setting",
    date: "2025-10-24",
    startTime: "6:00 PM",
    endTime: "9:00 PM",
    recurring: "thursday,friday,saturday,sunday"
  },
  {
    id: "event-flora-ole-2",
    businessId: "flora-bama-ole-river",
    businessName: "Flora-Bama Ole River Grill",
    type: "special",
    title: "Taco Tuesday",
    description: "3 Mahi tacos with Caribbean slaw, pineapple salsa, Sriracha aioli - $14",
    date: "2025-10-28",
    startTime: "11:00 AM",
    endTime: "10:00 PM",
    recurring: "tuesday"
  },
  {
    id: "event-flora-ole-3",
    businessId: "flora-bama-ole-river",
    businessName: "Flora-Bama Ole River Grill",
    type: "special",
    title: "Fish Fry Friday",
    description: "Fried fish, fries, slaw, hushpuppies - $19",
    date: "2025-10-31",
    startTime: "11:00 AM",
    endTime: "10:00 PM",
    recurring: "friday"
  },
  {
    id: "event-flora-ole-4",
    businessId: "flora-bama-ole-river",
    businessName: "Flora-Bama Ole River Grill",
    type: "special",
    title: "Chef's Seafood Plate",
    description: "Rotating entrée with fresh local catch and sides - Market Price",
    date: "2025-10-27",
    startTime: "11:00 AM",
    endTime: "10:00 PM",
    recurring: "monday"
  },

  // Flora-Bama Yacht Club Events
  {
    id: "event-flora-yacht-1",
    businessId: "flora-bama-yacht",
    businessName: "Flora-Bama Yacht Club",
    type: "live-music",
    title: "Live Music",
    description: "Live music performances featuring local and regional artists",
    date: "2025-10-25",
    startTime: "6:30 PM",
    endTime: "9:30 PM",
    recurring: "friday,saturday,sunday"
  }
];

// Helper function to get events for a specific business
function getBusinessEvents(businessId) {
  // Get events from the new event-loader (if available)
  let dynamicEvents = [];
  if (window.eventLoader && window.eventLoader.loaded) {
    dynamicEvents = window.eventLoader.getByBusiness(businessId).map(event => ({
      id: event.id,
      businessId: event.businessId,
      businessName: event.location?.name || 'See details',
      type: event.category || 'event',
      title: event.title,
      description: event.description || '',
      date: event.date,
      startTime: event.startTime || 'TBD',
      endTime: event.endTime || 'TBD',
      recurring: event.recurring ? (event.daysOfWeek ? event.daysOfWeek.join(',').toLowerCase() : 'daily') : false
    }));
  }

  // Get happy hour specials from business profile (if available)
  let happyHourEvents = [];
  if (typeof allBusinesses !== 'undefined') {
    const business = allBusinesses.find(b => b.id === businessId);
    if (business && business.happyHours && business.happyHours.length > 0) {
      // Create a recurring happy hour event
      const happyHourTime = business.happyHour || 'Daily 3pm-6pm';
      const happyHourLower = happyHourTime.toLowerCase();

      // Determine recurring pattern
      let recurringPattern = 'monday,tuesday,wednesday,thursday,friday'; // Weekdays by default
      if (happyHourLower.includes('daily') || happyHourLower.includes('every day')) {
        recurringPattern = 'daily';
      }

      happyHourEvents.push({
        id: `${businessId}-happy-hour`,
        businessId: businessId,
        businessName: business.name,
        type: 'happy-hour',
        title: '🍹 Happy Hours',
        description: business.happyHours.map(s => `${s.name}: ${s.description}`).join('\n'),
        date: new Date().toISOString().split('T')[0], // Start from today
        startTime: happyHourTime.includes('3') ? '3:00 PM' : '4:00 PM',
        endTime: happyHourTime.includes('6') ? '6:00 PM' : '7:00 PM',
        recurring: recurringPattern
      });
    }
  }

  // Get hardcoded events from old calendar data (for backward compatibility)
  const hardcodedEvents = calendarEvents.filter(event => event.businessId === businessId);

  // Combine all events (dynamic + happy hour + hardcoded)
  return [...dynamicEvents, ...happyHourEvents, ...hardcodedEvents];
}

// Helper function to get events for a specific date
function getEventsByDate(dateString) {
  const targetDate = new Date(dateString + 'T12:00:00');
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Get events from the new event-loader (if available)
  let dynamicEvents = [];
  if (window.eventLoader && window.eventLoader.loaded) {
    dynamicEvents = window.eventLoader.getByDate(dateString).map(event => {
      // Determine event type based on recurring pattern
      let eventType = 'event'; // default for one-time events

      if (event.recurring) {
        // If it's recurring and has specific time ranges → happy-hour
        if (event.startTime && event.endTime &&
            (event.startTime.includes('PM') || event.startTime.includes('AM'))) {
          eventType = 'happy-hour';
        }
        // If it's recurring on specific days (like Tuesday, Friday) → special
        else if (event.daysOfWeek && event.daysOfWeek.length > 0) {
          eventType = 'special';
        }
      }

      // Override with explicit category if provided
      if (event.category === 'happy-hour' || event.category === 'special') {
        eventType = event.category;
      }

      return {
        id: event.id,
        businessId: event.businessId,
        businessName: event.location?.name || 'See details',
        type: eventType,
        title: event.title,
        description: event.description || '',
        date: event.date,
        startTime: event.startTime || 'TBD',
        endTime: event.endTime || 'TBD',
        recurring: event.recurring ? (event.daysOfWeek ? event.daysOfWeek.join(',').toLowerCase() : 'daily') : false
      };
    });
  }

  // Get happy hour specials from business profiles (if available)
  let happyHourEvents = [];
  if (typeof allBusinesses !== 'undefined') {
    allBusinesses.forEach(business => {
      if (business.happyHours && business.happyHours.length > 0) {
        const happyHourTime = business.happyHour || 'Daily 3pm-6pm';
        const happyHourLower = happyHourTime.toLowerCase();

        // Check if happy hour occurs on this day of week
        let shouldShow = false;

        if (happyHourLower.includes('daily') || happyHourLower.includes('every day')) {
          shouldShow = true;
        } else if (happyHourLower.includes(dayOfWeek)) {
          shouldShow = true;
        } else {
          // Default to weekdays if not specified
          const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(dayOfWeek);
          shouldShow = isWeekday;
        }

        if (shouldShow) {
          happyHourEvents.push({
            id: `${business.id}-happy-hour-${dateString}`,
            businessId: business.id,
            businessName: business.name,
            type: 'happy-hour',
            title: '🍹 Happy Hours',
            description: business.happyHours.map(s => `${s.name}: ${s.description}`).join('\n'),
            date: dateString,
            startTime: happyHourTime.includes('3') ? '3:00 PM' : '4:00 PM',
            endTime: happyHourTime.includes('6') ? '6:00 PM' : '7:00 PM',
            recurring: happyHourLower.includes('daily') ? 'daily' : 'weekdays'
          });
        }
      }

      // Add business events (specials, recurring events, etc.)
      if (business.events && business.events.length > 0) {
        business.events.forEach(event => {
          // Check if event should show on this day
          let shouldShow = false;
          if (event.day) {
            const eventDayLower = event.day.toLowerCase();

            // Handle various day formats
            if (eventDayLower.includes('daily') || eventDayLower.includes('every day') || eventDayLower.includes('all day')) {
              shouldShow = true;
            }
            // Check if the specific day of week is mentioned
            else if (eventDayLower.includes(dayOfWeek)) {
              shouldShow = true;
            }
            // Handle day ranges like "Friday–Sunday" or "Monday-Friday"
            else if (eventDayLower.includes('–') || eventDayLower.includes('-')) {
              // Split on dash and check if current day is in range
              const dayRange = eventDayLower.replace(/–/g, '-').split('-');
              if (dayRange.length === 2) {
                const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const startDay = daysOfWeek.find(d => dayRange[0].trim().includes(d));
                const endDay = daysOfWeek.find(d => dayRange[1].trim().includes(d));

                if (startDay && endDay) {
                  const startIdx = daysOfWeek.indexOf(startDay);
                  const endIdx = daysOfWeek.indexOf(endDay);
                  const currentIdx = daysOfWeek.indexOf(dayOfWeek);

                  // Check if current day is in range (handle wrap-around if needed)
                  if (startIdx <= endIdx) {
                    shouldShow = currentIdx >= startIdx && currentIdx <= endIdx;
                  } else {
                    // Wrap around case (e.g., Friday-Sunday)
                    shouldShow = currentIdx >= startIdx || currentIdx <= endIdx;
                  }
                }
              }
            }
          } else {
            // If no day specified, show it every day
            shouldShow = true;
          }

          if (shouldShow) {
            // Determine if it's entertainment (live music, trivia, etc.) or a special
            const isEntertainment = event.name && (
              event.name.toLowerCase().includes('live music') ||
              event.name.toLowerCase().includes('trivia') ||
              event.name.toLowerCase().includes('karaoke') ||
              event.name.toLowerCase().includes('dj') ||
              event.name.toLowerCase().includes('band')
            );

            // Parse time from event and convert to 12-hour format
            const fullTime = event.time || 'See details';
            const convertedTime = typeof convertTo12Hour !== 'undefined' ? convertTo12Hour(fullTime) : fullTime;
            const timeMatch = convertedTime.match(/(\d+:\d+\s*[AP]M)/i);
            const startTime = timeMatch ? timeMatch[0] : (convertedTime.includes('All Day') ? 'All Day' : '5:00 PM');

            happyHourEvents.push({
              id: `${business.id}-event-${event.name.replace(/\s+/g, '-').toLowerCase()}-${dateString}`,
              businessId: business.id,
              businessName: business.name,
              type: isEntertainment ? 'event' : 'special',
              title: event.name,
              description: event.description || '',
              date: dateString,
              startTime: startTime,
              endTime: convertedTime,
              recurring: event.day || 'See details',
              dayInfo: event.day || '',
              timeInfo: convertedTime
            });
          }
        });
      }
    });
  }

  // Get hardcoded events from old calendar data (for backward compatibility)
  const hardcodedEvents = calendarEvents
    .filter(event => {
      // Check if event is on this specific date
      if (event.date === dateString) return true;

      // Check if event recurs on this day of week
      if (event.recurring) {
        // Check if this day is in the recurring pattern
        if (event.recurring === 'daily' || event.recurring.includes(dayOfWeek)) {
          const eventDate = new Date(event.date + 'T12:00:00');
          // Only include if target date is same or after the event start date
          return targetDate >= eventDate;
        }
      }

      return false;
    })
    .map(event => {
      // Apply categorization rules to hardcoded events
      let eventType = event.type || 'event';

      // If event has a recurring pattern, categorize it
      if (event.recurring && event.recurring !== false) {
        // If it's a time-based recurring event with specific hours → happy-hour
        if (event.startTime && event.endTime &&
            (event.startTime.includes('PM') || event.startTime.includes('AM')) &&
            (event.recurring === 'daily' || event.recurring.includes(','))) {
          eventType = 'happy-hour';
        }
        // If it's a day-based recurring event (specific days like Tuesday, Friday) → special
        else if (event.recurring !== 'daily' && event.recurring.includes('day')) {
          eventType = 'special';
        }
      }

      // Return event with updated type
      return { ...event, type: eventType };
    });

  // Combine all events (dynamic + happy hour + hardcoded)
  return [...dynamicEvents, ...happyHourEvents, ...hardcodedEvents];
}

// Helper function to get all upcoming events (next 30 days)
function getUpcomingEvents(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  const allEvents = [];
  const dateMap = new Map();

  // Generate events for each day
  for (let d = new Date(today); d <= futureDate; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split('T')[0];
    const dayEvents = getEventsByDate(dateString);

    dayEvents.forEach(event => {
      const eventCopy = { ...event, displayDate: dateString };
      const key = `${event.id}-${dateString}`;
      if (!dateMap.has(key)) {
        dateMap.set(key, eventCopy);
        allEvents.push(eventCopy);
      }
    });
  }

  return allEvents.sort((a, b) => {
    const dateCompare = a.displayDate.localeCompare(b.displayDate);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}

// Helper function to get events by type
function getEventsByType(type) {
  return calendarEvents.filter(event => event.type === type);
}
