import { Router } from 'express';
import { DonationsController } from './donations.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/requestValidator';
import { CreateDonationSchema, UserRole } from '@foodbridge/shared';

const router = Router();

router.get('/', DonationsController.getDonations);
router.get('/stats', requireAuth, DonationsController.getDonorStats);
router.get('/:id', DonationsController.getDonationById);
router.post(
  '/',
  requireAuth,
  requireRole([UserRole.DONOR, UserRole.ADMIN]),
  validateBody(CreateDonationSchema),
  DonationsController.createDonation
);
router.patch(
  '/:id/cancel',
  requireAuth,
  DonationsController.cancelDonation
);

export const donationRoutes = router;
