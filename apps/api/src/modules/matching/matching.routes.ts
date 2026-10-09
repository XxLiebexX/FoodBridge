import { Router } from 'express';
import { MatchingController } from './matching.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.post('/donations/:donationId/calculate', requireAuth, MatchingController.calculateMatches);
router.get('/donations/:donationId', requireAuth, MatchingController.getMatchesForDonation);

export const matchingRoutes = router;
