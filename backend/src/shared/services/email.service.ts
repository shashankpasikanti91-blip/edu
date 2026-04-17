import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    firstName: string,
    token: string
  ): Promise<void> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.send({
      to,
      subject: 'Verify your email - SRP Education AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">Welcome to SRP Education AI!</h2>
          <p>Hi ${this.escapeHtml(firstName)},</p>
          <p>Thank you for signing up. Please verify your email address to get started.</p>
          <a href="${this.escapeHtml(verificationUrl)}" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account, 
            please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">SRP Education AI &mdash; Learn Smart, Grow Strong</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    token: string
  ): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.send({
      to,
      subject: 'Reset your password - SRP Education AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">Password Reset Request</h2>
          <p>Hi ${this.escapeHtml(firstName)},</p>
          <p>We received a request to reset your password. Click the button below to set a new password.</p>
          <a href="${this.escapeHtml(resetUrl)}" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, 
            please ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">SRP Education AI &mdash; Learn Smart, Grow Strong</p>
        </div>
      `,
    });
  }

  async sendAdminNotification(
    to: string,
    title: string,
    body: string
  ): Promise<void> {
    await this.send({
      to,
      subject: `[SRP Admin] ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">${this.escapeHtml(title)}</h2>
          <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px;">${this.escapeHtml(body)}</pre>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">SRP Education AI &mdash; System Notification</p>
        </div>
      `,
    });
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        ...options,
      });
      logger.info('Email sent', { to: options.to, subject: options.subject });
    } catch (error) {
      logger.error('Email sending failed', { error, to: options.to });
      throw error;
    }
  }

  private escapeHtml(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return str.replace(/[&<>"']/g, (char) => map[char]);
  }
}

export const emailService = new EmailService();
