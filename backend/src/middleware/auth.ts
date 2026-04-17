import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { UnauthorizedError, ForbiddenError } from '../shared/errors';
import { AuthenticatedRequest, AuthenticatedUser } from '../shared/types';
import { Role, AccountType } from '../shared/constants';
import { logger } from '../shared/utils/logger';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  accountType: AccountType;
  sessionId: string;
  tenantId?: string;
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role as Role,
      accountType: (decoded.accountType as AccountType) || AccountType.B2B_INSTITUTION,
      sessionId: decoded.sessionId,
      tenantId: decoded.tenantId || null,
    };
    if (decoded.tenantId) {
      req.tenantId = decoded.tenantId;
    }

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Access token has expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token'));
      return;
    }
    next(error);
  }
}

export async function authenticateAndVerifySession(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    // Verify session is still active
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Session has expired or been revoked');
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role as Role,
      accountType: decoded.accountType || AccountType.B2B_INSTITUTION,
      sessionId: decoded.sessionId,
      tenantId: decoded.tenantId || null,
    };
    if (decoded.tenantId) {
      req.tenantId = decoded.tenantId;
    }

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Access token has expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token'));
      return;
    }
    next(error);
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
      });
      next(new ForbiddenError('You do not have permission to perform this action'));
      return;
    }

    next();
  };
}
