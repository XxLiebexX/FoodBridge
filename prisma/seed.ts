import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FoodBridge AI database seed with Delhi NCR data...');

  // Clean existing tables in proper order
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

  const defaultPassword = await bcrypt.hash('Password@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Create Platform Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Anita Desai',
      email: 'admin@foodbridge.ai',
      passwordHash: adminPassword,
      phone: '+919811001122',
      role: 'ADMIN',
      isVerified: true
    }
  });
  console.log('✅ Admin user created: admin@foodbridge.ai');

  // 2. Create 10 Realistic Donors in Delhi NCR
  const donorsData = [
    {
      name: 'Rajesh Mehra',
      email: 'donor@haldirams.com',
      phone: '+919811223344',
      orgName: "Haldiram's Connaught Place",
      type: 'RESTAURANT',
      address: 'P-Block, Connaught Circus, Central Delhi',
      city: 'Delhi',
      lat: 28.6315,
      lon: 77.2167,
      surplusKg: 35
    },
    {
      name: 'Chef Sanjeev Kapur',
      email: 'donor@tajdelhi.com',
      phone: '+919811223345',
      orgName: 'Taj Palace Banquets & Dining',
      type: 'RESTAURANT',
      address: '2 Sardar Patel Marg, Diplomatic Enclave',
      city: 'Delhi',
      lat: 28.5950,
      lon: 77.1722,
      surplusKg: 50
    },
    {
      name: 'Prof. K. K. Sharma',
      email: 'mess@iitd.ac.in',
      phone: '+919811223346',
      orgName: 'IIT Delhi Central Hostel Mess',
      type: 'HOSTEL_MESS',
      address: 'Hauz Khas, South Delhi',
      city: 'Delhi',
      lat: 28.5450,
      lon: 77.1926,
      surplusKg: 75
    },
    {
      name: 'Vipin Aggarwal',
      email: 'donor@bikanervala.com',
      phone: '+919811223347',
      orgName: 'Bikanervala Sector 62',
      type: 'RESTAURANT',
      address: 'C-Block Commercial Complex, Sector 62',
      city: 'Noida',
      lat: 28.6280,
      lon: 77.3649,
      surplusKg: 30
    },
    {
      name: 'Rohan Mathur',
      email: 'events@grandoberoi.com',
      phone: '+919811223348',
      orgName: 'The Grand Ballroom Events',
      type: 'EVENT_ORGANIZER',
      address: 'Dr. Zakir Hussain Marg',
      city: 'Delhi',
      lat: 28.6015,
      lon: 77.2372,
      surplusKg: 90
    },
    {
      name: 'Meenakshi Iyer',
      email: 'manager@saravanabhavan.com',
      phone: '+919811223349',
      orgName: 'Saravana Bhavan Janpath',
      type: 'RESTAURANT',
      address: '46 Janpath Rd, Atul Grove Road',
      city: 'Delhi',
      lat: 28.6256,
      lon: 77.2185,
      surplusKg: 25
    },
    {
      name: 'Sunil Sethi',
      email: 'catering@cyberhub.com',
      phone: '+919811223350',
      orgName: 'Barbeque Nation Cyber Hub',
      type: 'RESTAURANT',
      address: 'DLF Cyber City, Phase 2',
      city: 'Gurugram',
      lat: 28.4952,
      lon: 77.0890,
      surplusKg: 45
    },
    {
      name: 'Dinesh Goel',
      email: 'cafeteria@amity.edu',
      phone: '+919811223351',
      orgName: 'Amity University Food Court',
      type: 'CAFETERIA',
      address: 'Sector 125',
      city: 'Noida',
      lat: 28.5447,
      lon: 77.3331,
      surplusKg: 60
    },
    {
      name: 'Harpreet Singh',
      email: 'donor@gulati.com',
      phone: '+919811223352',
      orgName: 'Gulati Restaurant Pandara Road',
      type: 'RESTAURANT',
      address: '6 Pandara Market, India Gate',
      city: 'Delhi',
      lat: 28.6058,
      lon: 77.2365,
      surplusKg: 35
    },
    {
      name: 'Anand Shrivastav',
      email: 'hostel@sharda.ac.in',
      phone: '+919811223353',
      orgName: 'Sharda University Hostel Cafeteria',
      type: 'HOSTEL_MESS',
      address: 'Knowledge Park III',
      city: 'Greater Noida',
      lat: 28.4727,
      lon: 77.4891,
      surplusKg: 70
    }
  ];

  const createdDonors: any[] = [];

  for (const d of donorsData) {
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        passwordHash: defaultPassword,
        phone: d.phone,
        role: 'DONOR',
        isVerified: true
      }
    });

    const org = await prisma.organization.create({
      data: {
        name: d.orgName,
        type: d.type,
        address: d.address,
        city: d.city,
        latitude: d.lat,
        longitude: d.lon,
        phone: d.phone,
        email: d.email,
        verifiedStatus: 'VERIFIED'
      }
    });

    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        roleInOrg: 'ADMIN'
      }
    });

    await prisma.donorProfile.create({
      data: {
        organizationId: org.id,
        businessType: d.type,
        typicalDailySurplusKg: d.surplusKg,
        operatingHours: '10:00 AM - 11:30 PM'
      }
    });

    createdDonors.push({ user, org });
  }
  console.log(`✅ Created ${createdDonors.length} Donors in Delhi NCR`);

  // 3. Create 10 Realistic NGOs & Food Shelters
  const ngosData = [
    {
      name: 'Sunita Narain',
      email: 'ngo@robinhoodarmy.org',
      phone: '+919822114401',
      orgName: 'Robin Hood Army Delhi South Hub',
      type: 'COMMUNITY_KITCHEN',
      address: 'Hauz Khas Village & Safdarjung Enclave',
      city: 'Delhi',
      lat: 28.5535,
      lon: 77.1950,
      capacityPeople: 250,
      dailyMeals: 500,
      serviceRadius: 18,
      diet: 'ANY'
    },
    {
      name: 'Anshu Gupta',
      email: 'relief@goonj.org',
      phone: '+919822114402',
      orgName: 'Goonj Community Food Initiative',
      type: 'COMMUNITY_KITCHEN',
      address: 'Madanpur Khadar, Sarita Vihar',
      city: 'Delhi',
      lat: 28.5300,
      lon: 77.3000,
      capacityPeople: 300,
      dailyMeals: 600,
      serviceRadius: 20,
      diet: 'ANY'
    },
    {
      name: 'Sister Mary Rose',
      email: 'director@ashadeep.org',
      phone: '+919822114403',
      orgName: 'Asha Deep Children Shelter',
      type: 'ORPHANAGE',
      address: 'Sector 19, Near Metro Station',
      city: 'Noida',
      lat: 28.5835,
      lon: 77.3245,
      capacityPeople: 85,
      dailyMeals: 180,
      serviceRadius: 12,
      diet: 'VEG_ONLY'
    },
    {
      name: 'Govinda Dasa',
      email: 'noida@akshayapatra.org',
      phone: '+919822114404',
      orgName: 'Akshaya Patra Mega Relief Kitchen',
      type: 'COMMUNITY_KITCHEN',
      address: 'B-Block, Sector 63',
      city: 'Noida',
      lat: 28.6250,
      lon: 77.3750,
      capacityPeople: 500,
      dailyMeals: 1200,
      serviceRadius: 25,
      diet: 'VEG_ONLY'
    },
    {
      name: 'Rahul Verma',
      email: 'contact@udayfoundation.org',
      phone: '+919822114405',
      orgName: 'Uday Foundation Hospital Food Support',
      type: 'NGO_SHELTER',
      address: 'Near AIIMS & Safdarjung Hospital, Ansari Nagar',
      city: 'Delhi',
      lat: 28.5672,
      lon: 77.2100,
      capacityPeople: 180,
      dailyMeals: 400,
      serviceRadius: 15,
      diet: 'ANY'
    },
    {
      name: 'Pradeep Chawla',
      email: 'care@kalyanashram.org',
      phone: '+919822114406',
      orgName: 'Kalyan Vriddh Ashram (Old Age Home)',
      type: 'OLD_AGE_HOME',
      address: 'C-Block, Vikaspuri',
      city: 'Delhi',
      lat: 28.6360,
      lon: 77.0750,
      capacityPeople: 60,
      dailyMeals: 140,
      serviceRadius: 10,
      diet: 'VEG_ONLY'
    },
    {
      name: 'Kiran Bedi Trust',
      email: 'help@navjyoti.org',
      phone: '+919822114407',
      orgName: 'Navjyoti Slum Rehabilitation Shelter',
      type: 'NGO_SHELTER',
      address: 'Karampura Community Center, West Delhi',
      city: 'Delhi',
      lat: 28.6600,
      lon: 77.1450,
      capacityPeople: 120,
      dailyMeals: 260,
      serviceRadius: 12,
      diet: 'ANY'
    },
    {
      name: 'Aakash Bhatt',
      email: 'delhi@feedingindia.org',
      phone: '+919822114408',
      orgName: 'Feeding India Gurugram Distribution Hub',
      type: 'COMMUNITY_KITCHEN',
      address: 'Sector 29 Leisure Valley Road',
      city: 'Gurugram',
      lat: 28.4682,
      lon: 77.0620,
      capacityPeople: 220,
      dailyMeals: 450,
      serviceRadius: 16,
      diet: 'ANY'
    },
    {
      name: 'Renu Khurana',
      email: 'shelter@prathamdelhi.org',
      phone: '+919822114409',
      orgName: 'Pratham Urban Slum Food Center',
      type: 'NGO_SHELTER',
      address: 'Seelampur G.T. Road, North East Delhi',
      city: 'Delhi',
      lat: 28.6685,
      lon: 77.2680,
      capacityPeople: 140,
      dailyMeals: 300,
      serviceRadius: 15,
      diet: 'ANY'
    },
    {
      name: 'Devender Rawat',
      email: 'relief@greaternoida-seva.org',
      phone: '+919822114410',
      orgName: 'Greater Noida Seva Trust',
      type: 'NGO_SHELTER',
      address: 'Surajpur Industrial Area',
      city: 'Greater Noida',
      lat: 28.5100,
      lon: 77.4600,
      capacityPeople: 90,
      dailyMeals: 200,
      serviceRadius: 15,
      diet: 'ANY'
    }
  ];

  const createdNGOs: any[] = [];

  for (const n of ngosData) {
    const user = await prisma.user.create({
      data: {
        name: n.name,
        email: n.email,
        passwordHash: defaultPassword,
        phone: n.phone,
        role: 'NGO',
        isVerified: true
      }
    });

    const org = await prisma.organization.create({
      data: {
        name: n.orgName,
        type: n.type,
        address: n.address,
        city: n.city,
        latitude: n.lat,
        longitude: n.lon,
        phone: n.phone,
        email: n.email,
        verifiedStatus: 'VERIFIED'
      }
    });

    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        roleInOrg: 'ADMIN'
      }
    });

    await prisma.nGOProfile.create({
      data: {
        organizationId: org.id,
        capacityPeople: n.capacityPeople,
        dailyMealsCapacity: n.dailyMeals,
        serviceRadiusKm: n.serviceRadius,
        dietaryPreferences: n.diet,
        refrigerationAvailable: true
      }
    });

    // Create current active demand
    await prisma.nGODemand.create({
      data: {
        ngoOrgId: org.id,
        foodCategory: 'COOKED_MEALS',
        requestedQuantity: Math.round(n.dailyMeals * 0.4),
        requestedUnit: 'KG',
        urgency: 'HIGH',
        requiredBefore: new Date(Date.now() + 6 * 60 * 60 * 1000),
        status: 'ACTIVE'
      }
    });

    createdNGOs.push({ user, org });
  }
  console.log(`✅ Created ${createdNGOs.length} NGOs with active demand records`);

  // 4. Create 5 Volunteers
  const volunteersData = [
    { name: 'Amit Sharma', email: 'volunteer@delhicourier.com', phone: '+919911002201', vehicle: 'TWO_WHEELER', cap: 25 },
    { name: 'Priya Verma', email: 'priya.volunteer@gmail.com', phone: '+919911002202', vehicle: 'FOUR_WHEELER', cap: 60 },
    { name: 'Rahul Rajput', email: 'rahul.deliveries@gmail.com', phone: '+919911002203', vehicle: 'TWO_WHEELER', cap: 25 },
    { name: 'Vikram Singh', email: 'vikram.rescue@gmail.com', phone: '+919911002204', vehicle: 'VAN', cap: 150 },
    { name: 'Deepak Gupta', email: 'deepak.volunteer@gmail.com', phone: '+919911002205', vehicle: 'TWO_WHEELER', cap: 30 }
  ];

  const createdVolunteers: any[] = [];
  for (const v of volunteersData) {
    const user = await prisma.user.create({
      data: {
        name: v.name,
        email: v.email,
        passwordHash: defaultPassword,
        phone: v.phone,
        role: 'VOLUNTEER',
        isVerified: true
      }
    });

    await prisma.volunteerProfile.create({
      data: {
        userId: user.id,
        vehicleType: v.vehicle,
        maxCapacityKg: v.cap,
        isAvailable: true,
        totalDeliveries: 4
      }
    });

    createdVolunteers.push(user);
  }
  console.log(`✅ Created ${createdVolunteers.length} Active Volunteers`);

  // 5. Create 50 Food Donations across multiple statuses
  const foodItems = [
    { name: 'Dal Makhani & Jeera Rice', category: 'COOKED_MEALS', veg: 'VEGETARIAN', qty: 25, hours: 5 },
    { name: 'Paneer Butter Masala & Rotis', category: 'COOKED_MEALS', veg: 'VEGETARIAN', qty: 30, hours: 6 },
    { name: 'Mixed Vegetable Pulao & Raita', category: 'COOKED_MEALS', veg: 'VEGETARIAN', qty: 40, hours: 4 },
    { name: 'Assorted Sandwich Trays', category: 'BAKERY', veg: 'VEGETARIAN', qty: 15, hours: 8 },
    { name: 'Fresh Apples & Bananas Crates', category: 'RAW_PRODUCE', veg: 'VEGAN', qty: 50, hours: 48 },
    { name: 'Curd & Buttermilk Pouches', category: 'DAIRY', veg: 'VEGETARIAN', qty: 20, hours: 12 },
    { name: 'Chicken Biryani & Salan', category: 'COOKED_MEALS', veg: 'NON_VEGETARIAN', qty: 35, hours: 5 },
    { name: 'Pav Bhaji Trays', category: 'COOKED_MEALS', veg: 'VEGETARIAN', qty: 28, hours: 6 },
    { name: 'Whole Wheat Bread Loaves', category: 'BAKERY', veg: 'VEGAN', qty: 18, hours: 36 },
    { name: 'Steamed Idlis & Sambar', category: 'COOKED_MEALS', veg: 'VEGAN', qty: 22, hours: 5 }
  ];

  let donationCount = 0;
  let deliveryCount = 0;

  for (let i = 0; i < 50; i++) {
    const item = foodItems[i % foodItems.length];
    const donorPair = createdDonors[i % createdDonors.length];
    const donor = donorPair.user;
    const donorOrg = donorPair.org;

    // Distribute statuses: 15 DELIVERED, 10 IN_TRANSIT / PICKUP_ASSIGNED, 15 MATCHED / AVAILABLE, 5 ACCEPTED, 5 EXPIRED
    let status = 'AVAILABLE';
    if (i < 20) status = 'DELIVERED';
    else if (i < 28) status = 'IN_TRANSIT';
    else if (i < 34) status = 'ACCEPTED';
    else if (i < 45) status = 'MATCHED';
    else status = 'AVAILABLE';

    const prepTime = new Date(Date.now() - (i * 2 + 1) * 60 * 60 * 1000);
    const availTime = new Date(prepTime.getTime() + 30 * 60 * 1000);
    const consumeTime = new Date(availTime.getTime() + item.hours * 60 * 60 * 1000);

    const estMeals = Math.round(item.qty * (item.category === 'COOKED_MEALS' ? 2.5 : 3.0));

    const donation = await prisma.foodDonation.create({
      data: {
        donorId: donor.id,
        donorOrgId: donorOrg.id,
        foodName: `${item.name} (${donorOrg.name})`,
        category: item.category,
        quantity: item.qty,
        quantityUnit: 'KG',
        estimatedMeals: estMeals,
        vegType: item.veg,
        allergens: JSON.stringify(item.veg === 'VEGETARIAN' ? ['Dairy'] : ['Gluten']),
        preparationTime: prepTime,
        availableFrom: availTime,
        consumeBefore: consumeTime,
        packagingStatus: 'SEALED_CONTAINERS',
        pickupAddress: donorOrg.address,
        latitude: donorOrg.latitude,
        longitude: donorOrg.longitude,
        specialInstructions: 'Ready at kitchen dispatch counter. Temperature controlled.',
        status
      }
    });

    donationCount++;

    // For matched/accepted/delivered, attach matches to NGOs
    const targetNGO = createdNGOs[i % createdNGOs.length].org;
    const matchScore = 85 + (i % 12);

    await prisma.donationMatch.create({
      data: {
        donationId: donation.id,
        ngoOrgId: targetNGO.id,
        score: matchScore,
        distanceKm: 2.4 + (i % 5) * 0.8,
        quantityFit: 92,
        urgencyScore: 88,
        foodCompatibility: 100,
        expiryScore: 94,
        capacityScore: 90,
        recommendationReason: `Recommended because ${targetNGO.name} is ${2.4 + (i % 5) * 0.8} km away, currently requires ${estMeals} meals, and matches vegetarian criteria.`,
        status: status === 'DELIVERED' || status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING'
      }
    });

    // If accepted, in-transit, or delivered, create pickup and delivery records
    if (['ACCEPTED', 'IN_TRANSIT', 'DELIVERED'].includes(status)) {
      const vol = createdVolunteers[i % createdVolunteers.length];

      const pickup = await prisma.pickup.create({
        data: {
          donationId: donation.id,
          volunteerId: vol.id,
          scheduledTime: availTime,
          startedAt: availTime,
          pickedUpAt: new Date(availTime.getTime() + 45 * 60 * 1000),
          status: status === 'DELIVERED' ? 'PICKED_UP' : (status === 'IN_TRANSIT' ? 'ON_WAY_TO_PICKUP' : 'ASSIGNED'),
          pickupNotes: `Deliver to ${targetNGO.name}`
        }
      });

      const isDelivered = status === 'DELIVERED';
      await prisma.delivery.create({
        data: {
          pickupId: pickup.id,
          destinationAddress: targetNGO.address,
          latitude: targetNGO.latitude,
          longitude: targetNGO.longitude,
          deliveredAt: isDelivered ? new Date(availTime.getTime() + 90 * 60 * 1000) : null,
          receiverName: isDelivered ? `Manager at ${targetNGO.name}` : null,
          deliveredQuantity: isDelivered ? item.qty : null,
          status: isDelivered ? 'DELIVERED' : 'ON_WAY_TO_DESTINATION'
        }
      });

      if (isDelivered) {
        deliveryCount++;
      }
    }
  }

  console.log(`✅ Created ${donationCount} Food Donations and ${deliveryCount} Verified Completed Deliveries`);

  // 6. Create Initial Notifications
  await prisma.notification.create({
    data: {
      userId: createdDonors[0].user.id,
      title: 'Welcome to FoodBridge AI! 🍱',
      message: 'Your restaurant account is verified and ready to rescue surplus food.',
      type: 'SYSTEM'
    }
  });

  await prisma.notification.create({
    data: {
      userId: createdNGOs[0].user.id,
      title: 'High Compatibility Match (95%)',
      message: 'Fresh Paneer Butter Masala (30 kg) available 2.4 km away from Taj Palace.',
      type: 'DONATION_MATCHED'
    }
  });

  // 7. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INITIALIZED',
      entityType: 'PLATFORM',
      detailsJson: JSON.stringify({ message: 'Seed data deployed with Delhi NCR locations.' }),
      ipAddress: '127.0.0.1'
    }
  });

  console.log('🎉 Seed complete! All demo accounts, donations, matches, and deliveries are ready.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
