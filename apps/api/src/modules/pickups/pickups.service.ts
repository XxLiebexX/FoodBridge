import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { createAuditLog } from '../../middleware/audit';
import { DonationStatus, PickupStatus, DeliveryStatus } from '@foodbridge/shared';

export class PickupsService {
  static async getAvailablePickups(volunteerId?: string) {
    return prisma.pickup.findMany({
      where: {
        OR: [
          { status: 'ASSIGNED', volunteerId: null },
          { volunteerId: volunteerId || undefined }
        ]
      },
      include: {
        donation: {
          include: {
            donorOrg: true,
            donor: { select: { id: true, name: true, phone: true } }
          }
        },
        delivery: true,
        volunteer: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async acceptPickup(pickupId: string, volunteerId: string, ipAddress?: string) {
    const pickup = await prisma.pickup.findUnique({
      where: { id: pickupId },
      include: { donation: true }
    });

    if (!pickup) {
      throw new AppError('Pickup assignment not found', 404, 'NOT_FOUND');
    }

    if (pickup.volunteerId && pickup.volunteerId !== volunteerId) {
      throw new AppError('This pickup has already been accepted by another volunteer', 409, 'ALREADY_ASSIGNED');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.pickup.update({
        where: { id: pickupId },
        data: {
          volunteerId,
          status: PickupStatus.ASSIGNED
        },
        include: {
          donation: true,
          delivery: true
        }
      });

      await tx.foodDonation.update({
        where: { id: pickup.donationId },
        data: { status: DonationStatus.PICKUP_ASSIGNED }
      });

      return p;
    });

    await createAuditLog({
      userId: volunteerId,
      action: 'ACCEPT_PICKUP',
      entityType: 'PICKUP',
      entityId: pickupId,
      ipAddress
    });

    return updated;
  }

  static async updatePickupStatus(pickupId: string, status: string, notes?: string, volunteerId?: string) {
    const pickup = await prisma.pickup.findUnique({
      where: { id: pickupId },
      include: { donation: true, delivery: true }
    });

    if (!pickup) {
      throw new AppError('Pickup not found', 404, 'NOT_FOUND');
    }

    const data: any = { status };
    if (notes) data.pickupNotes = notes;

    let donationStatus = pickup.donation.status;

    if (status === PickupStatus.ON_WAY_TO_PICKUP) {
      data.startedAt = new Date();
    } else if (status === PickupStatus.PICKED_UP) {
      data.pickedUpAt = new Date();
      donationStatus = DonationStatus.IN_TRANSIT;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.pickup.update({
        where: { id: pickupId },
        data
      });

      if (donationStatus !== pickup.donation.status) {
        await tx.foodDonation.update({
          where: { id: pickup.donationId },
          data: { status: donationStatus }
        });
      }

      return p;
    });

    if (volunteerId) {
      await createAuditLog({
        userId: volunteerId,
        action: `PICKUP_STATUS_${status}`,
        entityType: 'PICKUP',
        entityId: pickupId
      });
    }

    return updated;
  }

  static async completeDelivery(deliveryId: string, data: {
    receiverName: string;
    deliveredQuantity: number;
    proofImageUrl?: string;
    deliveryNotes?: string;
  }, volunteerId?: string, ipAddress?: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        pickup: {
          include: {
            donation: {
              include: { donor: true, donorOrg: true }
            }
          }
        }
      }
    });

    if (!delivery) {
      throw new AppError('Delivery record not found', 404, 'NOT_FOUND');
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark delivery as DELIVERED
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.DELIVERED,
          receiverName: data.receiverName,
          deliveredQuantity: data.deliveredQuantity,
          proofImageUrl: data.proofImageUrl || null,
          deliveryNotes: data.deliveryNotes || null,
          deliveredAt: now
        }
      });

      // 2. Mark donation as DELIVERED
      await tx.foodDonation.update({
        where: { id: delivery.pickup.donationId },
        data: { status: DonationStatus.DELIVERED }
      });

      // 3. Increment volunteer stats if assigned
      if (delivery.pickup.volunteerId) {
        await tx.volunteerProfile.updateMany({
          where: { userId: delivery.pickup.volunteerId },
          data: {
            totalDeliveries: { increment: 1 },
            activeDeliveriesCount: { decrement: 1 }
          }
        });
      }

      // 4. Notify donor
      await tx.notification.create({
        data: {
          userId: delivery.pickup.donation.donorId,
          title: 'Food Donation Successfully Delivered! 🎉',
          message: `Your donation of ${delivery.pickup.donation.foodName} (${data.deliveredQuantity} kg) has been received by ${data.receiverName}. Thank you for preventing food waste!`,
          type: 'DELIVERED',
          dataJson: JSON.stringify({ donationId: delivery.pickup.donationId })
        }
      });

      return updatedDelivery;
    });

    await createAuditLog({
      userId: volunteerId || null,
      action: 'DELIVERY_COMPLETED',
      entityType: 'DELIVERY',
      entityId: deliveryId,
      details: { receiverName: data.receiverName, deliveredQuantity: data.deliveredQuantity },
      ipAddress
    });

    return result;
  }
}
