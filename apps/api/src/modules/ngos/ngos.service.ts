import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { calculateDistanceKm } from '../../lib/geo';
import { createAuditLog } from '../../middleware/audit';
import {
  VerificationStatus,
  DonationStatus,
  FoodCategory,
  QuantityUnit,
  UrgencyLevel
} from '@foodbridge/shared';

export class NGOService {
  static async getNGOs(filters: { verifiedStatus?: string; city?: string }) {
    const where: any = {
      type: { in: ['NGO_SHELTER', 'ORPHANAGE', 'COMMUNITY_KITCHEN', 'OLD_AGE_HOME'] }
    };
    if (filters.verifiedStatus) where.verifiedStatus = filters.verifiedStatus;
    if (filters.city) where.city = filters.city;

    return prisma.organization.findMany({
      where,
      include: {
        ngoProfile: true,
        demands: {
          where: { status: 'ACTIVE' }
        }
      }
    });
  }

  static async getNearbyNGOs(lat: number, lon: number, radiusKm = 20) {
    const ngos = await prisma.organization.findMany({
      where: {
        verifiedStatus: VerificationStatus.VERIFIED,
        type: { in: ['NGO_SHELTER', 'ORPHANAGE', 'COMMUNITY_KITCHEN', 'OLD_AGE_HOME'] }
      },
      include: {
        ngoProfile: true,
        demands: { where: { status: 'ACTIVE' } }
      }
    });

    return ngos
      .map(ngo => {
        const distance = calculateDistanceKm(lat, lon, ngo.latitude, ngo.longitude);
        return { ...ngo, distanceKm: distance };
      })
      .filter(ngo => ngo.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  static async getRecommendedDonations(ngoOrgId: string) {
    const ngo = await prisma.organization.findUnique({
      where: { id: ngoOrgId },
      include: { ngoProfile: true }
    });

    if (!ngo) {
      throw new AppError('NGO organization not found', 404, 'NOT_FOUND');
    }

    const matches = await prisma.donationMatch.findMany({
      where: {
        ngoOrgId,
        donation: {
          status: { in: [DonationStatus.AVAILABLE, DonationStatus.MATCHED] },
          consumeBefore: { gt: new Date() }
        }
      },
      include: {
        donation: {
          include: {
            donorOrg: true,
            donor: { select: { id: true, name: true, phone: true } }
          }
        }
      },
      orderBy: { score: 'desc' }
    });

    return matches.map((m: any) => ({
      matchId: m.id,
      score: m.score,
      distanceKm: m.distanceKm,
      recommendationReason: m.recommendationReason,
      breakdown: {
        distanceScore: m.distanceKm <= 3 ? 95 : 75,
        quantityScore: m.quantityFit,
        foodCompatibilityScore: m.foodCompatibility,
        urgencyScore: m.urgencyScore,
        expiryScore: m.expiryScore,
        capacityScore: m.capacityScore
      },
      donation: m.donation
    }));
  }

  static async createDemand(ngoOrgId: string, data: {
    foodCategory: FoodCategory;
    requestedQuantity: number;
    requestedUnit?: QuantityUnit;
    urgency?: UrgencyLevel;
    requiredBefore: string | Date;
  }) {
    return prisma.nGODemand.create({
      data: {
        ngoOrgId,
        foodCategory: data.foodCategory,
        requestedQuantity: data.requestedQuantity,
        requestedUnit: data.requestedUnit || QuantityUnit.KG,
        urgency: data.urgency || UrgencyLevel.MEDIUM,
        requiredBefore: new Date(data.requiredBefore),
        status: 'ACTIVE'
      }
    });
  }

  static async getDemands(ngoOrgId?: string) {
    const where: any = { status: 'ACTIVE' };
    if (ngoOrgId) where.ngoOrgId = ngoOrgId;

    return prisma.nGODemand.findMany({
      where,
      include: { ngoOrg: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async acceptDonation(ngoOrgId: string, donationId: string, userId: string, ipAddress?: string) {
    const ngo = await prisma.organization.findUnique({
      where: { id: ngoOrgId },
      include: { ngoProfile: true }
    });

    if (!ngo) {
      throw new AppError('NGO organization not found', 404, 'NOT_FOUND');
    }

    if (ngo.verifiedStatus !== VerificationStatus.VERIFIED) {
      throw new AppError('Only verified NGOs can accept surplus donations. Please wait for administrator verification.', 403, 'NGO_NOT_VERIFIED');
    }

    const donation = await prisma.foodDonation.findUnique({
      where: { id: donationId },
      include: { donor: true, donorOrg: true }
    });

    if (!donation) {
      throw new AppError('Donation not found', 404, 'NOT_FOUND');
    }

    if (donation.status === DonationStatus.EXPIRED || new Date(donation.consumeBefore).getTime() <= Date.now()) {
      throw new AppError('Cannot accept an expired donation', 400, 'DONATION_EXPIRED');
    }

    if (!['AVAILABLE', 'MATCHED'].includes(donation.status)) {
      throw new AppError(`Donation is no longer available (current status: ${donation.status})`, 400, 'DONATION_UNAVAILABLE');
    }

    // Capacity verification check
    const ngoCapacity = ngo.ngoProfile?.dailyMealsCapacity || 200;
    if (donation.estimatedMeals > ngoCapacity * 2) {
      throw new AppError(`Donation quantity exceeds safe handling capacity of ${ngoCapacity} meals.`, 400, 'CAPACITY_EXCEEDED');
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Update donation status to ACCEPTED
      const updatedDonation = await tx.foodDonation.update({
        where: { id: donationId },
        data: { status: DonationStatus.ACCEPTED }
      });

      // 2. Accept this match and decline others for this donation
      await tx.donationMatch.updateMany({
        where: { donationId, ngoOrgId },
        data: { status: 'ACCEPTED' }
      });

      await tx.donationMatch.updateMany({
        where: { donationId, ngoOrgId: { not: ngoOrgId } },
        data: { status: 'DECLINED' }
      });

      // 3. Create Pickup record for volunteer dispatch
      const pickup = await tx.pickup.create({
        data: {
          donationId,
          scheduledTime: new Date(Date.now() + 60 * 60 * 1000), // scheduled in 1 hr
          status: 'ASSIGNED',
          pickupNotes: `Collect from ${donation.donorOrg?.name || donation.donor.name} at ${donation.pickupAddress} for ${ngo.name}`
        }
      });

      // 4. Create pending delivery record linked to pickup
      await tx.delivery.create({
        data: {
          pickupId: pickup.id,
          destinationAddress: ngo.address,
          latitude: ngo.latitude,
          longitude: ngo.longitude,
          status: 'ON_WAY_TO_DESTINATION'
        }
      });

      // 5. Notify donor that donation was accepted
      await tx.notification.create({
        data: {
          userId: donation.donorId,
          title: 'Donation Accepted!',
          message: `${ngo.name} has accepted your donation of ${donation.foodName}. Pickup is being dispatched.`,
          type: 'DONATION_ACCEPTED',
          dataJson: JSON.stringify({ donationId, ngoName: ngo.name })
        }
      });

      // 6. Notify active volunteers of available pickup
      const volunteers = await tx.user.findMany({
        where: { role: 'VOLUNTEER', isActive: true }
      });

      for (const vol of volunteers) {
        await tx.notification.create({
          data: {
            userId: vol.id,
            title: 'New Delivery Assignment Available',
            message: `Food rescue pickup ready: ${donation.quantity} ${donation.quantityUnit} of ${donation.foodName} from ${donation.pickupAddress}.`,
            type: 'PICKUP_ASSIGNED',
            dataJson: JSON.stringify({ donationId, pickupId: pickup.id })
          }
        });
      }

      return { donation: updatedDonation, pickup };
    });

    await createAuditLog({
      userId,
      action: 'ACCEPT_DONATION',
      entityType: 'DONATION',
      entityId: donationId,
      details: { ngoId: ngo.id, ngoName: ngo.name },
      ipAddress
    });

    return result;
  }

  static async rejectDonation(ngoOrgId: string, donationId: string) {
    await prisma.donationMatch.updateMany({
      where: { donationId, ngoOrgId },
      data: { status: 'DECLINED' }
    });
    return { success: true };
  }
}
