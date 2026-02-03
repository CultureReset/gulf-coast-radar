/**
 * Demo Data for Sales Demonstrations
 * Used when business-dashboard.html is loaded with ?demo=true
 */

const DEMO_DATA = {

  // Business Information
  business: {
    id: 'demo-restaurant-123',
    name: 'The Coastal Grill',
    slug: 'the-coastal-grill',
    tier: 'premium',
    smsNumber: '+1 251-555-0123',
    address: '123 Beach Blvd, Gulf Shores, AL 36542',
    phone: '(251) 555-0123',
    email: 'info@coastalgrill.com'
  },

  // SMS Statistics
  smsStats: {
    membersCount: 847,
    sentToday: 12,
    sentMonth: 234,
    openRate: 68,
    totalMembers: 847,
    activeCampaigns: 3,
    avgOpenRate: 68
  },

  // VIP Members
  vipMembers: [
    {
      id: '1',
      phone: '+1 555-123-4567',
      userType: 'tourist',
      checkInDate: '2025-11-20',
      checkOutDate: '2025-11-27',
      interests: ['restaurant_deals', 'happy_hours', 'live_music'],
      joinedAt: '2025-11-15',
      messagesReceived: 3,
      lastMessageReceived: '2025-11-22',
      status: 'active'
    },
    {
      id: '2',
      phone: '+1 555-234-5678',
      userType: 'snowbird',
      checkInDate: '2025-11-01',
      checkOutDate: '2026-03-31',
      interests: ['restaurant_deals', 'activities'],
      joinedAt: '2025-10-28',
      messagesReceived: 8,
      lastMessageReceived: '2025-11-21',
      status: 'active'
    },
    {
      id: '3',
      phone: '+1 555-345-6789',
      userType: 'tourist',
      checkInDate: '2025-11-19',
      checkOutDate: '2025-11-23',
      interests: ['restaurant_deals', 'happy_hours'],
      joinedAt: '2025-11-10',
      messagesReceived: 2,
      lastMessageReceived: '2025-11-22',
      status: 'active'
    },
    {
      id: '4',
      phone: '+1 555-456-7890',
      userType: 'local',
      checkInDate: '2025-01-01',
      checkOutDate: '2025-12-31',
      interests: ['happy_hours', 'live_music'],
      joinedAt: '2025-06-15',
      messagesReceived: 15,
      lastMessageReceived: '2025-11-20',
      status: 'active'
    },
    {
      id: '5',
      phone: '+1 555-567-8901',
      userType: 'tourist',
      checkInDate: '2025-11-21',
      checkOutDate: '2025-11-28',
      interests: ['restaurant_deals', 'activities', 'live_music'],
      joinedAt: '2025-11-18',
      messagesReceived: 1,
      lastMessageReceived: '2025-11-21',
      status: 'active'
    },
    {
      id: '6',
      phone: '+1 555-678-9012',
      userType: 'snowbird',
      checkInDate: '2025-10-15',
      checkOutDate: '2026-04-15',
      interests: ['restaurant_deals', 'happy_hours', 'activities'],
      joinedAt: '2025-10-10',
      messagesReceived: 12,
      lastMessageReceived: '2025-11-22',
      status: 'active'
    }
  ],

  // SMS Campaigns
  campaigns: [
    {
      id: 'camp-1',
      name: 'Weekend Happy Hour Special',
      message: '🍹 Happy Hour Alert! 50% off all drinks & appetizers this Saturday 4-7pm. Show this text at the bar!',
      filters: {
        userTypes: ['tourist', 'snowbird'],
        interests: ['happy_hours', 'restaurant_deals'],
        inTownTiming: 'this_week'
      },
      recipientCount: 142,
      delivered: 142,
      opened: 98,
      openRate: 69,
      cost: 2.84,
      sentAt: '2025-11-22T10:30:00Z',
      status: 'completed'
    },
    {
      id: 'camp-2',
      name: 'Thanksgiving Week Special',
      message: '🦃 Thanksgiving Week Special! Reserve your table now. Call (251) 555-0123 or book at coastalgrill.com',
      filters: {
        userTypes: ['tourist', 'snowbird', 'local'],
        interests: ['restaurant_deals'],
        inTownTiming: 'this_week'
      },
      recipientCount: 286,
      delivered: 286,
      opened: 189,
      openRate: 66,
      cost: 5.72,
      sentAt: '2025-11-20T14:15:00Z',
      status: 'completed'
    },
    {
      id: 'camp-3',
      name: 'Live Music Tonight',
      message: '🎵 Live music tonight at 7pm! Local favorite Jimmy Davis plays acoustic beach vibes. No cover!',
      filters: {
        userTypes: ['tourist', 'local'],
        interests: ['live_music'],
        inTownTiming: 'now'
      },
      recipientCount: 67,
      delivered: 67,
      opened: 48,
      openRate: 72,
      cost: 1.34,
      sentAt: '2025-11-21T16:00:00Z',
      status: 'completed'
    },
    {
      id: 'camp-4',
      name: 'Sunday Brunch Launch',
      message: '🥞 NEW! Sunday Brunch starting this week. Bottomless mimosas $15. Reservations recommended!',
      filters: {
        userTypes: ['tourist', 'snowbird'],
        interests: ['restaurant_deals'],
        inTownTiming: 'this_week'
      },
      recipientCount: 198,
      delivered: 198,
      opened: 128,
      openRate: 65,
      cost: 3.96,
      sentAt: '2025-11-19T09:00:00Z',
      status: 'completed'
    },
    {
      id: 'camp-5',
      name: 'Oyster Monday Deal',
      message: '🦪 Oyster Monday! $5 dozen raw oysters ALL DAY. Only at The Coastal Grill. Reply STOP to opt out.',
      filters: {
        userTypes: ['tourist', 'snowbird', 'local'],
        interests: ['restaurant_deals', 'happy_hours'],
        inTownTiming: 'now'
      },
      recipientCount: 312,
      delivered: 310,
      opened: 203,
      openRate: 65,
      cost: 6.24,
      sentAt: '2025-11-18T08:30:00Z',
      status: 'completed'
    }
  ],

  // Daily Special
  dailySpecial: {
    title: 'Blackened Mahi Mahi',
    description: 'Fresh Gulf Mahi Mahi blackened to perfection, served with garlic mashed potatoes, seasonal vegetables, and lemon butter sauce.',
    price: '$24.99',
    available: true,
    updatedAt: '2025-11-22T08:00:00Z'
  },

  // Social Media Connections
  socialConnections: {
    instagram: {
      connected: true,
      username: '@thecoastalgrill',
      followers: 3842,
      posts: 287,
      lastSync: '2025-11-22T11:00:00Z'
    },
    facebook: {
      connected: true,
      pageName: 'The Coastal Grill',
      likes: 5129,
      lastSync: '2025-11-22T11:00:00Z'
    }
  },

  // Recent Social Posts
  socialPosts: [
    {
      id: 'post-1',
      platform: 'instagram',
      caption: '🌅 Sunset dinner views never get old! Join us tonight for fresh seafood and breathtaking Gulf views. #GulfShores #SunsetDinner #FreshSeafood',
      mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=600&fit=crop',
      likes: 284,
      comments: 23,
      publishedAt: '2025-11-21T18:30:00Z'
    },
    {
      id: 'post-2',
      platform: 'instagram',
      caption: '🦪 Oyster Monday is BACK! $5 dozen raw oysters all day long. Tag your oyster buddy! 👇',
      mediaUrl: 'https://images.unsplash.com/photo-1567552885334-2da78292d7ea?w=600&h=600&fit=crop',
      likes: 421,
      comments: 38,
      publishedAt: '2025-11-20T09:15:00Z'
    },
    {
      id: 'post-3',
      platform: 'facebook',
      caption: '🎵 Live music alert! Jimmy Davis performs tonight at 7pm. No cover charge. Come early for happy hour specials!',
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop',
      likes: 156,
      comments: 12,
      publishedAt: '2025-11-21T15:00:00Z'
    }
  ],

  // Menu Analytics
  menuAnalytics: {
    totalViews: 1247,
    avgTimeOnMenu: '3m 42s',
    topItems: [
      { name: 'Gulf Shrimp Po-Boy', clicks: 342, percentage: 85 },
      { name: 'Blackened Mahi Mahi', clicks: 298, percentage: 74 },
      { name: 'Oysters Rockefeller', clicks: 267, percentage: 66 },
      { name: 'Crab Cakes', clicks: 234, percentage: 58 },
      { name: 'Fish Tacos', clicks: 189, percentage: 47 }
    ],
    topQuestions: [
      'Do you have gluten-free options?',
      'What time does happy hour start?',
      'Can I make a reservation?',
      'Do you have outdoor seating?',
      'What are your most popular dishes?'
    ],
    aiInsights: 'Customers frequently ask about gluten-free options and happy hour times. Consider adding this info prominently to your menu. The Gulf Shrimp Po-Boy is your most clicked item - consider featuring it as a signature dish.'
  },

  // Audience Count for Filters (used for campaign preview)
  audienceCounts: {
    'tourist': 487,
    'snowbird': 234,
    'local': 126,
    'tourist,snowbird': 721,
    'tourist,local': 613,
    'snowbird,local': 360,
    'tourist,snowbird,local': 847
  }
};

// Helper function to format dates
function formatDemoDate(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

// Helper function to format phone numbers
function formatDemoPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// Helper function to calculate audience count based on filters
function getDemoAudienceCount(userTypes, interests, inTownTiming) {
  // Base count on user types
  let baseCount = 0;

  if (userTypes.includes('tourist')) baseCount += 487;
  if (userTypes.includes('snowbird')) baseCount += 234;
  if (userTypes.includes('local')) baseCount += 126;

  // Remove overlap (people who match multiple types)
  if (userTypes.length > 1) {
    baseCount = Math.floor(baseCount * 0.85);
  }

  // Apply interest filter (roughly 60% match any given interest)
  if (interests.length > 0) {
    baseCount = Math.floor(baseCount * 0.6);
  }

  // Apply timing filter
  switch (inTownTiming) {
    case 'now':
      baseCount = Math.floor(baseCount * 0.3); // 30% in town right now
      break;
    case 'this_week':
      baseCount = Math.floor(baseCount * 0.5); // 50% in town this week
      break;
    case 'next_week':
      baseCount = Math.floor(baseCount * 0.35); // 35% in town next week
      break;
    case 'this_month':
      baseCount = Math.floor(baseCount * 0.75); // 75% in town this month
      break;
    case 'anytime':
      // No reduction
      break;
  }

  return Math.max(1, baseCount); // Always return at least 1
}

// Export for use in business dashboard
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEMO_DATA, formatDemoDate, formatDemoPhone, getDemoAudienceCount };
}
