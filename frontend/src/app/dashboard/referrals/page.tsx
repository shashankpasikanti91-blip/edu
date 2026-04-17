'use client';

import { useEffect, useState } from 'react';
import { Users, Copy, Share2, Gift, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { ReferralInfo } from '@/types';

export default function ReferralsPage() {
  const { user } = useAuthStore();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const fetchReferralInfo = async () => {
    try {
      const { data } = await api.get('/students/referrals');
      setReferralInfo(data.data);
    } catch {
      toast.error('Failed to load referral info');
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralInfo?.referralCode) {
      navigator.clipboard.writeText(referralInfo.referralCode);
      toast.success('Referral code copied!');
    }
  };

  const copyReferralLink = () => {
    if (referralInfo?.referralCode) {
      const link = `${window.location.origin}/signup?ref=${referralInfo.referralCode}`;
      navigator.clipboard.writeText(link);
      toast.success('Referral link copied!');
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsSending(true);
    try {
      await api.post('/students/referrals/invite', { email: inviteEmail });
      toast.success('Invite sent!');
      setInviteEmail('');
      fetchReferralInfo();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to send invite');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invite Friends</h1>
        <p className="text-gray-500 mt-1">Share SRP Education AI and help your friends learn smarter</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-brand-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{referralInfo?.totalReferrals || 0}</p>
          <p className="text-sm text-gray-500">Total Invites</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{referralInfo?.convertedReferrals || 0}</p>
          <p className="text-sm text-gray-500">Friends Joined</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{referralInfo?.convertedReferrals || 0}</p>
          <p className="text-sm text-gray-500">Rewards Earned</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-lg font-mono font-bold text-brand-700 tracking-wider">
            {referralInfo?.referralCode || '—'}
          </div>
          <button onClick={copyReferralCode} className="btn-primary flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy Code
          </button>
          <button onClick={copyReferralLink} className="btn-primary flex items-center gap-2 !bg-green-600 hover:!bg-green-700">
            <Share2 className="w-4 h-4" />
            Copy Link
          </button>
        </div>
      </div>

      {/* Invite by Email */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite by Email</h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="friend@example.com"
            className="input-field flex-1"
            onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
          />
          <button
            onClick={sendInvite}
            disabled={isSending || !inviteEmail.trim()}
            className="btn-primary"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Invite'}
          </button>
        </div>
      </div>

      {/* Referral History */}
      {referralInfo?.referrals && referralInfo.referrals.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite History</h2>
          <div className="space-y-3">
            {referralInfo.referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{ref.referredEmail || 'Pending'}</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  ref.status === 'CONVERTED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {ref.status === 'CONVERTED' ? 'Joined' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
