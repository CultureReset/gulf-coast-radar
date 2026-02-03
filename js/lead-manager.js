// Lead Generation Manager
// Handles service requests from tourists and lead notifications to businesses

class LeadManager {
  constructor() {
    this.leads = this.loadLeads();
    this.init();
  }

  init() {
    console.log('Lead Manager initialized');
  }

  // Load leads from localStorage
  loadLeads() {
    try {
      const stored = localStorage.getItem('gcr_leads');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading leads:', error);
      return [];
    }
  }

  // Save leads to localStorage
  saveLeads() {
    try {
      localStorage.setItem('gcr_leads', JSON.stringify(this.leads));
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  }

  // Create new lead request
  createLead(leadData) {
    const lead = {
      id: this.generateLeadId(),

      // Request details
      serviceType: leadData.serviceType, // 'photographer', 'catering', 'boat-rental', etc.
      category: leadData.category, // 'photographers', 'restaurants', 'activities'

      // Timing
      requestedDate: leadData.requestedDate, // Date string
      requestedTime: leadData.requestedTime, // Time string
      flexible: leadData.flexible || false, // Is timing flexible?

      // Details
      description: leadData.description, // What they need
      budget: leadData.budget || null, // Optional budget
      partySize: leadData.partySize || null, // For restaurants/activities

      // Tourist contact info
      touristName: leadData.touristName,
      touristPhone: leadData.touristPhone,
      touristEmail: leadData.touristEmail || null,

      // Targeting (which businesses to notify)
      targetBusinessIds: leadData.targetBusinessIds || [], // Specific businesses
      targetCategory: leadData.targetCategory, // Or all in category
      location: leadData.location || 'Gulf Shores', // Location preference

      // Status tracking
      status: 'pending', // pending, responded, booked, declined, expired
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // Expires in 24 hours

      // Responses
      responses: [], // Array of business responses
      firstResponderId: null, // Business ID that responded first
      firstRespondedAt: null,

      // Business selection
      selectedBusinessId: null, // Which business tourist chose
      selectedAt: null,

      // Analytics
      viewedBy: [], // Business IDs that viewed the lead
      notificationsSent: 0
    };

    this.leads.push(lead);
    this.saveLeads();

    // Send notifications to businesses
    this.notifyBusinesses(lead);

    console.log('Lead created:', lead.id);
    return lead;
  }

  // Generate unique lead ID
  generateLeadId() {
    return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Notify businesses about new lead
  notifyBusinesses(lead) {
    // Get target businesses
    let targetBusinesses = [];

    if (typeof allBusinesses === 'undefined' || !allBusinesses) {
      console.error('Business data not loaded');
      return 0;
    }

    if (lead.targetBusinessIds && lead.targetBusinessIds.length > 0) {
      // Specific businesses
      targetBusinesses = allBusinesses.filter(b =>
        lead.targetBusinessIds.includes(b.id)
      );
    } else if (lead.targetCategory) {
      // All businesses in category
      targetBusinesses = allBusinesses.filter(b =>
        b.category === lead.targetCategory
      );
    }

    // Store notification count
    lead.notificationsSent = targetBusinesses.length;
    this.saveLeads();

    console.log(`Notified ${targetBusinesses.length} businesses about lead ${lead.id}`);

    // In a real app, this would send push notifications, emails, SMS
    // For now, businesses will see leads in their admin dashboard

    return targetBusinesses.length;
  }

  // Business responds to lead
  respondToLead(leadId, response) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) {
      console.error('Lead not found:', leadId);
      return { success: false, error: 'Lead not found' };
    }

    // Check if lead expired
    if (Date.now() > lead.expiresAt) {
      return { success: false, error: 'Lead has expired' };
    }

    // Check if already responded
    if (lead.responses.some(r => r.businessId === response.businessId)) {
      return { success: false, error: 'Already responded to this lead' };
    }

    const businessResponse = {
      businessId: response.businessId,
      businessName: response.businessName,
      message: response.message,
      availability: response.availability, // 'available', 'not-available', 'alternative-time'
      alternativeDate: response.alternativeDate || null,
      alternativeTime: response.alternativeTime || null,
      price: response.price || null,
      contactPhone: response.contactPhone,
      contactEmail: response.contactEmail || null,
      respondedAt: Date.now()
    };

    // Add response
    lead.responses.push(businessResponse);

    // Track first responder
    if (!lead.firstResponderId) {
      lead.firstResponderId = response.businessId;
      lead.firstRespondedAt = Date.now();
    }

    // Update status
    if (lead.status === 'pending') {
      lead.status = 'responded';
    }

    this.saveLeads();

    console.log(`Business ${response.businessId} responded to lead ${leadId}`);
    return { success: true, lead };
  }

  // Tourist selects a business
  selectBusiness(leadId, businessId) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return { success: false, error: 'Lead not found' };

    lead.selectedBusinessId = businessId;
    lead.selectedAt = Date.now();
    lead.status = 'booked';

    this.saveLeads();

    console.log(`Tourist selected business ${businessId} for lead ${leadId}`);
    return { success: true, lead };
  }

  // Mark lead as viewed by business
  markAsViewed(leadId, businessId) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return;

    if (!lead.viewedBy.includes(businessId)) {
      lead.viewedBy.push(businessId);
      this.saveLeads();
    }
  }

  // Get leads for a specific business
  getLeadsForBusiness(businessId) {
    if (typeof allBusinesses === 'undefined' || !allBusinesses) {
      console.error('Business data not loaded');
      return [];
    }

    const business = allBusinesses.find(b => b.id === businessId);
    if (!business) return [];

    return this.leads.filter(lead => {
      // Check if business was targeted
      const isTargeted =
        lead.targetBusinessIds.includes(businessId) ||
        lead.targetCategory === business.category;

      // Only show active leads (not expired, not already booked by someone else)
      const isActive =
        Date.now() <= lead.expiresAt &&
        (lead.status === 'pending' || lead.status === 'responded') &&
        (!lead.selectedBusinessId || lead.selectedBusinessId === businessId);

      return isTargeted && isActive;
    }).sort((a, b) => b.createdAt - a.createdAt); // Newest first
  }

  // Get all leads for admin
  getAllLeads(filter = 'all') {
    let filtered = [...this.leads];

    switch(filter) {
      case 'active':
        filtered = filtered.filter(l =>
          Date.now() <= l.expiresAt &&
          (l.status === 'pending' || l.status === 'responded')
        );
        break;
      case 'pending':
        filtered = filtered.filter(l => l.status === 'pending');
        break;
      case 'responded':
        filtered = filtered.filter(l => l.status === 'responded');
        break;
      case 'booked':
        filtered = filtered.filter(l => l.status === 'booked');
        break;
      case 'expired':
        filtered = filtered.filter(l => Date.now() > l.expiresAt);
        break;
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get leads created by a tourist (by phone number)
  getLeadsByTourist(phone) {
    return this.leads
      .filter(l => l.touristPhone === phone)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get lead by ID
  getLead(leadId) {
    return this.leads.find(l => l.id === leadId);
  }

  // Get analytics
  getAnalytics() {
    const total = this.leads.length;
    const pending = this.leads.filter(l => l.status === 'pending').length;
    const responded = this.leads.filter(l => l.status === 'responded').length;
    const booked = this.leads.filter(l => l.status === 'booked').length;
    const expired = this.leads.filter(l => Date.now() > l.expiresAt && l.status !== 'booked').length;

    // Calculate average response time
    const respondedLeads = this.leads.filter(l => l.firstRespondedAt);
    const avgResponseTime = respondedLeads.length > 0
      ? respondedLeads.reduce((sum, l) => sum + (l.firstRespondedAt - l.createdAt), 0) / respondedLeads.length
      : 0;

    // Conversion rate (booked / total)
    const conversionRate = total > 0 ? ((booked / total) * 100).toFixed(1) : 0;

    // Average responses per lead
    const avgResponses = total > 0
      ? (this.leads.reduce((sum, l) => sum + l.responses.length, 0) / total).toFixed(1)
      : 0;

    return {
      total,
      pending,
      responded,
      booked,
      expired,
      avgResponseTime: Math.round(avgResponseTime / 1000 / 60), // In minutes
      conversionRate: parseFloat(conversionRate),
      avgResponses: parseFloat(avgResponses)
    };
  }

  // Clean up expired leads (run periodically)
  cleanupExpiredLeads() {
    const before = this.leads.length;

    // Keep leads from last 30 days for analytics
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.leads = this.leads.filter(l => l.createdAt > thirtyDaysAgo);

    const removed = before - this.leads.length;
    if (removed > 0) {
      this.saveLeads();
      console.log(`Cleaned up ${removed} old leads`);
    }
  }
}

// Initialize global lead manager
let leadManager;
if (typeof allBusinesses !== 'undefined') {
  leadManager = new LeadManager();
} else {
  // Wait for business data to load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      leadManager = new LeadManager();
    }, 500);
  });
}
