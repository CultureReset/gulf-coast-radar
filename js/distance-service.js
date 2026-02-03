// Distance Service - Calculates driving distances using routing APIs

let userLocation = null;
let distanceCache = {};

// Get user's current location
async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        resolve(userLocation);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

// Calculate driving distance using OSRM (Open Source Routing Machine) - Free alternative
async function calculateDrivingDistance(origin, destination) {
  const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;

  // Check cache first
  if (distanceCache[cacheKey]) {
    return distanceCache[cacheKey];
  }

  try {
    // Using OSRM public API (free, open source)
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const distanceMeters = data.routes[0].distance;
      const distanceMiles = (distanceMeters * 0.000621371).toFixed(1); // Convert meters to miles
      const durationMinutes = Math.round(data.routes[0].duration / 60); // Convert seconds to minutes

      const result = {
        distance: parseFloat(distanceMiles),
        duration: durationMinutes,
        distanceText: `${distanceMiles} mi`,
        durationText: `${durationMinutes} min`
      };

      // Cache the result
      distanceCache[cacheKey] = result;
      return result;
    } else {
      throw new Error('No route found');
    }
  } catch (error) {
    console.error('Distance calculation error:', error);
    // Fallback to straight-line distance if API fails
    return calculateStraightLineDistance(origin, destination);
  }
}

// Fallback: Calculate straight-line distance (Haversine formula)
function calculateStraightLineDistance(origin, destination) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lng - origin.lng);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = (R * c).toFixed(1);

  return {
    distance: parseFloat(distance),
    duration: null,
    distanceText: `~${distance} mi`,
    durationText: null,
    isStraightLine: true
  };
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Calculate distances for multiple businesses
async function calculateDistancesForBusinesses(businesses) {
  if (!userLocation) {
    try {
      await getUserLocation();
    } catch (error) {
      console.error('Could not get user location:', error);
      return businesses; // Return without distances
    }
  }

  // Calculate distances in parallel
  const businessesWithDistances = await Promise.all(
    businesses.map(async (business) => {
      try {
        const destination = parseCoordinates(business);
        if (!destination) {
          return { ...business, distance: null, distanceText: 'N/A' };
        }

        const distanceInfo = await calculateDrivingDistance(userLocation, destination);
        return {
          ...business,
          ...distanceInfo
        };
      } catch (error) {
        console.error(`Error calculating distance for ${business.name}:`, error);
        return { ...business, distance: null, distanceText: 'N/A' };
      }
    })
  );

  return businessesWithDistances;
}

// Parse coordinates from business data or address
function parseCoordinates(business) {
  // If business has coordinates, use them
  if (business.coordinates && business.coordinates.lat && business.coordinates.lng) {
    return business.coordinates;
  }

  // Try to estimate coordinates from address
  const address = business.address ? business.address.toLowerCase() : '';

  // Perdido Beach Blvd (main beach road in Orange Beach)
  if (address.includes('perdido beach blvd')) {
    const match = address.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[0]);
      // Approximate coordinates along Perdido Beach Blvd
      if (num < 25000) return { lat: 30.2750, lng: -87.5850 };
      if (num < 26000) return { lat: 30.2765, lng: -87.5700 };
      if (num < 27000) return { lat: 30.2780, lng: -87.5600 };
      if (num < 28000) return { lat: 30.2790, lng: -87.5500 };
      return { lat: 30.2800, lng: -87.5400 };
    }
  }

  // Beach Blvd (Gulf Shores)
  if (address.includes('beach blvd') && address.includes('gulf shores')) {
    return { lat: 30.2472, lng: -87.6348 };
  }

  // Canal Rd (Orange Beach)
  if (address.includes('canal rd')) {
    return { lat: 30.2789, lng: -87.5521 };
  }

  // Gulf Shores Pkwy
  if (address.includes('gulf shores pkwy') || address.includes('gulf shores parkway')) {
    const match = address.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[0]);
      if (num < 1000) return { lat: 30.2680, lng: -87.6900 };
      if (num < 3000) return { lat: 30.2650, lng: -87.6950 };
      return { lat: 30.2600, lng: -87.7000 };
    }
  }

  // Wharf Pkwy
  if (address.includes('wharf pkwy') || address.includes('wharf parkway')) {
    return { lat: 30.2904, lng: -87.5482 };
  }

  // AL-135 / AL-59
  if (address.includes('al-135') || address.includes('al-59')) {
    return { lat: 30.2850, lng: -87.6750 };
  }

  // Fallback: Use location-based approximation
  if (business.location && business.location.toLowerCase().includes('gulf shores')) {
    return { lat: 30.2460, lng: -87.7008 };
  }

  if (business.location && business.location.toLowerCase().includes('orange beach')) {
    return { lat: 30.2904, lng: -87.5723 };
  }

  // Default to Gulf Shores center
  return { lat: 30.2460, lng: -87.7008 };
}

// Sort businesses by distance
function sortByDistance(businesses) {
  return businesses.sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });
}
