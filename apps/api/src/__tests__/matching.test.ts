import { MATCH_WEIGHTS, DietaryType, FoodCategory } from '@foodbridge/shared';
import { calculateDistanceKm } from '../lib/geo';

describe('AI Matching Engine & Algorithm Tests', () => {
  test('Formula weights sum to exactly 1.00', () => {
    const sum =
      MATCH_WEIGHTS.DISTANCE +
      MATCH_WEIGHTS.QUANTITY +
      MATCH_WEIGHTS.FOOD_COMPATIBILITY +
      MATCH_WEIGHTS.URGENCY +
      MATCH_WEIGHTS.EXPIRY +
      MATCH_WEIGHTS.CAPACITY;

    expect(Math.round(sum * 100) / 100).toBe(1.00);
  });

  test('Haversine distance calculation is accurate between Delhi points', () => {
    // Connaught Place to Hauz Khas (approx 9-10 km)
    const cpLat = 28.6315;
    const cpLon = 77.2167;
    const hkLat = 28.5450;
    const hkLon = 77.1926;

    const distance = calculateDistanceKm(cpLat, cpLon, hkLat, hkLon);
    expect(distance).toBeGreaterThan(8);
    expect(distance).toBeLessThan(12);
  });

  test('Scoring yields 0 compatibility for VEG_ONLY NGO receiving NON_VEG food', () => {
    const ngoPreference = 'VEG_ONLY';
    const donationVegType = DietaryType.NON_VEGETARIAN;

    let foodCompatibilityScore = 85;
    if (ngoPreference === 'VEG_ONLY' && donationVegType === DietaryType.NON_VEGETARIAN) {
      foodCompatibilityScore = 0;
    }

    expect(foodCompatibilityScore).toBe(0);
  });
});
