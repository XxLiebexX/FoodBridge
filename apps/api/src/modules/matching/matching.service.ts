import { prisma } from '../../lib/prisma';
import { calculateDistanceKm } from '../../lib/geo';
import {
  FoodCategory,
  DietaryType,
  UrgencyLevel,
  MATCH_WEIGHTS,
  MatchScoreBreakdown,
  VerificationStatus
} from '@foodbridge/shared';

export class MatchingService {
  /**
   * Run the 6-factor AI matching engine for a given donation against all verified NGOs.
   */
  static async calculateMatchesForDonation(donationId: string): Promise<any[]> {
    const donation = await prisma.foodDonation.findUnique({
      where: { id: donationId },
      include: {
        donorOrg: true
      }
    });

    if (!donation) {
      throw new Error(`Donation with ID ${donationId} not found`);
    }

    // Only match with VERIFIED NGOs
    const ngos = await prisma.organization.findMany({
      where: {
        verifiedStatus: VerificationStatus.VERIFIED,
        type: {
          in: ['NGO_SHELTER', 'ORPHANAGE', 'COMMUNITY_KITCHEN', 'OLD_AGE_HOME']
        }
      },
      include: {
        ngoProfile: true,
        demands: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        },
        members: {
          include: { user: true }
        }
      }
    });

    const now = new Date().getTime();
    const consumeTime = new Date(donation.consumeBefore).getTime();
    const hoursRemaining = Math.max(0, (consumeTime - now) / (1000 * 60 * 60));

    if (hoursRemaining <= 0) {
      return []; // Expired food cannot be matched
    }

    const matches: Array<{
      ngoOrgId: string;
      ngoOrg: any;
      breakdown: MatchScoreBreakdown;
    }> = [];

    for (const ngo of ngos) {
      const ngoProfile = ngo.ngoProfile || {
        capacityPeople: 60,
        dailyMealsCapacity: 150,
        serviceRadiusKm: 15,
        dietaryPreferences: 'ANY',
        refrigerationAvailable: false
      };

      // 1. Distance Calculation (Haversine)
      const distanceKm = calculateDistanceKm(
        donation.latitude,
        donation.longitude,
        ngo.latitude,
        ngo.longitude
      );

      // Distance Score (0 - 100)
      let distanceScore = 0;
      const radius = ngoProfile.serviceRadiusKm || 15;
      if (distanceKm <= 2) {
        distanceScore = 100;
      } else if (distanceKm <= radius) {
        // Linear scale from 100 down to 50 at radius edge
        distanceScore = Math.round(100 - ((distanceKm - 2) / (radius - 2)) * 50);
      } else if (distanceKm <= radius * 1.5) {
        distanceScore = Math.max(15, Math.round(50 - ((distanceKm - radius) / (radius * 0.5)) * 35));
      } else {
        distanceScore = 5;
      }

      // 2. Quantity Fit Score (0 - 100)
      const activeDemand = ngo.demands.find(d => d.foodCategory === donation.category) || ngo.demands[0];
      let quantityScore = 70; // baseline if general need
      let targetDemandMeals = activeDemand ? Math.round(activeDemand.requestedQuantity * 2.5) : ngoProfile.dailyMealsCapacity;

      if (targetDemandMeals > 0) {
        const ratio = donation.estimatedMeals / targetDemandMeals;
        if (ratio >= 0.8 && ratio <= 1.2) {
          quantityScore = 100;
        } else if (ratio < 0.8) {
          quantityScore = Math.round(ratio * 100);
        } else {
          // Larger than requested: acceptable if within daily capacity
          if (donation.estimatedMeals <= ngoProfile.dailyMealsCapacity) {
            quantityScore = 85;
          } else {
            const overRatio = donation.estimatedMeals / ngoProfile.dailyMealsCapacity;
            quantityScore = Math.max(20, Math.round(100 - (overRatio - 1) * 60));
          }
        }
      }

      // 3. Food Compatibility Score (0 - 100)
      let foodCompatibilityScore = 85;
      if (ngoProfile.dietaryPreferences === 'VEG_ONLY' && donation.vegType === DietaryType.NON_VEGETARIAN) {
        foodCompatibilityScore = 0; // Strict incompatibility
      } else if (donation.vegType === DietaryType.VEGAN || donation.vegType === DietaryType.VEGETARIAN) {
        foodCompatibilityScore = 100;
      }

      // Boost if NGO explicitly requested this category
      if (activeDemand && activeDemand.foodCategory === donation.category) {
        foodCompatibilityScore = Math.min(100, foodCompatibilityScore + 10);
      }

      // 4. Urgency Score (0 - 100)
      let urgencyScore = 60;
      if (activeDemand) {
        if (activeDemand.urgency === UrgencyLevel.CRITICAL) urgencyScore = 100;
        else if (activeDemand.urgency === UrgencyLevel.HIGH) urgencyScore = 88;
        else if (activeDemand.urgency === UrgencyLevel.MEDIUM) urgencyScore = 70;
        else urgencyScore = 50;
      }

      // 5. Expiry Score (0 - 100)
      // Urgent rescue needed if expiring within 6 hours
      let expiryScore = 75;
      if (hoursRemaining <= 2) {
        expiryScore = 100; // Emergency rescue
      } else if (hoursRemaining <= 6) {
        expiryScore = 95;
      } else if (hoursRemaining <= 12) {
        expiryScore = 85;
      } else {
        expiryScore = 70;
      }

      // 6. Capacity Score (0 - 100)
      let capacityScore = 80;
      if (ngoProfile.dailyMealsCapacity >= donation.estimatedMeals) {
        capacityScore = 100;
      } else {
        const capRatio = ngoProfile.dailyMealsCapacity / donation.estimatedMeals;
        capacityScore = Math.max(25, Math.round(capRatio * 80));
      }

      // Incompatibility filter
      if (foodCompatibilityScore === 0) {
        continue;
      }

      // Final Weighted Score (0 - 100)
      const finalScore = Math.round(
        distanceScore * MATCH_WEIGHTS.DISTANCE +
        quantityScore * MATCH_WEIGHTS.QUANTITY +
        foodCompatibilityScore * MATCH_WEIGHTS.FOOD_COMPATIBILITY +
        urgencyScore * MATCH_WEIGHTS.URGENCY +
        expiryScore * MATCH_WEIGHTS.EXPIRY +
        capacityScore * MATCH_WEIGHTS.CAPACITY
      );

      // Construct AI Explainability narrative
      const reasons: string[] = [];
      reasons.push(`${distanceKm} km away (${distanceKm < 3 ? 'very close' : 'within service radius'})`);
      if (activeDemand) {
        reasons.push(`matches requested ${activeDemand.foodCategory.replace('_', ' ').toLowerCase()}`);
      }
      if (donation.estimatedMeals > 0) {
        reasons.push(`provides ~${donation.estimatedMeals} meals for ${ngoProfile.capacityPeople}+ residents`);
      }
      if (hoursRemaining <= 6) {
        reasons.push(`expires in ${Math.round(hoursRemaining)}h (high rescue priority)`);
      }
      if (donation.vegType === DietaryType.VEGETARIAN) {
        reasons.push(`100% vegetarian compatible`);
      }

      const recommendationReason = `Recommended because ${ngo.name} is ${reasons.join(', ')}.`;

      const breakdown: MatchScoreBreakdown = {
        score: finalScore,
        distanceScore,
        quantityScore,
        foodCompatibilityScore,
        urgencyScore,
        expiryScore,
        capacityScore,
        distanceKm,
        recommendationReason
      };

      matches.push({
        ngoOrgId: ngo.id,
        ngoOrg: ngo,
        breakdown
      });
    }

    // Sort descending by AI score
    matches.sort((a, b) => b.breakdown.score - a.breakdown.score);

    // Save top 5 matches into database
    const topMatches = matches.slice(0, 5);

    const savedMatches = await Promise.all(
      topMatches.map(async (m) => {
        return prisma.donationMatch.upsert({
          where: {
            donationId_ngoOrgId: {
              donationId,
              ngoOrgId: m.ngoOrgId
            }
          },
          update: {
            score: m.breakdown.score,
            distanceKm: m.breakdown.distanceKm,
            quantityFit: m.breakdown.quantityScore,
            urgencyScore: m.breakdown.urgencyScore,
            foodCompatibility: m.breakdown.foodCompatibilityScore,
            expiryScore: m.breakdown.expiryScore,
            capacityScore: m.breakdown.capacityScore,
            recommendationReason: m.breakdown.recommendationReason
          },
          create: {
            donationId,
            ngoOrgId: m.ngoOrgId,
            score: m.breakdown.score,
            distanceKm: m.breakdown.distanceKm,
            quantityFit: m.breakdown.quantityScore,
            urgencyScore: m.breakdown.urgencyScore,
            foodCompatibility: m.breakdown.foodCompatibilityScore,
            expiryScore: m.breakdown.expiryScore,
            capacityScore: m.breakdown.capacityScore,
            recommendationReason: m.breakdown.recommendationReason,
            status: 'PENDING'
          },
          include: {
            ngoOrg: {
              include: {
                ngoProfile: true
              }
            }
          }
        });
      })
    );

    // Also update donation status to MATCHED if still AVAILABLE
    if (savedMatches.length > 0 && donation.status === 'AVAILABLE') {
      await prisma.foodDonation.update({
        where: { id: donationId },
        data: { status: 'MATCHED' }
      });
    }

    return savedMatches;
  }
}
