import { prisma } from '../lib/prisma';

export async function createAuditLog(params: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        detailsJson: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || null
      }
    });
  } catch (err) {
    console.error('Failed to create audit log entry:', err);
  }
}
