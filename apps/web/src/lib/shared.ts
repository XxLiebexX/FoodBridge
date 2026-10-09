export enum UserRole {
  DONOR = 'DONOR',
  NGO = 'NGO',
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN'
}

export enum FoodCategory {
  COOKED_MEALS = 'COOKED_MEALS',
  RAW_PRODUCE = 'RAW_PRODUCE',
  BAKERY = 'BAKERY',
  PACKAGED_GOODS = 'PACKAGED_GOODS',
  DAIRY = 'DAIRY',
  BEVERAGES = 'BEVERAGES'
}

export enum DietaryType {
  VEGETARIAN = 'VEGETARIAN',
  NON_VEGETARIAN = 'NON_VEGETARIAN',
  VEGAN = 'VEGAN'
}

export enum PackagingStatus {
  SEALED_CONTAINERS = 'SEALED_CONTAINERS',
  BULK_TRAYS = 'BULK_TRAYS',
  INDIVIDUAL_PACKS = 'INDIVIDUAL_PACKS',
  UNPACKAGED = 'UNPACKAGED'
}

export enum QuantityUnit {
  KG = 'KG',
  LITERS = 'LITERS',
  PACKETS = 'PACKETS',
  TRAYS = 'TRAYS'
}

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export const MEAL_CONVERSION_FACTORS: Record<FoodCategory, number> = {
  [FoodCategory.COOKED_MEALS]: 2.5,
  [FoodCategory.RAW_PRODUCE]: 3.0,
  [FoodCategory.BAKERY]: 4.0,
  [FoodCategory.PACKAGED_GOODS]: 2.0,
  [FoodCategory.DAIRY]: 3.5,
  [FoodCategory.BEVERAGES]: 2.0
};

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
