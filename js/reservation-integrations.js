// Reservation System Integration Layer
// Connects to OpenTable, Resy, and direct booking systems

class ReservationIntegrationManager {
  constructor() {
    this.integrations = {
      opentable: new OpenTableConnector(),
      resy: new ResyConnector(),
      direct: new DirectBookingConnector()
    };
  }

  /**
   * Check availability across ALL platforms business uses
   * @param {Object} reservation - Reservation details
   * @param {Object} business - Business with reservation systems
   * @returns {Promise<Array>} Availability across all platforms
   */
  async checkAllPlatforms(reservation, business) {
    // Support both single system and multiple systems
    const systems = business.reservationSystems || (business.reservationSystem ? [{ type: business.reservationSystem, credentials: business.reservationCredentials }] : []);

    const results = [];

    for (const system of systems) {
      const systemType = (system.type || system).toLowerCase();
      const connector = this.integrations[systemType];

      if (!connector) continue;

      try {
        const availability = await connector.checkAvailability(
          reservation.date,
          reservation.time,
          reservation.partySize,
          system.credentials || business.reservationCredentials
        );

        results.push({
          platform: systemType,
          available: availability.available,
          alternatives: availability.alternativeTimes || [],
          credentials: system.credentials || business.reservationCredentials
        });
      } catch (error) {
        console.error(`Error checking ${systemType}:`, error);
        results.push({
          platform: systemType,
          available: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Create reservation - supports HYBRID MODE (multiple platforms)
   * @param {Object} reservation - Reservation details from AI
   * @param {Object} business - Business object with booking credentials
   * @param {string} preferredPlatform - Optional: 'direct', 'opentable', 'resy', or 'auto'
   * @returns {Promise<Object>} Booking confirmation
   */
  async createReservation(reservation, business, preferredPlatform = 'auto') {
    // Support both formats: single system or multiple systems
    const systems = business.reservationSystems || (business.reservationSystem ? [{ type: business.reservationSystem, credentials: business.reservationCredentials }] : []);

    if (systems.length === 0) {
      console.warn('Business has no reservation system configured');
      return { success: false, error: 'No reservation system' };
    }

    // Check availability across all platforms
    const availabilityResults = await this.checkAllPlatforms(reservation, business);
    const anyAvailable = availabilityResults.some(r => r.available);

    if (!anyAvailable) {
      return {
        success: false,
        error: 'No availability on any platform',
        alternatives: availabilityResults.flatMap(r => r.alternatives),
        checkedPlatforms: availabilityResults.map(r => r.platform)
      };
    }

    // Auto-select best platform (prioritize: GCR direct > OpenTable > Resy)
    let selectedPlatform = null;
    if (preferredPlatform === 'auto') {
      const priorityOrder = ['direct', 'opentable', 'resy'];
      for (const priority of priorityOrder) {
        const available = availabilityResults.find(r => r.platform === priority && r.available);
        if (available) {
          selectedPlatform = available;
          break;
        }
      }
    } else {
      // Use customer's preferred platform (if available)
      selectedPlatform = availabilityResults.find(r => r.platform === preferredPlatform && r.available);
    }

    // Fallback to first available platform
    if (!selectedPlatform) {
      selectedPlatform = availabilityResults.find(r => r.available);
    }

    if (!selectedPlatform) {
      return {
        success: false,
        error: 'Selected platform not available'
      };
    }

    const connector = this.integrations[selectedPlatform.platform];

    try {

      // Create reservation
      const result = await connector.createReservation(
        reservation,
        business.reservationCredentials
      );

      if (result.success) {
        // Save reservation tracking info
        reservation.confirmationCode = result.confirmationCode;
        reservation.reservationSystem = systemType;

        console.log(`✅ Reservation created in ${systemType}:`, result.confirmationCode);
        return result;
      } else {
        console.error(`❌ Failed to create reservation in ${systemType}:`, result.error);
        return result;
      }
    } catch (error) {
      console.error(`Error creating reservation in ${systemType}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(reservation, business) {
    if (!reservation.confirmationCode || !reservation.reservationSystem) {
      return { success: false, error: 'No reservation tracking info' };
    }

    const connector = this.integrations[reservation.reservationSystem];
    if (!connector) {
      return { success: false, error: 'Unsupported system' };
    }

    try {
      return await connector.cancelReservation(
        reservation.confirmationCode,
        business.reservationCredentials
      );
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Modify reservation (change time/party size)
   */
  async modifyReservation(reservation, newDetails, business) {
    if (!reservation.confirmationCode || !reservation.reservationSystem) {
      return { success: false, error: 'No reservation tracking info' };
    }

    const connector = this.integrations[reservation.reservationSystem];
    if (!connector) {
      return { success: false, error: 'Unsupported system' };
    }

    try {
      return await connector.modifyReservation(
        reservation.confirmationCode,
        newDetails,
        business.reservationCredentials
      );
    } catch (error) {
      console.error('Error modifying reservation:', error);
      return { success: false, error: error.message };
    }
  }
}

// ===== OPENTABLE CONNECTOR =====
class OpenTableConnector {
  constructor() {
    this.apiBase = 'https://platform.otrestaurant.com/sync/v2';
  }

  async checkAvailability(date, time, partySize, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/restaurants/${credentials.restaurantId}/availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partySize: partySize,
          dateTime: `${date}T${time}:00`
        })
      });

      if (!response.ok) {
        return { available: false, alternatives: [] };
      }

      const result = await response.json();
      return {
        available: result.availability?.length > 0,
        alternativeTimes: result.availability || []
      };
    } catch (error) {
      return { available: false, alternatives: [], error: error.message };
    }
  }

  async createReservation(reservation, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/restaurants/${credentials.restaurantId}/reservations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partySize: reservation.partySize,
          dateTime: `${reservation.date}T${reservation.time}:00`,
          customer: {
            firstName: reservation.customerName.split(' ')[0],
            lastName: reservation.customerName.split(' ').slice(1).join(' '),
            phone: reservation.phone,
            email: reservation.email
          },
          specialRequests: reservation.notes || ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const result = await response.json();
      return {
        success: true,
        confirmationCode: result.confirmationCode,
        reservationData: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cancelReservation(confirmationCode, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/reservations/${confirmationCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`
        }
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to cancel' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async modifyReservation(confirmationCode, newDetails, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/reservations/${confirmationCode}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partySize: newDetails.partySize,
          dateTime: `${newDetails.date}T${newDetails.time}:00`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const result = await response.json();
      return {
        success: true,
        confirmationCode: result.confirmationCode,
        reservationData: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// ===== RESY CONNECTOR =====
class ResyConnector {
  constructor() {
    this.apiBase = 'https://api.resy.com/4';
  }

  async checkAvailability(date, time, partySize, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/find`, {
        method: 'POST',
        headers: {
          'Authorization': `ResyAPI api_key="${credentials.apiKey}"`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venue_id: credentials.venueId,
          day: date,
          party_size: partySize
        })
      });

      if (!response.ok) {
        return { available: false, alternatives: [] };
      }

      const result = await response.json();
      const slots = result.results?.venues?.[0]?.slots || [];

      return {
        available: slots.some(slot => slot.date.start.includes(time)),
        alternativeTimes: slots.map(slot => ({
          time: slot.date.start,
          available: true
        }))
      };
    } catch (error) {
      return { available: false, alternatives: [], error: error.message };
    }
  }

  async createReservation(reservation, credentials) {
    try {
      // First, get the config token for the time slot
      const findResponse = await fetch(`${this.apiBase}/find`, {
        method: 'POST',
        headers: {
          'Authorization': `ResyAPI api_key="${credentials.apiKey}"`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venue_id: credentials.venueId,
          day: reservation.date,
          party_size: reservation.partySize
        })
      });

      if (!findResponse.ok) {
        return { success: false, error: 'Time not available' };
      }

      const findResult = await findResponse.json();
      const slot = findResult.results?.venues?.[0]?.slots?.find(s =>
        s.date.start.includes(reservation.time)
      );

      if (!slot) {
        return { success: false, error: 'Time not available' };
      }

      // Create the reservation
      const response = await fetch(`${this.apiBase}/reservation/book`, {
        method: 'POST',
        headers: {
          'Authorization': `ResyAPI api_key="${credentials.apiKey}"`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config_id: slot.config.token,
          party_size: reservation.partySize,
          day: reservation.date,
          first_name: reservation.customerName.split(' ')[0],
          last_name: reservation.customerName.split(' ').slice(1).join(' '),
          mobile_number: reservation.phone,
          email: reservation.email,
          special_requests: reservation.notes || ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const result = await response.json();
      return {
        success: true,
        confirmationCode: result.resy_token,
        reservationData: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cancelReservation(confirmationCode, credentials) {
    try {
      const response = await fetch(`${this.apiBase}/reservation/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `ResyAPI api_key="${credentials.apiKey}"`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resy_token: confirmationCode
        })
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to cancel' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async modifyReservation(confirmationCode, newDetails, credentials) {
    // Resy doesn't support modification - need to cancel and rebook
    const cancelResult = await this.cancelReservation(confirmationCode, credentials);
    if (!cancelResult.success) {
      return { success: false, error: 'Failed to cancel existing reservation' };
    }

    return await this.createReservation(newDetails, credentials);
  }
}

// ===== DIRECT BOOKING CONNECTOR =====
// For restaurants using our built-in reservation system
class DirectBookingConnector {
  async checkAvailability(date, time, partySize, credentials) {
    // Check our internal availability
    const reservations = JSON.parse(localStorage.getItem('gcr_reservations') || '[]');
    const businessReservations = reservations.filter(r =>
      r.businessId === credentials.businessId &&
      r.date === date &&
      r.time === time &&
      r.status !== 'cancelled'
    );

    // Check table capacity (simplified - would need more logic in production)
    const totalSeats = businessReservations.reduce((sum, r) => sum + r.partySize, 0);
    const maxCapacity = credentials.maxCapacity || 100;

    return {
      available: (totalSeats + partySize) <= maxCapacity,
      alternativeTimes: [] // Could suggest alternatives based on availability
    };
  }

  async createReservation(reservation, credentials) {
    try {
      // Generate confirmation code
      const confirmationCode = 'GCR-' + Date.now().toString(36).toUpperCase();

      const reservationData = {
        confirmationCode: confirmationCode,
        businessId: credentials.businessId,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        customerName: reservation.customerName,
        phone: reservation.phone,
        email: reservation.email,
        notes: reservation.notes || '',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const reservations = JSON.parse(localStorage.getItem('gcr_reservations') || '[]');
      reservations.push(reservationData);
      localStorage.setItem('gcr_reservations', JSON.stringify(reservations));

      // Send confirmation SMS (mock)
      console.log(`📱 SMS to ${reservation.phone}:`);
      console.log(`✅ Reservation confirmed!\n${reservation.businessName}\n${reservation.date} at ${reservation.time}\nParty of ${reservation.partySize}\nConfirmation: ${confirmationCode}`);

      return {
        success: true,
        confirmationCode: confirmationCode,
        reservationData: reservationData
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cancelReservation(confirmationCode, credentials) {
    try {
      const reservations = JSON.parse(localStorage.getItem('gcr_reservations') || '[]');
      const reservation = reservations.find(r => r.confirmationCode === confirmationCode);

      if (!reservation) {
        return { success: false, error: 'Reservation not found' };
      }

      reservation.status = 'cancelled';
      reservation.cancelledAt = new Date().toISOString();

      localStorage.setItem('gcr_reservations', JSON.stringify(reservations));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async modifyReservation(confirmationCode, newDetails, credentials) {
    try {
      const reservations = JSON.parse(localStorage.getItem('gcr_reservations') || '[]');
      const reservation = reservations.find(r => r.confirmationCode === confirmationCode);

      if (!reservation) {
        return { success: false, error: 'Reservation not found' };
      }

      // Update details
      if (newDetails.date) reservation.date = newDetails.date;
      if (newDetails.time) reservation.time = newDetails.time;
      if (newDetails.partySize) reservation.partySize = newDetails.partySize;
      reservation.modifiedAt = new Date().toISOString();

      localStorage.setItem('gcr_reservations', JSON.stringify(reservations));

      return {
        success: true,
        confirmationCode: confirmationCode,
        reservationData: reservation
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
window.reservationIntegrationManager = new ReservationIntegrationManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReservationIntegrationManager;
}
