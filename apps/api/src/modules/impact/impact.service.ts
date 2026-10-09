import { prisma } from '../../lib/prisma';
import { DonationStatus } from '@foodbridge/shared';

export interface ImpactBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export class ImpactService {
  static async getPlatformImpactOverview() {
    const deliveredDonations = await prisma.foodDonation.findMany({
      where: { status: DonationStatus.DELIVERED },
      include: {
        pickup: {
          include: { delivery: true }
        }
      }
    });

    const totalRescuedKg = deliveredDonations.reduce((sum, d) => {
      const deliveredQty = d.pickup?.delivery?.deliveredQuantity || d.quantity;
      return sum + deliveredQty;
    }, 0);

    const totalMealsRescued = deliveredDonations.reduce((sum, d) => sum + d.estimatedMeals, 0);
    const wastePreventedKg = totalRescuedKg;
    const co2SavedKg = Math.round(wastePreventedKg * 2.5 * 10) / 10;
    const peopleServed = Math.round(totalMealsRescued * 0.7);

    // Active entities count
    const [donorCount, ngoCount, volunteerCount, activeDonationsCount] = await Promise.all([
      prisma.organization.count({ where: { type: { in: ['RESTAURANT', 'HOSTEL_MESS', 'CAFETERIA', 'EVENT_ORGANIZER'] } } }),
      prisma.organization.count({ where: { verifiedStatus: 'VERIFIED', type: { in: ['NGO_SHELTER', 'ORPHANAGE', 'COMMUNITY_KITCHEN', 'OLD_AGE_HOME'] } } }),
      prisma.user.count({ where: { role: 'VOLUNTEER', isActive: true } }),
      prisma.foodDonation.count({ where: { status: { in: ['AVAILABLE', 'MATCHED', 'ACCEPTED', 'PICKUP_ASSIGNED', 'IN_TRANSIT'] } } })
    ]);

    return {
      foodRescuedKg: Math.round(totalRescuedKg * 10) / 10,
      mealsProvided: totalMealsRescued,
      wastePreventedKg: Math.round(wastePreventedKg * 10) / 10,
      estimatedPeopleServed: peopleServed,
      co2SavedKg,
      activeDonors: donorCount,
      activeNGOs: ngoCount,
      activeVolunteers: volunteerCount,
      activeDonations: activeDonationsCount,
      totalCompletedDeliveries: deliveredDonations.length
    };
  }

  static async getTrends() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const delivered = await prisma.foodDonation.findMany({
      where: { status: DonationStatus.DELIVERED },
      include: {
        pickup: { include: { delivery: true } }
      }
    });

    // Real weekly trend mapping
    const dayMap: Record<string, { rescuedKg: number; meals: number; co2: number }> = {
      Mon: { rescuedKg: 0, meals: 0, co2: 0 },
      Tue: { rescuedKg: 0, meals: 0, co2: 0 },
      Wed: { rescuedKg: 0, meals: 0, co2: 0 },
      Thu: { rescuedKg: 0, meals: 0, co2: 0 },
      Fri: { rescuedKg: 0, meals: 0, co2: 0 },
      Sat: { rescuedKg: 0, meals: 0, co2: 0 },
      Sun: { rescuedKg: 0, meals: 0, co2: 0 }
    };

    // Real category breakdown mapping
    const catMap: Record<string, number> = {};

    delivered.forEach((d) => {
      const deliveredQty = d.pickup?.delivery?.deliveredQuantity || d.quantity;
      const date = d.pickup?.delivery?.deliveredAt || d.updatedAt;
      const dayName = days[new Date(date).getDay()];

      if (dayMap[dayName]) {
        dayMap[dayName].rescuedKg += deliveredQty;
        dayMap[dayName].meals += d.estimatedMeals;
        dayMap[dayName].co2 += Math.round(deliveredQty * 2.5 * 10) / 10;
      }

      const catLabel = d.category.replace(/_/g, ' ');
      catMap[catLabel] = (catMap[catLabel] || 0) + deliveredQty;
    });

    const trendData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      period: day,
      rescuedKg: Math.round(dayMap[day].rescuedKg * 10) / 10,
      meals: dayMap[day].meals,
      co2: Math.round(dayMap[day].co2 * 10) / 10
    }));

    const categoryData = Object.entries(catMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 10) / 10
    }));

    return {
      trendData,
      categoryData
    };
  }

  static async getLeaderboards() {
    // Top Donors
    const topDonorsRaw = await prisma.foodDonation.groupBy({
      by: ['donorOrgId'],
      where: {
        status: DonationStatus.DELIVERED,
        donorOrgId: { not: null }
      },
      _sum: {
        quantity: true,
        estimatedMeals: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    const donorOrgs = await prisma.organization.findMany({
      where: { id: { in: topDonorsRaw.map(d => d.donorOrgId!).filter(Boolean) } }
    });

    const donorLeaderboard = topDonorsRaw.map((d, index) => {
      const org = donorOrgs.find(o => o.id === d.donorOrgId);
      const foodRescuedKg = d._sum.quantity || 0;
      return {
        rank: index + 1,
        orgId: d.donorOrgId,
        name: org?.name || 'Independent Donor',
        type: org?.type || 'RESTAURANT',
        city: org?.city || 'Delhi NCR',
        totalFoodKg: Math.round(foodRescuedKg * 10) / 10,
        totalMeals: d._sum.estimatedMeals || 0,
        donationCount: d._count.id
      };
    });

    // Top Volunteers
    const topVolunteers = await prisma.volunteerProfile.findMany({
      take: 10,
      orderBy: { totalDeliveries: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    const volunteerLeaderboard = topVolunteers.map((v, index) => ({
      rank: index + 1,
      userId: v.userId,
      name: v.user.name,
      totalDeliveries: v.totalDeliveries,
      vehicleType: v.vehicleType
    }));

    return {
      donors: donorLeaderboard,
      volunteers: volunteerLeaderboard
    };
  }

  static async getUserBadges(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        donationsCreated: {
          where: { status: DonationStatus.DELIVERED }
        },
        volunteerProfile: true
      }
    });

    if (!user) return [];

    const totalMeals = user.donationsCreated.reduce((sum, d) => sum + d.estimatedMeals, 0);
    const totalKg = user.donationsCreated.reduce((sum, d) => sum + d.quantity, 0);
    const deliveriesCount = user.volunteerProfile?.totalDeliveries || 0;

    const badges: ImpactBadge[] = [
      {
        id: 'first_step',
        name: 'First Rescue',
        description: 'Completed your very first surplus food donation or delivery',
        icon: '🌱',
        unlocked: user.donationsCreated.length >= 1 || deliveriesCount >= 1,
        progressPercent: Math.min(100, Math.max(user.donationsCreated.length, deliveriesCount) * 100)
      },
      {
        id: 'food_saver_50',
        name: 'Food Saver',
        description: 'Rescued over 50 kg of edible surplus food',
        icon: '🍱',
        unlocked: totalKg >= 50,
        progressPercent: Math.min(100, Math.round((totalKg / 50) * 100))
      },
      {
        id: 'centurion_meals',
        name: '100 Meals Rescued',
        description: 'Provided 100 wholesome meals to individuals facing hunger',
        icon: '🥇',
        unlocked: totalMeals >= 100,
        progressPercent: Math.min(100, Math.round((totalMeals / 100) * 100))
      },
      {
        id: 'kilo_crusader',
        name: 'Kilogram Crusader',
        description: 'Diverted 500 kg of good food from landfills',
        icon: '♻️',
        unlocked: totalKg >= 500,
        progressPercent: Math.min(100, Math.round((totalKg / 500) * 100))
      },
      {
        id: 'community_hero',
        name: 'Community Hero',
        description: 'Achieved 1,000+ meals rescued and distributed to shelters',
        icon: '🌟',
        unlocked: totalMeals >= 1000,
        progressPercent: Math.min(100, Math.round((totalMeals / 1000) * 100))
      }
    ];

    return badges;
  }
}
