import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/rbac';
import { tenantGuard } from '../../middleware/tenant';
import { BrandingService } from './branding.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { BadRequestError } from '../../shared/errors/AppError';
import { AuthenticatedRequest } from '../../shared/types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'branding'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_LOGO_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only JPEG, PNG, SVG, and WebP images are allowed') as any);
    }
  },
});

const router = Router();

router.use(authenticate);
router.use(tenantGuard());

// Get branding for current tenant
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const branding = await BrandingService.getBranding(req.tenantId!);
    res.json({ success: true, data: { branding } });
  }),
);

// Update branding settings
router.put(
  '/',
  requireAdmin(),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const branding = await BrandingService.upsertBranding(req.tenantId!, req.body);
    res.json({ success: true, data: { branding } });
  }),
);

// Upload logo
router.post(
  '/logo',
  requireAdmin(),
  upload.single('logo'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.file) throw new BadRequestError('No file provided');
    const type = (req.query.type as 'logo' | 'favicon' | 'certificate') || 'logo';
    const logoUrl = `/uploads/branding/${req.file.filename}`;
    const branding = await BrandingService.uploadLogo(req.tenantId!, logoUrl, type);
    res.json({ success: true, data: { branding } });
  }),
);

// Remove logo
router.delete(
  '/logo',
  requireAdmin(),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const type = (req.query.type as 'logo' | 'favicon' | 'certificate') || 'logo';
    const branding = await BrandingService.removeLogo(req.tenantId!, type);
    res.json({ success: true, data: { branding } });
  }),
);

export default router;
