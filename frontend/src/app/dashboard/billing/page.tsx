'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  CreditCard, Calendar, Users, HardDrive, Zap,
  ArrowUpRight, Download, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, ChevronRight, TrendingUp, FileText,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  yearlyPrice: number;
  interval: string;
  maxUsers: number;
  maxStorage: number;
  maxAiCredits: number;
  brandingTier: string;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  plan: Plan;
}

interface Usage {
  seatsUsed: number;
  seatsLimit: number;
  seatsPercentage: number;
  storageUsedMb: number;
  storageLimitMb: number;
  storagePercentage: number;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  aiCreditsPercentage: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: string;
  description: string;
  createdAt: string;
  paidAt: string | null;
  dueDate: string | null;
  pdfUrl: string | null;
}

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  actionUrl: string | null;
}

interface BillingDashboard {
  subscription: Subscription | null;
  usage: Usage | null;
  recentInvoices: Invoice[];
  alerts: Alert[];
  upgradeSuggestions: string[];
}

function UsageBar({ label, used, limit, percentage, icon: Icon, unit }: {
  label: string;
  used: number;
  limit: number;
  percentage: number;
  icon: React.ElementType;
  unit: string;
}) {
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-brand-500';
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${percentage >= 90 ? 'bg-red-50' : 'bg-brand-50'}`}>
          <Icon className={`w-5 h-5 ${percentage >= 90 ? 'text-red-600' : 'text-brand-600'}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{used.toLocaleString()} / {limit.toLocaleString()} {unit}</p>
        </div>
        <span className={`ml-auto text-sm font-semibold ${
          percentage >= 90 ? 'text-red-600' : percentage >= 75 ? 'text-yellow-600' : 'text-gray-700'
        }`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${getColor()}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    TRIALING: 'bg-blue-100 text-blue-700',
    PAST_DUE: 'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
    EXPIRED: 'bg-red-100 text-red-700',
    PAUSED: 'bg-orange-100 text-orange-700',
    PAID: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function BillingPage() {
  const [dashboard, setDashboard] = useState<BillingDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await api.get('/subscriptions/billing/dashboard');
      setDashboard(data.data);
    } catch {
      toast.error('Failed to load billing dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!dashboard?.subscription) return;
    try {
      await api.post(`/subscriptions/${dashboard.subscription.id}/renew`);
      toast.success('Subscription renewed successfully');
      loadDashboard();
    } catch {
      toast.error('Failed to renew subscription');
    }
  };

  const handleCancel = async () => {
    if (!dashboard?.subscription) return;
    if (!confirm('Are you sure you want to cancel your subscription? Premium features will be paused at the end of the billing period.')) return;
    try {
      await api.post(`/subscriptions/${dashboard.subscription.id}/cancel`);
      toast.success('Subscription cancelled');
      loadDashboard();
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!dashboard) return null;

  const { subscription, usage, recentInvoices, alerts, upgradeSuggestions } = dashboard;
  const daysRemaining = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your plan, usage, and invoices</p>
        </div>
        <div className="flex gap-3">
          {subscription && subscription.status !== 'CANCELLED' && (
            <button onClick={handleRenew} className="btn-secondary text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Renew Plan
            </button>
          )}
          <a href="/pricing" className="btn-primary text-sm flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" /> Upgrade Plan
          </a>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.filter((a) => !a.readAt).slice(0, 3).map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-xl border ${
              alert.type === 'EXPIRY_WARNING' || alert.type === 'PAYMENT_FAILED'
                ? 'bg-red-50 border-red-200'
                : alert.type === 'USAGE_LIMIT'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                alert.type === 'EXPIRY_WARNING' || alert.type === 'PAYMENT_FAILED'
                  ? 'text-red-600'
                  : alert.type === 'USAGE_LIMIT'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
              </div>
              {alert.actionUrl && (
                <a href={alert.actionUrl} className="text-xs font-medium text-brand-600 hover:text-brand-700 flex-shrink-0">
                  Action →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upgrade Suggestions */}
      {upgradeSuggestions.length > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <p className="text-sm font-semibold text-brand-800">Upgrade Suggestions</p>
          </div>
          <ul className="space-y-1">
            {upgradeSuggestions.map((s, i) => (
              <li key={i} className="text-xs text-brand-700">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
            {subscription && <StatusBadge status={subscription.status} />}
          </div>
          {subscription ? (
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{subscription.plan.name}</p>
                <p className="text-sm text-gray-500">
                  ₹{subscription.plan.price.toLocaleString('en-IN')}/{subscription.plan.interval === 'YEARLY' ? 'year' : 'month'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Renewal Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Days Remaining</p>
                  <p className={`font-medium ${daysRemaining <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                    {daysRemaining} days
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Auto-Renew</p>
                  <p className="font-medium text-gray-900">{subscription.autoRenew ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Branding Tier</p>
                  <p className="font-medium text-gray-900">{subscription.plan.brandingTier}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={handleCancel} className="text-xs text-red-600 hover:text-red-700 font-medium">
                  Cancel Subscription
                </button>
                <span className="text-gray-300">|</span>
                <a href="/contact" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  Contact Sales
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No active subscription</p>
              <a href="/pricing" className="btn-primary text-sm">View Plans</a>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-50 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-brand-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{daysRemaining}</p>
              <p className="text-xs text-gray-500">Days Left</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{usage?.seatsUsed || 0}</p>
              <p className="text-xs text-gray-500">Active Users</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <HardDrive className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{usage?.storageUsedMb || 0}</p>
              <p className="text-xs text-gray-500">MB Storage</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{usage?.aiCreditsUsed || 0}</p>
              <p className="text-xs text-gray-500">AI Credits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Meters */}
      {usage && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <UsageBar label="User Seats" used={usage.seatsUsed} limit={usage.seatsLimit} percentage={usage.seatsPercentage} icon={Users} unit="seats" />
            <UsageBar label="Storage" used={usage.storageUsedMb} limit={usage.storageLimitMb} percentage={usage.storagePercentage} icon={HardDrive} unit="MB" />
            <UsageBar label="AI Credits" used={usage.aiCreditsUsed} limit={usage.aiCreditsLimit} percentage={usage.aiCreditsPercentage} icon={Zap} unit="credits" />
          </div>
        </div>
      )}

      {/* Payment History / Invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <a href="#" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="card overflow-hidden">
          {recentInvoices.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tax (GST)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-gray-900">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-gray-500">₹{inv.tax.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4"><StatusBadge status={inv.status} /></td>
                    <td className="py-3 px-4">
                      <button className="text-brand-600 hover:text-brand-700" title="Download Invoice">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No invoices yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Alerts */}
      {alerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Subscription Notifications</h2>
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
              {alerts.filter((a) => !a.readAt).length} unread
            </span>
          </div>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className={`card p-4 flex items-start gap-3 ${alert.readAt ? 'opacity-60' : ''}`}>
                <Bell className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  alert.type === 'EXPIRY_WARNING' ? 'text-red-500' :
                  alert.type === 'USAGE_LIMIT' ? 'text-yellow-500' :
                  alert.type === 'UPGRADE_SUGGESTION' ? 'text-brand-500' :
                  alert.type === 'PAYMENT_FAILED' ? 'text-red-500' :
                  'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    {!alert.readAt && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
