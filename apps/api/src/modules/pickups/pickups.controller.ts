import { Request, Response, NextFunction } from 'express';
import { PickupsService } from './pickups.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export class PickupsController {
  static async getAvailable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const volunteerId = req.user?.role === 'VOLUNTEER' ? req.user.userId : undefined;
      const pickups = await PickupsService.getAvailablePickups(volunteerId);
      return res.status(200).json({ success: true, data: pickups });
    } catch (err) {
      next(err);
    }
  }

  static async acceptPickup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pickup = await PickupsService.acceptPickup(id, req.user!.userId, req.ip);
      return res.status(200).json({
        success: true,
        data: pickup,
        message: 'Pickup assignment accepted'
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const pickup = await PickupsService.updatePickupStatus(id, status, notes, req.user?.userId);
      return res.status(200).json({
        success: true,
        data: pickup,
        message: `Pickup status updated to ${status}`
      });
    } catch (err) {
      next(err);
    }
  }

  static async completeDelivery(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const delivery = await PickupsService.completeDelivery(id, req.body, req.user?.userId, req.ip);
      return res.status(200).json({
        success: true,
        data: delivery,
        message: 'Delivery marked as completed successfully!'
      });
    } catch (err) {
      next(err);
    }
  }
}
