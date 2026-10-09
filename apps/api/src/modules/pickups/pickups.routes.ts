import { Router } from 'express';
import { PickupsController } from './pickups.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/requestValidator';
import { UpdateDeliverySchema, UserRole } from '@foodbridge/shared';

const router = Router();

router.get('/available', requireAuth, PickupsController.getAvailable);
router.post('/:id/accept', requireAuth, requireRole([UserRole.VOLUNTEER, UserRole.ADMIN]), PickupsController.acceptPickup);
router.patch('/:id/status', requireAuth, requireRole([UserRole.VOLUNTEER, UserRole.ADMIN]), PickupsController.updateStatus);
router.post(
  '/deliveries/:id/complete',
  requireAuth,
  requireRole([UserRole.VOLUNTEER, UserRole.ADMIN]),
  validateBody(UpdateDeliverySchema),
  PickupsController.completeDelivery
);

export const pickupRoutes = router;
