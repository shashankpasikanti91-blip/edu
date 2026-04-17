'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Sparkles, Loader2, GraduationCap, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const studentSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must include uppercase, lowercase, and a number'
    ),
  grade: z.string().optional(),
  goal: z.string().optional(),
  preferredLang: z.string().optional(),
  referralCode: z.string().optional(),
});

const institutionSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must include uppercase, lowercase, and a number'
    ),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER']),
  tenantId: z.string().min(1, 'Institution code is required'),
});

type StudentSignupForm = z.infer<typeof studentSignupSchema>;
type InstitutionSignupForm = z.infer<typeof institutionSignupSchema>;

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
  const signup = useAuthStore((s) => s.signup);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'student' | 'institution'>(
    searchParams.get('mode') === 'institution' ? 'institution' : 'student'
  );

  const studentForm = useForm<StudentSignupForm>({
    resolver: zodResolver(studentSignupSchema),
    defaultValues: {
      referralCode: searchParams.get('ref') || '',
      preferredLang: 'en',
    },
  });

  const institutionForm = useForm<InstitutionSignupForm>({
    resolver: zodResolver(institutionSignupSchema),
    defaultValues: { role: 'STUDENT' },
  });

  const onStudentSubmit = async (data: StudentSignupForm) => {
    setIsSubmitting(true);
    try {
      await signup({ ...data });
      toast.success('Account created! Welcome to SRP Education AI.');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInstitutionSubmit = async (data: InstitutionSignupForm) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-violet-50 px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative">
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

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'student'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setMode('institution')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'institution'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Institution
            </button>
          </div>

          {mode === 'student' ? (
            <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="input-field"
                    placeholder="John"
                    autoComplete="given-name"
                    {...studentForm.register('firstName')}
                  />
                  {studentForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{studentForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="input-field"
                    placeholder="Doe"
                    autoComplete="family-name"
                    {...studentForm.register('lastName')}
                  />
                  {studentForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{studentForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email" type="email" className="input-field" placeholder="you@example.com" autoComplete="email" {...studentForm.register('email')} />
                {studentForm.formState.errors.email && <p className="mt-1 text-sm text-red-500">{studentForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} className="input-field pr-11" placeholder="Min 8 characters" autoComplete="new-password" {...studentForm.register('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {studentForm.formState.errors.password && <p className="mt-1 text-sm text-red-500">{studentForm.formState.errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Class / Grade</label>
                  <select id="grade" className="input-field" {...studentForm.register('grade')}>
                    <option value="">Select</option>
                    {['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG Year 1', 'UG Year 2', 'UG Year 3', 'UG Year 4', 'PG', 'Competitive Exam'].map((g) => (
                      <option key={g} value={g}>{g}</option>
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
          ) : (
            <form onSubmit={institutionForm.handleSubmit(onInstitutionSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="instFirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input id="instFirstName" type="text" className="input-field" placeholder="John" autoComplete="given-name" {...institutionForm.register('firstName')} />
                  {institutionForm.formState.errors.firstName && <p className="mt-1 text-sm text-red-500">{institutionForm.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <label htmlFor="instLastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input id="instLastName" type="text" className="input-field" placeholder="Doe" autoComplete="family-name" {...institutionForm.register('lastName')} />
                  {institutionForm.formState.errors.lastName && <p className="mt-1 text-sm text-red-500">{institutionForm.formState.errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="instEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="instEmail" type="email" className="input-field" placeholder="you@school.edu" autoComplete="email" {...institutionForm.register('email')} />
                {institutionForm.formState.errors.email && <p className="mt-1 text-sm text-red-500">{institutionForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="instPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input id="instPassword" type={showPassword ? 'text' : 'password'} className="input-field pr-11" placeholder="Min 8 characters" autoComplete="new-password" {...institutionForm.register('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {institutionForm.formState.errors.password && <p className="mt-1 text-sm text-red-500">{institutionForm.formState.errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1">Institution Code</label>
                <input id="tenantId" type="text" className="input-field" placeholder="Provided by your school" {...institutionForm.register('tenantId')} />
                {institutionForm.formState.errors.tenantId && <p className="mt-1 text-sm text-red-500">{institutionForm.formState.errors.tenantId.message}</p>}
              </div>

              <div>
                <label htmlFor="instRole" className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <select id="instRole" className="input-field" {...institutionForm.register('role')}>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Creating account...</>) : 'Create Account'}
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
