export enum UserRole {
  DONOR = 'DONOR',
  NGO = 'NGO',
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN'
}

export enum OrganizationType {
  RESTAURANT = 'RESTAURANT',
  HOSTEL_MESS = 'HOSTEL_MESS',
  CAFETERIA = 'CAFETERIA',
  EVENT_ORGANIZER = 'EVENT_ORGANIZER',
  NGO_SHELTER = 'NGO_SHELTER',
  ORPHANAGE = 'ORPHANAGE',
  COMMUNITY_KITCHEN = 'COMMUNITY_KITCHEN',
  OLD_AGE_HOME = 'OLD_AGE_HOME'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
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

export enum DonationStatus {
  AVAILABLE = 'AVAILABLE',
  MATCHED = 'MATCHED',
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  PICKUP_ASSIGNED = 'PICKUP_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum PickupStatus {
  ASSIGNED = 'ASSIGNED',
  ON_WAY_TO_PICKUP = 'ON_WAY_TO_PICKUP',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED'
}

export enum DeliveryStatus {
  ON_WAY_TO_DESTINATION = 'ON_WAY_TO_DESTINATION',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

export enum NotificationType {
  DONATION_AVAILABLE = 'DONATION_AVAILABLE',
  DONATION_MATCHED = 'DONATION_MATCHED',
  DONATION_ACCEPTED = 'DONATION_ACCEPTED',
  PICKUP_ASSIGNED = 'PICKUP_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  DONATION_EXPIRED = 'DONATION_EXPIRED',
  SYSTEM = 'SYSTEM'
}

export interface MatchScoreBreakdown {
  score: number; // 0 - 100
  distanceScore: number; // 0 - 100
  quantityScore: number; // 0 - 100
  foodCompatibilityScore: number; // 0 - 100
  urgencyScore: number; // 0 - 100
  expiryScore: number; // 0 - 100
  capacityScore: number; // 0 - 100
  distanceKm: number;
  recommendationReason: string;
}

export interface SurplusPredictionInput {
  restaurant_type: string;
  day_of_week: number;
  month: number;
  food_category: string;
  expected_customers: number;
  has_event: boolean;
  is_holiday: boolean;
}

export interface SurplusPredictionResult {
  predicted_surplus_kg: number;
  expected_range: {
    min_kg: number;
    max_kg: number;
  };
  confidence_score: number;
  explanation: string;
}

export interface DemandPredictionInput {
  ngo_type: string;
  people_served: number;
  day_of_week: number;
  food_category: string;
  is_weekend: boolean;
  has_scheduled_distribution: boolean;
}

export interface DemandPredictionResult {
  predicted_demand_kg: number;
  predicted_meals: number;
  confidence_score: number;
  category_breakdown: Record<string, number>;
  explanation: string;
}
