// Sample AR Hunt Data for Testing
// This file populates the AR hunt system with example hunts

(function() {
  // Check if we already have hunts
  const existingHunts = localStorage.getItem('gcr_ar_hunts');

  if (!existingHunts || JSON.parse(existingHunts).length === 0) {
    console.log('🎯 Loading sample AR hunts...');

    const sampleHunts = [
      {
        id: 'hunt-hangout-001',
        businessId: 'the-hangout',
        brandName: 'The Hangout',
        brandImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
        description: 'Find The Hangout sign near the beach!',
        location: {
          lat: 30.2472,
          lng: -87.6348,
          address: '101 E Beach Blvd, Gulf Shores, AL',
          hint: 'Look for the iconic beach bar near the public beach'
        },
        reward: {
          type: 'discount',
          value: 15,
          description: '15% off your meal',
          code: 'RADAR15'
        },
        difficulty: 'easy',
        pointsValue: 100,
        captureRadius: 100, // meters
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      },
      {
        id: 'hunt-gulf-002',
        businessId: 'the-gulf',
        brandName: 'The Gulf Restaurant',
        brandImage: 'https://thegulf.com/wp-content/uploads/revslider/Orange%20Beach/Location-Gulf-OB-1.jpg.webp',
        description: 'Capture The Gulf\'s stunning sunset view!',
        location: {
          lat: 30.2765,
          lng: -87.5577,
          address: '27500 Perdido Beach Blvd, Orange Beach, AL',
          hint: 'Upscale waterfront dining with Gulf views'
        },
        reward: {
          type: 'freeItem',
          value: 1,
          description: 'Free appetizer with 2 entrees',
          code: 'GULFRADAR'
        },
        difficulty: 'medium',
        pointsValue: 250,
        captureRadius: 100,
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'hunt-cobalt-003',
        businessId: 'cobalt',
        brandName: 'Cobalt Restaurant',
        brandImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
        description: 'Find Cobalt\'s signature blue sign!',
        location: {
          lat: 30.2755,
          lng: -87.5985,
          address: '27267 Perdido Beach Blvd, Orange Beach, AL',
          hint: 'Modern Gulf Coast cuisine with a blue theme'
        },
        reward: {
          type: 'discount',
          value: 20,
          description: '20% off Sunday brunch',
          code: 'COBALTRADAR'
        },
        difficulty: 'easy',
        pointsValue: 150,
        captureRadius: 100,
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'hunt-lulus-004',
        businessId: 'lulus',
        brandName: 'LuLu\'s Gulf Shores',
        brandImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200&h=200&fit=crop',
        description: 'Spot LuLu\'s iconic parrot!',
        location: {
          lat: 30.2460,
          lng: -87.6810,
          address: '200 E 25th Ave, Gulf Shores, AL',
          hint: 'Jimmy Buffett\'s sister\'s famous restaurant'
        },
        reward: {
          type: 'freeItem',
          value: 1,
          description: 'Free dessert with entree',
          code: 'LULUSRADAR'
        },
        difficulty: 'medium',
        pointsValue: 200,
        captureRadius: 100,
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'hunt-pink-pony-005',
        businessId: 'pink-pony',
        brandName: 'Pink Pony Pub',
        brandImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop',
        description: 'Find the famous Pink Pony sign!',
        location: {
          lat: 30.2475,
          lng: -87.6330,
          address: '137 E Gulf Pl, Gulf Shores, AL',
          hint: 'Historic beachfront bar since 1956'
        },
        reward: {
          type: 'discount',
          value: 10,
          description: '$10 off your bill',
          code: 'PONYRADAR'
        },
        difficulty: 'easy',
        pointsValue: 100,
        captureRadius: 100,
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'hunt-wharf-006',
        businessId: 'the-wharf',
        brandName: 'The Wharf',
        brandImage: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200&h=200&fit=crop',
        description: 'Capture The Wharf\'s iconic Ferris wheel!',
        location: {
          lat: 30.2938,
          lng: -87.6106,
          address: '4851 Wharf Pkwy E, Orange Beach, AL',
          hint: 'Entertainment district with Ferris wheel'
        },
        reward: {
          type: 'points',
          value: 500,
          description: '500 bonus points',
          code: 'WHARFRADAR'
        },
        difficulty: 'hard',
        pointsValue: 500,
        captureRadius: 150,
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Save to localStorage
    localStorage.setItem('gcr_ar_hunts', JSON.stringify(sampleHunts));
    console.log(`✅ Loaded ${sampleHunts.length} sample AR hunts!`);
    console.log('Hunts:', sampleHunts.map(h => h.brandName).join(', '));
  } else {
    console.log('ℹ️ AR hunts already exist in localStorage');
  }
})();
