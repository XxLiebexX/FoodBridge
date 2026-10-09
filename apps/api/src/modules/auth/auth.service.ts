import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { createAuditLog } from '../../middleware/audit';
import { UserRole, OrganizationType, VerificationStatus } from '@foodbridge/shared';

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    organizationName?: string;
    organizationType?: OrganizationType;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    vehicleType?: string;
    maxCapacityKg?: number;
  }, ipAddress?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Initial verification: Donors are verified by default; NGOs start as PENDING for admin review
    const isVerified = data.role === UserRole.NGO ? false : true;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          phone: data.phone,
          role: data.role,
          isVerified
        }
      });

      let orgId: string | null = null;

      if ([UserRole.DONOR, UserRole.NGO].includes(data.role) && data.organizationName) {
        const org = await tx.organization.create({
          data: {
            name: data.organizationName,
            type: data.organizationType || (data.role === UserRole.DONOR ? OrganizationType.RESTAURANT : OrganizationType.NGO_SHELTER),
            address: data.address || 'Delhi NCR',
            city: data.city || 'Delhi',
            latitude: data.latitude || 28.6139,
            longitude: data.longitude || 77.2090,
            phone: data.phone,
            email: data.email.toLowerCase(),
            verifiedStatus: data.role === UserRole.NGO ? VerificationStatus.PENDING : VerificationStatus.VERIFIED
          }
        });

        orgId = org.id;

        await tx.organizationMember.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            roleInOrg: 'ADMIN'
          }
        });

        if (data.role === UserRole.DONOR) {
          await tx.donorProfile.create({
            data: {
              organizationId: org.id,
              businessType: data.organizationType || 'Restaurant',
              typicalDailySurplusKg: 20
            }
          });
        } else if (data.role === UserRole.NGO) {
          await tx.nGOProfile.create({
            data: {
              organizationId: org.id,
              capacityPeople: 100,
              dailyMealsCapacity: 250,
              serviceRadiusKm: 15.0
            }
          });
        }
      } else if (data.role === UserRole.VOLUNTEER) {
        await tx.volunteerProfile.create({
          data: {
            userId: user.id,
            vehicleType: data.vehicleType || 'TWO_WHEELER',
            maxCapacityKg: data.maxCapacityKg || 25
          }
        });
      }

      return { user, orgId };
    });

    await createAuditLog({
      userId: result.user.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: result.user.id,
      details: { role: data.role, email: data.email },
      ipAddress
    });

    const tokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      organizationId: result.orgId
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        isVerified: result.user.isVerified,
        organizationId: result.orgId
      },
      accessToken,
      refreshToken
    };
  }

  static async login(email: string, pass: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          include: { organization: true }
        }
      }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('This account has been suspended by administration', 403, 'ACCOUNT_SUSPENDED');
    }

    const isValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const orgId = user.memberships[0]?.organizationId || null;
    const org = user.memberships[0]?.organization || null;

    await createAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: orgId
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        organizationId: orgId,
        organization: org
      },
      accessToken,
      refreshToken
    };
  }

  static async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          memberships: true
        }
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or suspended', 401, 'UNAUTHORIZED');
      }

      const orgId = user.memberships[0]?.organizationId || null;
      const newPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: orgId
      };

      const accessToken = generateAccessToken(newPayload);
      const refreshToken = generateRefreshToken(newPayload);

      return { accessToken, refreshToken };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                donorProfile: true,
                ngoProfile: true
              }
            }
          }
        },
        volunteerProfile: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const { passwordHash, ...userClean } = user;
    return userClean;
  }
}
