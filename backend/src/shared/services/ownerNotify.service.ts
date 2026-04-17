import { prisma } from '../../config/database';
import { logger } from '../utils/logger';
import { NotificationType } from '../constants';
import { emailService } from './email.service';

/**
 * OwnerNotifyService — sends notifications to ALL SUPER_ADMIN users
 * when important events occur (new registrations, errors, security alerts).
 * This ensures the system owner always knows what's happening.
 */
class OwnerNotifyService {
  private async getSuperAdminIds(): Promise<string[]> {
    const admins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
      select: { id: true, email: true },
    });
    return admins.map((a) => a.id);
  }

  private async getSuperAdminEmails(): Promise<string[]> {
    const admins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
      select: { email: true },
    });
    return admins.map((a) => a.email);
  }

  /**
   * Notify owner when a new user signs up
   */
  async onNewRegistration(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    accountType: string;
    tenantId?: string | null;
  }): Promise<void> {
    try {
      const adminIds = await this.getSuperAdminIds();
      if (adminIds.length === 0) return;

      const title = `New Registration: ${user.firstName} ${user.lastName}`;
      const message = `A new ${user.accountType === 'B2C_STUDENT' ? 'student' : 'institution user'} has registered.\n\nEmail: ${user.email}\nRole: ${user.role}\nType: ${user.accountType}`;

      const notifications = adminIds.map((adminId) => ({
        userId: adminId,
        title,
        message,
        type: NotificationType.NEW_REGISTRATION,
      }));

      await prisma.notification.createMany({ data: notifications as any });

      // Also send email to super admins
      const adminEmails = await this.getSuperAdminEmails();
      for (const email of adminEmails) {
        emailService
          .sendAdminNotification(email, title, message)
          .catch((err) => logger.error('Failed to send admin registration email', { err }));
      }

      logger.info('Owner notified of new registration', { userId: user.id, email: user.email });
    } catch (err) {
      logger.error('Failed to notify owner of new registration', { err, userId: user.id });
    }
  }

  /**
   * Notify owner on security alerts (account locks, suspicious activity)
   */
  async onSecurityAlert(details: {
    event: string;
    userId?: string;
    email?: string;
    ipAddress?: string;
    description: string;
  }): Promise<void> {
    try {
      const adminIds = await this.getSuperAdminIds();
      if (adminIds.length === 0) return;

      const title = `Security Alert: ${details.event}`;
      const message = `${details.description}\n\nUser: ${details.email || 'N/A'}\nIP: ${details.ipAddress || 'N/A'}`;

      const notifications = adminIds.map((adminId) => ({
        userId: adminId,
        title,
        message,
        type: NotificationType.SECURITY_ALERT,
      }));

      await prisma.notification.createMany({ data: notifications as any });

      logger.warn('Security alert sent to owner', { event: details.event });
    } catch (err) {
      logger.error('Failed to send security alert to owner', { err });
    }
  }

  /**
   * Notify owner on critical errors
   */
  async onError(details: {
    source: string;
    error: string;
    context?: Record<string, unknown>;
  }): Promise<void> {
    try {
      const adminIds = await this.getSuperAdminIds();
      if (adminIds.length === 0) return;

      const title = `System Error: ${details.source}`;
      const message = `An error occurred in ${details.source}:\n\n${details.error}`;

      const notifications = adminIds.map((adminId) => ({
        userId: adminId,
        title,
        message,
        type: NotificationType.ERROR_ALERT,
      }));

      await prisma.notification.createMany({ data: notifications as any });
    } catch (err) {
      // Don't throw here — this is a notification service, failures should not cascade
      logger.error('Failed to send error notification to owner', { err });
    }
  }

  /**
   * Notify owner of payment events
   */
  async onPaymentEvent(details: {
    event: string;
    userId: string;
    amount?: number;
    description: string;
  }): Promise<void> {
    try {
      const adminIds = await this.getSuperAdminIds();
      if (adminIds.length === 0) return;

      const notifications = adminIds.map((adminId) => ({
        userId: adminId,
        title: `Payment: ${details.event}`,
        message: details.description,
        type: NotificationType.PAYMENT,
      }));

      await prisma.notification.createMany({ data: notifications as any });
    } catch (err) {
      logger.error('Failed to send payment notification to owner', { err });
    }
  }
}

export const ownerNotifyService = new OwnerNotifyService();
