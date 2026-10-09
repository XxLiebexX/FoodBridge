/**
 * FoodBridge AI - Local Browser Storage Demo Engine
 * 
 * When a user logs in with a Demo Account (1-Click Evaluator or @foodbridge.ai),
 * all generated data (donations, demands, pickups, deliveries, notifications)
 * is isolated and stored ONLY in the browser's localStorage.
 * 
 * Main / Real registered accounts bypass this entirely and persist directly to MongoDB.
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

const STORAGE_KEYS = {
  DONATIONS: 'foodbridge_demo_donations',
  DEMANDS: 'foodbridge_demo_demands',
  PICKUPS: 'foodbridge_demo_pickups',
  NOTIFICATIONS: 'foodbridge_demo_notifications',
  IMPACT: 'foodbridge_demo_impact',
  INITIALIZED: 'foodbridge_demo_initialized'
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
        return user.email?.endsWith('@foodbridge.ai');
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

    // Initialize with a clean baseline for demo evaluation
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DEMANDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([
      {
        id: 'demo-notif-1',
        title: 'Welcome to FoodBridge AI Demo',
        message: 'You are using a browser-isolated demo persona. Any data you create is stored locally in your browser and will not alter production MongoDB.',
        type: 'SYSTEM',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]));
    localStorage.setItem(STORAGE_KEYS.IMPACT, JSON.stringify({
      foodRescuedKg: 0,
      mealsProvided: 0,
      wastePreventedKg: 0,
      co2SavedKg: 0,
      activeDonors: 1,
      activeNGOs: 1,
      activeVolunteers: 1
    }));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  // ---------------- DONATIONS ----------------
  getDonations(): DemoDonation[] {
    if (typeof window === 'undefined') return [];
    try {
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
        ngoOrgId: 'demo-ngo-org-1',
        ngoOrg: {
          name: 'Robin Hood Army Hub (Local Demo)',
          type: 'COMMUNITY_KITCHEN',
          address: 'Connaught Place Area, Central Delhi',
          city: 'Delhi',
          phone: '+919811000003'
        },
        score: 95.4,
        distanceKm: 2.1,
        recommendationReason: '2.1 km away • Matches cooked food preference • Immediate shelter capacity available'
      },
      {
        id: `demo-match-${Date.now()}-2`,
        donationId: id,
        ngoOrgId: 'demo-ngo-org-2',
        ngoOrg: {
          name: 'Delhi Night Shelter Collective',
          type: 'NGO_SHELTER',
          address: 'Kashmere Gate, North Delhi',
          city: 'Delhi',
          phone: '+919811000004'
        },
        score: 88.2,
        distanceKm: 4.8,
        recommendationReason: '4.8 km away • Active dinner meal requirement'
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
        name: 'FoodBridge Partner Kitchen (Demo)',
        city: 'Delhi',
        type: 'RESTAURANT'
      },
      matches: mockMatches
    };

    donations.unshift(newDonation);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    // Also push a demo notification
    this.addNotification({
      title: 'Surplus Food Reported (Demo)',
      message: `Successfully recorded ${qty} ${newDonation.quantityUnit} of ${newDonation.foodName} (${meals} meals) in browser storage.`,
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
        name: 'Shelter Hub (Demo)',
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
    // Return available donations
    return donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHED');
  },

  acceptDonation(donationId: string) {
    const donations = this.getDonations();
    const don = donations.find((d) => d.id === donationId);
    if (!don) throw new Error('Donation not found in local browser storage');

    don.status = 'ACCEPTED';
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    // Create a Pickup ready for volunteer
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
        destinationAddress: 'Robin Hood Army Shelter Hub, Kashmere Gate',
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

  // ---------------- PICKUPS & VOLUNTEER ----------------
  getPickups(): DemoPickup[] {
    if (typeof window === 'undefined') return [];
    try {
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
    pickup.volunteerId = 'demo-volunteer-id';
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

    // Update donation status
    const donations = this.getDonations();
    const don = donations.find((d) => d.id === pickup.donationId);
    if (don) don.status = 'DELIVERED';

    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    // Increment local demo impact
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
      return { foodRescuedKg: 0, mealsProvided: 0, wastePreventedKg: 0, co2SavedKg: 0, activeDonors: 1, activeNGOs: 1, activeVolunteers: 1 };
    }
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPACT) || JSON.stringify({
        foodRescuedKg: 0,
        mealsProvided: 0,
        wastePreventedKg: 0,
        co2SavedKg: 0,
        activeDonors: 1,
        activeNGOs: 1,
        activeVolunteers: 1
      }));
    } catch {
      return { foodRescuedKg: 0, mealsProvided: 0, wastePreventedKg: 0, co2SavedKg: 0, activeDonors: 1, activeNGOs: 1, activeVolunteers: 1 };
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

  // ---------------- NOTIFICATIONS ----------------
  getNotifications(): DemoNotification[] {
    if (typeof window === 'undefined') return [];
    try {
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
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.ensureInitialized();
  }
};
