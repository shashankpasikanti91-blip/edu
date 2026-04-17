import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { AuthenticatedRequest } from '../../shared/types';

class AiController {
  async createChat(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { title } = req.body;

    const chat = await aiService.createChat(userId, title);

    res.status(201).json({
      success: true,
      message: 'Chat created',
      data: chat,
    });
  }

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { chatId } = req.params;
    const { message } = req.body;

    const response = await aiService.sendMessage(userId, chatId, message);

    res.status(200).json({
      success: true,
      message: 'Message sent',
      data: response,
    });
  }

  async getUserChats(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await aiService.getUserChats(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Chats retrieved',
      data: result.chats,
      meta: {
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  async getChatMessages(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await aiService.getChatMessages(userId, chatId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Messages retrieved',
      data: result.messages,
      meta: {
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  async deleteChat(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { chatId } = req.params;

    await aiService.deleteChat(userId, chatId);

    res.status(200).json({
      success: true,
      message: 'Chat deleted',
    });
  }

  async quickQuery(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { prompt, context } = req.body;

    const result = await aiService.quickQuery(userId, prompt, context);

    res.status(200).json({
      success: true,
      message: 'AI response generated',
      data: result,
    });
  }

  async generateQuestions(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const tenantId = req.user!.tenantId || undefined;
    const {
      subject, topic, grade, board, difficulty, count, questionType,
      examType, language, educationCategory, stream, courseCode, classYear,
    } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    const result = await aiService.generateQuestions(userId, {
      subject,
      topic,
      grade,
      board,
      difficulty,
      count,
      questionType,
      examType,
      language,
      educationCategory,
      stream,
      courseCode,
      classYear,
      tenantId,
    });

    res.status(200).json({
      success: true,
      message: 'Questions generated',
      data: result,
    });
  }

  async dictionaryLookup(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { word, language, translateTo } = req.body;

    if (!word) {
      return res.status(400).json({ success: false, message: 'Word is required' });
    }

    const result = await aiService.dictionaryLookup(userId, { word, language, translateTo });

    res.status(200).json({
      success: true,
      message: 'Dictionary lookup complete',
      data: result,
    });
  }

  async generateCurrentAffairs(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { topic, category, examType, count, language } = req.body;

    const result = await aiService.generateCurrentAffairs(userId, {
      topic,
      category,
      examType,
      count,
      language,
    });

    res.status(200).json({
      success: true,
      message: 'Current affairs content generated',
      data: result,
    });
  }

  async explainTopic(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { subject, topic, grade, board, depth, language } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ success: false, message: 'Subject and topic are required' });
    }

    const result = await aiService.explainTopic(userId, {
      subject,
      topic,
      grade,
      board,
      depth,
      language,
    });

    res.status(200).json({
      success: true,
      message: 'Topic explanation generated',
      data: result,
    });
  }

  async generateIELTS(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { section, taskType, topic, targetBand, language } = req.body;

    if (!section) {
      return res.status(400).json({ success: false, message: 'Section is required' });
    }

    const result = await aiService.generateIELTS(userId, {
      section,
      taskType,
      topic,
      targetBand,
      language,
    });

    res.status(200).json({
      success: true,
      message: 'IELTS practice content generated',
      data: result,
    });
  }
}

export const aiController = new AiController();
