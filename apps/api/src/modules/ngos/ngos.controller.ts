import { Request, Response, NextFunction } from 'express';
import { NGOService } from './ngos.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export class NGOController {
  static async getNGOs(req: Request, res: Response, next: NextFunction) {
    try {
      const { verifiedStatus, city } = req.query;
      const ngos = await NGOService.getNGOs({
        verifiedStatus: verifiedStatus as string,
        city: city as string
      });
      return res.status(200).json({ success: true, data: ngos });
    } catch (err) {
      next(err);
    }
  }

  static async getNearbyNGOs(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const radiusKm = req.query.radius ? parseFloat(req.query.radius as string) : 20;

      if (isNaN(lat) || isNaN(lon)) {
        throw new AppError('Valid lat and lon query parameters required', 400);
      }

      const ngos = await NGOService.getNearbyNGOs(lat, lon, radiusKm);
      return res.status(200).json({ success: true, data: ngos });
    } catch (err) {
      next(err);
    }
  }

  static async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ngoOrgId = req.user?.organizationId || (req.query.ngoOrgId as string);
      if (!ngoOrgId) {
        throw new AppError('NGO organization identifier required', 400);
      }
      const recommendations = await NGOService.getRecommendedDonations(ngoOrgId);
      return res.status(200).json({ success: true, data: recommendations });
    } catch (err) {
      next(err);
    }
  }

  static async createDemand(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ngoOrgId = req.user?.organizationId || req.body.ngoOrgId;
      if (!ngoOrgId) {
        throw new AppError('NGO organization identifier required', 400);
      }
      const demand = await NGOService.createDemand(ngoOrgId, req.body);
      return res.status(201).json({ success: true, data: demand, message: 'Demand posted successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async getDemands(req: Request, res: Response, next: NextFunction) {
    try {
      const ngoOrgId = req.query.ngoOrgId as string;
      const demands = await NGOService.getDemands(ngoOrgId);
      return res.status(200).json({ success: true, data: demands });
    } catch (err) {
      next(err);
    }
  }

  static async acceptDonation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { donationId } = req.params;
      const ngoOrgId = req.user?.organizationId || req.body.ngoOrgId;
      if (!ngoOrgId) {
        throw new AppError('NGO organization identifier required', 400);
      }
      const result = await NGOService.acceptDonation(ngoOrgId, donationId, req.user!.userId, req.ip);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Donation accepted! Pickup and delivery assignment created.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async rejectDonation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { donationId } = req.params;
      const ngoOrgId = req.user?.organizationId || req.body.ngoOrgId;
      if (!ngoOrgId) {
        throw new AppError('NGO organization identifier required', 400);
      }
      await NGOService.rejectDonation(ngoOrgId, donationId);
      return res.status(200).json({ success: true, message: 'Donation declined' });
    } catch (err) {
      next(err);
    }
  }
}
