'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Building2, User, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { InstitutionProfile, TaxonomyOption } from '@/types';

const ADMIN_ROLES = ['INSTITUTION_OWNER', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'mr', label: 'Marathi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'gu', label: 'Gujarati' },
];

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  preferredLang: string;
}

export default function SettingsPage() {
  const { user, loadUser } = useAuthStore();
  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role);
  const isInstitution = user?.accountType === 'B2B_INSTITUTION';
  const [activeTab, setActiveTab] = useState<'personal' | 'institution'>('personal');

  // Personal profile state
  const [form, setForm] = useState<ProfileForm>({
    firstName: '', lastName: '', phone: '', preferredLang: 'en',
  });
  const [saving, setSaving] = useState(false);

  // Institution profile state
  const [instProfile, setInstProfile] = useState<InstitutionProfile | null>(null);
  const [instLoading, setInstLoading] = useState(false);
  const [instSaving, setInstSaving] = useState(false);
  const [instForm, setInstForm] = useState<Record<string, unknown>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');

  // Taxonomy data
  const [institutionTypes, setInstitutionTypes] = useState<TaxonomyOption[]>([]);
  const [affiliationTypes, setAffiliationTypes] = useState<TaxonomyOption[]>([]);
  const [institutionCategories, setInstitutionCategories] = useState<TaxonomyOption[]>([]);
  const [academicLevels, setAcademicLevels] = useState<TaxonomyOption[]>([]);
  const [streams, setStreams] = useState<TaxonomyOption[]>([]);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, phone: '', preferredLang: 'en' });
      api.get('/users/profile').then(({ data }) => {
        const p = data.data;
        setForm({ firstName: p.firstName, lastName: p.lastName, phone: p.phone || '', preferredLang: p.preferredLang || 'en' });
      }).catch(() => {});
    }
  }, [user]);

  // Load taxonomy data & institution profile when admin views institution tab
  useEffect(() => {
    if (isAdmin && isInstitution && activeTab === 'institution') {
      loadTaxonomy();
      loadInstitutionProfile();
    }
  }, [isAdmin, isInstitution, activeTab]);

  const loadTaxonomy = async () => {
    try {
      const [types, affiliations, categories, levels, streamsRes] = await Promise.all([
        api.get('/taxonomy/institution-types'),
        api.get('/taxonomy/affiliation-types'),
        api.get('/taxonomy/institution-categories'),
        api.get('/taxonomy/academic-levels'),
        api.get('/taxonomy/streams'),
      ]);
      setInstitutionTypes(types.data.data);
      setAffiliationTypes(affiliations.data.data);
      setInstitutionCategories(categories.data.data);
      setAcademicLevels(levels.data.data);
      setStreams(streamsRes.data.data);
    } catch { /* taxonomy is non-critical */ }
  };

  const loadInstitutionProfile = async () => {
    setInstLoading(true);
    try {
      const { data } = await api.get('/institution/profile');
      const profile = data.data?.profile;
      setInstProfile(profile);
      if (profile) {
        setInstForm({
          institutionName: profile.institutionName || '',
          shortName: profile.shortName || '',
          institutionCode: profile.institutionCode || '',
          institutionType: profile.institutionType || 'SCHOOL',
          affiliationType: profile.affiliationType || '',
          affiliatedBody: profile.affiliatedBody || '',
          regulatoryBody: profile.regulatoryBody || '',
          institutionCategory: profile.institutionCategory || '',
          country: profile.country || 'India',
          state: profile.state || '',
          city: profile.city || '',
          fullAddress: profile.fullAddress || '',
          pincode: profile.pincode || '',
          levelsOffered: profile.levelsOffered || [],
          streamsOffered: profile.streamsOffered || [],
          mediumOfInstruction: profile.mediumOfInstruction || ['English'],
          academicCalendarType: profile.academicCalendarType || '',
          yearModel: profile.yearModel || '',
          officialEmail: profile.officialEmail || '',
          officialPhone: profile.officialPhone || '',
          website: profile.website || '',
          primaryColor: profile.primaryColor || '',
          secondaryColor: profile.secondaryColor || '',
          supportContact: profile.supportContact || '',
          attendanceModel: profile.attendanceModel || '',
          examModel: profile.examModel || '',
          lmsEnabled: profile.lmsEnabled || false,
          aiEnabled: profile.aiEnabled ?? true,
        });
      }
    } catch { /* profile may not exist yet */ }
    finally { setInstLoading(false); }
  };

  const handleSavePersonal = async () => {
    setSaving(true);
    try {
      await api.patch('/users/profile', form);
      await loadUser();
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleSaveInstitution = async () => {
    setInstSaving(true);
    try {
      await api.patch('/institution/profile', instForm);
      toast.success('Institution settings saved');
      loadInstitutionProfile();
    } catch { toast.error('Failed to save institution settings'); }
    finally { setInstSaving(false); }
  };

  const updateInstField = (key: string, value: unknown) => {
    setInstForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key: string, value: string) => {
    const current = (instForm[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateInstField(key, updated);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          {isAdmin && isInstitution
            ? 'Manage your personal profile and institution settings.'
            : 'Manage your account settings.'}
        </p>
      </div>

      {/* Tab selector for institution admins */}
      {isAdmin && isInstitution && (
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl max-w-md">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'personal' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" /> Personal Profile
          </button>
          <button
            onClick={() => setActiveTab('institution')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'institution' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4" /> Institution Settings
          </button>
        </div>
      )}

      {/* ─── Personal Profile Tab ──────────────────────────── */}
      {activeTab === 'personal' && (
        <>
          <div className="card max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" /> Personal Profile
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={user?.email ?? ''} disabled className="input-field bg-gray-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select value={form.preferredLang} onChange={(e) => setForm({ ...form, preferredLang: e.target.value })} className="input-field">
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="pt-4">
                <button onClick={handleSavePersonal} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="card max-w-2xl mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" /> Account Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-900 capitalize">{user?.role?.toLowerCase().replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Type</span>
                <span className="font-medium text-gray-900">{user?.accountType === 'B2C_STUDENT' ? 'Individual Student' : 'Institution'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email Verified</span>
                <span className={`font-medium ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              {user?.tenantId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Institution ID</span>
                  <span className="font-mono text-xs text-gray-600">{user.tenantId}</span>
                </div>
              )}
              {user?.directStudentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Student ID</span>
                  <span className="font-mono text-xs text-gray-600">{user.directStudentId}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── Institution Settings Tab ──────────────────────── */}
      {activeTab === 'institution' && isAdmin && isInstitution && (
        <div className="max-w-3xl">
          {instLoading ? (
            <div className="card text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
              <p className="text-gray-500 mt-3">Loading institution settings...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Section: Basic Institution Details */}
              <CollapsibleSection
                title="Basic Institution Details"
                icon={<Building2 className="w-5 h-5 text-brand-600" />}
                isExpanded={expandedSection === 'basic'}
                onToggle={() => toggleSection('basic')}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
                      <input type="text" value={(instForm.institutionName as string) || ''} onChange={e => updateInstField('institutionName', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Name / Code</label>
                      <input type="text" value={(instForm.shortName as string) || ''} onChange={e => updateInstField('shortName', e.target.value)} className="input-field" placeholder="e.g., MIT" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution Code (unique)</label>
                    <input type="text" value={(instForm.institutionCode as string) || ''} onChange={e => updateInstField('institutionCode', e.target.value)} className="input-field" placeholder="e.g., INST-001" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type *</label>
                      <select value={(instForm.institutionType as string) || ''} onChange={e => updateInstField('institutionType', e.target.value)} className="input-field">
                        <option value="">Select type</option>
                        {institutionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution Category</label>
                      <select value={(instForm.institutionCategory as string) || ''} onChange={e => updateInstField('institutionCategory', e.target.value)} className="input-field">
                        <option value="">Select category</option>
                        {institutionCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Section: Governance / Affiliation */}
              <CollapsibleSection
                title="Governance / Affiliation"
                icon={<Shield className="w-5 h-5 text-indigo-600" />}
                isExpanded={expandedSection === 'governance'}
                onToggle={() => toggleSection('governance')}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation Type</label>
                      <select value={(instForm.affiliationType as string) || ''} onChange={e => updateInstField('affiliationType', e.target.value)} className="input-field">
                        <option value="">Select</option>
                        {affiliationTypes.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Affiliated Board / University</label>
                      <input type="text" value={(instForm.affiliatedBody as string) || ''} onChange={e => updateInstField('affiliatedBody', e.target.value)} className="input-field" placeholder="e.g., CBSE, JNTU, Mumbai University" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Body</label>
                    <input type="text" value={(instForm.regulatoryBody as string) || ''} onChange={e => updateInstField('regulatoryBody', e.target.value)} className="input-field" placeholder="e.g., UGC, AICTE, NMC" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input type="text" value={(instForm.country as string) || 'India'} onChange={e => updateInstField('country', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input type="text" value={(instForm.state as string) || ''} onChange={e => updateInstField('state', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" value={(instForm.city as string) || ''} onChange={e => updateInstField('city', e.target.value)} className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                      <textarea value={(instForm.fullAddress as string) || ''} onChange={e => updateInstField('fullAddress', e.target.value)} className="input-field" rows={2} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input type="text" value={(instForm.pincode as string) || ''} onChange={e => updateInstField('pincode', e.target.value)} className="input-field" />
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Section: Academic Structure */}
              <CollapsibleSection
                title="Academic Structure"
                icon={<Building2 className="w-5 h-5 text-green-600" />}
                isExpanded={expandedSection === 'academic'}
                onToggle={() => toggleSection('academic')}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Levels Offered</label>
                    <div className="flex flex-wrap gap-2">
                      {academicLevels.map(l => (
                        <button key={l.value} type="button" onClick={() => toggleMultiSelect('levelsOffered', l.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                            ((instForm.levelsOffered as string[]) || []).includes(l.value)
                              ? 'bg-brand-50 border-brand-300 text-brand-700'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >{l.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Streams Offered</label>
                    <div className="flex flex-wrap gap-2">
                      {streams.map(s => (
                        <button key={s.value} type="button" onClick={() => toggleMultiSelect('streamsOffered', s.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                            ((instForm.streamsOffered as string[]) || []).includes(s.value)
                              ? 'bg-green-50 border-green-300 text-green-700'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Calendar Type</label>
                      <select value={(instForm.academicCalendarType as string) || ''} onChange={e => updateInstField('academicCalendarType', e.target.value)} className="input-field">
                        <option value="">Select</option>
                        <option value="semester">Semester</option>
                        <option value="trimester">Trimester</option>
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year/Class Model</label>
                      <select value={(instForm.yearModel as string) || ''} onChange={e => updateInstField('yearModel', e.target.value)} className="input-field">
                        <option value="">Select</option>
                        <option value="class-based">Class-Based (School)</option>
                        <option value="year-based">Year-Based (Degree)</option>
                        <option value="semester-based">Semester-Based</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medium of Instruction</label>
                    <div className="flex flex-wrap gap-2">
                      {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Urdu'].map(lang => (
                        <button key={lang} type="button" onClick={() => toggleMultiSelect('mediumOfInstruction', lang)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                            ((instForm.mediumOfInstruction as string[]) || []).includes(lang)
                              ? 'bg-violet-50 border-violet-300 text-violet-700'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >{lang}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Section: Contact & Branding */}
              <CollapsibleSection
                title="Contact & Branding"
                icon={<User className="w-5 h-5 text-amber-600" />}
                isExpanded={expandedSection === 'contact'}
                onToggle={() => toggleSection('contact')}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
                      <input type="email" value={(instForm.officialEmail as string) || ''} onChange={e => updateInstField('officialEmail', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Official Phone</label>
                      <input type="tel" value={(instForm.officialPhone as string) || ''} onChange={e => updateInstField('officialPhone', e.target.value)} className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input type="url" value={(instForm.website as string) || ''} onChange={e => updateInstField('website', e.target.value)} className="input-field" placeholder="https://" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Support Contact</label>
                      <input type="text" value={(instForm.supportContact as string) || ''} onChange={e => updateInstField('supportContact', e.target.value)} className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Primary Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={(instForm.primaryColor as string) || '#6366f1'} onChange={e => updateInstField('primaryColor', e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                        <input type="text" value={(instForm.primaryColor as string) || ''} onChange={e => updateInstField('primaryColor', e.target.value)} className="input-field flex-1" placeholder="#6366f1" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={(instForm.secondaryColor as string) || '#8b5cf6'} onChange={e => updateInstField('secondaryColor', e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                        <input type="text" value={(instForm.secondaryColor as string) || ''} onChange={e => updateInstField('secondaryColor', e.target.value)} className="input-field flex-1" placeholder="#8b5cf6" />
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Section: Operational Settings */}
              <CollapsibleSection
                title="Operational Settings"
                icon={<Shield className="w-5 h-5 text-rose-600" />}
                isExpanded={expandedSection === 'operations'}
                onToggle={() => toggleSection('operations')}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Model</label>
                      <select value={(instForm.attendanceModel as string) || ''} onChange={e => updateInstField('attendanceModel', e.target.value)} className="input-field">
                        <option value="">Select</option>
                        <option value="daily">Daily</option>
                        <option value="period-wise">Period-wise</option>
                        <option value="subject-wise">Subject-wise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Exam Model</label>
                      <select value={(instForm.examModel as string) || ''} onChange={e => updateInstField('examModel', e.target.value)} className="input-field">
                        <option value="">Select</option>
                        <option value="internal">Internal Only</option>
                        <option value="board">Board/University</option>
                        <option value="both">Both Internal & Board</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(instForm.lmsEnabled as boolean) || false} onChange={e => updateInstField('lmsEnabled', e.target.checked)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                      <span className="text-sm text-gray-700">LMS Enabled</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(instForm.aiEnabled as boolean) ?? true} onChange={e => updateInstField('aiEnabled', e.target.checked)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                      <span className="text-sm text-gray-700">AI Features Enabled</span>
                    </label>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Save button */}
              <div className="pt-2">
                <button onClick={handleSaveInstitution} disabled={instSaving} className="btn-primary inline-flex items-center gap-2">
                  {instSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Institution Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Collapsible section component for organizing institution settings */
function CollapsibleSection({
  title, icon, isExpanded, onToggle, children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isExpanded && <div className="mt-4 pt-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}
