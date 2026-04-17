import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { AuthenticatedRequest } from '../../shared/types';
import { logger } from '../../shared/utils/logger';
import { ADMIN_ROLES } from '../../shared/constants';
import type { Role } from '../../shared/constants';

// ─── Allowed file types by purpose ─────────────────────────
const STUDY_MATERIAL_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const ATTENDANCE_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

const PROFILE_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const ALL_ALLOWED_TYPES = [
  ...new Set([...STUDY_MATERIAL_TYPES, ...ATTENDANCE_TYPES, ...PROFILE_IMAGE_TYPES]),
];

// Max sizes per purpose
const MAX_STUDY_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_ATTENDANCE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB general cap

// Blocked file extensions (double extension attack prevention)
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif', '.vbs',
  '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh', '.ps1', '.ps2',
  '.psc1', '.psc2', '.msh', '.msh1', '.msh2', '.inf', '.reg',
  '.rgs', '.sct', '.shb', '.shs', '.lnk', '.dll', '.sys',
];

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Strip path info from original name to prevent path traversal
    const safeName = path.basename(file.originalname);
    const ext = path.extname(safeName).toLowerCase();
    // UUID filename prevents guessing and path traversal
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Block dangerous extensions
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      cb(new BadRequestError(`File extension ${ext} is not allowed`) as any);
      return;
    }

    // Check double extensions (e.g., file.pdf.exe)
    const nameParts = file.originalname.split('.');
    if (nameParts.length > 2) {
      for (const part of nameParts.slice(1)) {
        if (BLOCKED_EXTENSIONS.includes(`.${part.toLowerCase()}`)) {
          cb(new BadRequestError('File contains blocked extension') as any);
          return;
        }
      }
    }

    if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`File type ${file.mimetype} is not allowed`) as any);
    }
  },
});

type UploadPurpose = 'study_material' | 'attendance' | 'profile_image' | 'general';

function validatePurpose(purpose: string | undefined, mimeType: string, fileSize: number, userRole: string): UploadPurpose {
  const p = (purpose || 'general') as UploadPurpose;

  if (p === 'attendance') {
    if (!ATTENDANCE_TYPES.includes(mimeType)) {
      throw new BadRequestError('Attendance files must be Excel or CSV format');
    }
    if (fileSize > MAX_ATTENDANCE_FILE_SIZE) {
      throw new BadRequestError('Attendance files must be under 10MB');
    }
    // Only teachers and admins can upload attendance
    if (!['TEACHER', ...ADMIN_ROLES.map(String)].includes(userRole)) {
      throw new ForbiddenError('Only teachers and admins can upload attendance files');
    }
  }

  if (p === 'study_material') {
    if (!STUDY_MATERIAL_TYPES.includes(mimeType)) {
      throw new BadRequestError('Study materials must be PDF, DOC, DOCX, PPT, PPTX, TXT, or image');
    }
    if (fileSize > MAX_STUDY_FILE_SIZE) {
      throw new BadRequestError('Study materials must be under 25MB');
    }
  }

  if (p === 'profile_image') {
    if (!PROFILE_IMAGE_TYPES.includes(mimeType)) {
      throw new BadRequestError('Profile images must be JPEG, PNG, or WebP');
    }
    if (fileSize > MAX_PROFILE_IMAGE_SIZE) {
      throw new BadRequestError('Profile images must be under 2MB');
    }
  }

  return p;
}

const router = Router();
router.use(authenticate);

// Upload single file
router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.file) throw new BadRequestError('No file provided');

    const purpose = validatePurpose(
      req.body.purpose,
      req.file.mimetype,
      req.file.size,
      req.user!.role
    );

    const fileUrl = `/uploads/${req.file.filename}`;
    const record = await prisma.upload.create({
      data: {
        userId: req.user!.id,
        fileName: req.file.filename,
        fileUrl,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        purpose,
      },
    });

    logger.info('File uploaded', {
      userId: req.user!.id,
      uploadId: record.id,
      purpose,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json({ success: true, data: { upload: record } });
  }),
);

// List user uploads
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const purpose = req.query.purpose as string | undefined;

    const where: Record<string, unknown> = { userId: req.user!.id };
    if (purpose) where.purpose = purpose;

    const [uploads, total] = await Promise.all([
      prisma.upload.findMany({
        where: where as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.upload.count({ where: where as any }),
    ]);

    res.json({
      success: true,
      data: { uploads, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  }),
);

// Serve uploaded file securely (authenticated access only)
router.get(
  '/file/:filename',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const filename = path.basename(req.params.filename); // prevent path traversal
    const record = await prisma.upload.findFirst({
      where: { fileName: filename },
    });

    if (!record) throw new NotFoundError('File not found');

    // Users can only access their own files, admins can access all
    const isAdmin = ADMIN_ROLES.includes(req.user!.role as Role);
    if (record.userId !== req.user!.id && !isAdmin) {
      throw new ForbiddenError('You do not have permission to access this file');
    }

    const filePath = path.join(UPLOADS_DIR, filename);

    // Verify the resolved path is within uploads directory (prevent traversal)
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(UPLOADS_DIR))) {
      throw new ForbiddenError('Invalid file path');
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new NotFoundError('File not found on disk');
    }

    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Type', record.mimeType);
    res.sendFile(resolvedPath);
  }),
);

// Download uploaded file
router.get(
  '/download/:filename',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const filename = path.basename(req.params.filename);
    const record = await prisma.upload.findFirst({
      where: { fileName: filename },
    });

    if (!record) throw new NotFoundError('File not found');

    const isAdmin = ADMIN_ROLES.includes(req.user!.role as Role);
    if (record.userId !== req.user!.id && !isAdmin) {
      throw new ForbiddenError('You do not have permission to download this file');
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(UPLOADS_DIR))) {
      throw new ForbiddenError('Invalid file path');
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new NotFoundError('File not found on disk');
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.download(resolvedPath);
  }),
);

// Delete upload (with actual file cleanup)
router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const record = await prisma.upload.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!record) throw new NotFoundError('Upload not found');

    // Delete from disk
    const filePath = path.join(UPLOADS_DIR, record.fileName);
    const resolvedPath = path.resolve(filePath);
    if (resolvedPath.startsWith(path.resolve(UPLOADS_DIR)) && fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      logger.info('File deleted from disk', { uploadId: record.id, fileName: record.fileName });
    }

    await prisma.upload.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Upload deleted' });
  }),
);

export default router;
