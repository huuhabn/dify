'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function UserProfilePage() {
  const { user, workspace } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'api'>('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || 'Administrator'}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                disabled
                defaultValue={user?.email || 'admin@dify.local'}
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
                defaultValue={user?.timezone || 'UTC'}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
              >
                Save Changes
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
                  {workspace?.name || 'Default Workspace'}
                </p>
                <p className="text-xs text-gray-500">Workspace ID: {workspace?.id || 'default'}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Active Plan: {workspace?.plan || 'Community / Self-Hosted'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Resource Limits</h3>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Apps Created</p>
                <p className="text-lg font-bold text-gray-900 mt-1">Unlimited</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Vector Storage</p>
                <p className="text-lg font-bold text-gray-900 mt-1">Self-Hosted</p>
              </div>
            </div>
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
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
            >
              Generate New API Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
