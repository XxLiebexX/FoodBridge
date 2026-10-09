import { Router } from 'express';
import { ImpactController } from './impact.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.get('/overview', ImpactController.getOverview);
router.get('/trends', ImpactController.getTrends);
router.get('/leaderboards', ImpactController.getLeaderboards);
router.get('/badges', requireAuth, ImpactController.getUserBadges);

export const impactRoutes = router;
