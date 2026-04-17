import { Request, Response, NextFunction } from 'express';
import { Role, AccountType } from '../constants';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  accountType: AccountType;
  tenantId: string | null;
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  tenantId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
