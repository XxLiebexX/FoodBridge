import { MEAL_CONVERSION_FACTORS, FoodCategory, CO2_SAVED_PER_KG_WASTE } from '@foodbridge/shared';

describe('Impact Engine & Meal Conversion Tests', () => {
  test('Correctly calculates estimated meals across food categories', () => {
    // 20 kg cooked food @ 2.5 meals/kg = 50 meals
    const cookedMeals = 20 * MEAL_CONVERSION_FACTORS[FoodCategory.COOKED_MEALS];
    expect(cookedMeals).toBe(50);

    // 10 kg raw produce @ 3.0 meals/kg = 30 meals
    const rawMeals = 10 * MEAL_CONVERSION_FACTORS[FoodCategory.RAW_PRODUCE];
    expect(rawMeals).toBe(30);

    // 5 kg bakery @ 4.0 meals/kg = 20 meals
    const bakeryMeals = 5 * MEAL_CONVERSION_FACTORS[FoodCategory.BAKERY];
    expect(bakeryMeals).toBe(20);
  });

  test('CO2 emission factor is 2.5 kg CO2e per kg food waste prevented', () => {
    const rescuedKg = 100;
    const co2Saved = rescuedKg * CO2_SAVED_PER_KG_WASTE;
    expect(co2Saved).toBe(250);
  });
});
