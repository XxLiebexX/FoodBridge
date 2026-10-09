import { Router } from 'express';
import { AIController } from './ai.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.post('/predict/surplus', requireAuth, AIController.predictSurplus);
router.post('/predict/demand', requireAuth, AIController.predictDemand);
router.get('/metrics', AIController.getMetrics);
router.get('/forecasts', requireAuth, AIController.getForecasts);

export const aiRoutes = router;
