import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { aiController } from './ai.controller';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

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

// Dictionary
router.post('/dictionary', asyncHandler(async (req, res) => aiController.dictionaryLookup(req as any, res)));

export const aiRoutes = router;
