/**
 * Gulf Coast Radar - SMS Loyalty Dashboard
 * Handles SMS campaign management for business owners
 */

// Get business ID from session or URL
const businessId = localStorage.getItem('businessId') || 'demo-business';

// SMS Configuration
const SMS_COST_PER_MESSAGE = 0.01; // $0.01 per message markup
const MAX_SMS_LENGTH = 160;

// Demo Mode Detection
const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if we're on the dashboard (not login screen)
  if (document.getElementById('dashboardScreen')) {
    initSMSLoyalty();
  }
});

/**
 * Initialize SMS Loyalty Dashboard
 */
function initSMSLoyalty() {
  // Load SMS data
  loadSMSStatus();
  loadMembers();
  loadCampaignHistory();

  // Set up tab switching
  setupTabs();

  // Set up campaign form
  setupCampaignForm();

  // Set up member search
  setupMemberSearch();
}

/**
 * Set up tab switching
 */
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');

      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });

      // Add active class to clicked tab
      this.classList.add('active');
      const contentEl = document.getElementById(tabName);
      if (contentEl) {
        contentEl.style.display = 'block';
      }

      // Load data for tab
      if (tabName === 'members') {
        loadMembers();
      } else if (tabName === 'history') {
        loadCampaignHistory();
      }
    });
  });
}

/**
 * Set up campaign form handlers
 */
function setupCampaignForm() {
  const messageInput = document.getElementById('campaignMessage');
  const charCount = document.getElementById('charCount');
  const campaignCost = document.getElementById('campaignCost');
  const recipientCount = document.getElementById('recipientCount');
  const sendBtn = document.getElementById('sendCampaignBtn');
  const clearBtn = document.getElementById('clearCampaignBtn');

  // Character count and cost calculation
  if (messageInput) {
    messageInput.addEventListener('input', function() {
      const length = this.value.length;
      charCount.textContent = length;

      // Update cost estimate
      updateCampaignCost();

      // Warn if over limit
      if (length > MAX_SMS_LENGTH) {
        charCount.style.color = '#e74c3c';
      } else {
        charCount.style.color = '#7f8c8d';
      }
    });
  }

  // Update recipient count when ANY filter changes
  const filterElements = [
    ...document.querySelectorAll('input[name="userType"]'),
    ...document.querySelectorAll('input[name="interests"]'),
    document.getElementById('inTownTiming')
  ].filter(el => el);

  filterElements.forEach(element => {
    element.addEventListener('change', updateCampaignCost);
  });

  // Initial load
  updateCampaignCost();

  // Send campaign
  if (sendBtn) {
    sendBtn.addEventListener('click', sendCampaign);
  }

  // Clear form
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCampaignForm);
  }
}

/**
 * Update campaign cost estimate
 */
async function updateCampaignCost() {
  const recipientCount = document.getElementById('recipientCount');
  const campaignCost = document.getElementById('campaignCost');

  if (!recipientCount) return;

  try {
    // Get selected filters
    const userTypes = Array.from(document.querySelectorAll('input[name="userType"]:checked'))
      .map(cb => cb.value);

    const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
      .map(cb => cb.value);

    const inTownTiming = document.getElementById('inTownTiming')?.value || 'anytime';

    let count = 0;

    // Use demo data if in demo mode
    if (isDemoMode && typeof getDemoAudienceCount !== 'undefined') {
      count = getDemoAudienceCount(userTypes, interests, inTownTiming);
    } else {
      // Build query params
      const params = new URLSearchParams({
        userTypes: userTypes.join(','),
        interests: interests.join(','),
        inTownTiming
      });

      // Get member count for selected filters
      const response = await fetch(`/api/sms-loyalty/${businessId}/audience-count?${params}`);
      const data = await response.json();
      count = data.count || 0;
    }

    recipientCount.textContent = count;

    // Calculate cost
    const cost = (count * SMS_COST_PER_MESSAGE).toFixed(2);
    campaignCost.textContent = cost;

  } catch (error) {
    console.error('Error updating campaign cost:', error);
    recipientCount.textContent = '0';
    campaignCost.textContent = '0.00';
  }
}

/**
 * Load SMS status data
 */
async function loadSMSStatus() {
  try {
    let data;

    // Use demo data if in demo mode
    if (isDemoMode && typeof DEMO_DATA !== 'undefined') {
      data = {
        smsNumber: DEMO_DATA.business.smsNumber,
        memberCount: DEMO_DATA.smsStats.membersCount,
        sentToday: DEMO_DATA.smsStats.sentToday,
        sentMonth: DEMO_DATA.smsStats.sentMonth,
        openRate: DEMO_DATA.smsStats.openRate
      };
    } else {
      const response = await fetch(`/api/sms-loyalty/${businessId}/status`);
      data = await response.json();
    }

    // Update SMS number
    const smsNumberDisplay = document.getElementById('smsNumberDisplay');
    if (smsNumberDisplay) {
      if (data.smsNumber) {
        smsNumberDisplay.textContent = formatPhoneNumber(data.smsNumber);
        smsNumberDisplay.style.color = '#27ae60';
      } else {
        smsNumberDisplay.textContent = 'Not assigned yet';
        smsNumberDisplay.style.color = '#e74c3c';
      }
    }

    // Update member count
    document.getElementById('smsMembersCount').textContent = data.memberCount || 0;

    // Update stats
    document.getElementById('smsSentToday').textContent = data.sentToday || 0;
    document.getElementById('smsSentMonth').textContent = data.sentMonth || 0;

    // Update open rate
    const openRate = data.openRate || 0;
    document.getElementById('smsOpenRate').textContent = openRate + '%';

    // Update recipient count for campaigns
    updateCampaignCost();

  } catch (error) {
    console.error('Error loading SMS status:', error);
  }
}

/**
 * Load loyalty members
 */
async function loadMembers() {
  const membersList = document.getElementById('membersList');
  if (!membersList) return;

  try {
    membersList.innerHTML = '<div style="text-align: center; padding: 20px; color: #7f8c8d;">Loading members...</div>';

    let members = [];

    // Use demo data if in demo mode
    if (isDemoMode && typeof DEMO_DATA !== 'undefined') {
      members = DEMO_DATA.vipMembers;
    } else {
      const response = await fetch(`/api/sms-loyalty/${businessId}/members`);
      members = await response.json();
    }

    if (!members || members.length === 0) {
      membersList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #7f8c8d;">
          No members yet. Share your SMS number with customers to get started!
        </div>
      `;
      return;
    }

    // Render members
    let html = '';
    members.forEach(member => {
      const userTypeEmoji = member.userType === 'tourist' ? '🏖️' : member.userType === 'snowbird' ? '❄️' : '🏠';
      const checkIn = new Date(member.checkInDate).toLocaleDateString();
      const checkOut = new Date(member.checkOutDate).toLocaleDateString();

      html += `
        <div class="member-item">
          <div class="member-info">
            <div class="member-phone">${formatPhoneNumber(member.phone)} ${userTypeEmoji}</div>
            <div class="member-meta">
              Joined: ${new Date(member.joinedAt).toLocaleDateString()} •
              In Town: ${checkIn} - ${checkOut} •
              Messages: ${member.messagesReceived || 0}
            </div>
          </div>
          ${!isDemoMode ? `<div class="member-actions"><button onclick="removeMember('${member.id}', '${member.phone}')">Remove</button></div>` : ''}
        </div>
      `;
    });

    membersList.innerHTML = html;

  } catch (error) {
    console.error('Error loading members:', error);
    membersList.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #e74c3c;">
        Error loading members. Please try again.
      </div>
    `;
  }
}

/**
 * Load campaign history
 */
async function loadCampaignHistory() {
  const campaignHistory = document.getElementById('campaignHistory');
  if (!campaignHistory) return;

  try {
    campaignHistory.innerHTML = '<div style="text-align: center; padding: 20px; color: #7f8c8d;">Loading campaigns...</div>';

    let campaigns = [];

    // Use demo data if in demo mode
    if (isDemoMode && typeof DEMO_DATA !== 'undefined') {
      campaigns = DEMO_DATA.campaigns;
    } else {
      const response = await fetch(`/api/sms-loyalty/${businessId}/campaigns`);
      campaigns = await response.json();
    }

    if (!campaigns || campaigns.length === 0) {
      campaignHistory.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #7f8c8d;">
          No campaigns sent yet
        </div>
      `;
      return;
    }

    // Render campaigns
    let html = '';
    campaigns.forEach(campaign => {
      const timeAgo = isDemoMode && typeof formatDemoDate !== 'undefined' ? formatDemoDate(campaign.sentAt) : new Date(campaign.sentAt).toLocaleString();

      html += `
        <div class="campaign-item">
          <div class="campaign-header">
            <div class="campaign-name">${campaign.name}</div>
            <div class="campaign-date">${timeAgo}</div>
          </div>
          <div class="campaign-message">${campaign.message}</div>
          <div class="campaign-stats">
            <span>📧 Sent: ${campaign.recipientCount}</span>
            <span>✅ Delivered: ${campaign.delivered || 0}</span>
            <span>👁️ Opened: ${campaign.opened || 0} (${campaign.openRate || 0}%)</span>
            <span>💵 Cost: $${campaign.cost ? campaign.cost.toFixed(2) : (campaign.recipientCount * SMS_COST_PER_MESSAGE).toFixed(2)}</span>
          </div>
        </div>
      `;
    });

    campaignHistory.innerHTML = html;

  } catch (error) {
    console.error('Error loading campaign history:', error);
    campaignHistory.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #e74c3c;">
        Error loading campaigns. Please try again.
      </div>
    `;
  }
}

/**
 * Send SMS campaign
 */
async function sendCampaign() {
  const nameInput = document.getElementById('campaignName');
  const messageInput = document.getElementById('campaignMessage');
  const sendBtn = document.getElementById('sendCampaignBtn');

  // Validate inputs
  if (!nameInput.value.trim()) {
    alert('Please enter a campaign name');
    nameInput.focus();
    return;
  }

  if (!messageInput.value.trim()) {
    alert('Please enter a message');
    messageInput.focus();
    return;
  }

  if (messageInput.value.length > MAX_SMS_LENGTH) {
    alert(`Message is too long. Maximum ${MAX_SMS_LENGTH} characters.`);
    messageInput.focus();
    return;
  }

  // Get filters
  const userTypes = Array.from(document.querySelectorAll('input[name="userType"]:checked'))
    .map(cb => cb.value);

  const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
    .map(cb => cb.value);

  const inTownTiming = document.getElementById('inTownTiming')?.value || 'anytime';

  if (userTypes.length === 0) {
    alert('Please select at least one visitor type');
    return;
  }

  if (interests.length === 0) {
    alert('Please select at least one interest category');
    return;
  }

  // Demo mode: Prevent actual sending
  if (isDemoMode) {
    alert('🎭 DEMO MODE\n\nThis is a demonstration dashboard. No messages will actually be sent.\n\nIn the real dashboard, this would send your campaign to the selected audience.');
    return;
  }

  // Confirm send
  const recipientCount = document.getElementById('recipientCount').textContent;
  const cost = document.getElementById('campaignCost').textContent;

  if (!confirm(`Send campaign to ${recipientCount} members?\n\nCost: $${cost}`)) {
    return;
  }

  // Disable button
  sendBtn.disabled = true;
  const originalText = sendBtn.textContent;
  sendBtn.innerHTML = '<span class="loading"></span> Sending...';

  try {
    const response = await fetch(`/api/sms-loyalty/${businessId}/send-campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        message: messageInput.value.trim(),
        filters: {
          userTypes,
          interests,
          inTownTiming
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send campaign');
    }

    const result = await response.json();

    // Show success message
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
      successMsg.textContent = `✅ Campaign sent to ${result.sent} members!`;
      successMsg.style.display = 'block';
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 5000);
    }

    // Clear form
    clearCampaignForm();

    // Reload data
    loadSMSStatus();
    loadCampaignHistory();

    // Switch to history tab
    document.querySelector('.tab-btn[data-tab="history"]')?.click();

  } catch (error) {
    console.error('Error sending campaign:', error);
    alert('Failed to send campaign. Please try again.');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = originalText;
  }
}

/**
 * Clear campaign form
 */
function clearCampaignForm() {
  document.getElementById('campaignName').value = '';
  document.getElementById('campaignMessage').value = '';
  document.getElementById('campaignAudience').value = 'all';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('campaignCost').textContent = '0.00';
}

/**
 * Set up member search
 */
function setupMemberSearch() {
  const searchInput = document.getElementById('memberSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const memberItems = document.querySelectorAll('.member-item');

    memberItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

/**
 * Remove a member from loyalty program
 */
async function removeMember(memberId, memberPhone) {
  if (!confirm(`Remove ${formatPhoneNumber(memberPhone)} from loyalty program?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/sms-loyalty/${businessId}/members/${memberId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to remove member');
    }

    // Reload members
    loadMembers();
    loadSMSStatus();

  } catch (error) {
    console.error('Error removing member:', error);
    alert('Failed to remove member. Please try again.');
  }
}

/**
 * Format phone number for display
 */
function formatPhoneNumber(phone) {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

// Make removeMember available globally
window.removeMember = removeMember;
