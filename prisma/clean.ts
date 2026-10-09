import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clean() {
  console.log('🧹 Purging all sample and mock data from FoodBridge database...');

  // 1. Wipe all operational tables
  await prisma.review.deleteMany({});
  await prisma.issueReport.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.pickup.deleteMany({});
  await prisma.donationRequest.deleteMany({});
  await prisma.donationMatch.deleteMany({});
  await prisma.nGODemand.deleteMany({});
  await prisma.foodDonation.deleteMany({});
  await prisma.donorProfile.deleteMany({});
  await prisma.nGOProfile.deleteMany({});
  await prisma.volunteerProfile.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✨ All donations, matches, pickups, deliveries, demands, logs & reviews purged (0 remaining).');

  // 2. Setup clean core accounts for real operation
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const defaultPassword = await bcrypt.hash('Password@123', 10);

  // Admin Account
  await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@foodbridge.ai',
      passwordHash: adminPassword,
      phone: '+919811000001',
      role: 'ADMIN',
      isVerified: true
    }
  });

  // Clean Donor Account (0 donations)
  const donorUser = await prisma.user.create({
    data: {
      name: 'Restaurant Partner',
      email: 'donor@foodbridge.ai',
      passwordHash: defaultPassword,
      phone: '+919811000002',
      role: 'DONOR',
      isVerified: true
    }
  });

  const donorOrg = await prisma.organization.create({
    data: {
      name: 'FoodBridge Partner Kitchen',
      type: 'RESTAURANT',
      address: 'Connaught Place, Central Delhi',
      city: 'Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      phone: '+919811000002',
      email: 'donor@foodbridge.ai',
      verifiedStatus: 'VERIFIED'
    }
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: donorOrg.id,
      userId: donorUser.id,
      roleInOrg: 'ADMIN'
    }
  });

  await prisma.donorProfile.create({
    data: {
      organizationId: donorOrg.id,
      businessType: 'Restaurant',
      typicalDailySurplusKg: 0
    }
  });

  // Clean NGO Account (0 demands, 0 accepted donations)
  const ngoUser = await prisma.user.create({
    data: {
      name: 'Shelter Coordinator',
      email: 'ngo@foodbridge.ai',
      passwordHash: defaultPassword,
      phone: '+919811000003',
      role: 'NGO',
      isVerified: true
    }
  });

  const ngoOrg = await prisma.organization.create({
    data: {
      name: 'FoodBridge Shelter Home',
      type: 'COMMUNITY_KITCHEN',
      address: 'Hauz Khas, South Delhi',
      city: 'Delhi',
      latitude: 28.5450,
      longitude: 77.1926,
      phone: '+919811000003',
      email: 'ngo@foodbridge.ai',
      verifiedStatus: 'VERIFIED'
    }
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: ngoOrg.id,
      userId: ngoUser.id,
      roleInOrg: 'ADMIN'
    }
  });

  await prisma.nGOProfile.create({
    data: {
      organizationId: ngoOrg.id,
      capacityPeople: 100,
      dailyMealsCapacity: 250,
      serviceRadiusKm: 15.0,
      dietaryPreferences: 'ANY',
      refrigerationAvailable: true
    }
  });

  // Clean Volunteer Account (0 deliveries)
  const volUser = await prisma.user.create({
    data: {
      name: 'Volunteer Courier',
      email: 'volunteer@foodbridge.ai',
      passwordHash: defaultPassword,
      phone: '+919811000004',
      role: 'VOLUNTEER',
      isVerified: true
    }
  });

  await prisma.volunteerProfile.create({
    data: {
      userId: volUser.id,
      vehicleType: 'TWO_WHEELER',
      maxCapacityKg: 30.0,
      isAvailable: true,
      totalDeliveries: 0,
      activeDeliveriesCount: 0
    }
  });

  console.log('✅ Database is completely clean and ready for real data:');
  console.log(' - Total Donations: 0');
  console.log(' - Total Demands: 0');
  console.log(' - Total Deliveries: 0');
  console.log(' - Total Rescued kg: 0 kg');
  console.log(' - Clean accounts initialized (admin, donor, ngo, volunteer).');
}

clean()
  .catch((e) => {
    console.error('Clean error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
