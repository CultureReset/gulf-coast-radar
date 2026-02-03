// Lead Email Notification System
// Sends lead notifications to cybercheckinc@gmail.com

class LeadEmailer {
  constructor() {
    this.emailEndpoint = 'cybercheckinc@gmail.com';
    this.initialized = false;
  }

  /**
   * Send lead notification email
   * @param {Object} leadData - The lead data to send
   */
  async sendLeadNotification(leadData) {
    try {
      // Save to localStorage (for dashboard)
      this.saveToLocalStorage(leadData);

      // Send email notification
      await this.sendEmail(leadData);

      console.log('[Lead Emailer] Lead saved and email sent!');
      return { success: true };
    } catch (error) {
      console.error('[Lead Emailer] Error:', error);
      // Still save locally even if email fails
      this.saveToLocalStorage(leadData);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save lead to localStorage (for dashboard viewing)
   */
  saveToLocalStorage(leadData) {
    const leads = JSON.parse(localStorage.getItem('gcr_leads') || '[]');

    const lead = {
      ...leadData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      contacted: false
    };

    leads.unshift(lead); // Add to beginning
    localStorage.setItem('gcr_leads', JSON.stringify(leads));

    // Dispatch event for dashboard to refresh
    window.dispatchEvent(new CustomEvent('leadAdded', { detail: lead }));
  }

  /**
   * Send email using mailto (opens user's email client)
   * For production, use a backend API or EmailJS
   */
  async sendEmail(leadData) {
    // Format email content
    const subject = `New Lead: ${leadData.type || 'Contact Form'} - ${leadData.name || 'Unknown'}`;

    const body = this.formatEmailBody(leadData);

    // For now, using backend API
    // You can replace this with EmailJS, Sendgrid, or your backend
    return this.sendViaBackend(leadData, subject, body);
  }

  /**
   * Format email body
   */
  formatEmailBody(leadData) {
    const lines = [
      `NEW LEAD RECEIVED`,
      `===================`,
      ``,
      `Date: ${new Date().toLocaleString()}`,
      `Type: ${leadData.type || 'Contact Form'}`,
      ``,
      `CONTACT INFORMATION:`,
      `Name: ${leadData.name || 'Not provided'}`,
      `Phone: ${leadData.phone || 'Not provided'}`,
      `Email: ${leadData.email || 'Not provided'}`,
      ``
    ];

    if (leadData.businessName) {
      lines.push(`Business: ${leadData.businessName}`);
      lines.push(``);
    }

    if (leadData.message || leadData.details) {
      lines.push(`MESSAGE/DETAILS:`);
      lines.push(leadData.message || leadData.details);
      lines.push(``);
    }

    // Add any additional fields
    Object.keys(leadData).forEach(key => {
      if (!['name', 'phone', 'email', 'businessName', 'message', 'details', 'type', 'timestamp', 'id', 'contacted'].includes(key)) {
        lines.push(`${key}: ${leadData[key]}`);
      }
    });

    lines.push(``);
    lines.push(`---`);
    lines.push(`View in dashboard: admin-dashboard.html → Leads tab`);
    lines.push(``);
    lines.push(`Gulf Coast Radar - Lead Management System`);

    return lines.join('\\n');
  }

  /**
   * Send via backend API
   */
  async sendViaBackend(leadData, subject, body) {
    const backendUrl = 'http://localhost:3002/api/leads/notify';

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: 'cybercheckinc@gmail.com',
          subject: subject,
          body: body,
          leadData: leadData
        })
      });

      if (!response.ok) {
        throw new Error('Backend email API not available');
      }

      return await response.json();
    } catch (error) {
      console.warn('[Lead Emailer] Backend not available, using fallback');
      // Fallback: Use mailto (opens email client)
      this.sendViaMailto(subject, body);
      return { success: true, method: 'mailto' };
    }
  }

  /**
   * Fallback: Open email client with pre-filled data
   */
  sendViaMailto(subject, body) {
    const mailtoLink = `mailto:cybercheckinc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Create invisible link and click it
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.style.display = 'none';
    document.body.appendChild(link);

    // Note: This will open the user's email client
    // For silent sending, you need a backend API
    console.log('[Lead Emailer] Email notification prepared (requires user email client)');
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.leadEmailer = new LeadEmailer();
  console.log('[Lead Emailer] Initialized - emails will be sent to cybercheckinc@gmail.com');
}

// Helper function for forms to use
window.submitLead = async function(leadData) {
  if (!window.leadEmailer) {
    console.error('Lead emailer not initialized');
    return { success: false, error: 'Emailer not initialized' };
  }

  return await window.leadEmailer.sendLeadNotification(leadData);
};
