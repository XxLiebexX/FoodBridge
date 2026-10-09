import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { createAuditLog } from '../../middleware/audit';
import { VerificationStatus } from '@foodbridge/shared';

export class AdminService {
  static async getUsers(filters: { role?: string; isActive?: boolean; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } }
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: {
            include: { organization: true }
          },
          volunteerProfile: true
        }
      })
    ]);

    const sanitized = users.map(({ passwordHash, ...u }) => u);

    return {
      users: sanitized,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async toggleUserStatus(userId: string, isActive: boolean, adminUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });

    await createAuditLog({
      userId: adminUserId,
      action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entityType: 'USER',
      entityId: userId,
      details: { email: user.email }
    });

    const { passwordHash, ...clean } = updated;
    return clean;
  }

  static async getOrganizations(filters: { verifiedStatus?: string; type?: string; search?: string }) {
    const where: any = {};
    if (filters.verifiedStatus) where.verifiedStatus = filters.verifiedStatus;
    if (filters.type) where.type = filters.type;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { city: { contains: filters.search } }
      ];
    }

    return prisma.organization.findMany({
      where,
      include: {
        ngoProfile: true,
        donorProfile: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } }
          }
        },
        _count: {
          select: { donations: true, demands: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateOrgVerification(orgId: string, status: VerificationStatus, adminUserId: string) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: { verifiedStatus: status }
    });

    // Notify organization members
    const members = await prisma.organizationMember.findMany({ where: { organizationId: orgId } });
    for (const m of members) {
      await prisma.notification.create({
        data: {
          userId: m.userId,
          title: status === VerificationStatus.VERIFIED ? 'Organization Verified! ✅' : 'Verification Status Updated',
          message: status === VerificationStatus.VERIFIED
            ? `Congratulations! ${org.name} has been verified by the FoodBridge AI team. You can now accept surplus donations.`
            : `Your verification status for ${org.name} has been set to ${status}.`,
          type: 'SYSTEM'
        }
      });
    }

    await createAuditLog({
      userId: adminUserId,
      action: `ORG_VERIFICATION_${status}`,
      entityType: 'ORGANIZATION',
      entityId: orgId,
      details: { orgName: org.name, status }
    });

    return updated;
  }

  static async getAuditLogs(filters: { action?: string; entityType?: string; page?: number; limit?: number }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        }
      })
    ]);

    return {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async exportReport(type: 'donations' | 'impact' | 'ngos' | 'donors'): Promise<string> {
    if (type === 'donations') {
      const donations = await prisma.foodDonation.findMany({
        include: { donorOrg: true, donor: true }
      });
      const headers = ['ID', 'Food Name', 'Category', 'Quantity (kg)', 'Estimated Meals', 'Status', 'Donor Org', 'Donor Email', 'Consume Before', 'Created At'];
      const rows = donations.map(d => [
        d.id,
        `"${d.foodName.replace(/"/g, '""')}"`,
        d.category,
        d.quantity,
        d.estimatedMeals,
        d.status,
        `"${(d.donorOrg?.name || d.donor.name).replace(/"/g, '""')}"`,
        d.donor.email,
        d.consumeBefore.toISOString(),
        d.createdAt.toISOString()
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (type === 'ngos') {
      const ngos = await prisma.organization.findMany({
        where: { type: { in: ['NGO_SHELTER', 'ORPHANAGE', 'COMMUNITY_KITCHEN', 'OLD_AGE_HOME'] } },
        include: { ngoProfile: true }
      });
      const headers = ['ID', 'Name', 'City', 'Verification Status', 'Phone', 'Email', 'People Served', 'Daily Meals Capacity'];
      const rows = ngos.map(n => [
        n.id,
        `"${n.name.replace(/"/g, '""')}"`,
        n.city,
        n.verifiedStatus,
        n.phone,
        n.email,
        n.ngoProfile?.capacityPeople || 0,
        n.ngoProfile?.dailyMealsCapacity || 0
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    // Default / Donors
    const donors = await prisma.organization.findMany({
      where: { type: { in: ['RESTAURANT', 'HOSTEL_MESS', 'CAFETERIA', 'EVENT_ORGANIZER'] } },
      include: { donorProfile: true }
    });
    const headers = ['ID', 'Name', 'Type', 'City', 'Status', 'Phone', 'Email', 'Typical Daily Surplus (kg)'];
    const rows = donors.map(d => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      d.type,
      d.city,
      d.verifiedStatus,
      d.phone,
      d.email,
      d.donorProfile?.typicalDailySurplusKg || 0
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
