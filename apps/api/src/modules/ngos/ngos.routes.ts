import { Router } from 'express';
import { NGOController } from './ngos.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/requestValidator';
import { CreateNGODemandSchema, UserRole } from '@foodbridge/shared';

const router = Router();

router.get('/', NGOController.getNGOs);
router.get('/nearby', NGOController.getNearbyNGOs);
router.get('/recommendations', requireAuth, requireRole([UserRole.NGO, UserRole.ADMIN]), NGOController.getRecommendations);
router.get('/demands', NGOController.getDemands);
router.post(
  '/demands',
  requireAuth,
  requireRole([UserRole.NGO, UserRole.ADMIN]),
  validateBody(CreateNGODemandSchema),
  NGOController.createDemand
);
router.post(
  '/donations/:donationId/accept',
  requireAuth,
  requireRole([UserRole.NGO, UserRole.ADMIN]),
  NGOController.acceptDonation
);
router.post(
  '/donations/:donationId/reject',
  requireAuth,
  requireRole([UserRole.NGO, UserRole.ADMIN]),
  NGOController.rejectDonation
);

export const ngoRoutes = router;
