import { z } from 'zod';
import {
  UserRole,
  OrganizationType,
  FoodCategory,
  DietaryType,
  PackagingStatus,
  QuantityUnit,
  UrgencyLevel
} from './types';

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  role: z.nativeEnum(UserRole),
  organizationName: z.string().min(2, 'Organization name is required').optional(),
  organizationType: z.nativeEnum(OrganizationType).optional(),
  address: z.string().min(5, 'Address is required').optional(),
  city: z.string().min(2, 'City is required').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Volunteer specifics
  vehicleType: z.string().optional(),
  maxCapacityKg: z.number().positive().optional()
});

export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const CreateDonationSchema = z.object({
  foodName: z.string().min(3, 'Food item name must be at least 3 characters'),
  category: z.nativeEnum(FoodCategory),
  quantity: z.number().positive('Quantity must be greater than zero'),
  quantityUnit: z.nativeEnum(QuantityUnit).default(QuantityUnit.KG),
  vegType: z.nativeEnum(DietaryType),
  allergens: z.array(z.string()).default([]),
  preparationTime: z.string().or(z.date()),
  availableFrom: z.string().or(z.date()),
  consumeBefore: z.string().or(z.date()),
  packagingStatus: z.nativeEnum(PackagingStatus),
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  imageUrl: z.string().optional(),
  specialInstructions: z.string().optional()
}).refine((data) => {
  const consume = new Date(data.consumeBefore).getTime();
  const available = new Date(data.availableFrom).getTime();
  return consume > available;
}, {
  message: 'Consume-before time must be strictly after available-from time',
  path: ['consumeBefore']
});

export const CreateNGODemandSchema = z.object({
  foodCategory: z.nativeEnum(FoodCategory),
  requestedQuantity: z.number().positive('Requested quantity must be positive'),
  requestedUnit: z.nativeEnum(QuantityUnit).default(QuantityUnit.KG),
  urgency: z.nativeEnum(UrgencyLevel).default(UrgencyLevel.MEDIUM),
  requiredBefore: z.string().or(z.date())
});

export const UpdateDeliverySchema = z.object({
  receiverName: z.string().min(2, 'Receiver name is required'),
  deliveredQuantity: z.number().positive('Delivered quantity must be greater than 0'),
  proofImageUrl: z.string().optional(),
  deliveryNotes: z.string().optional()
});

export const AcceptDonationSchema = z.object({
  donationId: z.string()
});
