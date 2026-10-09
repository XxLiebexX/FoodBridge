import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { MatchingService } from '../matching/matching.service';
import { createAuditLog } from '../../middleware/audit';
import {
  FoodCategory,
  QuantityUnit,
  DietaryType,
  PackagingStatus,
  DonationStatus,
  MEAL_CONVERSION_FACTORS
} from '@foodbridge/shared';

export class DonationsService {
  static async createDonation(userId: string, data: {
    donorOrgId?: string;
    foodName: string;
    category: FoodCategory;
    quantity: number;
    quantityUnit?: QuantityUnit;
    vegType: DietaryType;
    allergens?: string[];
    preparationTime: string | Date;
    availableFrom: string | Date;
    consumeBefore: string | Date;
    packagingStatus: PackagingStatus;
    pickupAddress: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    specialInstructions?: string;
  }, ipAddress?: string) {
    if (data.quantity <= 0) {
      throw new AppError('Quantity must be greater than zero', 400, 'INVALID_QUANTITY');
    }

    const availableTime = new Date(data.availableFrom).getTime();
    const consumeTime = new Date(data.consumeBefore).getTime();
    const now = new Date().getTime();

    if (consumeTime <= availableTime) {
      throw new AppError('Consume-before time must be strictly after available-from time', 400, 'INVALID_EXPIRY');
    }

    if (consumeTime <= now) {
      throw new AppError('Donation has already expired. Cannot list expired food.', 400, 'DONATION_EXPIRED');
    }

    // Auto-calculate estimated meals based on category conversion factor
    const factor = MEAL_CONVERSION_FACTORS[data.category] || 2.5;
    const estimatedMeals = Math.round(data.quantity * factor);

    const donation = await prisma.foodDonation.create({
      data: {
        donorId: userId,
        donorOrgId: data.donorOrgId || null,
        foodName: data.foodName,
        category: data.category,
        quantity: data.quantity,
        quantityUnit: data.quantityUnit || QuantityUnit.KG,
        estimatedMeals,
        vegType: data.vegType,
        allergens: JSON.stringify(data.allergens || []),
        preparationTime: new Date(data.preparationTime),
        availableFrom: new Date(data.availableFrom),
        consumeBefore: new Date(data.consumeBefore),
        packagingStatus: data.packagingStatus,
        pickupAddress: data.pickupAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        imageUrl: data.imageUrl || null,
        specialInstructions: data.specialInstructions || null,
        status: DonationStatus.AVAILABLE
      },
      include: {
        donorOrg: true,
        donor: {
          select: { id: true, name: true, phone: true, email: true }
        }
      }
    });

    await createAuditLog({
      userId,
      action: 'CREATE_DONATION',
      entityType: 'DONATION',
      entityId: donation.id,
      details: { foodName: donation.foodName, quantity: donation.quantity, estimatedMeals },
      ipAddress
    });

    // Run AI matching engine asynchronously or synchronously so matches are ready immediately
    let matches: any[] = [];
    try {
      matches = await MatchingService.calculateMatchesForDonation(donation.id);

      // Notify the top matched NGOs
      for (const match of matches) {
        // Find NGO admin users to notify
        const orgUsers = await prisma.organizationMember.findMany({
          where: { organizationId: match.ngoOrgId },
          include: { user: true }
        });

        for (const member of orgUsers) {
          await prisma.notification.create({
            data: {
              userId: member.userId,
              title: `New Food Donation Match (${match.score}% Score)`,
              message: `${donation.foodName} (${donation.quantity} ${donation.quantityUnit}) is available near you. ${match.recommendationReason}`,
              type: 'DONATION_MATCHED',
              dataJson: JSON.stringify({ donationId: donation.id, matchScore: match.score })
            }
          });
        }
      }
    } catch (e) {
      console.error('Error during automatic match calculation:', e);
    }

    return { donation, matches };
  }

  static async getDonations(filters: {
    category?: string;
    vegType?: string;
    status?: string;
    donorOrgId?: string;
    donorId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.vegType) where.vegType = filters.vegType;
    if (filters.status) where.status = filters.status;
    if (filters.donorOrgId) where.donorOrgId = filters.donorOrgId;
    if (filters.donorId) where.donorId = filters.donorId;

    if (filters.search) {
      where.OR = [
        { foodName: { contains: filters.search } },
        { pickupAddress: { contains: filters.search } }
      ];
    }

    const [total, donations] = await Promise.all([
      prisma.foodDonation.count({ where }),
      prisma.foodDonation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          donorOrg: true,
          donor: {
            select: { id: true, name: true, phone: true }
          },
          matches: {
            include: {
              ngoOrg: true
            }
          },
          pickup: {
            include: {
              volunteer: {
                select: { id: true, name: true, phone: true }
              },
              delivery: true
            }
          }
        }
      })
    ]);

    return {
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getDonationById(id: string) {
    const donation = await prisma.foodDonation.findUnique({
      where: { id },
      include: {
        donorOrg: true,
        donor: {
          select: { id: true, name: true, phone: true, email: true }
        },
        matches: {
          include: {
            ngoOrg: {
              include: { ngoProfile: true }
            }
          },
          orderBy: { score: 'desc' }
        },
        pickup: {
          include: {
            volunteer: {
              select: { id: true, name: true, phone: true }
            },
            delivery: true
          }
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!donation) {
      throw new AppError('Donation not found', 404, 'NOT_FOUND');
    }

    return donation;
  }

  static async cancelDonation(id: string, userId: string, ipAddress?: string) {
    const donation = await prisma.foodDonation.findUnique({ where: { id } });
    if (!donation) {
      throw new AppError('Donation not found', 404, 'NOT_FOUND');
    }

    if (donation.status === DonationStatus.DELIVERED) {
      throw new AppError('Cannot cancel a donation that has already been delivered', 400, 'CANNOT_MODIFY_DELIVERED');
    }

    const updated = await prisma.foodDonation.update({
      where: { id },
      data: { status: DonationStatus.CANCELLED }
    });

    await createAuditLog({
      userId,
      action: 'CANCEL_DONATION',
      entityType: 'DONATION',
      entityId: id,
      ipAddress
    });

    return updated;
  }

  static async getDonorStats(donorOrgId?: string, donorId?: string) {
    const where: any = {};
    if (donorOrgId) where.donorOrgId = donorOrgId;
    if (donorId) where.donorId = donorId;

    const allDonations = await prisma.foodDonation.findMany({ where });

    const totalDonations = allDonations.length;
    const deliveredDonations = allDonations.filter(d => d.status === DonationStatus.DELIVERED);
    const pendingDonations = allDonations.filter(d => ['AVAILABLE', 'MATCHED', 'REQUESTED', 'ACCEPTED', 'PICKUP_ASSIGNED'].includes(d.status));

    const totalFoodKg = deliveredDonations.reduce((sum, d) => sum + d.quantity, 0);
    const totalMealsRescued = deliveredDonations.reduce((sum, d) => sum + d.estimatedMeals, 0);
    const foodWastePreventedKg = totalFoodKg; // 1 kg rescued = 1 kg prevented

    // Category distribution
    const categoryCount: Record<string, number> = {};
    allDonations.forEach(d => {
      categoryCount[d.category] = (categoryCount[d.category] || 0) + d.quantity;
    });

    return {
      totalDonations,
      successfulDonations: deliveredDonations.length,
      pendingDonations: pendingDonations.length,
      totalFoodDonatedKg: Math.round(totalFoodKg * 10) / 10,
      totalMealsRescued,
      foodWastePreventedKg: Math.round(foodWastePreventedKg * 10) / 10,
      co2SavedKg: Math.round(foodWastePreventedKg * 2.5 * 10) / 10,
      categoryDistribution: categoryCount
    };
  }
}
