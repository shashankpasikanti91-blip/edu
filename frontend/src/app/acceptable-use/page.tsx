'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, FileText, AlertCircle } from 'lucide-react';

const sections = [
  {
    id: 'purpose',
    title: '1. Purpose',
    content: `This Acceptable Use Policy ("AUP") governs the use of the SRP Education AI platform ("Platform") operated by SRP AI Labs. This policy supplements the Terms of Service and outlines what constitutes acceptable and unacceptable behavior when using our Platform.

By using the Platform, you agree to comply with this AUP. Violations may result in account suspension, termination, or legal action.`,
  },
  {
    id: 'permitted-use',
    title: '2. Permitted Use',
    content: `The Platform is designed exclusively for educational and academic purposes. Permitted activities include:

• Creating, studying, and sharing educational content
• Using AI tools for learning assistance, revision, study planning, and exam preparation
• Uploading and managing educational materials you have the right to use
• Accessing institution-provided content as part of your enrollment
• Using analytics and tracking features for legitimate educational progress monitoring
• Teachers creating assessments, study materials, and resources for their students
• Institution administrators managing academic operations and user accounts`,
  },
  {
    id: 'prohibited-use',
    title: '3. Prohibited Use',
    content: `You must NOT use the Platform to:

Content Violations:
• Upload, post, or transmit any content that is unlawful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable
• Upload copyrighted material you do not have the right to distribute
• Reproduce verbatim textbook content, copyrighted exam papers, or proprietary educational materials
• Share or distribute exam questions from ongoing or upcoming official examinations
• Upload content that contains malware, viruses, or malicious code

Academic Integrity:
• Submit AI-generated content as your own original work in contexts where AI assistance is prohibited
• Use the Platform to facilitate cheating on official examinations
• Share exam answers or assessment solutions without authorization
• Impersonate another student, teacher, or administrator

System Abuse:
• Attempt to gain unauthorized access to accounts, data, or system components
• Use automated bots, scrapers, or tools to extract data from the Platform
• Attempt to reverse-engineer, decompile, or disassemble any part of the Platform
• Overload or disrupt the Platform's infrastructure through excessive automated requests
• Circumvent rate limits, usage quotas, or subscription restrictions

Data Privacy:
• Collect or harvest personal information of other users
• Share student data outside the Platform without proper authorization
• Access content or data belonging to another institution's tenant
• Use student analytics data for non-educational commercial purposes`,
  },
  {
    id: 'ai-specific',
    title: '4. AI-Specific Guidelines',
    content: `When using AI features of the Platform:

• Use AI-generated content as a learning aid, not as a definitive source of truth
• Cross-verify AI-generated facts, figures, and dates with authoritative sources before citing
• Do not use AI to generate intentionally misleading content
• Do not attempt to manipulate AI responses through prompt injection or adversarial techniques
• Report any AI-generated content that appears incorrect, biased, or inappropriate
• Understand that AI responses may contain errors and should be reviewed critically`,
  },
  {
    id: 'enforcement',
    title: '5. Enforcement',
    content: `Violations of this AUP may result in:

• Warning notification to the user
• Temporary suspension of account access
• Permanent account termination
• Removal of violating content
• Reporting to relevant authorities if the violation involves illegal activity
• Notification to the user's institution (for B2B users)

We reserve the right to investigate any suspected violations and take appropriate action at our sole discretion. Users who believe they have been wrongly sanctioned may appeal by contacting support@srpailabs.com.`,
  },
  {
    id: 'reporting',
    title: '6. Reporting Violations',
    content: `If you encounter content or behavior that violates this AUP, please report it immediately:

• Email: support@srpailabs.com
• Subject line: "AUP Violation Report"
• Include: description of the violation, relevant URLs or user identifiers, and any supporting evidence

We will investigate all reports and respond within 5 business days.`,
  },
  {
    id: 'updates',
    title: '7. Policy Updates',
    content: `We may update this AUP from time to time. Material changes will be communicated via email or in-platform notifications. Continued use of the Platform after changes constitutes acceptance of the updated policy.

Last updated: April 2026`,
  },
];

export default function AcceptableUsePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceptable Use Policy</h1>
            <p className="text-gray-500">Last updated: April 2026</p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Questions about this policy? Contact{' '}
              <a href="mailto:support@srpailabs.com" className="text-brand-600 hover:text-brand-700 font-medium">support@srpailabs.com</a>
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <Link href="/terms" className="text-brand-600 hover:text-brand-700">Terms of Service</Link>
              <span className="text-gray-300">|</span>
              <Link href="/privacy" className="text-brand-600 hover:text-brand-700">Privacy Policy</Link>
              <span className="text-gray-300">|</span>
              <Link href="/content-policy" className="text-brand-600 hover:text-brand-700">Content Policy</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
