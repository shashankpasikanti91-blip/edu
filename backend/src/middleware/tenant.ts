import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';
import { ForbiddenError } from '../shared/errors/AppError';
import { Role } from '../shared/constants';
import { prisma } from '../config/database';

export function tenantGuard() {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      // Super Admin can access any tenant
      if (user.role === Role.SUPER_ADMIN) {
        // Allow tenantId from query/params for Super Admin
        const tenantId = req.params.tenantId || req.query.tenantId as string || user.tenantId;
        req.tenantId = tenantId || undefined;
        return next();
      }

      // All other roles must belong to a tenant
      if (!user.tenantId) {
        throw new ForbiddenError('You are not associated with any institution');
      }

      // Verify tenant exists and is active
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { id: true, status: true, deletedAt: true },
      });

      if (!tenant || tenant.deletedAt || tenant.status === 'SUSPENDED') {
        throw new ForbiddenError('Your institution is not active. Please contact support.');
      }

      req.tenantId = user.tenantId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireTenantMatch() {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (user.role === Role.SUPER_ADMIN) {
      return next();
    }

    const paramTenantId = req.params.tenantId;
    if (paramTenantId && paramTenantId !== user.tenantId) {
      return next(new ForbiddenError('You do not have access to this institution'));
    }

    next();
  };
}
