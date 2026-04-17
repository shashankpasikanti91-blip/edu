'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, MapPin, GraduationCap, Palette, Settings,
  ChevronRight, ChevronLeft, Check, Loader2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { TaxonomyOption, InstitutionProfile } from '@/types';

// ─── Step definitions ────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Basic Details', icon: Building2, desc: 'Institution identity' },
  { id: 2, title: 'Affiliation & Location', icon: MapPin, desc: 'Governance & address' },
  { id: 3, title: 'Academic Structure', icon: GraduationCap, desc: 'Levels, streams & medium' },
  { id: 4, title: 'Contact & Branding', icon: Palette, desc: 'Email, colors & logo' },
  { id: 5, title: 'Operational Settings', icon: Settings, desc: 'Capacity & features' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

const MEDIUMS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Odia', 'Punjabi', 'Urdu'];

// ─── Main Component ──────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Taxonomy data
  const [institutionTypes, setInstitutionTypes] = useState<TaxonomyOption[]>([]);
  const [affiliationTypes, setAffiliationTypes] = useState<TaxonomyOption[]>([]);
  const [academicLevels, setAcademicLevels] = useState<TaxonomyOption[]>([]);
  const [streams, setStreams] = useState<TaxonomyOption[]>([]);

  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    institutionName: '',
    shortName: '',
    institutionCode: '',
    institutionType: '',
    institutionCategory: '',
    // Step 2: Affiliation & Location
    affiliationType: '',
    affiliatedBody: '',
    regulatoryBody: '',
    country: 'India',
    state: '',
    city: '',
    fullAddress: '',
    pincode: '',
    // Step 3: Academic Structure
    levelsOffered: [] as string[],
    streamsOffered: [] as string[],
    mediumOfInstruction: ['English'] as string[],
    academicCalendarType: 'ANNUAL',
    yearModel: '',
    // Step 4: Contact & Branding
    officialEmail: '',
    officialPhone: '',
    website: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#7C3AED',
    supportContact: '',
    // Step 5: Operational Settings
    maxTeachers: 50,
    maxStudents: 500,
    branchSupport: false,
    attendanceModel: 'DAILY',
    examModel: 'SEMESTER',
    lmsEnabled: true,
    aiEnabled: true,
  });

  // Load existing profile and taxonomy
  useEffect(() => {
    const load = async () => {
      try {
        const [typesRes, affRes, levelsRes, streamsRes, profileRes] = await Promise.all([
          api.get('/taxonomy/institution-types'),
          api.get('/taxonomy/affiliation-types'),
          api.get('/taxonomy/academic-levels'),
          api.get('/taxonomy/streams'),
          api.get('/institution/profile').catch(() => null),
        ]);

        setInstitutionTypes(typesRes.data.data || []);
        setAffiliationTypes(affRes.data.data || []);
        setAcademicLevels(levelsRes.data.data || []);
        setStreams(streamsRes.data.data || []);

        // Pre-fill from existing profile
        const profile: InstitutionProfile | null = profileRes?.data?.data?.profile || null;
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            institutionName: profile.institutionName || prev.institutionName,
            shortName: profile.shortName || '',
            institutionCode: profile.institutionCode || '',
            institutionType: profile.institutionType || prev.institutionType,
            institutionCategory: profile.institutionCategory || '',
            affiliationType: profile.affiliationType || '',
            affiliatedBody: profile.affiliatedBody || '',
            regulatoryBody: profile.regulatoryBody || '',
            country: profile.country || 'India',
            state: profile.state || '',
            city: profile.city || '',
            fullAddress: profile.fullAddress || '',
            pincode: profile.pincode || '',
            levelsOffered: profile.levelsOffered || [],
            streamsOffered: profile.streamsOffered || [],
            mediumOfInstruction: profile.mediumOfInstruction?.length ? profile.mediumOfInstruction : ['English'],
            academicCalendarType: profile.academicCalendarType || 'ANNUAL',
            yearModel: profile.yearModel || '',
            officialEmail: profile.officialEmail || '',
            officialPhone: profile.officialPhone || '',
            website: profile.website || '',
            primaryColor: profile.primaryColor || '#4F46E5',
            secondaryColor: profile.secondaryColor || '#7C3AED',
            supportContact: profile.supportContact || '',
            maxTeachers: profile.maxTeachers ?? 50,
            maxStudents: profile.maxStudents ?? 500,
            branchSupport: profile.branchSupport ?? false,
            attendanceModel: profile.attendanceModel || 'DAILY',
            examModel: profile.examModel || 'SEMESTER',
            lmsEnabled: profile.lmsEnabled ?? true,
            aiEnabled: profile.aiEnabled ?? true,
          }));

          // Determine current step from onboarding status
          const statusMap: Record<string, number> = {
            NOT_STARTED: 1, STEP_1: 2, STEP_2: 3, STEP_3: 4, STEP_4: 5, COMPLETED: 5,
          };
          setStep(statusMap[profile.onboardingStatus] || 1);
        }
      } catch {
        // taxonomy might fail if not seeded, continue with empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Redirect non-institution-owners
  useEffect(() => {
    if (!loading && user && user.role !== 'INSTITUTION_OWNER' && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayField = useCallback((field: string, value: string) => {
    setFormData((prev) => {
      const arr = (prev as Record<string, unknown>)[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }, []);

  // Save current step's data to backend
  const saveStep = async (nextStep: number) => {
    setSaving(true);
    try {
      const stepStatusMap: Record<number, string> = {
        1: 'STEP_1', 2: 'STEP_2', 3: 'STEP_3', 4: 'STEP_4', 5: 'STEP_4',
      };

      await api.patch('/institution/profile', {
        ...formData,
        onboardingStatus: stepStatusMap[step],
      });

      setStep(nextStep);
      toast.success('Progress saved');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const completeOnboarding = async () => {
    setSaving(true);
    try {
      // Save final step data
      await api.patch('/institution/profile', { ...formData, onboardingStatus: 'STEP_4' });
      // Mark complete
      await api.post('/institution/onboarding/complete');
      toast.success('Onboarding complete! Your institution is ready.');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to complete onboarding.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 5) {
      completeOnboarding();
    } else {
      saveStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Set Up Your Institution</h1>
        <p className="text-gray-500 mt-1">Complete these steps to configure your institution on SRP Education AI</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => s.id < step && setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                s.id === step
                  ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                  : s.id < step
                  ? 'bg-green-50 text-green-700 cursor-pointer hover:bg-green-100'
                  : 'bg-gray-50 text-gray-400'
              }`}
              disabled={s.id > step}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                s.id === step
                  ? 'bg-brand-600 text-white'
                  : s.id < step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {s.id < step ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-300 mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        {step === 1 && (
          <Step1BasicDetails
            formData={formData}
            updateField={updateField}
            institutionTypes={institutionTypes}
          />
        )}
        {step === 2 && (
          <Step2Affiliation
            formData={formData}
            updateField={updateField}
            affiliationTypes={affiliationTypes}
          />
        )}
        {step === 3 && (
          <Step3AcademicStructure
            formData={formData}
            updateField={updateField}
            toggleArrayField={toggleArrayField}
            academicLevels={academicLevels}
            streams={streams}
          />
        )}
        {step === 4 && (
          <Step4ContactBranding
            formData={formData}
            updateField={updateField}
          />
        )}
        {step === 5 && (
          <Step5OperationalSettings
            formData={formData}
            updateField={updateField}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={step === 1 || saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : step === 5 ? (
            <><Check className="w-4 h-4" /> Complete Setup</>
          ) : (
            <>Save & Continue <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 1: Basic Details ───────────────────────────────────

function Step1BasicDetails({ formData, updateField, institutionTypes }: {
  formData: Record<string, unknown>;
  updateField: (f: string, v: unknown) => void;
  institutionTypes: TaxonomyOption[];
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Basic Details</h2>
      <p className="text-sm text-gray-500 mb-6">Tell us about your institution</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., Delhi Public School, R.K. Puram"
            value={formData.institutionName as string}
            onChange={(e) => updateField('institutionName', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Name / Abbreviation</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., DPS-RKP"
              value={formData.shortName as string}
              onChange={(e) => updateField('shortName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Code</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., DPSRKP2024"
              value={formData.institutionCode as string}
              onChange={(e) => updateField('institutionCode', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Unique code for members to join</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type *</label>
            <select
              className="input-field"
              value={formData.institutionType as string}
              onChange={(e) => updateField('institutionType', e.target.value)}
            >
              <option value="">Select type</option>
              {institutionTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="input-field"
              value={formData.institutionCategory as string}
              onChange={(e) => updateField('institutionCategory', e.target.value)}
            >
              <option value="">Select category</option>
              <option value="GOVERNMENT">Government</option>
              <option value="PRIVATE">Private</option>
              <option value="AIDED">Aided</option>
              <option value="AUTONOMOUS">Autonomous</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Affiliation & Location ──────────────────────────

function Step2Affiliation({ formData, updateField, affiliationTypes }: {
  formData: Record<string, unknown>;
  updateField: (f: string, v: unknown) => void;
  affiliationTypes: TaxonomyOption[];
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Affiliation & Location</h2>
      <p className="text-sm text-gray-500 mb-6">Governance details and address</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation Type</label>
            <select
              className="input-field"
              value={formData.affiliationType as string}
              onChange={(e) => updateField('affiliationType', e.target.value)}
            >
              <option value="">Select</option>
              {affiliationTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliated Body</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., CBSE, JNTU, Anna University"
              value={formData.affiliatedBody as string}
              onChange={(e) => updateField('affiliatedBody', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Body</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., UGC, AICTE, NMC"
            value={formData.regulatoryBody as string}
            onChange={(e) => updateField('regulatoryBody', e.target.value)}
          />
        </div>

        <hr className="my-4" />
        <h3 className="text-sm font-semibold text-gray-700">Location</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              className="input-field"
              value={formData.country as string}
              onChange={(e) => updateField('country', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              className="input-field"
              value={formData.state as string}
              onChange={(e) => updateField('state', e.target.value)}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              className="input-field"
              placeholder="City name"
              value={formData.city as string}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
          <textarea
            className="input-field"
            rows={2}
            placeholder="Street address, area, landmark"
            value={formData.fullAddress as string}
            onChange={(e) => updateField('fullAddress', e.target.value)}
          />
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., 110022"
            maxLength={6}
            value={formData.pincode as string}
            onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Academic Structure ──────────────────────────────

function Step3AcademicStructure({ formData, updateField, toggleArrayField, academicLevels, streams }: {
  formData: Record<string, unknown>;
  updateField: (f: string, v: unknown) => void;
  toggleArrayField: (f: string, v: string) => void;
  academicLevels: TaxonomyOption[];
  streams: TaxonomyOption[];
}) {
  const selectedLevels = formData.levelsOffered as string[];
  const selectedStreams = formData.streamsOffered as string[];
  const selectedMediums = formData.mediumOfInstruction as string[];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Academic Structure</h2>
      <p className="text-sm text-gray-500 mb-6">Select which levels, streams, and languages your institution offers</p>
      <div className="space-y-6">
        {/* Academic Levels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Levels Offered *
          </label>
          <div className="flex flex-wrap gap-2">
            {academicLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => toggleArrayField('levelsOffered', level.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedLevels.includes(level.value)
                    ? 'bg-brand-50 text-brand-700 border-brand-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
          {selectedLevels.length === 0 && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Select at least one level
            </p>
          )}
        </div>

        {/* Streams */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Streams / Domains Offered
          </label>
          <div className="flex flex-wrap gap-2">
            {streams.map((stream) => (
              <button
                key={stream.value}
                type="button"
                onClick={() => toggleArrayField('streamsOffered', stream.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedStreams.includes(stream.value)
                    ? 'bg-violet-50 text-violet-700 border-violet-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {stream.label}
              </button>
            ))}
          </div>
        </div>

        {/* Medium of Instruction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medium of Instruction
          </label>
          <div className="flex flex-wrap gap-2">
            {MEDIUMS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleArrayField('mediumOfInstruction', m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedMediums.includes(m)
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar & Year Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Calendar</label>
            <select
              className="input-field"
              value={formData.academicCalendarType as string}
              onChange={(e) => updateField('academicCalendarType', e.target.value)}
            >
              <option value="ANNUAL">Annual (June–April)</option>
              <option value="SEMESTER">Semester</option>
              <option value="TRIMESTER">Trimester</option>
              <option value="QUARTER">Quarter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Model</label>
            <select
              className="input-field"
              value={formData.yearModel as string}
              onChange={(e) => updateField('yearModel', e.target.value)}
            >
              <option value="">Select</option>
              <option value="JUNE_MAY">June – May</option>
              <option value="APRIL_MARCH">April – March</option>
              <option value="JULY_JUNE">July – June</option>
              <option value="AUGUST_JULY">August – July</option>
              <option value="JANUARY_DECEMBER">January – December</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Contact & Branding ──────────────────────────────

function Step4ContactBranding({ formData, updateField }: {
  formData: Record<string, unknown>;
  updateField: (f: string, v: unknown) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Contact & Branding</h2>
      <p className="text-sm text-gray-500 mb-6">Official contact info and visual identity</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="info@institution.edu.in"
              value={formData.officialEmail as string}
              onChange={(e) => updateField('officialEmail', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Phone</label>
            <input
              type="tel"
              className="input-field"
              placeholder="+91 11 2345 6789"
              value={formData.officialPhone as string}
              onChange={(e) => updateField('officialPhone', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://www.institution.edu.in"
              value={formData.website as string}
              onChange={(e) => updateField('website', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Contact</label>
            <input
              type="text"
              className="input-field"
              placeholder="Help desk phone or email"
              value={formData.supportContact as string}
              onChange={(e) => updateField('supportContact', e.target.value)}
            />
          </div>
        </div>

        <hr className="my-4" />
        <h3 className="text-sm font-semibold text-gray-700">Brand Colors</h3>
        <p className="text-xs text-gray-400 mb-3">These colors will be used across the institution&apos;s interface</p>

        <div className="flex gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                value={formData.primaryColor as string}
                onChange={(e) => updateField('primaryColor', e.target.value)}
              />
              <input
                type="text"
                className="input-field w-28"
                value={formData.primaryColor as string}
                onChange={(e) => updateField('primaryColor', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                value={formData.secondaryColor as string}
                onChange={(e) => updateField('secondaryColor', e.target.value)}
              />
              <input
                type="text"
                className="input-field w-28"
                value={formData.secondaryColor as string}
                onChange={(e) => updateField('secondaryColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
          <div className="flex gap-3 items-center">
            <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: formData.primaryColor as string }}>
              Primary Button
            </div>
            <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: formData.secondaryColor as string }}>
              Secondary Button
            </div>
            <div className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: formData.primaryColor as string, color: formData.primaryColor as string }}>
              Outline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Operational Settings ────────────────────────────

function Step5OperationalSettings({ formData, updateField }: {
  formData: Record<string, unknown>;
  updateField: (f: string, v: unknown) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Operational Settings</h2>
      <p className="text-sm text-gray-500 mb-6">Capacity limits and feature toggles</p>
      <div className="space-y-5">
        {/* Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Teachers</label>
            <input
              type="number"
              className="input-field"
              min={1}
              max={10000}
              value={formData.maxTeachers as number}
              onChange={(e) => updateField('maxTeachers', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
            <input
              type="number"
              className="input-field"
              min={1}
              max={100000}
              value={formData.maxStudents as number}
              onChange={(e) => updateField('maxStudents', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Models */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Model</label>
            <select
              className="input-field"
              value={formData.attendanceModel as string}
              onChange={(e) => updateField('attendanceModel', e.target.value)}
            >
              <option value="DAILY">Daily</option>
              <option value="PERIOD_WISE">Period-wise</option>
              <option value="SUBJECT_WISE">Subject-wise</option>
              <option value="NONE">Not Tracked</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Model</label>
            <select
              className="input-field"
              value={formData.examModel as string}
              onChange={(e) => updateField('examModel', e.target.value)}
            >
              <option value="SEMESTER">Semester-based</option>
              <option value="ANNUAL">Annual</option>
              <option value="CONTINUOUS">Continuous Assessment</option>
              <option value="CREDIT">Credit-based</option>
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-gray-700">Feature Toggles</h3>

          <ToggleSwitch
            label="Branch Support"
            description="Enable multi-branch/campus management"
            checked={formData.branchSupport as boolean}
            onChange={(v) => updateField('branchSupport', v)}
          />
          <ToggleSwitch
            label="LMS (Content Library)"
            description="Enable course content, notes, and materials library"
            checked={formData.lmsEnabled as boolean}
            onChange={(v) => updateField('lmsEnabled', v)}
          />
          <ToggleSwitch
            label="AI Assistant"
            description="Enable AI-powered question generation, tutoring, and analytics"
            checked={formData.aiEnabled as boolean}
            onChange={(v) => updateField('aiEnabled', v)}
          />
        </div>

        {/* Summary card */}
        <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-lg">
          <h3 className="text-sm font-semibold text-brand-800 mb-2">Setup Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-brand-700">
            <p>Institution: <strong>{(formData.institutionName as string) || '—'}</strong></p>
            <p>Type: <strong>{(formData.institutionType as string) || '—'}</strong></p>
            <p>Levels: <strong>{(formData.levelsOffered as string[]).length || 0} selected</strong></p>
            <p>Streams: <strong>{(formData.streamsOffered as string[]).length || 0} selected</strong></p>
            <p>Capacity: <strong>{String(formData.maxTeachers)} teachers, {String(formData.maxStudents)} students</strong></p>
            <p>Location: <strong>{(formData.city as string) || '—'}, {(formData.state as string) || '—'}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Switch Component ─────────────────────────────────

function ToggleSwitch({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-gray-300'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}
