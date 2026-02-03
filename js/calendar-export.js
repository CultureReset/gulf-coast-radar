// Calendar Export Manager
// Exports vacation plans to iCal format (works with Google Calendar, Apple Calendar, Outlook, etc.)
// NO user accounts required!

class CalendarExport {
  constructor() {
    this.events = [];
  }

  // Add a single event to the calendar
  addEvent(event) {
    /*
    event = {
      title: "Lunch at Cobalt Restaurant",
      location: "30500 Hwy 98, Orange Beach, AL",
      description: "Waterfront dining with live music",
      startTime: Date object,
      endTime: Date object (optional),
      business: business object (optional)
    }
    */
    this.events.push(event);
  }

  // Add a full day itinerary
  addDayItinerary(day, activities) {
    activities.forEach(activity => {
      this.addEvent({
        title: activity.title,
        location: activity.location,
        description: activity.description,
        startTime: activity.startTime,
        endTime: activity.endTime,
        business: activity.business
      });
    });
  }

  // Generate iCal file content
  generateICalContent() {
    const now = new Date();
    const timestamp = this.formatICalDate(now);

    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Gulf Coast Radar//Vacation Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Gulf Coast Vacation',
      'X-WR-TIMEZONE:America/Chicago'
    ];

    this.events.forEach((event, index) => {
      const uid = `${timestamp}-${index}@gulfcoastradar.com`;
      const dtstart = this.formatICalDate(event.startTime);
      const dtend = event.endTime
        ? this.formatICalDate(event.endTime)
        : this.formatICalDate(new Date(event.startTime.getTime() + 60 * 60 * 1000)); // Default 1 hour

      ical.push('BEGIN:VEVENT');
      ical.push(`UID:${uid}`);
      ical.push(`DTSTAMP:${timestamp}`);
      ical.push(`DTSTART:${dtstart}`);
      ical.push(`DTEND:${dtend}`);
      ical.push(`SUMMARY:${this.escapeICalText(event.title)}`);

      if (event.location) {
        ical.push(`LOCATION:${this.escapeICalText(event.location)}`);
      }

      if (event.description) {
        ical.push(`DESCRIPTION:${this.escapeICalText(event.description)}`);
      }

      // Add business details if available
      if (event.business) {
        let description = event.description || '';
        if (event.business.phone) {
          description += `\\n\\nPhone: ${event.business.phone}`;
        }
        if (event.business.website) {
          description += `\\n\\nWebsite: ${event.business.website}`;
        }
        description += '\\n\\nPlanned via Gulf Coast Radar';

        ical.push(`DESCRIPTION:${this.escapeICalText(description)}`);
      }

      ical.push('STATUS:CONFIRMED');
      ical.push('SEQUENCE:0');
      ical.push('BEGIN:VALARM');
      ical.push('TRIGGER:-PT30M'); // 30 minute reminder
      ical.push('ACTION:DISPLAY');
      ical.push(`DESCRIPTION:Reminder: ${this.escapeICalText(event.title)}`);
      ical.push('END:VALARM');
      ical.push('END:VEVENT');
    });

    ical.push('END:VCALENDAR');

    return ical.join('\r\n');
  }

  // Format date for iCal (YYYYMMDDTHHMMSSZ)
  formatICalDate(date) {
    const pad = (num) => String(num).padStart(2, '0');

    return [
      date.getUTCFullYear(),
      pad(date.getUTCMonth() + 1),
      pad(date.getUTCDate()),
      'T',
      pad(date.getUTCHours()),
      pad(date.getUTCMinutes()),
      pad(date.getUTCSeconds()),
      'Z'
    ].join('');
  }

  // Escape special characters for iCal
  escapeICalText(text) {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  // Download the calendar file
  downloadCalendar(filename = 'gulf-coast-vacation.ics') {
    const content = this.generateICalContent();
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  // Clear all events
  clear() {
    this.events = [];
  }

  // Get event count
  getEventCount() {
    return this.events.length;
  }
}

// Helper function to create a trip itinerary from AI conversation
class TripItineraryBuilder {
  constructor() {
    this.calendar = new CalendarExport();
    this.days = [];
  }

  // Add a day to the trip
  addDay(dayNumber, activities) {
    /*
    activities = [
      {
        type: 'activity', // or 'dining', 'entertainment'
        business: business object,
        time: '9:00 AM' or Date object,
        duration: 2 (hours)
      }
    ]
    */
    this.days.push({
      dayNumber,
      activities
    });
  }

  // Parse time string to Date object for a specific day
  parseTime(timeStr, dayOffset = 0) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + dayOffset);

    // Parse time string (e.g., "9:00 AM", "2:30 PM")
    const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);

    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2] || 0);
      const meridiem = (match[3] || '').toUpperCase();

      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      startDate.setHours(hours, minutes, 0, 0);
    }

    return startDate;
  }

  // Build the calendar from the trip
  build(startDate = new Date()) {
    this.calendar.clear();

    this.days.forEach((day, dayIndex) => {
      day.activities.forEach(activity => {
        const startTime = activity.time instanceof Date
          ? activity.time
          : this.parseTime(activity.time, dayIndex);

        const duration = activity.duration || 1; // Default 1 hour
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

        const business = activity.business;
        const typeLabel = this.getTypeLabel(activity.type);

        this.calendar.addEvent({
          title: `${typeLabel}: ${business.name}`,
          location: business.location || business.address,
          description: business.description || `Enjoy ${business.name} on your Gulf Coast vacation!`,
          startTime: startTime,
          endTime: endTime,
          business: business
        });
      });
    });

    return this.calendar;
  }

  getTypeLabel(type) {
    const labels = {
      'dining': '🍽️ Dining',
      'activity': '🎪 Activity',
      'entertainment': '🎵 Entertainment',
      'coffee': '☕ Coffee',
      'shopping': '🛍️ Shopping'
    };
    return labels[type] || '📍 Visit';
  }

  // Export to calendar
  exportToCalendar(filename) {
    const calendar = this.build();
    calendar.downloadCalendar(filename);
  }

  // Get summary of the trip
  getSummary() {
    const totalActivities = this.days.reduce((sum, day) => sum + day.activities.length, 0);
    return {
      totalDays: this.days.length,
      totalActivities: totalActivities,
      days: this.days
    };
  }
}

// Add export button to AI conversation
function addCalendarExportButton(itinerary) {
  const button = document.createElement('button');
  button.className = 'calendar-export-button';
  button.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5z"/>
    </svg>
    Save Trip to Calendar
  `;

  button.addEventListener('click', () => {
    const builder = new TripItineraryBuilder();

    // Build from itinerary data
    itinerary.days.forEach((day, index) => {
      builder.addDay(index + 1, day.activities);
    });

    builder.exportToCalendar('my-gulf-coast-trip.ics');

    // Show confirmation
    showCalendarExportConfirmation();
  });

  return button;
}

function showCalendarExportConfirmation() {
  const toast = document.createElement('div');
  toast.className = 'calendar-export-toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
    </svg>
    <span>Trip saved to calendar! Open your calendar app to view.</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Trip Share Manager
// Share vacation plans to social media, text, or email
class TripShareManager {
  constructor(tripItinerary) {
    this.tripItinerary = tripItinerary; // TripItineraryBuilder instance
  }

  // Generate shareable text summary
  generateShareText() {
    const summary = this.tripItinerary.getSummary();
    let text = `🌊 My Gulf Coast Vacation Plan!\n\n`;
    text += `📅 ${summary.totalDays} day${summary.totalDays !== 1 ? 's' : ''} • ${summary.totalActivities} activities\n\n`;

    summary.days.forEach((day, index) => {
      text += `Day ${day.dayNumber}:\n`;
      day.activities.forEach(activity => {
        const business = activity.business;
        const typeEmoji = this.getTypeEmoji(activity.type);
        text += `${typeEmoji} ${business.name}`;
        if (activity.time) {
          const timeStr = typeof activity.time === 'string' ? activity.time :
                          `${activity.time.getHours()}:${String(activity.time.getMinutes()).padStart(2, '0')}`;
          text += ` at ${timeStr}`;
        }
        text += `\n`;
      });
      text += `\n`;
    });

    text += `\n✨ Plan your Gulf Coast adventure at GulfCoastRadar.com`;
    return text;
  }

  // Generate short shareable text (for SMS/Twitter)
  generateShortText() {
    const summary = this.tripItinerary.getSummary();
    const firstBusiness = summary.days[0]?.activities[0]?.business?.name || 'Gulf Coast';
    return `🌊 Planning a ${summary.totalDays}-day Gulf Coast vacation! Starting at ${firstBusiness}. Join me! ✨ GulfCoastRadar.com`;
  }

  getTypeEmoji(type) {
    const emojis = {
      'dining': '🍽️',
      'activity': '🎪',
      'entertainment': '🎵',
      'coffee': '☕',
      'shopping': '🛍️'
    };
    return emojis[type] || '📍';
  }

  // Share using Web Share API (native sharing on mobile)
  async shareNative() {
    if (!navigator.share) {
      throw new Error('Web Share API not supported on this device');
    }

    const text = this.generateShareText();
    const url = window.location.origin;

    try {
      await navigator.share({
        title: '🌊 My Gulf Coast Vacation Plan',
        text: text,
        url: url
      });
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }

  // Share to Facebook
  shareToFacebook() {
    const url = window.location.origin;
    const text = this.generateShortText();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }

  // Share to Twitter
  shareToTwitter() {
    const text = this.generateShortText();
    const url = window.location.origin;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  }

  // Share via SMS/Text
  shareViaSMS() {
    const text = this.generateShareText();
    const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
    window.location.href = smsUrl;
  }

  // Share via Email
  shareViaEmail() {
    const text = this.generateShareText();
    const subject = '🌊 My Gulf Coast Vacation Plan';
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailtoUrl;
  }

  // Copy text to clipboard
  async copyToClipboard() {
    const text = this.generateShareText();

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (err) {
        document.body.removeChild(textarea);
        return false;
      }
    }
  }

  // Show share modal
  showShareModal() {
    // Remove existing modal if any
    const existing = document.getElementById('trip-share-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'trip-share-modal';
    modal.className = 'trip-share-modal';
    modal.innerHTML = `
      <div class="trip-share-overlay" onclick="document.getElementById('trip-share-modal').remove()"></div>
      <div class="trip-share-content">
        <div class="trip-share-header">
          <h3>📤 Share Your Trip</h3>
          <button class="trip-share-close" onclick="document.getElementById('trip-share-modal').remove()">×</button>
        </div>

        <div class="trip-share-preview">
          ${this.generatePreviewHTML()}
        </div>

        <div class="trip-share-buttons">
          ${navigator.share ? `
            <button class="share-btn share-native" onclick="tripShareManager.handleNativeShare()">
              📱 Share
            </button>
          ` : ''}

          <button class="share-btn share-facebook" onclick="tripShareManager.shareToFacebook()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>

          <button class="share-btn share-twitter" onclick="tripShareManager.shareToTwitter()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>

          <button class="share-btn share-sms" onclick="tripShareManager.shareViaSMS()">
            💬 Text
          </button>

          <button class="share-btn share-email" onclick="tripShareManager.shareViaEmail()">
            📧 Email
          </button>

          <button class="share-btn share-copy" onclick="tripShareManager.handleCopyToClipboard()">
            📋 Copy
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  generatePreviewHTML() {
    const summary = this.tripItinerary.getSummary();
    let html = `<div class="trip-preview-summary">`;
    html += `<strong>${summary.totalDays} Day${summary.totalDays !== 1 ? 's' : ''}</strong> • `;
    html += `<strong>${summary.totalActivities} Activities</strong>`;
    html += `</div>`;

    html += `<div class="trip-preview-days">`;
    summary.days.slice(0, 2).forEach((day) => {
      html += `<div class="trip-preview-day">`;
      html += `<strong>Day ${day.dayNumber}:</strong> `;
      const names = day.activities.slice(0, 2).map(a => a.business.name).join(', ');
      html += names;
      if (day.activities.length > 2) {
        html += ` +${day.activities.length - 2} more`;
      }
      html += `</div>`;
    });
    if (summary.days.length > 2) {
      html += `<div class="trip-preview-more">+${summary.days.length - 2} more days...</div>`;
    }
    html += `</div>`;

    return html;
  }

  // Handle native share with error fallback
  async handleNativeShare() {
    try {
      const success = await this.shareNative();
      if (success) {
        document.getElementById('trip-share-modal').remove();
        showShareConfirmation('Trip shared successfully!');
      }
    } catch (error) {
      showShareConfirmation('Share cancelled', 'warning');
    }
  }

  // Handle copy to clipboard with feedback
  async handleCopyToClipboard() {
    const success = await this.copyToClipboard();
    if (success) {
      showShareConfirmation('Trip copied to clipboard!');
      document.getElementById('trip-share-modal').remove();
    } else {
      showShareConfirmation('Failed to copy. Please try again.', 'error');
    }
  }
}

// Show share confirmation toast
function showShareConfirmation(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `share-confirmation-toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Add share button to calendar export
function addShareTripButton(itinerary) {
  const button = document.createElement('button');
  button.className = 'share-trip-button';
  button.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
    </svg>
    Share Trip
  `;

  button.addEventListener('click', () => {
    const builder = new TripItineraryBuilder();

    // Build from itinerary data
    itinerary.days.forEach((day, index) => {
      builder.addDay(index + 1, day.activities);
    });

    window.tripShareManager = new TripShareManager(builder);
    window.tripShareManager.showShareModal();
  });

  return button;
}

// Global instances
window.CalendarExport = CalendarExport;
window.TripItineraryBuilder = TripItineraryBuilder;
window.TripShareManager = TripShareManager;
window.addCalendarExportButton = addCalendarExportButton;
window.addShareTripButton = addShareTripButton;
