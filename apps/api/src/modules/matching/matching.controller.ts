import { Request, Response, NextFunction } from 'express';
import { MatchingService } from './matching.service';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class MatchingController {
  static async calculateMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const { donationId } = req.params;
      const matches = await MatchingService.calculateMatchesForDonation(donationId);
      return res.status(200).json({
        success: true,
        data: matches,
        message: `Found ${matches.length} AI-matched NGOs`
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMatchesForDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const { donationId } = req.params;
      let matches = await prisma.donationMatch.findMany({
        where: { donationId },
        include: {
          ngoOrg: {
            include: { ngoProfile: true }
          }
        },
        orderBy: { score: 'desc' }
      });

      // If no matches yet, trigger calculation on the fly
      if (matches.length === 0) {
        matches = await MatchingService.calculateMatchesForDonation(donationId);
      }

      return res.status(200).json({
        success: true,
        data: matches
      });
    } catch (err) {
      next(err);
    }
  }
}
