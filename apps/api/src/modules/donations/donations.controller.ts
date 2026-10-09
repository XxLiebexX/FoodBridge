import { Request, Response, NextFunction } from 'express';
import { DonationsService } from './donations.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export class DonationsController {
  static async createDonation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const donorOrgId = req.user?.organizationId || req.body.donorOrgId;
      const result = await DonationsService.createDonation(
        req.user!.userId,
        { ...req.body, donorOrgId },
        req.ip
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Donation created successfully and AI matches calculated'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDonations(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as string,
        vegType: req.query.vegType as string,
        status: req.query.status as string,
        donorOrgId: req.query.donorOrgId as string,
        donorId: req.query.donorId as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      };
      const result = await DonationsService.getDonations(filters);
      return res.status(200).json({
        success: true,
        data: result.donations,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDonationById(req: Request, res: Response, next: NextFunction) {
    try {
      const donation = await DonationsService.getDonationById(req.params.id);
      return res.status(200).json({
        success: true,
        data: donation
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancelDonation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await DonationsService.cancelDonation(req.params.id, req.user!.userId, req.ip);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Donation cancelled successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDonorStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const donorOrgId = req.user?.organizationId || (req.query.orgId as string);
      const donorId = req.user?.userId;
      const stats = await DonationsService.getDonorStats(donorOrgId, donorId);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
}
