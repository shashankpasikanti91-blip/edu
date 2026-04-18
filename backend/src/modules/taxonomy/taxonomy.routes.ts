import { Router, Request, Response } from 'express';
import {
  INSTITUTION_TYPES,
  AFFILIATION_TYPES,
  INSTITUTION_CATEGORIES,
  ACADEMIC_LEVELS,
  STREAMS,
  BOARDS,
  REGULATORY_BODIES,
  EXAM_TYPES,
  DIFFICULTY_LEVELS,
  QUESTION_COUNTS,
  COMPETITIVE_EXAMS,
  COURSE_CATALOG,
  INSTITUTION_STREAM_MAP,
  getSubjectsForContext,
  getStreamsForLevel,
  getGradesForLevel,
  getCoursesForStreamLevel,
  getYearsForCourse,
  getStreamsForInstitutionType,
} from '../../shared/constants/taxonomy';

const router = Router();

// GET /api/v1/taxonomy/institution-types
router.get('/institution-types', (_req: Request, res: Response) => {
  res.json({ success: true, data: INSTITUTION_TYPES });
});

// GET /api/v1/taxonomy/affiliation-types
router.get('/affiliation-types', (_req: Request, res: Response) => {
  res.json({ success: true, data: AFFILIATION_TYPES });
});

// GET /api/v1/taxonomy/institution-categories
router.get('/institution-categories', (_req: Request, res: Response) => {
  res.json({ success: true, data: INSTITUTION_CATEGORIES });
});

// GET /api/v1/taxonomy/academic-levels
router.get('/academic-levels', (_req: Request, res: Response) => {
  res.json({ success: true, data: ACADEMIC_LEVELS });
});

// GET /api/v1/taxonomy/streams?level=UG
router.get('/streams', (req: Request, res: Response) => {
  const { level } = req.query;
  if (level && typeof level === 'string') {
    res.json({ success: true, data: getStreamsForLevel(level) });
  } else {
    res.json({ success: true, data: STREAMS });
  }
});

// GET /api/v1/taxonomy/grades?level=HIGH_SCHOOL
router.get('/grades', (req: Request, res: Response) => {
  const { level } = req.query;
  if (level && typeof level === 'string') {
    const grades = getGradesForLevel(level);
    res.json({ success: true, data: grades.map(g => ({ value: g, label: g })) });
  } else {
    // Return all levels with grades
    res.json({ success: true, data: ACADEMIC_LEVELS.map(l => ({ level: l.value, label: l.label, grades: l.grades })) });
  }
});

// GET /api/v1/taxonomy/boards
router.get('/boards', (_req: Request, res: Response) => {
  const data = BOARDS.map(b => ({ value: b.shortName, label: b.name, boardType: b.boardType, country: b.country }));
  res.json({ success: true, data });
});

// GET /api/v1/taxonomy/regulatory-bodies
router.get('/regulatory-bodies', (_req: Request, res: Response) => {
  res.json({ success: true, data: REGULATORY_BODIES });
});

// GET /api/v1/taxonomy/subjects?stream=ENGINEERING&level=UG&courseCode=BTECH-CSE
router.get('/subjects', (req: Request, res: Response) => {
  const { stream, level, courseCode } = req.query;
  const subjects = getSubjectsForContext(
    stream as string | undefined,
    level as string | undefined,
    courseCode as string | undefined
  );
  res.json({ success: true, data: subjects });
});

// GET /api/v1/taxonomy/courses?stream=ENGINEERING&level=UG
router.get('/courses', (req: Request, res: Response) => {
  const { stream, level } = req.query;
  if (stream && typeof stream === 'string') {
    res.json({ success: true, data: getCoursesForStreamLevel(stream, level as string | undefined) });
  } else {
    res.json({ success: true, data: COURSE_CATALOG });
  }
});

// GET /api/v1/taxonomy/years?courseCode=BTECH-CSE
router.get('/years', (req: Request, res: Response) => {
  const { courseCode } = req.query;
  if (courseCode && typeof courseCode === 'string') {
    res.json({ success: true, data: getYearsForCourse(courseCode) });
  } else {
    res.json({ success: true, data: [] });
  }
});

// GET /api/v1/taxonomy/institution-streams?type=ENGINEERING_COLLEGE
router.get('/institution-streams', (req: Request, res: Response) => {
  const { type } = req.query;
  if (type && typeof type === 'string') {
    const streamValues = getStreamsForInstitutionType(type);
    const streamDetails = STREAMS.filter(s => streamValues.includes(s.value));
    res.json({ success: true, data: streamDetails });
  } else {
    res.json({ success: true, data: INSTITUTION_STREAM_MAP });
  }
});

// GET /api/v1/taxonomy/exam-types
router.get('/exam-types', (_req: Request, res: Response) => {
  res.json({ success: true, data: EXAM_TYPES });
});

// GET /api/v1/taxonomy/difficulty-levels
router.get('/difficulty-levels', (_req: Request, res: Response) => {
  res.json({ success: true, data: DIFFICULTY_LEVELS });
});

// GET /api/v1/taxonomy/question-counts
router.get('/question-counts', (_req: Request, res: Response) => {
  res.json({ success: true, data: QUESTION_COUNTS });
});

// GET /api/v1/taxonomy/competitive-exams
router.get('/competitive-exams', (_req: Request, res: Response) => {
  const data = COMPETITIVE_EXAMS.map(e => ({ value: e, label: e }));
  res.json({ success: true, data });
});

export const taxonomyRoutes = router;
