'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { useAuth } from '@/context/AuthContext';
import { request } from '@/services/api-client';

export default function UserProfilePage() {
  const { user, workspace, isLoading, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'api'>('profile');
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTimezone(user.timezone || 'UTC');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await request('/console/api/account/profile', {
        method: 'PATCH',
        body: {
          name: name.trim(),
          timezone: timezone.trim() || 'UTC',
        },
      });

      await refreshAuth();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Account & Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal profile, credentials, team members, and integration tokens.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'profile', label: 'My Profile' },
          { id: 'workspace', label: 'Workspace & Plan' },
          { id: 'api', label: 'API & Integrations' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'profile' | 'workspace' | 'api')}
            className={`cursor-pointer px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Update your account details and contact information.
          </p>

          {saved && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Profile updated successfully.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || (isLoading ? 'Loading...' : '')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Email is tied to your Dify account authentication.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="UTC"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || isLoading}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workspace Tab */}
      {activeTab === 'workspace' && (
        <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Workspace Settings</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Manage organization settings and member permissions.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {workspace?.name || (isLoading ? 'Loading...' : 'My Workspace')}
                </p>
                {workspace?.id && (
                  <p className="text-xs text-gray-500">Workspace ID: {workspace.id}</p>
                )}
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Active Plan: {workspace?.plan || 'Community / Self-Hosted'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-700">Team Collaboration</p>
              <p className="text-2xs text-gray-400">Manage invitations, roles, and access control.</p>
            </div>
            <Link
              href="/dashboard/settings/members"
              className="rounded-lg bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Manage Members →
            </Link>
          </div>
        </div>
      )}

      {/* API Tab */}
      {activeTab === 'api' && (
        <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-gray-900">API Access & Keys</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Use API keys to integrate your Dify agents and workflows into custom frontends and backend services.
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Backend Reverse Proxy Target
            </p>
            <p className="mt-1 font-mono text-sm text-gray-900">
              http://127.0.0.1:5001/console/api
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/dashboard/apps"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
            >
              Go to Studio & Apps
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
