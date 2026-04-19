import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth';
import { aiRateLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { aiController } from './ai.controller';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const aiMessageSchema = z.object({ message: z.string().min(1).max(10000) });
const aiGenerateSchema = z.object({
  topic: z.string().min(1).max(500).optional(),
  subject: z.string().min(1).max(200).optional(),
  prompt: z.string().min(1).max(10000).optional(),
  title: z.string().min(1).max(500).optional(),
  count: z.number().int().min(1).max(50).optional(),
  difficulty: z.string().max(50).optional(),
  type: z.string().max(50).optional(),
}).strip();

const router = Router();

// All AI routes require authentication + rate limiting
router.use(authenticate);
router.use(aiRateLimiter);

// Chat CRUD
router.post('/chats', asyncHandler(async (req, res) => aiController.createChat(req as any, res)));
router.get('/chats', asyncHandler(async (req, res) => aiController.getUserChats(req as any, res)));
router.get('/chats/:chatId/messages', asyncHandler(async (req, res) => aiController.getChatMessages(req as any, res)));
router.post('/chats/:chatId/messages', asyncHandler(async (req, res) => aiController.sendMessage(req as any, res)));
router.delete('/chats/:chatId', asyncHandler(async (req, res) => aiController.deleteChat(req as any, res)));

// Quick query (no chat persistence)
router.post('/query', asyncHandler(async (req, res) => aiController.quickQuery(req as any, res)));

// Structured generation endpoints
router.post('/generate/questions', asyncHandler(async (req, res) => aiController.generateQuestions(req as any, res)));
router.post('/generate/explain', asyncHandler(async (req, res) => aiController.explainTopic(req as any, res)));
router.post('/generate/current-affairs', asyncHandler(async (req, res) => aiController.generateCurrentAffairs(req as any, res)));
router.post('/generate/ielts', asyncHandler(async (req, res) => aiController.generateIELTS(req as any, res)));

// Medical Learning Assistant
router.post('/medical/generate', asyncHandler(async (req, res) => aiController.generateMedicalContent(req as any, res)));

// Industry Learning Assistant
router.post('/industry/generate', asyncHandler(async (req, res) => aiController.generateIndustryContent(req as any, res)));

// Engineering Learning Assistant
router.post('/engineering/generate', asyncHandler(async (req, res) => aiController.generateEngineeringContent(req as any, res)));

// Commerce & CA Learning Assistant
router.post('/commerce/generate', asyncHandler(async (req, res) => aiController.generateCommerceContent(req as any, res)));

// Dictionary
router.post('/dictionary', asyncHandler(async (req, res) => aiController.dictionaryLookup(req as any, res)));

export const aiRoutes = router;
