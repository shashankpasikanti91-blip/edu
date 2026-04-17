import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { studentDirectService } from './student.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { AuthenticatedRequest } from '../../shared/types';

const router = Router();

router.use(authenticate);

// B2C Student Dashboard
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.getDashboard(authReq.user!.id);
    res.json({ success: true, message: 'Dashboard data retrieved', data });
  })
);

// Update student profile
router.put(
  '/profile',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.updateProfile(authReq.user!.id, req.body);
    res.json({ success: true, message: 'Profile updated', data });
  })
);

// Get progress summary
router.get(
  '/progress',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const days = parseInt(req.query.days as string) || 30;
    const data = await studentDirectService.getProgressSummary(authReq.user!.id, days);
    res.json({ success: true, message: 'Progress summary retrieved', data });
  })
);

// Referral info
router.get(
  '/referrals',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.getReferralInfo(authReq.user!.id);
    res.json({ success: true, message: 'Referral info retrieved', data });
  })
);

// Create referral invite
router.post(
  '/referrals/invite',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { email } = req.body;
    const data = await studentDirectService.createReferralInvite(authReq.user!.id, email);
    res.status(201).json({ success: true, message: 'Referral invite created', data });
  })
);

// Link to institution
router.post(
  '/link-institution',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { tenantId } = req.body;
    await studentDirectService.linkToInstitution(authReq.user!.id, tenantId);
    res.json({ success: true, message: 'Account linked to institution successfully' });
  })
);

// ─── NOTES CRUD ────────────────────────────────────────────

router.get(
  '/notes',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.listNotes(authReq.user!.id, req.query as Record<string, string>);
    res.json({ success: true, message: 'Notes retrieved', data });
  })
);

router.post(
  '/notes',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.createNote(authReq.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Note created', data });
  })
);

router.get(
  '/notes/:id',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.getNote(authReq.user!.id, req.params.id);
    res.json({ success: true, message: 'Note retrieved', data });
  })
);

router.patch(
  '/notes/:id',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.updateNote(authReq.user!.id, req.params.id, req.body);
    res.json({ success: true, message: 'Note updated', data });
  })
);

router.delete(
  '/notes/:id',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    await studentDirectService.deleteNote(authReq.user!.id, req.params.id);
    res.json({ success: true, message: 'Note deleted' });
  })
);

// ─── STUDY PLAN CRUD ──────────────────────────────────────

router.get(
  '/plans',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.listStudyPlans(authReq.user!.id, req.query as Record<string, string>);
    res.json({ success: true, message: 'Study plans retrieved', data });
  })
);

router.post(
  '/plans',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.createStudyPlan(authReq.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Study plan created', data });
  })
);

router.patch(
  '/plans/:id',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const data = await studentDirectService.updateStudyPlan(authReq.user!.id, req.params.id, req.body);
    res.json({ success: true, message: 'Study plan updated', data });
  })
);

router.delete(
  '/plans/:id',
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    await studentDirectService.deleteStudyPlan(authReq.user!.id, req.params.id);
    res.json({ success: true, message: 'Study plan deleted' });
  })
);

export const studentRoutes = router;
