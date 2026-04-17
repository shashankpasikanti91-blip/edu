// ─── ACADEMIC TAXONOMY ──────────────────────────────────────
// Central reference data for institution types, boards, streams,
// courses, subjects, and academic levels.
// Used by: exam prep, onboarding, institution profile, sub-user creation
//
// ARCHITECTURE NOTES:
// - This file is the single source of truth for all taxonomy data.
// - Taxonomy routes serve this data as JSON via helper functions.
// - Course→Subject→Year mappings enable hierarchical filtering.
// - Institution type→stream mappings enforce correct combinations.

// ─── INSTITUTION TYPES ──────────────────────────────────────

export const INSTITUTION_TYPES = [
  { value: 'SCHOOL', label: 'School' },
  { value: 'JUNIOR_COLLEGE', label: 'Junior College' },
  { value: 'DEGREE_COLLEGE', label: 'Degree College' },
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'COACHING_CENTER', label: 'Coaching Center' },
  { value: 'POLYTECHNIC', label: 'Polytechnic' },
  { value: 'ENGINEERING_COLLEGE', label: 'Engineering College' },
  { value: 'MEDICAL_COLLEGE', label: 'Medical College' },
  { value: 'NURSING_COLLEGE', label: 'Nursing College' },
  { value: 'PHARMACY_COLLEGE', label: 'Pharmacy College' },
  { value: 'DENTAL_COLLEGE', label: 'Dental College' },
  { value: 'LAW_COLLEGE', label: 'Law College' },
  { value: 'MANAGEMENT_INSTITUTE', label: 'Management Institute' },
  { value: 'TRAINING_INSTITUTE', label: 'Training Institute' },
  { value: 'OTHER', label: 'Other' },
] as const;

// Maps institution type to allowed streams
export const INSTITUTION_STREAM_MAP: Record<string, string[]> = {
  SCHOOL: ['GENERAL_SCHOOL', 'SCIENCE', 'COMMERCE', 'ARTS_HUMANITIES'],
  JUNIOR_COLLEGE: ['SCIENCE', 'COMMERCE', 'ARTS_HUMANITIES'],
  DEGREE_COLLEGE: ['SCIENCE', 'COMMERCE', 'ARTS_HUMANITIES', 'COMPUTER_SCIENCE_IT', 'MANAGEMENT'],
  UNIVERSITY: ['SCIENCE', 'COMMERCE', 'ARTS_HUMANITIES', 'ENGINEERING', 'MEDICAL', 'PHARMACY', 'NURSING', 'DENTAL', 'ALLIED_HEALTH', 'LAW', 'MANAGEMENT', 'COMPUTER_SCIENCE_IT', 'AGRICULTURE', 'VOCATIONAL'],
  COACHING_CENTER: ['SCIENCE', 'COMMERCE', 'ARTS_HUMANITIES', 'ENGINEERING', 'MEDICAL', 'COMPETITIVE_EXAM'],
  POLYTECHNIC: ['ENGINEERING', 'VOCATIONAL'],
  ENGINEERING_COLLEGE: ['ENGINEERING', 'COMPUTER_SCIENCE_IT'],
  MEDICAL_COLLEGE: ['MEDICAL', 'ALLIED_HEALTH'],
  NURSING_COLLEGE: ['NURSING'],
  PHARMACY_COLLEGE: ['PHARMACY'],
  DENTAL_COLLEGE: ['DENTAL'],
  LAW_COLLEGE: ['LAW'],
  MANAGEMENT_INSTITUTE: ['MANAGEMENT', 'COMMERCE'],
  TRAINING_INSTITUTE: ['VOCATIONAL', 'COMPUTER_SCIENCE_IT'],
  OTHER: ['SCIENCE', 'COMMERCE', 'ARTS_HUMANITIES', 'ENGINEERING', 'MEDICAL', 'NURSING', 'PHARMACY', 'DENTAL', 'ALLIED_HEALTH', 'LAW', 'MANAGEMENT', 'COMPUTER_SCIENCE_IT', 'AGRICULTURE', 'VOCATIONAL'],
};

export const AFFILIATION_TYPES = [
  { value: 'STATE_BOARD', label: 'State Board' },
  { value: 'CENTRAL_BOARD', label: 'Central Board' },
  { value: 'UNIVERSITY_AFFILIATED', label: 'University Affiliated' },
  { value: 'AUTONOMOUS', label: 'Autonomous' },
  { value: 'DEEMED_UNIVERSITY', label: 'Deemed University' },
  { value: 'PRIVATE_UNIVERSITY', label: 'Private University' },
  { value: 'GOVERNMENT_INSTITUTION', label: 'Government Institution' },
  { value: 'INTERNATIONAL_CURRICULUM', label: 'International Curriculum' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const INSTITUTION_CATEGORIES = [
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'AIDED', label: 'Aided' },
  { value: 'AUTONOMOUS', label: 'Autonomous' },
] as const;

// ─── EDUCATION CATEGORIES (Academic Levels) ─────────────────

export const ACADEMIC_LEVELS = [
  { value: 'PRIMARY_SCHOOL', label: 'Primary School', grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
  { value: 'MIDDLE_SCHOOL', label: 'Middle School', grades: ['Class 6', 'Class 7', 'Class 8'] },
  { value: 'HIGH_SCHOOL', label: 'High School', grades: ['Class 9', 'Class 10'] },
  { value: 'HIGHER_SECONDARY', label: 'Intermediate / Higher Secondary', grades: ['Class 11', 'Class 12'] },
  { value: 'DIPLOMA', label: 'Diploma', grades: ['1st Year', '2nd Year', '3rd Year'] },
  { value: 'UG', label: 'Undergraduate (UG)', grades: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  { value: 'PG', label: 'Postgraduate (PG)', grades: ['1st Year', '2nd Year', '3rd Year'] },
  { value: 'DOCTORAL', label: 'Doctoral', grades: ['PhD Year 1', 'PhD Year 2', 'PhD Year 3', 'PhD Year 4', 'PhD Year 5'] },
  { value: 'PROFESSIONAL', label: 'Professional Courses', grades: ['1st Professional', '2nd Professional', '3rd Professional', 'Final Year', 'Internship'] },
  { value: 'COMPETITIVE_EXAM', label: 'Competitive Exams', grades: ['Preparation'] },
  { value: 'SKILL_VOCATIONAL', label: 'Skill / Vocational', grades: ['Certificate', 'Diploma', 'Advanced Diploma'] },
] as const;

// ─── STREAMS ────────────────────────────────────────────────

export const STREAMS = [
  { value: 'GENERAL_SCHOOL', label: 'General (School)', levels: ['PRIMARY_SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL'] },
  { value: 'SCIENCE', label: 'Science', levels: ['HIGHER_SECONDARY', 'UG', 'PG'] },
  { value: 'COMMERCE', label: 'Commerce', levels: ['HIGHER_SECONDARY', 'UG', 'PG'] },
  { value: 'ARTS_HUMANITIES', label: 'Arts / Humanities', levels: ['HIGHER_SECONDARY', 'UG', 'PG'] },
  { value: 'ENGINEERING', label: 'Engineering', levels: ['DIPLOMA', 'UG', 'PG', 'DOCTORAL'] },
  { value: 'MEDICAL', label: 'Medical', levels: ['UG', 'PG', 'DOCTORAL', 'PROFESSIONAL'] },
  { value: 'PHARMACY', label: 'Pharmacy', levels: ['DIPLOMA', 'UG', 'PG', 'DOCTORAL'] },
  { value: 'NURSING', label: 'Nursing', levels: ['DIPLOMA', 'UG', 'PG'] },
  { value: 'DENTAL', label: 'Dental', levels: ['UG', 'PG'] },
  { value: 'ALLIED_HEALTH', label: 'Allied Health Sciences', levels: ['DIPLOMA', 'UG', 'PG'] },
  { value: 'LAW', label: 'Law', levels: ['UG', 'PG', 'DOCTORAL'] },
  { value: 'MANAGEMENT', label: 'Management', levels: ['UG', 'PG', 'DOCTORAL'] },
  { value: 'COMPUTER_SCIENCE_IT', label: 'Computer Science / IT', levels: ['DIPLOMA', 'UG', 'PG', 'DOCTORAL'] },
  { value: 'AGRICULTURE', label: 'Agriculture', levels: ['DIPLOMA', 'UG', 'PG'] },
  { value: 'VOCATIONAL', label: 'Vocational', levels: ['SKILL_VOCATIONAL', 'DIPLOMA'] },
  { value: 'COMPETITIVE_EXAM', label: 'Competitive Exam Prep', levels: ['COMPETITIVE_EXAM'] },
  { value: 'OTHER', label: 'Other', levels: ['UG', 'PG', 'DOCTORAL'] },
] as const;

// ─── BOARDS ─────────────────────────────────────────────────

export const BOARDS = [
  { name: 'CBSE', shortName: 'CBSE', boardType: 'central', country: 'India' },
  { name: 'ICSE / ISC', shortName: 'ICSE', boardType: 'central', country: 'India' },
  { name: 'NIOS', shortName: 'NIOS', boardType: 'central', country: 'India' },
  { name: 'Andhra Pradesh Board (BSEAP)', shortName: 'AP Board', boardType: 'state', country: 'India' },
  { name: 'Telangana Board (BSETS)', shortName: 'TS Board', boardType: 'state', country: 'India' },
  { name: 'Maharashtra Board (MSBSHSE)', shortName: 'MH Board', boardType: 'state', country: 'India' },
  { name: 'Karnataka Board (KSEEB)', shortName: 'KA Board', boardType: 'state', country: 'India' },
  { name: 'Tamil Nadu Board', shortName: 'TN Board', boardType: 'state', country: 'India' },
  { name: 'Kerala Board (DHSE)', shortName: 'KL Board', boardType: 'state', country: 'India' },
  { name: 'Uttar Pradesh Board (UPMSP)', shortName: 'UP Board', boardType: 'state', country: 'India' },
  { name: 'Bihar Board (BSEB)', shortName: 'Bihar Board', boardType: 'state', country: 'India' },
  { name: 'West Bengal Board (WBBSE)', shortName: 'WB Board', boardType: 'state', country: 'India' },
  { name: 'Gujarat Board (GSEB)', shortName: 'GJ Board', boardType: 'state', country: 'India' },
  { name: 'Rajasthan Board (RBSE)', shortName: 'RJ Board', boardType: 'state', country: 'India' },
  { name: 'Madhya Pradesh Board (MPBSE)', shortName: 'MP Board', boardType: 'state', country: 'India' },
  { name: 'Punjab Board (PSEB)', shortName: 'PB Board', boardType: 'state', country: 'India' },
  { name: 'Haryana Board (HBSE)', shortName: 'HR Board', boardType: 'state', country: 'India' },
  { name: 'Odisha Board (CHSE)', shortName: 'OD Board', boardType: 'state', country: 'India' },
  { name: 'Assam Board (AHSEC)', shortName: 'AS Board', boardType: 'state', country: 'India' },
  { name: 'Jharkhand Board (JAC)', shortName: 'JH Board', boardType: 'state', country: 'India' },
  { name: 'Chhattisgarh Board (CGBSE)', shortName: 'CG Board', boardType: 'state', country: 'India' },
  { name: 'IB (International Baccalaureate)', shortName: 'IB', boardType: 'international', country: 'International' },
  { name: 'Cambridge (IGCSE / A-Level)', shortName: 'Cambridge', boardType: 'international', country: 'International' },
  { name: 'University Curriculum', shortName: 'University', boardType: 'university', country: 'India' },
] as const;

export const REGULATORY_BODIES = [
  'UGC', 'AICTE', 'NMC (National Medical Commission)',
  'INC (Indian Nursing Council)', 'PCI (Pharmacy Council of India)',
  'DCI (Dental Council of India)', 'BCI (Bar Council of India)',
  'NCVT', 'State Technical Board', 'Other',
] as const;

// ─── COURSES / PROGRAMS ─────────────────────────────────────

export interface CourseEntry {
  code: string;
  name: string;
  stream: string;
  level: string;
  duration: string;
  semesters?: number;
  yearBased?: boolean;
  professionalYears?: string[];
}

export const COURSE_CATALOG: CourseEntry[] = [
  // School
  { code: 'SCHOOL-GEN', name: 'General School', stream: 'GENERAL_SCHOOL', level: 'PRIMARY_SCHOOL', duration: '5 years', yearBased: true },
  { code: 'SCHOOL-MID', name: 'General School', stream: 'GENERAL_SCHOOL', level: 'MIDDLE_SCHOOL', duration: '3 years', yearBased: true },
  { code: 'SCHOOL-HIGH', name: 'General School', stream: 'GENERAL_SCHOOL', level: 'HIGH_SCHOOL', duration: '2 years', yearBased: true },

  // Higher Secondary
  { code: 'HS-SCI', name: 'Science Stream', stream: 'SCIENCE', level: 'HIGHER_SECONDARY', duration: '2 years', yearBased: true },
  { code: 'HS-COM', name: 'Commerce Stream', stream: 'COMMERCE', level: 'HIGHER_SECONDARY', duration: '2 years', yearBased: true },
  { code: 'HS-ART', name: 'Arts / Humanities Stream', stream: 'ARTS_HUMANITIES', level: 'HIGHER_SECONDARY', duration: '2 years', yearBased: true },

  // Engineering
  { code: 'BTECH-CSE', name: 'B.Tech - Computer Science & Engineering', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-ECE', name: 'B.Tech - Electronics & Communication', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-EEE', name: 'B.Tech - Electrical & Electronics', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-ME', name: 'B.Tech - Mechanical Engineering', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-CE', name: 'B.Tech - Civil Engineering', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-IT', name: 'B.Tech - Information Technology', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-CHEM', name: 'B.Tech - Chemical Engineering', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-BIOTECH', name: 'B.Tech - Biotechnology', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-AERO', name: 'B.Tech - Aerospace Engineering', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BTECH-AI', name: 'B.Tech - AI & Data Science', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'BE-GEN', name: 'B.E. (General)', stream: 'ENGINEERING', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'DIPL-ENG', name: 'Diploma in Engineering', stream: 'ENGINEERING', level: 'DIPLOMA', duration: '3 years', semesters: 6 },
  { code: 'MTECH-GEN', name: 'M.Tech', stream: 'ENGINEERING', level: 'PG', duration: '2 years', semesters: 4 },
  { code: 'ME-GEN', name: 'M.E.', stream: 'ENGINEERING', level: 'PG', duration: '2 years', semesters: 4 },

  // CS / IT
  { code: 'BCA', name: 'BCA - Bachelor of Computer Applications', stream: 'COMPUTER_SCIENCE_IT', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'MCA', name: 'MCA - Master of Computer Applications', stream: 'COMPUTER_SCIENCE_IT', level: 'PG', duration: '2 years', semesters: 4 },
  { code: 'BSC-CS', name: 'B.Sc Computer Science', stream: 'COMPUTER_SCIENCE_IT', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'MSC-CS', name: 'M.Sc Computer Science', stream: 'COMPUTER_SCIENCE_IT', level: 'PG', duration: '2 years', semesters: 4 },
  { code: 'DIPL-CS', name: 'Diploma in Computer Science', stream: 'COMPUTER_SCIENCE_IT', level: 'DIPLOMA', duration: '3 years', semesters: 6 },

  // Medical
  { code: 'MBBS', name: 'MBBS', stream: 'MEDICAL', level: 'PROFESSIONAL', duration: '5.5 years', professionalYears: ['1st Professional', '2nd Professional', '3rd Professional (Part 1)', '3rd Professional (Part 2)', 'Internship'] },
  { code: 'MD', name: 'MD - Doctor of Medicine', stream: 'MEDICAL', level: 'PG', duration: '3 years', yearBased: true },
  { code: 'MS-MED', name: 'MS - Master of Surgery', stream: 'MEDICAL', level: 'PG', duration: '3 years', yearBased: true },

  // Dental
  { code: 'BDS', name: 'BDS - Bachelor of Dental Surgery', stream: 'DENTAL', level: 'UG', duration: '5 years', professionalYears: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Internship'] },
  { code: 'MDS', name: 'MDS - Master of Dental Surgery', stream: 'DENTAL', level: 'PG', duration: '3 years', yearBased: true },

  // Nursing
  { code: 'BSC-NUR', name: 'B.Sc Nursing', stream: 'NURSING', level: 'UG', duration: '4 years', yearBased: true },
  { code: 'GNM', name: 'GNM - General Nursing & Midwifery', stream: 'NURSING', level: 'DIPLOMA', duration: '3 years', yearBased: true },
  { code: 'ANM', name: 'ANM - Auxiliary Nurse Midwifery', stream: 'NURSING', level: 'DIPLOMA', duration: '2 years', yearBased: true },
  { code: 'MSC-NUR', name: 'M.Sc Nursing', stream: 'NURSING', level: 'PG', duration: '2 years', yearBased: true },
  { code: 'PBBSC-NUR', name: 'Post Basic B.Sc Nursing', stream: 'NURSING', level: 'UG', duration: '2 years', yearBased: true },

  // Pharmacy
  { code: 'BPHARM', name: 'B.Pharm', stream: 'PHARMACY', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'DPHARM', name: 'D.Pharm', stream: 'PHARMACY', level: 'DIPLOMA', duration: '2 years', yearBased: true },
  { code: 'MPHARM', name: 'M.Pharm', stream: 'PHARMACY', level: 'PG', duration: '2 years', semesters: 4 },
  { code: 'PHARMD', name: 'Pharm.D', stream: 'PHARMACY', level: 'PROFESSIONAL', duration: '6 years', professionalYears: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Internship'] },

  // Allied Health
  { code: 'BPT', name: 'BPT - Physiotherapy', stream: 'ALLIED_HEALTH', level: 'UG', duration: '4.5 years', yearBased: true },
  { code: 'MPT', name: 'MPT - Physiotherapy', stream: 'ALLIED_HEALTH', level: 'PG', duration: '2 years', yearBased: true },
  { code: 'BOT', name: 'BOT - Occupational Therapy', stream: 'ALLIED_HEALTH', level: 'UG', duration: '4.5 years', yearBased: true },
  { code: 'BMLT', name: 'BMLT - Medical Lab Technology', stream: 'ALLIED_HEALTH', level: 'UG', duration: '3 years', yearBased: true },
  { code: 'BOPTOM', name: 'B.Optometry', stream: 'ALLIED_HEALTH', level: 'UG', duration: '4 years', yearBased: true },
  { code: 'BSC-RAD', name: 'B.Sc Radiology', stream: 'ALLIED_HEALTH', level: 'UG', duration: '3 years', yearBased: true },
  { code: 'DIPL-AH', name: 'Diploma in Allied Health', stream: 'ALLIED_HEALTH', level: 'DIPLOMA', duration: '2 years', yearBased: true },

  // Science
  { code: 'BSC-PHY', name: 'B.Sc Physics', stream: 'SCIENCE', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BSC-CHEM', name: 'B.Sc Chemistry', stream: 'SCIENCE', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BSC-MATH', name: 'B.Sc Mathematics', stream: 'SCIENCE', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BSC-BIO', name: 'B.Sc Biology / Life Sciences', stream: 'SCIENCE', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BSC-GEN', name: 'B.Sc (General)', stream: 'SCIENCE', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'MSC-PHY', name: 'M.Sc Physics', stream: 'SCIENCE', level: 'PG', duration: '2 years', semesters: 4 },
  { code: 'MSC-CHEM', name: 'M.Sc Chemistry', stream: 'SCIENCE', level: 'PG', duration: '2 years', semesters: 4 },
  { code: 'MSC-MATH', name: 'M.Sc Mathematics', stream: 'SCIENCE', level: 'PG', duration: '2 years', semesters: 4 },

  // Commerce
  { code: 'BCOM', name: 'B.Com', stream: 'COMMERCE', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BCOM-HONS', name: 'B.Com (Hons)', stream: 'COMMERCE', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'MCOM', name: 'M.Com', stream: 'COMMERCE', level: 'PG', duration: '2 years', semesters: 4 },

  // Arts
  { code: 'BA-GEN', name: 'BA (General)', stream: 'ARTS_HUMANITIES', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BA-ENG', name: 'BA English', stream: 'ARTS_HUMANITIES', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BA-HIST', name: 'BA History', stream: 'ARTS_HUMANITIES', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BA-POL', name: 'BA Political Science', stream: 'ARTS_HUMANITIES', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BA-ECO', name: 'BA Economics', stream: 'ARTS_HUMANITIES', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BA-PSY', name: 'BA Psychology', stream: 'ARTS_HUMANITIES', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'BA-SOC', name: 'BA Sociology', stream: 'ARTS_HUMANITIES', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'MA-GEN', name: 'MA (General)', stream: 'ARTS_HUMANITIES', level: 'PG', duration: '2 years', semesters: 4 },

  // Law
  { code: 'BALLB', name: 'BA LLB (Integrated)', stream: 'LAW', level: 'UG', duration: '5 years', semesters: 10 },
  { code: 'LLB', name: 'LLB', stream: 'LAW', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'LLM', name: 'LLM', stream: 'LAW', level: 'PG', duration: '2 years', semesters: 4 },

  // Management
  { code: 'BBA', name: 'BBA - Bachelor of Business Administration', stream: 'MANAGEMENT', level: 'UG', duration: '3 years', semesters: 6 },
  { code: 'MBA', name: 'MBA - Master of Business Administration', stream: 'MANAGEMENT', level: 'PG', duration: '2 years', semesters: 4 },
  { code: 'PGDM', name: 'PGDM', stream: 'MANAGEMENT', level: 'PG', duration: '2 years', semesters: 4 },

  // Agriculture
  { code: 'BSCAG', name: 'B.Sc Agriculture', stream: 'AGRICULTURE', level: 'UG', duration: '4 years', semesters: 8 },
  { code: 'MSCAG', name: 'M.Sc Agriculture', stream: 'AGRICULTURE', level: 'PG', duration: '2 years', semesters: 4 },

  // Competitive
  { code: 'COMP-JEE', name: 'JEE Preparation', stream: 'COMPETITIVE_EXAM', level: 'COMPETITIVE_EXAM', duration: 'Varies', yearBased: true },
  { code: 'COMP-NEET', name: 'NEET Preparation', stream: 'COMPETITIVE_EXAM', level: 'COMPETITIVE_EXAM', duration: 'Varies', yearBased: true },
  { code: 'COMP-GATE', name: 'GATE Preparation', stream: 'COMPETITIVE_EXAM', level: 'COMPETITIVE_EXAM', duration: 'Varies', yearBased: true },
  { code: 'COMP-UPSC', name: 'UPSC Preparation', stream: 'COMPETITIVE_EXAM', level: 'COMPETITIVE_EXAM', duration: 'Varies', yearBased: true },
  { code: 'COMP-CAT', name: 'CAT Preparation', stream: 'COMPETITIVE_EXAM', level: 'COMPETITIVE_EXAM', duration: 'Varies', yearBased: true },
  { code: 'COMP-SSC', name: 'SSC Preparation', stream: 'COMPETITIVE_EXAM', level: 'COMPETITIVE_EXAM', duration: 'Varies', yearBased: true },
  { code: 'COMP-BANK', name: 'Banking Exam Preparation', stream: 'COMPETITIVE_EXAM', level: 'COMPETITIVE_EXAM', duration: 'Varies', yearBased: true },
  { code: 'COMP-CLAT', name: 'CLAT Preparation', stream: 'COMPETITIVE_EXAM', level: 'COMPETITIVE_EXAM', duration: 'Varies', yearBased: true },

  // Vocational
  { code: 'VOC-GEN', name: 'Vocational Course', stream: 'VOCATIONAL', level: 'SKILL_VOCATIONAL', duration: 'Varies', yearBased: true },
  { code: 'ITI', name: 'ITI', stream: 'VOCATIONAL', level: 'SKILL_VOCATIONAL', duration: '1-2 years', yearBased: true },
];

// ─── SUBJECT CATALOG ────────────────────────────────────────

export interface SubjectEntry {
  name: string;
  code: string;
  category: 'core' | 'elective' | 'lab' | 'practical' | 'language';
}

export const SUBJECT_CATALOG: Record<string, SubjectEntry[]> = {
  // ── Primary School ──
  'GENERAL_SCHOOL:PRIMARY_SCHOOL': [
    { name: 'Mathematics', code: 'PRI-MATH', category: 'core' },
    { name: 'English', code: 'PRI-ENG', category: 'language' },
    { name: 'Hindi', code: 'PRI-HIN', category: 'language' },
    { name: 'Environmental Studies (EVS)', code: 'PRI-EVS', category: 'core' },
    { name: 'General Knowledge', code: 'PRI-GK', category: 'core' },
    { name: 'Telugu', code: 'PRI-TEL', category: 'language' },
    { name: 'Tamil', code: 'PRI-TAM', category: 'language' },
    { name: 'Kannada', code: 'PRI-KAN', category: 'language' },
    { name: 'Malayalam', code: 'PRI-MAL', category: 'language' },
    { name: 'Marathi', code: 'PRI-MAR', category: 'language' },
    { name: 'Bengali', code: 'PRI-BEN', category: 'language' },
    { name: 'Gujarati', code: 'PRI-GUJ', category: 'language' },
    { name: 'Drawing / Art', code: 'PRI-ART', category: 'elective' },
    { name: 'Physical Education', code: 'PRI-PE', category: 'elective' },
  ],

  // ── Middle School ──
  'GENERAL_SCHOOL:MIDDLE_SCHOOL': [
    { name: 'Mathematics', code: 'MID-MATH', category: 'core' },
    { name: 'Science', code: 'MID-SCI', category: 'core' },
    { name: 'Social Science', code: 'MID-SSC', category: 'core' },
    { name: 'English', code: 'MID-ENG', category: 'language' },
    { name: 'Hindi', code: 'MID-HIN', category: 'language' },
    { name: 'Telugu', code: 'MID-TEL', category: 'language' },
    { name: 'Tamil', code: 'MID-TAM', category: 'language' },
    { name: 'Kannada', code: 'MID-KAN', category: 'language' },
    { name: 'Malayalam', code: 'MID-MAL', category: 'language' },
    { name: 'Marathi', code: 'MID-MAR', category: 'language' },
    { name: 'Sanskrit', code: 'MID-SAN', category: 'language' },
    { name: 'Urdu', code: 'MID-URD', category: 'language' },
    { name: 'Computer Science', code: 'MID-CS', category: 'elective' },
    { name: 'General Knowledge', code: 'MID-GK', category: 'elective' },
    { name: 'Physical Education', code: 'MID-PE', category: 'elective' },
  ],

  // ── High School ──
  'GENERAL_SCHOOL:HIGH_SCHOOL': [
    { name: 'Mathematics', code: 'HS-MATH', category: 'core' },
    { name: 'Physics', code: 'HS-PHY', category: 'core' },
    { name: 'Chemistry', code: 'HS-CHEM', category: 'core' },
    { name: 'Biology', code: 'HS-BIO', category: 'core' },
    { name: 'Science (Combined)', code: 'HS-SCI', category: 'core' },
    { name: 'Social Science', code: 'HS-SSC', category: 'core' },
    { name: 'History', code: 'HS-HIST', category: 'core' },
    { name: 'Geography', code: 'HS-GEO', category: 'core' },
    { name: 'Economics', code: 'HS-ECO', category: 'core' },
    { name: 'Civics / Political Science', code: 'HS-CIV', category: 'core' },
    { name: 'English', code: 'HS-ENG', category: 'language' },
    { name: 'Hindi', code: 'HS-HIN', category: 'language' },
    { name: 'Telugu', code: 'HS-TEL', category: 'language' },
    { name: 'Tamil', code: 'HS-TAM', category: 'language' },
    { name: 'Kannada', code: 'HS-KAN', category: 'language' },
    { name: 'Malayalam', code: 'HS-MAL', category: 'language' },
    { name: 'Marathi', code: 'HS-MAR', category: 'language' },
    { name: 'Urdu', code: 'HS-URD', category: 'language' },
    { name: 'Sanskrit', code: 'HS-SAN', category: 'language' },
    { name: 'French', code: 'HS-FRE', category: 'language' },
    { name: 'Computer Science', code: 'HS-CS', category: 'elective' },
    { name: 'Information Technology', code: 'HS-IT', category: 'elective' },
    { name: 'Physical Education', code: 'HS-PE', category: 'elective' },
  ],

  'GENERAL_SCHOOL': [
    { name: 'Mathematics', code: 'SCH-MATH', category: 'core' },
    { name: 'Science', code: 'SCH-SCI', category: 'core' },
    { name: 'Social Science', code: 'SCH-SSC', category: 'core' },
    { name: 'English', code: 'SCH-ENG', category: 'language' },
    { name: 'Hindi', code: 'SCH-HIN', category: 'language' },
    { name: 'Environmental Studies', code: 'SCH-EVS', category: 'core' },
    { name: 'Computer Science', code: 'SCH-CS', category: 'elective' },
    { name: 'Physical Education', code: 'SCH-PE', category: 'elective' },
    { name: 'General Knowledge', code: 'SCH-GK', category: 'elective' },
  ],

  'SCIENCE:HIGHER_SECONDARY': [
    { name: 'Mathematics', code: 'SCI-HS-MATH', category: 'core' },
    { name: 'Physics', code: 'SCI-HS-PHY', category: 'core' },
    { name: 'Chemistry', code: 'SCI-HS-CHEM', category: 'core' },
    { name: 'Biology', code: 'SCI-HS-BIO', category: 'core' },
    { name: 'Computer Science', code: 'SCI-HS-CS', category: 'elective' },
    { name: 'Informatics Practices', code: 'SCI-HS-IP', category: 'elective' },
    { name: 'Biotechnology', code: 'SCI-HS-BIOT', category: 'elective' },
    { name: 'English', code: 'SCI-HS-ENG', category: 'language' },
    { name: 'Hindi', code: 'SCI-HS-HIN', category: 'language' },
    { name: 'Physical Education', code: 'SCI-HS-PE', category: 'elective' },
    { name: 'Psychology', code: 'SCI-HS-PSY', category: 'elective' },
    { name: 'Statistics', code: 'SCI-HS-STAT', category: 'elective' },
  ],

  'COMMERCE:HIGHER_SECONDARY': [
    { name: 'Accountancy', code: 'COM-HS-ACC', category: 'core' },
    { name: 'Business Studies', code: 'COM-HS-BS', category: 'core' },
    { name: 'Economics', code: 'COM-HS-ECO', category: 'core' },
    { name: 'Mathematics', code: 'COM-HS-MATH', category: 'elective' },
    { name: 'Informatics Practices', code: 'COM-HS-IP', category: 'elective' },
    { name: 'Entrepreneurship', code: 'COM-HS-ENT', category: 'elective' },
    { name: 'English', code: 'COM-HS-ENG', category: 'language' },
    { name: 'Hindi', code: 'COM-HS-HIN', category: 'language' },
    { name: 'Physical Education', code: 'COM-HS-PE', category: 'elective' },
  ],

  'ARTS_HUMANITIES:HIGHER_SECONDARY': [
    { name: 'History', code: 'ART-HS-HIST', category: 'core' },
    { name: 'Geography', code: 'ART-HS-GEO', category: 'core' },
    { name: 'Political Science', code: 'ART-HS-POL', category: 'core' },
    { name: 'Sociology', code: 'ART-HS-SOC', category: 'elective' },
    { name: 'Psychology', code: 'ART-HS-PSY', category: 'elective' },
    { name: 'Economics', code: 'ART-HS-ECO', category: 'elective' },
    { name: 'Philosophy', code: 'ART-HS-PHI', category: 'elective' },
    { name: 'Fine Arts', code: 'ART-HS-FA', category: 'elective' },
    { name: 'Music', code: 'ART-HS-MUS', category: 'elective' },
    { name: 'Home Science', code: 'ART-HS-HS', category: 'elective' },
    { name: 'English', code: 'ART-HS-ENG', category: 'language' },
    { name: 'Hindi', code: 'ART-HS-HIN', category: 'language' },
  ],

  'ENGINEERING': [
    { name: 'Engineering Mathematics', code: 'ENG-MATH', category: 'core' },
    { name: 'Engineering Physics', code: 'ENG-PHY', category: 'core' },
    { name: 'Engineering Chemistry', code: 'ENG-CHEM', category: 'core' },
    { name: 'Basic Electrical Engineering', code: 'ENG-BEE', category: 'core' },
    { name: 'Basic Electronics', code: 'ENG-BEC', category: 'core' },
    { name: 'Engineering Mechanics', code: 'ENG-MECH', category: 'core' },
    { name: 'Engineering Drawing', code: 'ENG-DRAW', category: 'core' },
    { name: 'Programming in C', code: 'ENG-C', category: 'core' },
    { name: 'Python Programming', code: 'ENG-PY', category: 'core' },
    { name: 'Computer Programming', code: 'ENG-CP', category: 'core' },
    { name: 'Data Structures', code: 'ENG-DS', category: 'core' },
    { name: 'Algorithms', code: 'ENG-ALGO', category: 'core' },
    { name: 'Database Management Systems (DBMS)', code: 'ENG-DBMS', category: 'core' },
    { name: 'Operating Systems', code: 'ENG-OS', category: 'core' },
    { name: 'Computer Networks', code: 'ENG-CN', category: 'core' },
    { name: 'Software Engineering', code: 'ENG-SE', category: 'core' },
    { name: 'Object-Oriented Programming (Java)', code: 'ENG-OOP', category: 'core' },
    { name: 'Web Technologies', code: 'ENG-WEB', category: 'elective' },
    { name: 'Artificial Intelligence', code: 'ENG-AI', category: 'elective' },
    { name: 'Machine Learning', code: 'ENG-ML', category: 'elective' },
    { name: 'Cloud Computing', code: 'ENG-CC', category: 'elective' },
    { name: 'Cybersecurity', code: 'ENG-CYBER', category: 'elective' },
    { name: 'Compiler Design', code: 'ENG-CD', category: 'elective' },
    { name: 'Theory of Computation', code: 'ENG-TOC', category: 'core' },
    { name: 'Computer Architecture', code: 'ENG-CA', category: 'core' },
    { name: 'Distributed Systems', code: 'ENG-DIST', category: 'elective' },
    { name: 'Big Data Analytics', code: 'ENG-BDA', category: 'elective' },
    { name: 'Internet of Things (IoT)', code: 'ENG-IOT', category: 'elective' },
    { name: 'Digital Electronics', code: 'ENG-DE', category: 'core' },
    { name: 'Analog Electronics', code: 'ENG-AE', category: 'core' },
    { name: 'Signals & Systems', code: 'ENG-SS', category: 'core' },
    { name: 'Control Systems', code: 'ENG-CTRL', category: 'core' },
    { name: 'Electromagnetic Theory', code: 'ENG-EMT', category: 'core' },
    { name: 'Communication Systems', code: 'ENG-COMM', category: 'core' },
    { name: 'Microprocessors & Microcontrollers', code: 'ENG-MICRO', category: 'core' },
    { name: 'VLSI Design', code: 'ENG-VLSI', category: 'elective' },
    { name: 'Embedded Systems', code: 'ENG-EMB', category: 'elective' },
    { name: 'Power Systems', code: 'ENG-PWRSYS', category: 'core' },
    { name: 'Electrical Machines', code: 'ENG-EMACH', category: 'core' },
    { name: 'Power Electronics', code: 'ENG-PWREL', category: 'core' },
    { name: 'Thermodynamics', code: 'ENG-THERMO', category: 'core' },
    { name: 'Fluid Mechanics', code: 'ENG-FM', category: 'core' },
    { name: 'Strength of Materials', code: 'ENG-SOM', category: 'core' },
    { name: 'Theory of Machines', code: 'ENG-TOM', category: 'core' },
    { name: 'Machine Design', code: 'ENG-MD', category: 'core' },
    { name: 'Manufacturing Processes', code: 'ENG-MFG', category: 'core' },
    { name: 'Heat Transfer', code: 'ENG-HT', category: 'core' },
    { name: 'CAD/CAM', code: 'ENG-CADCAM', category: 'elective' },
    { name: 'Industrial Engineering', code: 'ENG-INDENG', category: 'elective' },
    { name: 'Automobile Engineering', code: 'ENG-AUTO', category: 'elective' },
    { name: 'Surveying', code: 'ENG-SURV', category: 'core' },
    { name: 'Structural Analysis', code: 'ENG-STRUCT', category: 'core' },
    { name: 'Geotechnical Engineering', code: 'ENG-GEOTECH', category: 'core' },
    { name: 'Transportation Engineering', code: 'ENG-TRANS', category: 'core' },
    { name: 'Environmental Engineering', code: 'ENG-ENVENG', category: 'core' },
    { name: 'Concrete Technology', code: 'ENG-CONC', category: 'core' },
    { name: 'Water Resources Engineering', code: 'ENG-WATER', category: 'core' },
    { name: 'Structural Engineering', code: 'ENG-STRENG', category: 'core' },
    { name: 'Chemical Engineering Thermodynamics', code: 'ENG-CTHERMO', category: 'core' },
    { name: 'Mass Transfer', code: 'ENG-MASS', category: 'core' },
    { name: 'Chemical Reaction Engineering', code: 'ENG-CRE', category: 'core' },
    { name: 'Process Control', code: 'ENG-PROC', category: 'core' },
  ],

  'MEDICAL': [
    { name: 'Anatomy', code: 'MED-ANAT', category: 'core' },
    { name: 'Physiology', code: 'MED-PHYS', category: 'core' },
    { name: 'Biochemistry', code: 'MED-BIOC', category: 'core' },
    { name: 'Pharmacology', code: 'MED-PHAR', category: 'core' },
    { name: 'Pathology', code: 'MED-PATH', category: 'core' },
    { name: 'Microbiology', code: 'MED-MICRO', category: 'core' },
    { name: 'Forensic Medicine & Toxicology', code: 'MED-FMED', category: 'core' },
    { name: 'Community Medicine / PSM', code: 'MED-COMM', category: 'core' },
    { name: 'General Medicine', code: 'MED-MED', category: 'core' },
    { name: 'General Surgery', code: 'MED-SURG', category: 'core' },
    { name: 'Pediatrics', code: 'MED-PED', category: 'core' },
    { name: 'Obstetrics & Gynecology', code: 'MED-OBG', category: 'core' },
    { name: 'Orthopedics', code: 'MED-ORTH', category: 'core' },
    { name: 'ENT', code: 'MED-ENT', category: 'core' },
    { name: 'Ophthalmology', code: 'MED-OPTH', category: 'core' },
    { name: 'Dermatology', code: 'MED-DERM', category: 'core' },
    { name: 'Psychiatry', code: 'MED-PSYCH', category: 'core' },
    { name: 'Radiology', code: 'MED-RAD', category: 'core' },
    { name: 'Anesthesiology', code: 'MED-ANES', category: 'core' },
    { name: 'Emergency Medicine', code: 'MED-EMER', category: 'core' },
    { name: 'Clinical Postings / Case Studies', code: 'MED-CASE', category: 'practical' },
  ],

  'DENTAL': [
    { name: 'Oral Anatomy & Histology', code: 'DEN-OANAT', category: 'core' },
    { name: 'Dental Materials', code: 'DEN-MAT', category: 'core' },
    { name: 'Oral Pathology & Microbiology', code: 'DEN-OPATH', category: 'core' },
    { name: 'General Anatomy', code: 'DEN-GANAT', category: 'core' },
    { name: 'General Physiology', code: 'DEN-GPHYS', category: 'core' },
    { name: 'Biochemistry', code: 'DEN-BIOC', category: 'core' },
    { name: 'Pharmacology', code: 'DEN-PHAR', category: 'core' },
    { name: 'General Medicine', code: 'DEN-MED', category: 'core' },
    { name: 'General Surgery', code: 'DEN-SURG', category: 'core' },
    { name: 'Prosthodontics', code: 'DEN-PROS', category: 'core' },
    { name: 'Conservative Dentistry & Endodontics', code: 'DEN-CONS', category: 'core' },
    { name: 'Periodontics', code: 'DEN-PERI', category: 'core' },
    { name: 'Orthodontics', code: 'DEN-ORTHO', category: 'core' },
    { name: 'Oral & Maxillofacial Surgery', code: 'DEN-OMS', category: 'core' },
    { name: 'Pediatric Dentistry', code: 'DEN-PED', category: 'core' },
    { name: 'Community / Public Health Dentistry', code: 'DEN-COMM', category: 'core' },
    { name: 'Oral Medicine & Radiology', code: 'DEN-OMR', category: 'core' },
  ],

  'NURSING': [
    { name: 'Nursing Foundation', code: 'NUR-FOUND', category: 'core' },
    { name: 'Anatomy & Physiology', code: 'NUR-AP', category: 'core' },
    { name: 'Microbiology', code: 'NUR-MICRO', category: 'core' },
    { name: 'Biochemistry & Nutrition', code: 'NUR-BIOC', category: 'core' },
    { name: 'Medical-Surgical Nursing', code: 'NUR-MSN', category: 'core' },
    { name: 'Community Health Nursing', code: 'NUR-CHN', category: 'core' },
    { name: 'Pediatric / Child Health Nursing', code: 'NUR-PED', category: 'core' },
    { name: 'Obstetric & Midwifery Nursing', code: 'NUR-OBM', category: 'core' },
    { name: 'Mental Health / Psychiatric Nursing', code: 'NUR-MHN', category: 'core' },
    { name: 'Nursing Research & Statistics', code: 'NUR-RES', category: 'core' },
    { name: 'Nursing Management & Education', code: 'NUR-MGT', category: 'core' },
    { name: 'Pharmacology', code: 'NUR-PHAR', category: 'core' },
    { name: 'Sociology', code: 'NUR-SOC', category: 'core' },
    { name: 'Psychology', code: 'NUR-PSY', category: 'core' },
    { name: 'English', code: 'NUR-ENG', category: 'language' },
  ],

  'PHARMACY': [
    { name: 'Pharmaceutics', code: 'PHR-PHAR', category: 'core' },
    { name: 'Pharmaceutical Chemistry (Organic)', code: 'PHR-OCHEM', category: 'core' },
    { name: 'Pharmaceutical Chemistry (Inorganic)', code: 'PHR-ICHEM', category: 'core' },
    { name: 'Pharmacology', code: 'PHR-PHCOL', category: 'core' },
    { name: 'Pharmacognosy & Phytochemistry', code: 'PHR-PGSY', category: 'core' },
    { name: 'Pharmaceutical Analysis', code: 'PHR-ANAL', category: 'core' },
    { name: 'Hospital & Clinical Pharmacy', code: 'PHR-HCP', category: 'core' },
    { name: 'Biopharmaceutics & Pharmacokinetics', code: 'PHR-BIO', category: 'core' },
    { name: 'Pharmaceutical Jurisprudence', code: 'PHR-LAW', category: 'core' },
    { name: 'Industrial Pharmacy', code: 'PHR-IND', category: 'core' },
    { name: 'Drug Regulatory Affairs', code: 'PHR-DRA', category: 'elective' },
    { name: 'Pharmaceutical Microbiology', code: 'PHR-MICRO', category: 'core' },
    { name: 'Pharmaceutical Biotechnology', code: 'PHR-BIOTECH', category: 'elective' },
    { name: 'Anatomy, Physiology & Health Education', code: 'PHR-APHE', category: 'core' },
    { name: 'Biochemistry & Clinical Pathology', code: 'PHR-BIOCLIN', category: 'core' },
  ],

  'ALLIED_HEALTH': [
    { name: 'Human Anatomy', code: 'AH-ANAT', category: 'core' },
    { name: 'Human Physiology', code: 'AH-PHYS', category: 'core' },
    { name: 'Clinical Biochemistry', code: 'AH-BIOC', category: 'core' },
    { name: 'Medical Lab Technology', code: 'AH-MLT', category: 'core' },
    { name: 'Radiography & Imaging', code: 'AH-RAD', category: 'core' },
    { name: 'Physiotherapy', code: 'AH-PT', category: 'core' },
    { name: 'Exercise Therapy', code: 'AH-EXT', category: 'core' },
    { name: 'Electrotherapy', code: 'AH-ELEC', category: 'core' },
    { name: 'Optometry', code: 'AH-OPT', category: 'core' },
    { name: 'Operation Theatre Technology', code: 'AH-OTT', category: 'core' },
    { name: 'Nutrition & Dietetics', code: 'AH-NUTR', category: 'core' },
    { name: 'Emergency & Trauma Care', code: 'AH-EMER', category: 'core' },
    { name: 'Pathology', code: 'AH-PATH', category: 'core' },
    { name: 'Microbiology', code: 'AH-MICRO', category: 'core' },
  ],

  'LAW': [
    { name: 'Constitutional Law', code: 'LAW-CONST', category: 'core' },
    { name: 'Criminal Law (IPC & CrPC)', code: 'LAW-CRIM', category: 'core' },
    { name: 'Contract Law', code: 'LAW-CONT', category: 'core' },
    { name: 'Property Law / Transfer of Property', code: 'LAW-PROP', category: 'core' },
    { name: 'Family Law', code: 'LAW-FAM', category: 'core' },
    { name: 'Administrative Law', code: 'LAW-ADMIN', category: 'core' },
    { name: 'Company Law', code: 'LAW-COMP', category: 'core' },
    { name: 'International Law', code: 'LAW-INTL', category: 'elective' },
    { name: 'Intellectual Property Law', code: 'LAW-IPR', category: 'elective' },
    { name: 'Environmental Law', code: 'LAW-ENV', category: 'elective' },
    { name: 'Cyber Law / IT Law', code: 'LAW-CYBER', category: 'elective' },
    { name: 'Labour & Industrial Law', code: 'LAW-LABOUR', category: 'core' },
    { name: 'Jurisprudence', code: 'LAW-JURIS', category: 'core' },
    { name: 'Law of Evidence', code: 'LAW-EVID', category: 'core' },
    { name: 'Taxation Law', code: 'LAW-TAX', category: 'elective' },
    { name: 'Human Rights Law', code: 'LAW-HR', category: 'elective' },
    { name: 'Moot Court / Clinical Legal Education', code: 'LAW-MOOT', category: 'practical' },
  ],

  'MANAGEMENT': [
    { name: 'Principles of Management', code: 'MGT-POM', category: 'core' },
    { name: 'Financial Management', code: 'MGT-FM', category: 'core' },
    { name: 'Marketing Management', code: 'MGT-MM', category: 'core' },
    { name: 'Human Resource Management', code: 'MGT-HRM', category: 'core' },
    { name: 'Operations Management', code: 'MGT-OM', category: 'core' },
    { name: 'Business Analytics', code: 'MGT-BA', category: 'elective' },
    { name: 'Strategic Management', code: 'MGT-SM', category: 'core' },
    { name: 'Organizational Behavior', code: 'MGT-OB', category: 'core' },
    { name: 'Business Law', code: 'MGT-BL', category: 'core' },
    { name: 'Entrepreneurship', code: 'MGT-ENT', category: 'elective' },
    { name: 'International Business', code: 'MGT-IB', category: 'elective' },
    { name: 'Managerial Economics', code: 'MGT-ME', category: 'core' },
    { name: 'Business Communication', code: 'MGT-BC', category: 'core' },
    { name: 'Business Statistics', code: 'MGT-STAT', category: 'core' },
    { name: 'Supply Chain Management', code: 'MGT-SCM', category: 'elective' },
    { name: 'Digital Marketing', code: 'MGT-DM', category: 'elective' },
  ],

  'COMPUTER_SCIENCE_IT': [
    { name: 'Programming Fundamentals', code: 'CSIT-PF', category: 'core' },
    { name: 'Object-Oriented Programming', code: 'CSIT-OOP', category: 'core' },
    { name: 'Data Structures & Algorithms', code: 'CSIT-DSA', category: 'core' },
    { name: 'Database Systems', code: 'CSIT-DBS', category: 'core' },
    { name: 'Operating Systems', code: 'CSIT-OS', category: 'core' },
    { name: 'Computer Networks', code: 'CSIT-CN', category: 'core' },
    { name: 'Software Engineering', code: 'CSIT-SE', category: 'core' },
    { name: 'Web Development', code: 'CSIT-WD', category: 'elective' },
    { name: 'Mobile App Development', code: 'CSIT-MAD', category: 'elective' },
    { name: 'Artificial Intelligence', code: 'CSIT-AI', category: 'elective' },
    { name: 'Machine Learning', code: 'CSIT-ML', category: 'elective' },
    { name: 'Data Science', code: 'CSIT-DS', category: 'elective' },
    { name: 'Cloud Computing', code: 'CSIT-CC', category: 'elective' },
    { name: 'Cybersecurity', code: 'CSIT-SEC', category: 'elective' },
    { name: 'System Design', code: 'CSIT-SD', category: 'elective' },
    { name: 'Discrete Mathematics', code: 'CSIT-DM', category: 'core' },
    { name: 'Computer Architecture & Organization', code: 'CSIT-COA', category: 'core' },
    { name: 'Digital Logic Design', code: 'CSIT-DLD', category: 'core' },
    { name: 'Compiler Design', code: 'CSIT-CD', category: 'elective' },
    { name: 'Theory of Computation', code: 'CSIT-TOC', category: 'core' },
  ],

  'COMMERCE:UG': [
    { name: 'Financial Accounting', code: 'COM-UG-FA', category: 'core' },
    { name: 'Cost & Management Accounting', code: 'COM-UG-CA', category: 'core' },
    { name: 'Taxation (Direct & Indirect)', code: 'COM-UG-TAX', category: 'core' },
    { name: 'Auditing & Assurance', code: 'COM-UG-AUD', category: 'core' },
    { name: 'Business Law', code: 'COM-UG-BL', category: 'core' },
    { name: 'Statistics & Quantitative Methods', code: 'COM-UG-STAT', category: 'core' },
    { name: 'Microeconomics', code: 'COM-UG-MICRO', category: 'core' },
    { name: 'Macroeconomics', code: 'COM-UG-MACRO', category: 'core' },
    { name: 'Banking & Financial Services', code: 'COM-UG-BF', category: 'elective' },
    { name: 'Corporate Law', code: 'COM-UG-CL', category: 'elective' },
    { name: 'Business Communication', code: 'COM-UG-BC', category: 'core' },
    { name: 'Marketing', code: 'COM-UG-MKT', category: 'elective' },
    { name: 'E-Commerce', code: 'COM-UG-ECOM', category: 'elective' },
    { name: 'Insurance', code: 'COM-UG-INS', category: 'elective' },
  ],

  'AGRICULTURE': [
    { name: 'Agronomy', code: 'AGR-AGRO', category: 'core' },
    { name: 'Soil Science', code: 'AGR-SOIL', category: 'core' },
    { name: 'Plant Pathology', code: 'AGR-PATH', category: 'core' },
    { name: 'Entomology', code: 'AGR-ENTO', category: 'core' },
    { name: 'Plant Breeding & Genetics', code: 'AGR-BREED', category: 'core' },
    { name: 'Horticulture', code: 'AGR-HORT', category: 'core' },
    { name: 'Agricultural Economics', code: 'AGR-ECON', category: 'core' },
    { name: 'Agricultural Engineering', code: 'AGR-ENGG', category: 'core' },
    { name: 'Animal Husbandry', code: 'AGR-AH', category: 'core' },
    { name: 'Agricultural Extension', code: 'AGR-EXT', category: 'core' },
  ],

  'COMPETITIVE_EXAM': [
    { name: 'Quantitative Aptitude', code: 'COMP-QA', category: 'core' },
    { name: 'Logical Reasoning', code: 'COMP-LR', category: 'core' },
    { name: 'Verbal Ability / English', code: 'COMP-VA', category: 'core' },
    { name: 'General Knowledge / General Awareness', code: 'COMP-GK', category: 'core' },
    { name: 'Current Affairs', code: 'COMP-CA', category: 'core' },
    { name: 'Data Interpretation', code: 'COMP-DI', category: 'core' },
    { name: 'Physics (JEE/NEET)', code: 'COMP-PHY', category: 'core' },
    { name: 'Chemistry (JEE/NEET)', code: 'COMP-CHEM', category: 'core' },
    { name: 'Mathematics (JEE)', code: 'COMP-MATH', category: 'core' },
    { name: 'Biology (NEET)', code: 'COMP-BIO', category: 'core' },
    { name: 'Indian Polity', code: 'COMP-POLITY', category: 'core' },
    { name: 'History (UPSC)', code: 'COMP-HIST', category: 'core' },
    { name: 'Geography (UPSC)', code: 'COMP-GEO', category: 'core' },
    { name: 'Economy (UPSC)', code: 'COMP-ECO', category: 'core' },
    { name: 'Science & Technology', code: 'COMP-SCITECH', category: 'core' },
    { name: 'GATE - Subject Paper', code: 'COMP-GATE', category: 'core' },
    { name: 'Essay Writing', code: 'COMP-ESSAY', category: 'core' },
  ],

  'VOCATIONAL': [
    { name: 'Computer Hardware & Networking', code: 'VOC-HW', category: 'core' },
    { name: 'Web Design', code: 'VOC-WEB', category: 'core' },
    { name: 'Tally / Accounting Software', code: 'VOC-TALLY', category: 'core' },
    { name: 'Electrical Wiring', code: 'VOC-ELEC', category: 'core' },
    { name: 'Plumbing', code: 'VOC-PLUMB', category: 'core' },
    { name: 'Automotive Repair', code: 'VOC-AUTO', category: 'core' },
    { name: 'Welding & Fabrication', code: 'VOC-WELD', category: 'core' },
    { name: 'Fashion Design', code: 'VOC-FASHION', category: 'elective' },
    { name: 'Photography', code: 'VOC-PHOTO', category: 'elective' },
  ],
};

// ─── COURSE → SUBJECT MAPPING ───────────────────────────────

export const COURSE_SUBJECT_MAP: Record<string, string[]> = {
  'BTECH-CSE': ['ENG-MATH', 'ENG-PHY', 'ENG-CHEM', 'ENG-BEE', 'ENG-BEC', 'ENG-MECH', 'ENG-DRAW', 'ENG-C', 'ENG-PY', 'ENG-CP', 'ENG-DS', 'ENG-ALGO', 'ENG-DBMS', 'ENG-OS', 'ENG-CN', 'ENG-SE', 'ENG-OOP', 'ENG-WEB', 'ENG-AI', 'ENG-ML', 'ENG-CC', 'ENG-CYBER', 'ENG-CD', 'ENG-TOC', 'ENG-CA', 'ENG-DE', 'ENG-DIST', 'ENG-BDA', 'ENG-IOT'],
  'BTECH-ECE': ['ENG-MATH', 'ENG-PHY', 'ENG-CHEM', 'ENG-BEE', 'ENG-BEC', 'ENG-MECH', 'ENG-DRAW', 'ENG-C', 'ENG-CP', 'ENG-DE', 'ENG-AE', 'ENG-SS', 'ENG-CTRL', 'ENG-EMT', 'ENG-COMM', 'ENG-MICRO', 'ENG-VLSI', 'ENG-EMB', 'ENG-DS', 'ENG-CN', 'ENG-IOT'],
  'BTECH-EEE': ['ENG-MATH', 'ENG-PHY', 'ENG-CHEM', 'ENG-BEE', 'ENG-BEC', 'ENG-MECH', 'ENG-DRAW', 'ENG-C', 'ENG-CP', 'ENG-DE', 'ENG-AE', 'ENG-SS', 'ENG-CTRL', 'ENG-EMT', 'ENG-PWRSYS', 'ENG-EMACH', 'ENG-PWREL', 'ENG-MICRO', 'ENG-EMB'],
  'BTECH-ME': ['ENG-MATH', 'ENG-PHY', 'ENG-CHEM', 'ENG-BEE', 'ENG-MECH', 'ENG-DRAW', 'ENG-C', 'ENG-CP', 'ENG-THERMO', 'ENG-FM', 'ENG-SOM', 'ENG-TOM', 'ENG-MD', 'ENG-MFG', 'ENG-HT', 'ENG-CADCAM', 'ENG-INDENG', 'ENG-AUTO', 'ENG-CTRL'],
  'BTECH-CE': ['ENG-MATH', 'ENG-PHY', 'ENG-CHEM', 'ENG-BEE', 'ENG-MECH', 'ENG-DRAW', 'ENG-C', 'ENG-CP', 'ENG-FM', 'ENG-SOM', 'ENG-SURV', 'ENG-STRUCT', 'ENG-GEOTECH', 'ENG-TRANS', 'ENG-ENVENG', 'ENG-CONC', 'ENG-WATER', 'ENG-STRENG'],
  'BTECH-IT': ['ENG-MATH', 'ENG-PHY', 'ENG-CHEM', 'ENG-BEE', 'ENG-BEC', 'ENG-MECH', 'ENG-DRAW', 'ENG-C', 'ENG-PY', 'ENG-CP', 'ENG-DS', 'ENG-ALGO', 'ENG-DBMS', 'ENG-OS', 'ENG-CN', 'ENG-SE', 'ENG-OOP', 'ENG-WEB', 'ENG-AI', 'ENG-ML', 'ENG-CC', 'ENG-CYBER', 'ENG-IOT'],
  'BTECH-CHEM': ['ENG-MATH', 'ENG-PHY', 'ENG-CHEM', 'ENG-BEE', 'ENG-MECH', 'ENG-DRAW', 'ENG-C', 'ENG-CP', 'ENG-THERMO', 'ENG-FM', 'ENG-CTHERMO', 'ENG-MASS', 'ENG-CRE', 'ENG-PROC'],
  'BTECH-AI': ['ENG-MATH', 'ENG-PHY', 'ENG-CHEM', 'ENG-C', 'ENG-PY', 'ENG-CP', 'ENG-DS', 'ENG-ALGO', 'ENG-DBMS', 'ENG-OS', 'ENG-CN', 'ENG-SE', 'ENG-OOP', 'ENG-AI', 'ENG-ML', 'ENG-CC', 'ENG-BDA', 'ENG-IOT', 'ENG-DE'],
};

// ─── EXAM TYPES & DIFFICULTY ────────────────────────────────

export const EXAM_TYPES = [
  { value: 'practice', label: 'Practice Questions' },
  { value: 'topic_test', label: 'Topic Test' },
  { value: 'chapter_test', label: 'Chapter Test' },
  { value: 'semester_prep', label: 'Semester Prep' },
  { value: 'final_exam', label: 'Final Exam Prep' },
  { value: 'entrance_exam', label: 'Entrance Exam Prep' },
  { value: 'mcq', label: 'MCQ Only' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer' },
  { value: 'true_false', label: 'True / False' },
  { value: 'descriptive', label: 'Descriptive' },
  { value: 'case_based', label: 'Case-Based' },
  { value: 'viva_prep', label: 'Viva Prep' },
  { value: 'mixed', label: 'Mixed' },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'adaptive', label: 'Adaptive' },
] as const;

export const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30] as const;

export const COMPETITIVE_EXAMS = [
  'JEE Main', 'JEE Advanced', 'NEET-UG', 'NEET-PG', 'GATE',
  'CAT', 'CLAT', 'UPSC', 'SSC', 'IBPS', 'GRE', 'GMAT',
  'SAT', 'IELTS', 'TOEFL', 'AIIMS', 'INICET', 'FMGE',
  'GPAT', 'NIPER JEE', 'MH-CET', 'AP EAMCET', 'TS EAMCET',
  'KCET', 'COMEDK', 'VITEEE', 'BITSAT', 'WBJEE', 'CUET',
] as const;

// ─── HELPER FUNCTIONS ───────────────────────────────────────

export function getSubjectsForContext(stream?: string, level?: string, courseCode?: string): SubjectEntry[] {
  const results: SubjectEntry[] = [];
  const seen = new Set<string>();

  if (courseCode && COURSE_SUBJECT_MAP[courseCode]) {
    const allowedCodes = new Set(COURSE_SUBJECT_MAP[courseCode]);
    const course = COURSE_CATALOG.find(c => c.code === courseCode);
    const courseStream = course?.stream || stream;
    if (courseStream && SUBJECT_CATALOG[courseStream]) {
      for (const s of SUBJECT_CATALOG[courseStream]) {
        if (allowedCodes.has(s.code) && !seen.has(s.code)) {
          results.push(s);
          seen.add(s.code);
        }
      }
    }
    if (results.length > 0) return results;
  }

  if (stream && level) {
    const key = `${stream}:${level}`;
    if (SUBJECT_CATALOG[key]) {
      for (const s of SUBJECT_CATALOG[key]) {
        if (!seen.has(s.code)) { results.push(s); seen.add(s.code); }
      }
    }
  }

  if (stream && SUBJECT_CATALOG[stream]) {
    for (const s of SUBJECT_CATALOG[stream]) {
      if (!seen.has(s.code)) { results.push(s); seen.add(s.code); }
    }
  }

  if (results.length === 0) {
    const fallback = SUBJECT_CATALOG['GENERAL_SCHOOL'] || [];
    for (const s of fallback) {
      if (!seen.has(s.code)) { results.push(s); seen.add(s.code); }
    }
  }

  return results;
}

export function getStreamsForLevel(level: string): typeof STREAMS[number][] {
  return STREAMS.filter(s => (s.levels as readonly string[]).includes(level));
}

export function getGradesForLevel(level: string): string[] {
  const found = ACADEMIC_LEVELS.find(l => l.value === level);
  return found ? [...found.grades] : [];
}

export function getCoursesForStreamLevel(stream: string, level?: string): CourseEntry[] {
  return COURSE_CATALOG.filter(c => {
    if (c.stream !== stream) return false;
    if (level && c.level !== level) return false;
    return true;
  });
}

export function getYearsForCourse(courseCode: string): string[] {
  const course = COURSE_CATALOG.find(c => c.code === courseCode);
  if (!course) return [];
  if (course.professionalYears) return course.professionalYears;
  if (course.semesters) {
    return Array.from({ length: course.semesters }, (_, i) => `Semester ${i + 1}`);
  }
  const levelDef = ACADEMIC_LEVELS.find(l => l.value === course.level);
  return levelDef ? [...levelDef.grades] : [];
}

export function getStreamsForInstitutionType(institutionType: string): string[] {
  return INSTITUTION_STREAM_MAP[institutionType] || [];
}
