import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';

export class AIController {
  static async predictSurplus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AIService.predictSurplus(req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async predictDemand(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AIService.predictDemand(req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AIService.getModelMetrics();
      return res.status(200).json({ success: true, data: metrics });
    } catch (err) {
      next(err);
    }
  }

  static async getForecasts(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const forecasts = await AIService.getForecastTrends(days);
      return res.status(200).json({ success: true, data: forecasts });
    } catch (err) {
      next(err);
    }
  }
}
