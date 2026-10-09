import { Request, Response, NextFunction } from 'express';
import { ImpactService } from './impact.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export class ImpactController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await ImpactService.getPlatformImpactOverview();
      return res.status(200).json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  }

  static async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await ImpactService.getTrends();
      return res.status(200).json({ success: true, data: trends });
    } catch (err) {
      next(err);
    }
  }

  static async getLeaderboards(req: Request, res: Response, next: NextFunction) {
    try {
      const leaderboards = await ImpactService.getLeaderboards();
      return res.status(200).json({ success: true, data: leaderboards });
    } catch (err) {
      next(err);
    }
  }

  static async getUserBadges(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const badges = await ImpactService.getUserBadges(req.user!.userId);
      return res.status(200).json({ success: true, data: badges });
    } catch (err) {
      next(err);
    }
  }
}
