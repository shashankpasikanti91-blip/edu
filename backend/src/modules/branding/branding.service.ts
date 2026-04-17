import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

export class BrandingService {
  static async getBranding(tenantId: string) {
    const branding = await prisma.tenantBranding.findUnique({
      where: { tenantId },
    });
    return branding;
  }

  static async upsertBranding(tenantId: string, data: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    customCss?: string;
    loginPageHtml?: string;
    emailHeaderHtml?: string;
    certificateLogo?: string;
    subdomain?: string;
    whiteLabel?: boolean;
  }) {
    // Validate branding tier allows requested features
    const subscription = await prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
      include: { plan: true },
    });

    if (!subscription) {
      throw new ForbiddenError('Active subscription required for branding features');
    }

    const plan = subscription.plan as any;
    const tier = plan.brandingTier || 'BASIC';

    // Enforce tier restrictions
    if (tier === 'BASIC') {
      // Only logo upload allowed
      if (data.primaryColor || data.secondaryColor || data.accentColor) {
        throw new ForbiddenError('Custom colors require Standard plan or above');
      }
      if (data.subdomain) {
        throw new ForbiddenError('Subdomain branding requires Standard plan or above');
      }
      if (data.whiteLabel || data.customCss || data.loginPageHtml) {
        throw new ForbiddenError('White-label features require Premium plan or above');
      }
    }

    if (tier === 'STANDARD') {
      if (data.whiteLabel || data.customCss || data.loginPageHtml) {
        throw new ForbiddenError('White-label features require Premium plan or above');
      }
    }

    // Validate subdomain uniqueness
    if (data.subdomain) {
      const existingSubdomain = await prisma.tenantBranding.findUnique({
        where: { subdomain: data.subdomain },
      });
      if (existingSubdomain && existingSubdomain.tenantId !== tenantId) {
        throw new BadRequestError('Subdomain is already taken');
      }
    }

    // Sanitize custom CSS to prevent XSS
    if (data.customCss) {
      data.customCss = this.sanitizeCss(data.customCss);
    }

    // Sanitize HTML inputs
    if (data.loginPageHtml) {
      data.loginPageHtml = this.sanitizeHtml(data.loginPageHtml);
    }
    if (data.emailHeaderHtml) {
      data.emailHeaderHtml = this.sanitizeHtml(data.emailHeaderHtml);
    }

    const existing = await prisma.tenantBranding.findUnique({
      where: { tenantId },
    });

    if (existing) {
      const updated = await prisma.tenantBranding.update({
        where: { tenantId },
        data: { ...data, tier } as any,
      });
      logger.info(`Branding updated for tenant ${tenantId}`);
      return updated;
    }

    const created = await prisma.tenantBranding.create({
      data: {
        tenantId,
        tier,
        ...data,
      } as any,
    });
    logger.info(`Branding created for tenant ${tenantId}`);
    return created;
  }

  static async uploadLogo(tenantId: string, logoUrl: string, type: 'logo' | 'favicon' | 'certificate') {
    const fieldMap = {
      logo: 'logoUrl',
      favicon: 'faviconUrl',
      certificate: 'certificateLogo',
    };

    return this.upsertBranding(tenantId, { [fieldMap[type]]: logoUrl });
  }

  static async removeLogo(tenantId: string, type: 'logo' | 'favicon' | 'certificate') {
    const fieldMap = {
      logo: 'logoUrl',
      favicon: 'faviconUrl',
      certificate: 'certificateLogo',
    };

    return prisma.tenantBranding.update({
      where: { tenantId },
      data: { [fieldMap[type]]: null } as any,
    });
  }

  private static sanitizeCss(css: string): string {
    // Remove potentially dangerous CSS constructs
    return css
      .replace(/expression\s*\(/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/@import/gi, '')
      .replace(/url\s*\(\s*['"]?\s*javascript/gi, '')
      .replace(/behavior\s*:/gi, '')
      .replace(/-moz-binding/gi, '');
  }

  private static sanitizeHtml(html: string): string {
    // Remove script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript\s*:/gi, '');
  }
}
