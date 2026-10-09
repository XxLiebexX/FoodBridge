import { FoodCategory, QuantityUnit } from './types';

// Meal conversion factors (how many individual meals 1 unit of category yields)
export const MEAL_CONVERSION_FACTORS: Record<FoodCategory, number> = {
  [FoodCategory.COOKED_MEALS]: 2.5, // 1 kg cooked meals ~ 2.5 standard meal portions
  [FoodCategory.RAW_PRODUCE]: 3.0,  // 1 kg raw produce ~ 3.0 meals when cooked
  [FoodCategory.BAKERY]: 4.0,       // 1 kg bakery items ~ 4 meals/servings
  [FoodCategory.PACKAGED_GOODS]: 2.0,// 1 kg packaged dry rations ~ 2 meals
  [FoodCategory.DAIRY]: 3.5,        // 1 liter / kg dairy ~ 3.5 servings
  [FoodCategory.BEVERAGES]: 2.0     // 1 liter beverage ~ 2 servings
};

// CO2 emission factor: kg CO2 equivalent saved per kg food waste prevented
export const CO2_SAVED_PER_KG_WASTE = 2.5;

// Matching algorithm factor weights
export const MATCH_WEIGHTS = {
  DISTANCE: 0.20,
  QUANTITY: 0.20,
  FOOD_COMPATIBILITY: 0.20,
  URGENCY: 0.15,
  EXPIRY: 0.15,
  CAPACITY: 0.10
} as const;

export const DEFAULT_SERVICE_RADIUS_KM = 15;
export const MAX_MATCH_RADIUS_KM = 30;

export const ALLERGEN_OPTIONS = [
  'Gluten / Wheat',
  'Dairy / Milk',
  'Nuts / Peanuts',
  'Soy',
  'Eggs',
  'Mustard',
  'Sesame',
  'None'
];
