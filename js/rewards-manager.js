/**
 * Gulf Coast Radar - Rewards System
 *
 * Gamified points system for user engagement:
 * - Earn points for photos, reviews, check-ins, AR games, etc.
 * - Track via phone number (no account required)
 * - Redeem for prizes, gift cards, discounts
 * - Admin-configurable point values
 */

class RewardsManager {
  constructor() {
    this.storageKey = 'gcr_rewards';
    this.configKey = 'gcr_rewards_config';
    this.userPoints = this.loadUserPoints();
    this.config = this.loadConfig();

    console.log('🎁 Rewards Manager initialized');
  }

  // Load rewards configuration (point values set by admin)
  loadConfig() {
    try {
      const stored = localStorage.getItem(this.configKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading rewards config:', error);
    }

    // Default point values
    return {
      // Tier system for SMS promos (higher points = better deals)
      tiers: [
        {
          name: 'Bronze',
          minPoints: 0,
          icon: '🥉',
          color: '#cd7f32',
          smsFrequency: 'weekly',
          dealTypes: ['10% off', 'Happy Hour specials', 'Event invites'],
          description: 'Get weekly deals and event updates'
        },
        {
          name: 'Silver',
          minPoints: 500,
          icon: '🥈',
          color: '#c0c0c0',
          smsFrequency: 'twice weekly',
          dealTypes: ['15% off', 'Free appetizers', 'Early access to events'],
          description: 'Better deals, sent twice a week'
        },
        {
          name: 'Gold',
          minPoints: 1500,
          icon: '🥇',
          color: '#ffd700',
          smsFrequency: '3x weekly',
          dealTypes: ['20% off', 'Buy one get one', 'VIP event access'],
          description: 'Premium deals and VIP perks'
        },
        {
          name: 'Platinum',
          minPoints: 3000,
          icon: '💎',
          color: '#e5e4e2',
          smsFrequency: 'daily',
          dealTypes: ['25% off', 'Complimentary drinks', 'Private tastings'],
          description: 'Exclusive daily deals and experiences'
        },
        {
          name: 'Diamond',
          minPoints: 5000,
          icon: '💠',
          color: '#b9f2ff',
          smsFrequency: 'daily + exclusive',
          dealTypes: ['30% off', 'Free entrees', 'Chef table reservations', 'Concierge service'],
          description: 'Ultimate VIP treatment with personal concierge'
        }
      ],
      activities: {
        photo_submitted: 5,           // Photo submitted (before approval)
        photo_approved: 10,            // Photo approved by admin
        photo_verified: 15,            // GPS-verified photo approved
        review_submitted: 5,           // Text review submitted
        check_in: 3,                   // Check in at business
        ar_game_complete: 25,          // Complete AR treasure hunt
        referral: 20,                  // Refer a friend who signs up
        daily_login: 1,                // Daily login bonus
        streak_3_days: 5,              // 3-day login streak bonus
        streak_7_days: 15,             // 7-day login streak bonus
        share_business: 2,             // Share business profile
        favorite_business: 1,          // Favorite a business
        event_rsvp: 5,                 // RSVP to event
        loyalty_signup: 10             // Sign up for loyalty program
      },
      redemptions: [
        { id: 'gift_card_5', name: '$5 Gift Card', points: 100, description: 'Redeemable at participating restaurants' },
        { id: 'appetizer_free', name: 'Free Appetizer', points: 150, description: 'Any appetizer up to $12 value' },
        { id: 'gift_card_10', name: '$10 Gift Card', points: 200, description: 'Redeemable at participating restaurants' },
        { id: 'discount_20', name: '20% Off Entire Bill', points: 250, description: 'One-time use, max $50 discount' },
        { id: 'gift_card_25', name: '$25 Gift Card', points: 500, description: 'Redeemable at participating restaurants' },
        { id: 'sunset_cruise', name: 'Sunset Cruise Tickets', points: 750, description: '2 tickets for sunset dolphin cruise' },
        { id: 'vip_dinner', name: 'VIP Dining Experience', points: 1000, description: 'Chef\'s table for 2 at select restaurants' },
        { id: 'season_pass', name: 'Gulf Coast Season Pass', points: 2000, description: 'Access to all premium features for 1 year' }
      ],
      enabled: true,
      minPointsToRedeem: 100
    };
  }

  // Save configuration
  saveConfig() {
    try {
      localStorage.setItem(this.configKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving rewards config:', error);
    }
  }

  // Update point value for an activity (admin only)
  updateActivityPoints(activity, points) {
    this.config.activities[activity] = points;
    this.saveConfig();
    console.log(`Updated ${activity} to ${points} points`);
  }

  // Add new redemption option (admin only)
  addRedemptionOption(option) {
    this.config.redemptions.push(option);
    this.saveConfig();
  }

  // Load user points data
  loadUserPoints() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading user points:', error);
      return {};
    }
  }

  // Save user points data
  saveUserPoints() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userPoints));
    } catch (error) {
      console.error('Error saving user points:', error);
    }
  }

  // Get user by phone number
  getUser(phoneNumber) {
    const normalized = this.normalizePhone(phoneNumber);

    if (!this.userPoints[normalized]) {
      this.userPoints[normalized] = {
        phone: phoneNumber,
        points: 0,
        lifetimePoints: 0,
        activities: [],
        redemptions: [],
        streaks: {
          current: 0,
          best: 0,
          lastLogin: null
        },
        joinedAt: new Date().toISOString()
      };
      this.saveUserPoints();
    }

    return this.userPoints[normalized];
  }

  // Normalize phone number (remove formatting)
  normalizePhone(phone) {
    return phone.replace(/\D/g, '');
  }

  // Award points to user
  awardPoints(phoneNumber, activity, metadata = {}) {
    if (!this.config.enabled) return false;

    const user = this.getUser(phoneNumber);
    const points = this.config.activities[activity] || 0;

    if (points === 0) {
      console.warn(`No points defined for activity: ${activity}`);
      return false;
    }

    // Add points
    user.points += points;
    user.lifetimePoints += points;

    // Log activity
    user.activities.push({
      activity,
      points,
      metadata,
      timestamp: new Date().toISOString()
    });

    this.saveUserPoints();

    // Track in Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'points_earned', {
        activity: activity,
        points: points,
        user_phone: phoneNumber,
        event_category: 'Rewards',
        event_label: 'Points Earned'
      });
    }

    console.log(`🎁 Awarded ${points} points to ${phoneNumber} for ${activity}`);

    // Show notification to user
    this.showPointsNotification(points, activity);

    return true;
  }

  // Check daily login and update streak
  checkDailyLogin(phoneNumber) {
    const user = this.getUser(phoneNumber);
    const today = new Date().toDateString();
    const lastLogin = user.streaks.lastLogin ? new Date(user.streaks.lastLogin).toDateString() : null;

    if (lastLogin === today) {
      // Already logged in today
      return false;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastLogin === yesterdayStr) {
      // Continuing streak
      user.streaks.current++;
    } else if (lastLogin !== null) {
      // Streak broken
      user.streaks.current = 1;
    } else {
      // First login
      user.streaks.current = 1;
    }

    // Update best streak
    if (user.streaks.current > user.streaks.best) {
      user.streaks.best = user.streaks.current;
    }

    user.streaks.lastLogin = new Date().toISOString();
    this.saveUserPoints();

    // Award daily login points
    this.awardPoints(phoneNumber, 'daily_login', { streak: user.streaks.current });

    // Streak bonuses
    if (user.streaks.current === 3) {
      this.awardPoints(phoneNumber, 'streak_3_days', { streak: 3 });
    } else if (user.streaks.current === 7) {
      this.awardPoints(phoneNumber, 'streak_7_days', { streak: 7 });
    }

    return true;
  }

  // Get user's point balance
  getBalance(phoneNumber) {
    const user = this.getUser(phoneNumber);
    return user.points;
  }

  // Get user's lifetime points
  getLifetimePoints(phoneNumber) {
    const user = this.getUser(phoneNumber);
    return user.lifetimePoints;
  }

  // Get user's tier based on lifetime points
  getUserTier(phoneNumber) {
    const user = this.getUser(phoneNumber);
    const tiers = this.config.tiers;

    // Find highest tier user qualifies for
    let currentTier = tiers[0];
    for (const tier of tiers) {
      if (user.lifetimePoints >= tier.minPoints) {
        currentTier = tier;
      }
    }

    // Find next tier
    const currentIndex = tiers.indexOf(currentTier);
    const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
    const pointsToNext = nextTier ? nextTier.minPoints - user.lifetimePoints : 0;
    const progressPercent = nextTier ?
      ((user.lifetimePoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

    return {
      current: currentTier,
      next: nextTier,
      pointsToNext: Math.max(0, pointsToNext),
      progressPercent: Math.min(100, Math.max(0, progressPercent))
    };
  }

  // Get user's activity history
  getActivityHistory(phoneNumber, limit = 20) {
    const user = this.getUser(phoneNumber);
    return user.activities.slice(-limit).reverse();
  }

  // Redeem points for reward
  redeemPoints(phoneNumber, rewardId) {
    const user = this.getUser(phoneNumber);
    const reward = this.config.redemptions.find(r => r.id === rewardId);

    if (!reward) {
      return { success: false, error: 'Reward not found' };
    }

    if (user.points < reward.points) {
      return { success: false, error: 'Insufficient points' };
    }

    // Deduct points
    user.points -= reward.points;

    // Log redemption
    const redemption = {
      rewardId: reward.id,
      rewardName: reward.name,
      pointsSpent: reward.points,
      timestamp: new Date().toISOString(),
      code: this.generateRedemptionCode()
    };

    user.redemptions.push(redemption);
    this.saveUserPoints();

    // Track in Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'points_redeemed', {
        reward_id: rewardId,
        reward_name: reward.name,
        points_spent: reward.points,
        user_phone: phoneNumber,
        event_category: 'Rewards',
        event_label: 'Points Redeemed'
      });
    }

    console.log(`🎉 ${phoneNumber} redeemed ${reward.name} for ${reward.points} points`);

    return { success: true, redemption, newBalance: user.points };
  }

  // Generate unique redemption code
  generateRedemptionCode() {
    return 'GCR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  // Get available redemptions for user
  getAvailableRedemptions(phoneNumber) {
    const user = this.getUser(phoneNumber);
    return this.config.redemptions.map(reward => ({
      ...reward,
      canAfford: user.points >= reward.points,
      pointsNeeded: Math.max(0, reward.points - user.points)
    }));
  }

  // Get leaderboard (top users by lifetime points)
  getLeaderboard(limit = 10) {
    const users = Object.values(this.userPoints);
    return users
      .sort((a, b) => b.lifetimePoints - a.lifetimePoints)
      .slice(0, limit)
      .map((user, index) => ({
        rank: index + 1,
        phone: user.phone.slice(-4), // Last 4 digits only for privacy
        points: user.lifetimePoints,
        streak: user.streaks.best
      }));
  }

  // Show points notification
  showPointsNotification(points, activity) {
    const notification = document.createElement('div');
    notification.className = 'points-notification';
    notification.innerHTML = `
      <div class="points-notification-content">
        <div class="points-notification-icon">🎁</div>
        <div class="points-notification-text">
          <strong>+${points} points!</strong>
          <span>${this.getActivityDisplayName(activity)}</span>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Get friendly display name for activity
  getActivityDisplayName(activity) {
    const names = {
      photo_submitted: 'Photo submitted',
      photo_approved: 'Photo approved',
      photo_verified: 'Verified photo',
      review_submitted: 'Review posted',
      check_in: 'Check-in',
      ar_game_complete: 'AR game completed',
      referral: 'Friend referred',
      daily_login: 'Daily login',
      streak_3_days: '3-day streak!',
      streak_7_days: '7-day streak!',
      share_business: 'Business shared',
      favorite_business: 'Business favorited',
      event_rsvp: 'Event RSVP',
      loyalty_signup: 'Loyalty signup'
    };
    return names[activity] || activity;
  }

  // Export user data (for user to download)
  exportUserData(phoneNumber) {
    const user = this.getUser(phoneNumber);
    return {
      phone: user.phone,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      joinedAt: user.joinedAt,
      activities: user.activities,
      redemptions: user.redemptions,
      streaks: user.streaks
    };
  }
}

// Initialize global rewards manager
window.rewardsManager = new RewardsManager();

// Hook into existing photo approval system
if (typeof PhotoReviewManager !== 'undefined') {
  const originalApprovePhoto = PhotoReviewManager.prototype.approvePhoto;
  PhotoReviewManager.prototype.approvePhoto = function(photoId, adminName = 'Admin') {
    const result = originalApprovePhoto.call(this, photoId, adminName);

    if (result) {
      // Award points to user who submitted the photo
      const photo = this.photos.find(p => p.id === photoId);
      if (photo && photo.userName) {
        // Check if user has phone number in loyalty system
        const userPhone = window.rewardsManager.getUserPhoneByName(photo.userName);
        if (userPhone) {
          const points = photo.verified ? 'photo_verified' : 'photo_approved';
          window.rewardsManager.awardPoints(userPhone, points, {
            photoId: photo.id,
            businessId: photo.businessId
          });
        }
      }
    }

    return result;
  };
}

// Helper: Get phone number from localStorage loyalty signups
window.rewardsManager.getUserPhoneByName = function(userName) {
  // This would need to integrate with your loyalty signup system
  // For now, return null - admin can manually award points
  return null;
};
