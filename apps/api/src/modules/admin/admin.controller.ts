import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { VerificationStatus } from '@foodbridge/shared';

export class AdminController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, isActive, search, page, limit } = req.query;
      const result = await AdminService.getUsers({
        role: role as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20
      });
      return res.status(200).json({ success: true, data: result.users, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  static async toggleUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = await AdminService.toggleUserStatus(id, isActive, req.user!.userId);
      return res.status(200).json({ success: true, data: updated, message: `User status changed` });
    } catch (err) {
      next(err);
    }
  }

  static async getOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const { verifiedStatus, type, search } = req.query;
      const orgs = await AdminService.getOrganizations({
        verifiedStatus: verifiedStatus as string,
        type: type as string,
        search: search as string
      });
      return res.status(200).json({ success: true, data: orgs });
    } catch (err) {
      next(err);
    }
  }

  static async updateOrgVerification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await AdminService.updateOrgVerification(id, status as VerificationStatus, req.user!.userId);
      return res.status(200).json({
        success: true,
        data: updated,
        message: `Organization verification status updated to ${status}`
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, entityType, page, limit } = req.query;
      const result = await AdminService.getAuditLogs({
        action: action as string,
        entityType: entityType as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 25
      });
      return res.status(200).json({ success: true, data: result.logs, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  static async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type || 'donations') as 'donations' | 'impact' | 'ngos' | 'donors';
      const csv = await AdminService.exportReport(type);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=foodbridge_${type}_report_${Date.now()}.csv`);
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}
