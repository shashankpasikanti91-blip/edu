export type UserRole =
  | 'STUDENT'
  | 'PARENT'
  | 'TEACHER'
  | 'HOD'
  | 'STAFF'
  | 'COORDINATOR'
  | 'BRANCH_ADMIN'
  | 'ACADEMIC_ADMIN'
  | 'DEPARTMENT_ADMIN'
  | 'INSTITUTION_ADMIN'
  | 'INSTITUTION_OWNER'
  | 'SUPER_ADMIN';

export type AccountType = 'B2C_STUDENT' | 'B2B_INSTITUTION';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accountType: AccountType;
  emailVerified: boolean;
  tenantId: string | null;
  directStudentId: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
}

// ─── INSTITUTION PROFILE TYPES ──────────────────────────────

export interface InstitutionProfile {
  id: string;
  tenantId: string;
  institutionName: string;
  shortName: string | null;
  institutionCode: string | null;
  institutionType: string;
  affiliationType: string | null;
  affiliatedBody: string | null;
  regulatoryBody: string | null;
  institutionCategory: string | null;
  country: string;
  state: string | null;
  city: string | null;
  fullAddress: string | null;
  pincode: string | null;
  levelsOffered: string[];
  streamsOffered: string[];
  mediumOfInstruction: string[];
  academicCalendarType: string | null;
  yearModel: string | null;
  officialEmail: string | null;
  officialPhone: string | null;
  website: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  supportContact: string | null;
  maxTeachers: number | null;
  maxStudents: number | null;
  branchSupport: boolean;
  attendanceModel: string | null;
  examModel: string | null;
  lmsEnabled: boolean;
  aiEnabled: boolean;
  onboardingStatus: string;
  onboardingCompletedAt: string | null;
}

export interface TaxonomyOption {
  value: string;
  label: string;
}

export interface SubjectEntry {
  name: string;
  code: string;
  category: 'core' | 'elective' | 'lab' | 'practical' | 'language';
}

export interface SubUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: string;
  phone: string | null;
  emailVerified: boolean;
  directStudentId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  studentProfile?: {
    studentId: string | null;
    departmentId: string | null;
    grade: string | null;
    section: string | null;
    rollNumber: string | null;
  };
  teacherProfile?: {
    employeeId: string | null;
    departmentId: string | null;
    designation: string | null;
    specialization: string | null;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface DashboardStats {
  totalQuizAttempts: number;
  totalNotes: number;
  todayStudyPlans: StudyPlan[];
  unreadNotifications: number;
}

export interface StudyPlan {
  id: string;
  title: string;
  date: string;
  subjectName: string;
  duration: number;
  isCompleted: boolean;
  notes: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalContent: number;
  pendingApprovals: number;
  recentActivity: number;
}

// ─── BILLING & SUBSCRIPTION TYPES ───────────────────────────

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'STUDENT' | 'INSTITUTION';
  price: number;
  yearlyPrice: number;
  currency: string;
  interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  maxUsers: number;
  maxStorage: number;
  maxAiCredits: number;
  features: Record<string, unknown>;
  brandingTier: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'WHITE_LABEL';
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
}

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' | 'PAUSED' | 'TRIALING';

export interface Subscription {
  id: string;
  tenantId: string | null;
  userId: string | null;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  autoRenew: boolean;
  seatsUsed: number;
  storageUsedMb: number;
  aiCreditsUsed: number;
  plan: Plan;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'VOID';
  description: string;
  discountAmount: number;
  createdAt: string;
  paidAt: string | null;
  dueDate: string | null;
  pdfUrl: string | null;
}

export interface SubscriptionAlert {
  id: string;
  type: 'RENEWAL_REMINDER' | 'EXPIRY_WARNING' | 'USAGE_LIMIT' | 'UPGRADE_SUGGESTION' | 'PAYMENT_FAILED' | 'PLAN_CHANGED';
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  actionUrl: string | null;
}

export interface BillingDashboard {
  subscription: Subscription | null;
  usage: {
    seatsUsed: number;
    seatsLimit: number;
    seatsPercentage: number;
    storageUsedMb: number;
    storageLimitMb: number;
    storagePercentage: number;
    aiCreditsUsed: number;
    aiCreditsLimit: number;
    aiCreditsPercentage: number;
  } | null;
  recentInvoices: Invoice[];
  alerts: SubscriptionAlert[];
  upgradeSuggestions: string[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface TenantBranding {
  id: string;
  tenantId: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'WHITE_LABEL';
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  subdomain: string | null;
  whiteLabel: boolean;
}

// ─── AI CHAT TYPES ──────────────────────────────────────────

export interface AiChat {
  id: string;
  title: string;
  lastMessage: string | null;
  updatedAt: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// ─── ADD-ON MODULE TYPES ────────────────────────────────────

export type AddOnSlug =
  | 'ATTENDANCE'
  | 'BILLING_FINANCE'
  | 'PARENT_PORTAL'
  | 'TRANSPORT'
  | 'FEE_REMINDER'
  | 'WHATSAPP'
  | 'LMS'
  | 'AI_ANALYTICS';

export interface AddOnModule {
  slug: AddOnSlug;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  trialDays: number;
}

export interface TenantAddOn {
  slug: AddOnSlug;
  name: string;
  price: number | null;
  billingInterval: string;
  activatedAt: string;
  expiresAt: string | null;
  trialEndsAt: string | null;
}

export interface BillingSummary {
  currentPlan: Plan | null;
  subscriptionStatus: string | null;
  renewalDate: string | null;
  enabledAddOns: TenantAddOn[];
  availableAddOns: AddOnModule[];
  costBreakdown: {
    basePlan: number;
    addOns: number;
    total: number;
    currency: string;
  };
}

// ─── B2C STUDENT TYPES ──────────────────────────────────────

export interface StudentProfile {
  id: string;
  grade: string | null;
  board: string | null;
  goalDescription: string | null;
  courseName: string | null;
  examCountdownDate: string | null;
  targetExams: string[];
}

export interface StudentDashboard {
  user: User;
  profile: StudentProfile;
  stats: {
    totalNotes: number;
    totalQuizzes: number;
    completedPlans: number;
    totalPlans: number;
    completionRate: number;
  };
  examCountdown: { date: string; daysLeft: number } | null;
  recentNotes: Array<{ id: string; title: string; subjectName: string | null; updatedAt: string }>;
  todayStudyPlans: StudyPlan[];
  recentQuizAttempts: Array<{ id: string; score: number | null; totalMarks: number; quiz: { title: string } }>;
  unreadNotifications: number;
  recentAiChats: Array<{ id: string; title: string; updatedAt: string }>;
}

export interface ReferralInfo {
  referralCode: string;
  totalReferrals: number;
  convertedReferrals: number;
  referrals: Array<{
    id: string;
    referredEmail: string | null;
    status: string;
    convertedAt: string | null;
    createdAt: string;
  }>;
}
