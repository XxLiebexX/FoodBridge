import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt';
import { AppError } from './errorHandler';
import { prisma } from '../lib/prisma';
import { UserRole } from '@foodbridge/shared';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    fullUser?: any;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token missing or invalid', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify user is still active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: {
          include: { organization: true }
        }
      }
    });

    if (!user || !user.isActive) {
      throw new AppError('User account not found or suspended', 401, 'ACCOUNT_INACTIVE');
    }

    const orgId = user.memberships[0]?.organizationId || null;

    req.user = {
      ...payload,
      organizationId: orgId,
      fullUser: user
    };

    next();
  } catch (err: any) {
    if (err instanceof AppError) {
      return next(err);
    }
    return next(new AppError('Invalid or expired authentication token', 401, 'TOKEN_EXPIRED'));
  }
}

export function requireRole(allowedRoles: UserRole[] | string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized access', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(new AppError(`Forbidden: Role '${req.user.role}' lacks permission`, 403, 'FORBIDDEN'));
    }

    next();
  };
}
