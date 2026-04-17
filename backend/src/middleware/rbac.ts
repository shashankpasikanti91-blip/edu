import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';
import { ForbiddenError } from '../shared/errors/AppError';
import { Role, ADMIN_ROLES, TENANT_ADMIN_ROLES } from '../shared/constants';

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(user.role as Role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}

export function requireAdmin() {
  return requireRole(...ADMIN_ROLES, Role.SUPER_ADMIN);
}

export function requireTenantAdmin() {
  return requireRole(...TENANT_ADMIN_ROLES, Role.SUPER_ADMIN);
}

export function requireSuperAdmin() {
  return requireRole(Role.SUPER_ADMIN);
}

export function requireTeacherOrAbove() {
  return requireRole(Role.TEACHER, Role.DEPARTMENT_ADMIN, ...TENANT_ADMIN_ROLES, Role.SUPER_ADMIN);
}
