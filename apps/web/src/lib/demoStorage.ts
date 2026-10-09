/**
 * FoodBridge AI - Local Browser Storage Demo Engine
 * 
 * When a user logs in with a Demo Account (1-Click Evaluator or @foodbridge.ai),
 * all operations and state (donations, demands, pickups, deliveries, notifications,
 * AI forecasts, analytics, and admin records) run 100% inside browser localStorage.
 * 
 * Main / Real registered accounts persist directly to MongoDB.
 */

export interface DemoDonation {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  quantityUnit: string;
  estimatedMeals: number;
  vegType: string;
  allergens: string[];
  preparationTime: string;
  availableFrom: string;
  consumeBefore: string;
  packagingStatus: string;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  specialInstructions?: string;
  status: string; // AVAILABLE, MATCHED, ACCEPTED, PICKUP_ASSIGNED, PICKED_UP, DELIVERED
  createdAt: string;
  donorOrg?: {
    name: string;
    city: string;
    type: string;
  };
  matches?: any[];
}

export interface DemoDemand {
  id: string;
  foodCategory: string;
  requestedQuantity: number;
  requestedUnit: string;
  urgency: string;
  requiredBefore: string;
  status: string;
  createdAt: string;
  ngoOrg?: {
    name: string;
    city: string;
  };
}

export interface DemoPickup {
  id: string;
  donationId: string;
  donation: DemoDonation;
  volunteerId?: string;
  status: string; // ASSIGNED, ON_WAY_TO_PICKUP, PICKED_UP, DELIVERED
  pickupNotes?: string;
  createdAt: string;
  delivery?: {
    id: string;
    destinationAddress: string;
    status: string;
    deliveredQuantity?: number;
    receiverName?: string;
    proofImageUrl?: string;
  };
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const DEMO_USERS = {
  donor: {
    id: 'demo-donor-user-1',
    name: 'Delhi Spice Kitchen (Demo)',
    email: 'donor@foodbridge.ai',
    phone: '+91 98110 00001',
    role: 'DONOR' as const,
    isVerified: true,
    organizationId: 'demo-org-donor-1',
    organization: {
      id: 'demo-org-donor-1',
      name: 'Delhi Spice Kitchen',
      type: 'RESTAURANT',
      city: 'Delhi',
      address: 'Connaught Place, Central Delhi'
    }
  },
  ngo: {
    id: 'demo-ngo-user-1',
    name: 'Robin Hood Army Hub (Demo)',
    email: 'ngo@foodbridge.ai',
    phone: '+91 98110 00002',
    role: 'NGO' as const,
    isVerified: true,
    organizationId: 'demo-org-ngo-1',
    organization: {
      id: 'demo-org-ngo-1',
      name: 'Robin Hood Army Hub',
      type: 'COMMUNITY_KITCHEN',
      city: 'Delhi',
      address: 'Kashmere Gate, North Delhi'
    }
  },
  volunteer: {
    id: 'demo-volunteer-user-1',
    name: 'Aarav Sharma (Demo Volunteer)',
    email: 'volunteer@foodbridge.ai',
    phone: '+91 98110 00005',
    role: 'VOLUNTEER' as const,
    isVerified: true
  },
  admin: {
    id: 'demo-admin-user-1',
    name: 'FoodBridge Platform Admin',
    email: 'admin@foodbridge.ai',
    phone: '+91 98110 00000',
    role: 'ADMIN' as const,
    isVerified: true
  }
};

const STORAGE_KEYS = {
  DONATIONS: 'foodbridge_demo_donations',
  DEMANDS: 'foodbridge_demo_demands',
  PICKUPS: 'foodbridge_demo_pickups',
  NOTIFICATIONS: 'foodbridge_demo_notifications',
  IMPACT: 'foodbridge_demo_impact',
  ORGS: 'foodbridge_demo_orgs',
  USERS: 'foodbridge_demo_users',
  AUDIT: 'foodbridge_demo_audit',
  INITIALIZED: 'foodbridge_demo_initialized_v2'
};

export const demoStorage = {
  isDemoActive(): boolean {
    if (typeof window === 'undefined') return false;
    const isDemo = localStorage.getItem('foodbridge_is_demo');
    if (isDemo === 'true') return true;

    try {
      const userStr = localStorage.getItem('foodbridge_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email?.toLowerCase().endsWith('@foodbridge.ai');
      }
    } catch {
      return false;
    }
    return false;
  },

  setDemoActive(active: boolean) {
    if (typeof window === 'undefined') return;
    if (active) {
      localStorage.setItem('foodbridge_is_demo', 'true');
      this.ensureInitialized();
    } else {
      localStorage.removeItem('foodbridge_is_demo');
    }
  },

  ensureInitialized() {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) return;

    // Realistic baseline donations for Delhi NCR
    const initialDonations: DemoDonation[] = [
      {
        id: 'demo-don-101',
        foodName: 'Dinner Buffet Biryani & Dal Makhani',
        category: 'COOKED_MEALS',
        quantity: 40,
        quantityUnit: 'KG',
        estimatedMeals: 100,
        vegType: 'VEGETARIAN',
        allergens: ['Dairy / Milk'],
        preparationTime: new Date(Date.now() - 2 * 3600000).toISOString(),
        availableFrom: new Date(Date.now() - 30 * 60000).toISOString(),
        consumeBefore: new Date(Date.now() + 4 * 3600000).toISOString(),
        packagingStatus: 'SEALED_CONTAINERS',
        pickupAddress: 'Connaught Place, Central Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
        specialInstructions: 'Packed in 4 insulated thermal boxes. Keep level.',
        status: 'AVAILABLE',
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        donorOrg: {
          name: 'Delhi Spice Kitchen (Demo)',
          city: 'Delhi',
          type: 'RESTAURANT'
        },
        matches: [
          {
            id: 'match-101-a',
            donationId: 'demo-don-101',
            ngoOrgId: 'demo-org-ngo-1',
            ngoOrg: {
              name: 'Robin Hood Army Hub (Demo)',
              type: 'COMMUNITY_KITCHEN',
              address: 'Kashmere Gate, North Delhi',
              city: 'Delhi',
              phone: '+91 98110 00002'
            },
            score: 96.2,
            distanceKm: 2.4,
            recommendationReason: '2.4 km away • Immediate capacity for 120 people • High vegetarian preference'
          },
          {
            id: 'match-101-b',
            donationId: 'demo-don-101',
            ngoOrgId: 'demo-org-ngo-2',
            ngoOrg: {
              name: 'Asha Kiran Children Home',
              type: 'ORPHANAGE',
              address: 'Civil Lines, Delhi',
              city: 'Delhi',
              phone: '+91 98110 00003'
            },
            score: 88.5,
            distanceKm: 4.8,
            recommendationReason: '4.8 km away • Active dinner requirement for 80 children'
          }
        ]
      },
      {
        id: 'demo-don-102',
        foodName: 'Artisan Bread Rolls & Pastries',
        category: 'BAKERY',
        quantity: 25,
        quantityUnit: 'KG',
        estimatedMeals: 100,
        vegType: 'VEGETARIAN',
        allergens: ['Gluten / Wheat'],
        preparationTime: new Date(Date.now() - 4 * 3600000).toISOString(),
        availableFrom: new Date(Date.now() - 1 * 3600000).toISOString(),
        consumeBefore: new Date(Date.now() + 18 * 3600000).toISOString(),
        packagingStatus: 'INDIVIDUAL_PACKS',
        pickupAddress: 'Khan Market, New Delhi',
        latitude: 28.6003,
        longitude: 77.2272,
        specialInstructions: 'Individual food-grade packets ready for hand distribution.',
        status: 'MATCHED',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        donorOrg: {
          name: 'The French Crust Bakery',
          city: 'Delhi',
          type: 'BAKERY'
        },
        matches: [
          {
            id: 'match-102-a',
            donationId: 'demo-don-102',
            ngoOrgId: 'demo-org-ngo-1',
            ngoOrg: {
              name: 'Robin Hood Army Hub (Demo)',
              type: 'COMMUNITY_KITCHEN',
              address: 'Kashmere Gate, North Delhi',
              city: 'Delhi',
              phone: '+91 98110 00002'
            },
            score: 91.8,
            distanceKm: 3.5,
            recommendationReason: 'Long shelf life (18h) • Highly suitable for morning breakfast distribution'
          }
        ]
      },
      {
        id: 'demo-don-103',
        foodName: 'Farm Fresh Organic Spinach & Tomatoes',
        category: 'RAW_PRODUCE',
        quantity: 35,
        quantityUnit: 'KG',
        estimatedMeals: 105,
        vegType: 'VEGAN',
        allergens: [],
        preparationTime: new Date(Date.now() - 6 * 3600000).toISOString(),
        availableFrom: new Date(Date.now() - 3 * 3600000).toISOString(),
        consumeBefore: new Date(Date.now() + 36 * 3600000).toISOString(),
        packagingStatus: 'BULK_TRAYS',
        pickupAddress: 'Azadpur Wholesale Mandi, Delhi',
        latitude: 28.7166,
        longitude: 77.1738,
        specialInstructions: 'Crates available for return on next pickup.',
        status: 'ACCEPTED',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        donorOrg: {
          name: 'GreenField AgriHub',
          city: 'Delhi',
          type: 'PRODUCE_MARKET'
        }
      }
    ];

    // Initial Demands
    const initialDemands: DemoDemand[] = [
      {
        id: 'demo-dem-201',
        foodCategory: 'COOKED_MEALS',
        requestedQuantity: 60,
        requestedUnit: 'KG',
        urgency: 'HIGH',
        requiredBefore: new Date(Date.now() + 5 * 3600000).toISOString(),
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
        ngoOrg: {
          name: 'Robin Hood Army Hub (Demo)',
          city: 'Delhi'
        }
      },
      {
        id: 'demo-dem-202',
        foodCategory: 'RAW_PRODUCE',
        requestedQuantity: 40,
        requestedUnit: 'KG',
        urgency: 'MEDIUM',
        requiredBefore: new Date(Date.now() + 24 * 3600000).toISOString(),
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        ngoOrg: {
          name: 'Delhi Night Shelter Collective',
          city: 'Delhi'
        }
      }
    ];

    // Initial Pickups for volunteer dispatch
    const initialPickups: DemoPickup[] = [
      {
        id: 'demo-pk-301',
        donationId: 'demo-don-103',
        donation: initialDonations[2],
        volunteerId: 'demo-volunteer-user-1',
        status: 'ASSIGNED',
        pickupNotes: 'Contact supervisor Ramesh at gate 4.',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        delivery: {
          id: 'demo-del-401',
          destinationAddress: 'Robin Hood Community Kitchen, Kashmere Gate',
          status: 'ON_WAY_TO_DESTINATION',
          deliveredQuantity: 35,
          receiverName: 'Sunil Verma (Kitchen In-Charge)'
        }
      }
    ];

    // Initial Notifications
    const initialNotifications: DemoNotification[] = [
      {
        id: 'demo-notif-1',
        title: 'Welcome to FoodBridge AI Demo',
        message: 'You are using a browser-isolated demo persona. Any data you create is stored locally in your browser and will not alter production MongoDB.',
        type: 'SYSTEM',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-notif-2',
        title: 'New AI Match: Dinner Buffet Biryani',
        message: 'A 96.2% compatibility match was detected with Robin Hood Army Hub (2.4 km away).',
        type: 'DONATION_MATCHED',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60000).toISOString()
      }
    ];

    // Initial Impact
    const initialImpact = {
      foodRescuedKg: 385,
      mealsProvided: 960,
      wastePreventedKg: 385,
      co2SavedKg: 731,
      activeDonors: 12,
      activeNGOs: 16,
      activeVolunteers: 24
    };

    // Organizations for Admin & Map
    const initialOrgs = [
      {
        id: 'demo-org-donor-1',
        name: 'Delhi Spice Kitchen (Demo)',
        type: 'RESTAURANT',
        address: 'Connaught Place, Central Delhi',
        city: 'Delhi',
        phone: '+91 98110 00001',
        email: 'donor@foodbridge.ai',
        verifiedStatus: 'VERIFIED',
        latitude: 28.6315,
        longitude: 77.2167
      },
      {
        id: 'demo-org-ngo-1',
        name: 'Robin Hood Army Hub (Demo)',
        type: 'COMMUNITY_KITCHEN',
        address: 'Kashmere Gate, North Delhi',
        city: 'Delhi',
        phone: '+91 98110 00002',
        email: 'ngo@foodbridge.ai',
        verifiedStatus: 'VERIFIED',
        latitude: 28.6675,
        longitude: 77.2285
      },
      {
        id: 'demo-org-3',
        name: 'Grand Royal Banquet Hall',
        type: 'EVENT_ORGANIZER',
        address: 'Karol Bagh, Delhi',
        city: 'Delhi',
        phone: '+91 98110 00008',
        email: 'events@grandroyal.com',
        verifiedStatus: 'VERIFIED',
        latitude: 28.6517,
        longitude: 77.1906
      },
      {
        id: 'demo-org-4',
        name: 'Delhi Night Shelter Collective',
        type: 'NGO_SHELTER',
        address: 'ISBT Kashmiri Gate, Delhi',
        city: 'Delhi',
        phone: '+91 98110 00004',
        email: 'contact@delhishelters.org',
        verifiedStatus: 'VERIFIED',
        latitude: 28.6692,
        longitude: 77.2312
      }
    ];

    // Users for Admin
    const initialUsers = [
      { id: 'u1', name: 'Delhi Spice Kitchen', email: 'donor@foodbridge.ai', role: 'DONOR', isActive: true, createdAt: new Date().toISOString() },
      { id: 'u2', name: 'Robin Hood Army Hub', email: 'ngo@foodbridge.ai', role: 'NGO', isActive: true, createdAt: new Date().toISOString() },
      { id: 'u3', name: 'Aarav Sharma', email: 'volunteer@foodbridge.ai', role: 'VOLUNTEER', isActive: true, createdAt: new Date().toISOString() },
      { id: 'u4', name: 'Platform Admin', email: 'admin@foodbridge.ai', role: 'ADMIN', isActive: true, createdAt: new Date().toISOString() }
    ];

    // Audit logs
    const initialAudit = [
      { id: 'a1', action: 'DONATION_CREATED', entityType: 'FoodDonation', entityId: 'demo-don-101', createdAt: new Date(Date.now() - 45 * 60000).toISOString(), ipAddress: '127.0.0.1' },
      { id: 'a2', action: 'AI_MATCH_GENERATED', entityType: 'DonationMatch', entityId: 'match-101-a', createdAt: new Date(Date.now() - 44 * 60000).toISOString(), ipAddress: '127.0.0.1' },
      { id: 'a3', action: 'PICKUP_ASSIGNED', entityType: 'Pickup', entityId: 'demo-pk-301', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), ipAddress: '127.0.0.1' }
    ];

    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(initialDonations));
    localStorage.setItem(STORAGE_KEYS.DEMANDS, JSON.stringify(initialDemands));
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(initialPickups));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    localStorage.setItem(STORAGE_KEYS.IMPACT, JSON.stringify(initialImpact));
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(initialOrgs));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(initialAudit));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  // ---------------- DONATIONS ----------------
  getDonations(): DemoDonation[] {
    if (typeof window === 'undefined') return [];
    try {
      this.ensureInitialized();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
    } catch {
      return [];
    }
  },

  createDonation(data: any): { donation: DemoDonation; matches: any[] } {
    const donations = this.getDonations();
    const id = `demo-don-${Date.now()}`;
    const qty = Number(data.quantity) || 10;
    const meals = Math.round(qty * 2.5);

    const mockMatches = [
      {
        id: `demo-match-${Date.now()}-1`,
        donationId: id,
        ngoOrgId: 'demo-org-ngo-1',
        ngoOrg: {
          name: 'Robin Hood Army Hub (Demo)',
          type: 'COMMUNITY_KITCHEN',
          address: 'Kashmere Gate, North Delhi',
          city: 'Delhi',
          phone: '+91 98110 00002'
        },
        score: 95.8,
        distanceKm: 2.1,
        recommendationReason: '2.1 km away • Matches food type • High capacity (120 people)'
      },
      {
        id: `demo-match-${Date.now()}-2`,
        donationId: id,
        ngoOrgId: 'demo-org-4',
        ngoOrg: {
          name: 'Delhi Night Shelter Collective',
          type: 'NGO_SHELTER',
          address: 'ISBT Kashmiri Gate, Delhi',
          city: 'Delhi',
          phone: '+91 98110 00004'
        },
        score: 89.2,
        distanceKm: 4.2,
        recommendationReason: '4.2 km away • Active high urgency demand for evening meals'
      }
    ];

    const newDonation: DemoDonation = {
      id,
      foodName: data.foodName || 'Surplus Meals',
      category: data.category || 'COOKED_MEALS',
      quantity: qty,
      quantityUnit: data.quantityUnit || 'KG',
      estimatedMeals: meals,
      vegType: data.vegType || 'VEGETARIAN',
      allergens: data.allergens || [],
      preparationTime: data.preparationTime || new Date().toISOString(),
      availableFrom: data.availableFrom || new Date().toISOString(),
      consumeBefore: data.consumeBefore || new Date(Date.now() + 4 * 3600000).toISOString(),
      packagingStatus: data.packagingStatus || 'SEALED_CONTAINERS',
      pickupAddress: data.pickupAddress || 'Connaught Place, Central Delhi',
      latitude: Number(data.latitude) || 28.6315,
      longitude: Number(data.longitude) || 77.2167,
      specialInstructions: data.specialInstructions,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      donorOrg: {
        name: 'Delhi Spice Kitchen (Demo)',
        city: 'Delhi',
        type: 'RESTAURANT'
      },
      matches: mockMatches
    };

    donations.unshift(newDonation);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    this.addNotification({
      title: 'Surplus Food Reported (Demo)',
      message: `Successfully listed ${qty} ${newDonation.quantityUnit} of ${newDonation.foodName} (${meals} meals) in browser storage.`,
      type: 'DONATION_AVAILABLE'
    });

    return { donation: newDonation, matches: mockMatches };
  },

  getDonationStats() {
    const donations = this.getDonations();
    const totalDonations = donations.length;
    const totalRescuedKg = donations.reduce((sum, d) => sum + (d.quantity || 0), 0);
    const pendingPickups = donations.filter((d) => d.status === 'ACCEPTED' || d.status === 'PICKUP_ASSIGNED').length;
    const completedDonations = donations.filter((d) => d.status === 'DELIVERED').length;

    return {
      totalDonations,
      totalRescuedKg,
      pendingPickups,
      completedDonations,
      monthlyKg: totalRescuedKg
    };
  },

  // ---------------- DEMANDS ----------------
  getDemands(): DemoDemand[] {
    if (typeof window === 'undefined') return [];
    try {
      this.ensureInitialized();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMANDS) || '[]');
    } catch {
      return [];
    }
  },

  createDemand(data: any): DemoDemand {
    const demands = this.getDemands();
    const newDemand: DemoDemand = {
      id: `demo-dem-${Date.now()}`,
      foodCategory: data.foodCategory || 'COOKED_MEALS',
      requestedQuantity: Number(data.requestedQuantity) || 20,
      requestedUnit: data.requestedUnit || 'KG',
      urgency: data.urgency || 'HIGH',
      requiredBefore: data.requiredBefore || new Date(Date.now() + 6 * 3600000).toISOString(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      ngoOrg: {
        name: 'Robin Hood Army Hub (Demo)',
        city: 'Delhi'
      }
    };

    demands.unshift(newDemand);
    localStorage.setItem(STORAGE_KEYS.DEMANDS, JSON.stringify(demands));

    this.addNotification({
      title: 'Food Demand Logged (Demo)',
      message: `Demand for ${newDemand.requestedQuantity} kg ${newDemand.foodCategory} saved in browser storage.`,
      type: 'DEMAND_LOGGED'
    });

    return newDemand;
  },

  // ---------------- MATCHES & RECOMMENDATIONS ----------------
  getRecommendations(): DemoDonation[] {
    const donations = this.getDonations();
    return donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHED');
  },

  acceptDonation(donationId: string) {
    const donations = this.getDonations();
    const don = donations.find((d) => d.id === donationId);
    if (!don) throw new Error('Donation not found in local browser storage');

    don.status = 'ACCEPTED';
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    const pickups = this.getPickups();
    const pickupId = `demo-pk-${Date.now()}`;
    const newPickup: DemoPickup = {
      id: pickupId,
      donationId: don.id,
      donation: don,
      status: 'ASSIGNED',
      createdAt: new Date().toISOString(),
      delivery: {
        id: `demo-del-${Date.now()}`,
        destinationAddress: 'Robin Hood Community Kitchen, Kashmere Gate',
        status: 'ON_WAY_TO_DESTINATION',
        deliveredQuantity: don.quantity
      }
    };
    pickups.unshift(newPickup);
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));

    this.addNotification({
      title: 'Donation Accepted (Demo)',
      message: `You accepted "${don.foodName}". A pickup assignment has been scheduled for delivery volunteers.`,
      type: 'DONATION_ACCEPTED'
    });

    return { success: true, pickup: newPickup };
  },

  rejectDonation(donationId: string) {
    const donations = this.getDonations();
    const don = donations.find((d) => d.id === donationId);
    if (don) {
      don.status = 'DECLINED';
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
    }
    return { success: true };
  },

  getNearbyNGOs() {
    return [
      {
        id: 'demo-org-ngo-1',
        name: 'Robin Hood Army Hub (Demo)',
        type: 'COMMUNITY_KITCHEN',
        address: 'Kashmere Gate, North Delhi',
        city: 'Delhi',
        phone: '+91 98110 00002',
        distanceKm: 2.1,
        capacityPeople: 120
      },
      {
        id: 'demo-org-4',
        name: 'Delhi Night Shelter Collective',
        type: 'NGO_SHELTER',
        address: 'ISBT Kashmiri Gate, Delhi',
        city: 'Delhi',
        phone: '+91 98110 00004',
        distanceKm: 4.2,
        capacityPeople: 90
      },
      {
        id: 'demo-org-5',
        name: 'Goonj Urban Relief Centre',
        type: 'COMMUNITY_KITCHEN',
        address: 'Madanpur Khadar, Sarita Vihar, Delhi',
        city: 'Delhi',
        phone: '+91 98110 00006',
        distanceKm: 6.8,
        capacityPeople: 250
      }
    ];
  },

  // ---------------- PICKUPS & VOLUNTEER ----------------
  getPickups(): DemoPickup[] {
    if (typeof window === 'undefined') return [];
    try {
      this.ensureInitialized();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PICKUPS) || '[]');
    } catch {
      return [];
    }
  },

  getAvailablePickups(): DemoPickup[] {
    return this.getPickups().filter((p) => p.status !== 'DELIVERED');
  },

  claimPickup(pickupId: string) {
    const pickups = this.getPickups();
    const pickup = pickups.find((p) => p.id === pickupId);
    if (!pickup) throw new Error('Pickup not found in local browser storage');

    pickup.status = 'ON_WAY_TO_PICKUP';
    pickup.volunteerId = 'demo-volunteer-user-1';
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));

    return pickup;
  },

  updatePickupStatus(pickupId: string, status: string) {
    const pickups = this.getPickups();
    const pickup = pickups.find((p) => p.id === pickupId);
    if (!pickup) throw new Error('Pickup not found in local browser storage');

    pickup.status = status;
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));
    return pickup;
  },

  completeDelivery(deliveryId: string, data: any) {
    const pickups = this.getPickups();
    const pickup = pickups.find((p) => p.delivery?.id === deliveryId || p.id === deliveryId);
    if (!pickup) throw new Error('Delivery not found in local browser storage');

    pickup.status = 'DELIVERED';
    if (pickup.delivery) {
      pickup.delivery.status = 'DELIVERED';
      pickup.delivery.receiverName = data.receiverName || 'Shelter Caretaker';
      pickup.delivery.deliveredQuantity = Number(data.deliveredQuantity) || pickup.donation.quantity;
      pickup.delivery.proofImageUrl = data.proofImageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=500&q=60';
    }

    const donations = this.getDonations();
    const don = donations.find((d) => d.id === pickup.donationId);
    if (don) don.status = 'DELIVERED';

    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    this.recordImpact(pickup.donation.quantity);

    this.addNotification({
      title: 'Food Delivery Verified (Demo)',
      message: `Completed delivery of ${pickup.donation.quantity} kg (${pickup.donation.estimatedMeals} meals). Impact stats updated!`,
      type: 'DELIVERY_COMPLETED'
    });

    return { success: true, message: 'Delivery completed in browser demo storage' };
  },

  // ---------------- IMPACT & ANALYTICS ----------------
  getImpact() {
    if (typeof window === 'undefined') {
      return { foodRescuedKg: 385, mealsProvided: 960, wastePreventedKg: 385, co2SavedKg: 731, activeDonors: 12, activeNGOs: 16, activeVolunteers: 24 };
    }
    try {
      this.ensureInitialized();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPACT) || JSON.stringify({
        foodRescuedKg: 385,
        mealsProvided: 960,
        wastePreventedKg: 385,
        co2SavedKg: 731,
        activeDonors: 12,
        activeNGOs: 16,
        activeVolunteers: 24
      }));
    } catch {
      return { foodRescuedKg: 385, mealsProvided: 960, wastePreventedKg: 385, co2SavedKg: 731, activeDonors: 12, activeNGOs: 16, activeVolunteers: 24 };
    }
  },

  recordImpact(kg: number) {
    const impact = this.getImpact();
    impact.foodRescuedKg += kg;
    impact.mealsProvided += Math.round(kg * 2.5);
    impact.wastePreventedKg += kg;
    impact.co2SavedKg += Math.round(kg * 1.9);
    localStorage.setItem(STORAGE_KEYS.IMPACT, JSON.stringify(impact));
  },

  getTrends() {
    return {
      trendData: [
        { date: 'Mon', rescuedKg: 45, meals: 112, co2Saved: 85 },
        { date: 'Tue', rescuedKg: 62, meals: 155, co2Saved: 118 },
        { date: 'Wed', rescuedKg: 38, meals: 95, co2Saved: 72 },
        { date: 'Thu', rescuedKg: 85, meals: 212, co2Saved: 161 },
        { date: 'Fri', rescuedKg: 95, meals: 238, co2Saved: 180 },
        { date: 'Sat', rescuedKg: 130, meals: 325, co2Saved: 247 },
        { date: 'Sun', rescuedKg: 110, meals: 275, co2Saved: 209 }
      ],
      categoryData: [
        { name: 'Cooked Meals', value: 45 },
        { name: 'Bakery', value: 20 },
        { name: 'Raw Produce', value: 18 },
        { name: 'Dairy', value: 12 },
        { name: 'Packaged', value: 5 }
      ]
    };
  },

  getLeaderboards() {
    return {
      donors: [
        { id: '1', name: 'Delhi Spice Kitchen (Demo)', organizationName: 'Delhi Spice Kitchen', mealsRescued: 420, rank: 1, co2Saved: 798, badge: '🥇 Gold Rescuer' },
        { id: '2', name: 'The French Crust Bakery', organizationName: 'The French Crust Bakery', mealsRescued: 310, rank: 2, co2Saved: 589, badge: '🥈 Silver Rescuer' },
        { id: '3', name: 'Grand Buffet Connaught', organizationName: 'Grand Buffet Connaught', mealsRescued: 240, rank: 3, co2Saved: 456, badge: '🥉 Bronze Rescuer' },
        { id: '4', name: 'GreenField AgriHub', organizationName: 'GreenField AgriHub', mealsRescued: 185, rank: 4, co2Saved: 351, badge: '🌱 Green Hero' }
      ],
      volunteers: [
        { id: '1', name: 'Aarav Sharma (Demo Volunteer)', deliveriesCount: 38, rank: 1, badge: '⚡ Speed Champion' },
        { id: '2', name: 'Priya Patel', deliveriesCount: 29, rank: 2, badge: '🛡️ Reliability Pro' },
        { id: '3', name: 'Rohan Mehra', deliveriesCount: 22, rank: 3, badge: '🌟 Community Hero' }
      ]
    };
  },

  getBadges() {
    return [
      { id: 'b1', name: 'Zero Waste Pioneer', description: 'Prevented over 250 kg of edible food waste from reaching landfills.', icon: '🌱', unlocked: true },
      { id: 'b2', name: 'Centurion Feeder', description: 'Provided 100+ meals to community kitchens & hunger relief shelters.', icon: '🍲', unlocked: true },
      { id: 'b3', name: 'Rapid Dispatcher', description: 'Collected and transported surplus donations in under 45 minutes.', icon: '⚡', unlocked: true },
      { id: 'b4', name: 'Community Pillar', description: 'Contributed 5+ consecutive days of verified hunger relief operations.', icon: '🏆', unlocked: true }
    ];
  },

  // ---------------- ADMIN ----------------
  getOrganizations() {
    if (typeof window === 'undefined') return [];
    try {
      this.ensureInitialized();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORGS) || '[]');
    } catch {
      return [];
    }
  },

  verifyOrganization(orgId: string, status: string) {
    const orgs = this.getOrganizations();
    const org = orgs.find((o: any) => o.id === orgId);
    if (org) {
      org.verifiedStatus = status;
      localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(orgs));
    }
    return { success: true };
  },

  getUsers() {
    if (typeof window === 'undefined') return [];
    try {
      this.ensureInitialized();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch {
      return [];
    }
  },

  toggleUserStatus(userId: string, isActive: boolean) {
    const users = this.getUsers();
    const u = users.find((item: any) => item.id === userId);
    if (u) {
      u.isActive = isActive;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return { success: true };
  },

  getAuditLogs() {
    if (typeof window === 'undefined') return [];
    try {
      this.ensureInitialized();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]');
    } catch {
      return [];
    }
  },

  // ---------------- AI INTELLIGENCE ----------------
  getAIMetrics() {
    return {
      model_version: 'v2.4-rf',
      r2_score: 0.914,
      mae_kg: 2.18,
      rmse_kg: 3.42,
      training_samples: 1250,
      last_retrained: '2026-10-09',
      features_used: ['expected_customers', 'restaurant_type', 'food_category', 'day_of_week', 'month', 'has_event']
    };
  },

  getAIForecasts(days: number = 7) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const base = [34.5, 28.2, 31.0, 42.1, 58.4, 72.0, 64.6];
    return Array.from({ length: Math.min(days, 7) }, (_, i) => ({
      day: dayNames[i],
      predicted_surplus_kg: base[i],
      confidence_lower: +(base[i] * 0.85).toFixed(1),
      confidence_upper: +(base[i] * 1.15).toFixed(1)
    }));
  },

  predictSurplus(data: any) {
    const customers = Number(data.expected_customers) || 100;
    const factor = data.has_event ? 0.35 : 0.22;
    const surplusKg = +(customers * factor).toFixed(1);
    const meals = Math.round(surplusKg * 2.5);

    return {
      predicted_surplus_kg: surplusKg,
      estimated_meals: meals,
      confidence_range: {
        lower_kg: +(surplusKg * 0.88).toFixed(1),
        upper_kg: +(surplusKg * 1.12).toFixed(1)
      },
      factors: {
        customer_volume: `${customers} expected patrons`,
        event_impact: data.has_event ? '+35% event buffer' : 'Standard dinner flow',
        category_risk: 'Medium shelf life factor'
      }
    };
  },

  // ---------------- NOTIFICATIONS ----------------
  getNotifications(): DemoNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      this.ensureInitialized();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    } catch {
      return [];
    }
  },

  addNotification(n: { title: string; message: string; type: string }) {
    const list = this.getNotifications();
    list.unshift({
      id: `demo-notif-${Date.now()}`,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list.slice(0, 30)));
  },

  markNotificationsRead() {
    const list = this.getNotifications();
    list.forEach((n) => (n.isRead = true));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  clearDemoData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.DEMANDS);
    localStorage.removeItem(STORAGE_KEYS.PICKUPS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.IMPACT);
    localStorage.removeItem(STORAGE_KEYS.ORGS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.ensureInitialized();
  }
};
