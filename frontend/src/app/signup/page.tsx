'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Sparkles, Loader2, GraduationCap, Building2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

// ─── Schemas ─────────────────────────────────────────────────

const studentSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and a number'),
  grade: z.string().optional(),
  goal: z.string().optional(),
  preferredLang: z.string().optional(),
  referralCode: z.string().optional(),
});

const joinInstitutionSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and a number'),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER']),
  tenantId: z.string().min(1, 'Institution code is required'),
});

const registerInstitutionSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and a number'),
  institutionName: z.string().min(2, 'Institution name is required').max(200),
  institutionType: z.string().min(1, 'Please select institution type'),
  phone: z.string().optional(),
});

type StudentForm = z.infer<typeof studentSignupSchema>;
type JoinForm = z.infer<typeof joinInstitutionSchema>;
type RegisterForm = z.infer<typeof registerInstitutionSchema>;

type SignupMode = 'student' | 'join' | 'register';

// ─── Reusable Components ─────────────────────────────────────

function PasswordField({ showPassword, setShowPassword, register, error, id }: {
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  register: Record<string, unknown>;
  error?: { message?: string };
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <div className="relative">
        <input id={id} type={showPassword ? 'text' : 'password'} className="input-field pr-11" placeholder="Min 8 characters" autoComplete="new-password" {...register} />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
}

function NameFields({ register, errors, prefix }: {
  register: (name: string) => ReturnType<ReturnType<typeof useForm>['register']>;
  errors: Record<string, { message?: string } | undefined>;
  prefix: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label htmlFor={`${prefix}FirstName`} className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
        <input id={`${prefix}FirstName`} type="text" className="input-field" placeholder="John" autoComplete="given-name" {...register('firstName')} />
        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
      </div>
      <div>
        <label htmlFor={`${prefix}LastName`} className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input id={`${prefix}LastName`} type="text" className="input-field" placeholder="Doe" autoComplete="family-name" {...register('lastName')} />
        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, signupInstitution } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<SignupMode>(
    (searchParams.get('mode') as SignupMode) || 'student'
  );

  // Taxonomy data for dropdowns
  const [grades, setGrades] = useState<{ value: string; label: string }[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    api.get('/taxonomy/grades').then(r => setGrades(r.data.data || [])).catch(() => {});
    api.get('/taxonomy/institution-types').then(r => setInstitutionTypes(r.data.data || [])).catch(() => {});
  }, []);

  const studentForm = useForm<StudentForm>({
    resolver: zodResolver(studentSignupSchema),
    defaultValues: { referralCode: searchParams.get('ref') || '', preferredLang: 'en' },
  });

  const joinForm = useForm<JoinForm>({
    resolver: zodResolver(joinInstitutionSchema),
    defaultValues: { role: 'STUDENT' },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerInstitutionSchema),
  });

  const onStudentSubmit = async (data: StudentForm) => {
    setIsSubmitting(true);
    try {
      await signup(data);
      toast.success('Account created! Welcome to SRP Education AI.');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onJoinSubmit = async (data: JoinForm) => {
    setIsSubmitting(true);
    try {
      await signup(data);
      toast.success('Account created! Please check your email to verify.');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await signupInstitution(data);
      toast.success('Institution registered! Let\'s set up your institution.');
      router.push('/dashboard/onboarding');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modeConfig = [
    { key: 'student' as const, label: 'Student', icon: GraduationCap, desc: 'Individual learner' },
    { key: 'join' as const, label: 'Join', icon: Users, desc: 'Join your school' },
    { key: 'register' as const, label: 'Institution', icon: Building2, desc: 'Register school' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-violet-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SRP Education AI</span>
          </Link>
        </div>

        {/* Card */}
        <div className="card-elevated">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 mb-6">Start your learning journey today</p>

          {/* Mode Toggle — 3 tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl">
            {modeConfig.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  mode === m.key
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <m.icon className="w-4 h-4" />
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* ─── Individual Student Form ─── */}
          {mode === 'student' && (
            <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
              <NameFields
                register={(name) => studentForm.register(name as keyof StudentForm)}
                errors={studentForm.formState.errors}
                prefix="stu"
              />

              <div>
                <label htmlFor="stuEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="stuEmail" type="email" className="input-field" placeholder="you@example.com" autoComplete="email" {...studentForm.register('email')} />
                {studentForm.formState.errors.email && <p className="mt-1 text-sm text-red-500">{studentForm.formState.errors.email.message}</p>}
              </div>

              <PasswordField
                id="stuPassword"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                register={studentForm.register('password')}
                error={studentForm.formState.errors.password}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Class / Grade</label>
                  <select id="grade" className="input-field" {...studentForm.register('grade')}>
                    <option value="">Select</option>
                    {grades.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="preferredLang" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select id="preferredLang" className="input-field" {...studentForm.register('preferredLang')}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="kn">Kannada</option>
                    <option value="ml">Malayalam</option>
                    <option value="mr">Marathi</option>
                    <option value="bn">Bengali</option>
                    <option value="gu">Gujarati</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Goal (optional)</label>
                <input id="goal" type="text" className="input-field" placeholder="e.g., JEE, NEET, Board Exams..." {...studentForm.register('goal')} />
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">Referral Code (optional)</label>
                <input id="referralCode" type="text" className="input-field" placeholder="Friend's referral code" {...studentForm.register('referralCode')} />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Creating account...</>) : 'Start Learning — Free'}
              </button>
            </form>
          )}

          {/* ─── Join Institution Form ─── */}
          {mode === 'join' && (
            <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-blue-700">Enter the institution code provided by your school/college to join.</p>
              </div>

              <NameFields
                register={(name) => joinForm.register(name as keyof JoinForm)}
                errors={joinForm.formState.errors}
                prefix="join"
              />

              <div>
                <label htmlFor="joinEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="joinEmail" type="email" className="input-field" placeholder="you@school.edu" autoComplete="email" {...joinForm.register('email')} />
                {joinForm.formState.errors.email && <p className="mt-1 text-sm text-red-500">{joinForm.formState.errors.email.message}</p>}
              </div>

              <PasswordField
                id="joinPassword"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                register={joinForm.register('password')}
                error={joinForm.formState.errors.password}
              />

              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1">Institution Code</label>
                <input id="tenantId" type="text" className="input-field" placeholder="Provided by your school" {...joinForm.register('tenantId')} />
                {joinForm.formState.errors.tenantId && <p className="mt-1 text-sm text-red-500">{joinForm.formState.errors.tenantId.message}</p>}
              </div>

              <div>
                <label htmlFor="joinRole" className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <select id="joinRole" className="input-field" {...joinForm.register('role')}>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Creating account...</>) : 'Join Institution'}
              </button>
            </form>
          )}

          {/* ─── Register New Institution Form ─── */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-amber-700">Register your school, college, or coaching institute. You&apos;ll be the Institution Owner and can set up everything after registration.</p>
              </div>

              <NameFields
                register={(name) => registerForm.register(name as keyof RegisterForm)}
                errors={registerForm.formState.errors}
                prefix="reg"
              />

              <div>
                <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="regEmail" type="email" className="input-field" placeholder="admin@institution.edu" autoComplete="email" {...registerForm.register('email')} />
                {registerForm.formState.errors.email && <p className="mt-1 text-sm text-red-500">{registerForm.formState.errors.email.message}</p>}
              </div>

              <PasswordField
                id="regPassword"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                register={registerForm.register('password')}
                error={registerForm.formState.errors.password}
              />

              <div>
                <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                <input id="institutionName" type="text" className="input-field" placeholder="e.g., Delhi Public School, Kota" {...registerForm.register('institutionName')} />
                {registerForm.formState.errors.institutionName && <p className="mt-1 text-sm text-red-500">{registerForm.formState.errors.institutionName.message}</p>}
              </div>

              <div>
                <label htmlFor="institutionType" className="block text-sm font-medium text-gray-700 mb-1">Institution Type</label>
                <select id="institutionType" className="input-field" {...registerForm.register('institutionType')}>
                  <option value="">Select type</option>
                  {institutionTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {registerForm.formState.errors.institutionType && <p className="mt-1 text-sm text-red-500">{registerForm.formState.errors.institutionType.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input id="phone" type="tel" className="input-field" placeholder="+91 98765 43210" {...registerForm.register('phone')} />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Registering...</>) : 'Register Institution'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
