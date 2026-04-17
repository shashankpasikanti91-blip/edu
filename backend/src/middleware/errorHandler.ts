import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../shared/errors';
import { ApiResponse } from '../shared/types';
import { logger } from '../shared/utils/logger';
import { env } from '../config/env';
import { ownerNotifyService } from '../shared/services/ownerNotify.service';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.');
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: fieldErrors,
    });
    return;
  }

  // Custom validation errors
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unexpected errors — notify the system owner
  logger.error('Unhandled error', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Notify system owner of unexpected errors (non-blocking)
  ownerNotifyService.onError({
    source: `${req.method} ${req.path}`,
    error: err.message,
    context: { stack: err.stack?.slice(0, 500) },
  }).catch(() => { /* swallow — we can't let notification failures cause more errors */ });

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message;

  res.status(500).json({
    success: false,
    message,
  });
}
