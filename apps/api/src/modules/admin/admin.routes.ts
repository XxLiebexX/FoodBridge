import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { UserRole } from '@foodbridge/shared';

const router = Router();

// Restrict entire admin router to ADMIN
router.use(requireAuth);
router.use(requireRole([UserRole.ADMIN]));

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.get('/organizations', AdminController.getOrganizations);
router.patch('/organizations/:id/verify', AdminController.updateOrgVerification);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/export/:type', AdminController.exportReport);

export const adminRoutes = router;
