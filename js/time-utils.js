// Time Utilities - Convert military time to 12-hour format
// Used across the entire platform for consistent time display

/**
 * Convert 24-hour time to 12-hour format
 * Examples:
 *   "14:30" -> "2:30 PM"
 *   "09:00" -> "9:00 AM"
 *   "00:00" -> "12:00 AM"
 *   "2:30 PM" -> "2:30 PM" (already formatted)
 */
function convertTo12Hour(time) {
  if (!time) return time;

  // If already in 12-hour format (contains AM/PM), return as-is
  if (time.includes('AM') || time.includes('PM') || time.includes('am') || time.includes('pm')) {
    return time;
  }

  // Handle special text cases
  if (time.toLowerCase().includes('all day') ||
      time.toLowerCase().includes('daily') ||
      time.toLowerCase().includes('see details')) {
    return time;
  }

  // Extract time from string like "3:00 PM - 6:00 PM" or "15:00-18:00"
  const timePattern = /(\d{1,2}):(\d{2})/g;

  return time.replace(timePattern, (match, hours, minutes) => {
    let hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';

    // Convert 24-hour to 12-hour
    if (hour === 0) {
      hour = 12; // Midnight
    } else if (hour > 12) {
      hour = hour - 12;
    }

    return `${hour}:${minutes} ${period}`;
  });
}

/**
 * Format time range
 * Examples:
 *   "14:30-18:00" -> "2:30 PM - 6:00 PM"
 *   "3:00 PM - 6:00 PM" -> "3:00 PM - 6:00 PM" (already formatted)
 */
function formatTimeRange(range) {
  if (!range) return range;

  // Handle ranges with various separators
  const rangeParts = range.split(/[-–—]/);

  if (rangeParts.length === 2) {
    const start = convertTo12Hour(rangeParts[0].trim());
    const end = convertTo12Hour(rangeParts[1].trim());
    return `${start} - ${end}`;
  }

  return convertTo12Hour(range);
}

/**
 * Format business hours object
 * Converts all time values in the hours object to 12-hour format
 */
function formatBusinessHours(hours) {
  if (!hours || typeof hours !== 'object') return hours;

  const formatted = {};
  for (const [day, time] of Object.entries(hours)) {
    formatted[day] = convertTo12Hour(time);
  }
  return formatted;
}

/**
 * Format event time display
 * Handles both single times and time ranges
 */
function formatEventTime(startTime, endTime) {
  if (!startTime && !endTime) return '';

  if (startTime && endTime && startTime !== endTime) {
    return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
  }

  if (startTime) {
    return convertTo12Hour(startTime);
  }

  if (endTime) {
    return convertTo12Hour(endTime);
  }

  return '';
}
