import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body, req.ip);
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Account registered successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password, req.ip);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Logged in successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      return res.status(200).json({
        success: true,
        data: user,
        message: 'User profile fetched'
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully'
    });
  }
}
