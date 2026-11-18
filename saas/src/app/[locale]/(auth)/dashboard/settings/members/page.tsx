'use client';

import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';

type Member = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: number;
};

export default function WorkspaceMembersPage() {
  const [members, setMembers] = useState<Member[]>([
    {
      id: 'm1',
      name: 'Nguyen Van A',
      email: 'owner@dify.local',
      role: 'owner',
      joined_at: Date.now() / 1000 - 86400 * 30,
    },
    {
      id: 'm2',
      name: 'Tran Thi B',
      email: 'admin@dify.local',
      role: 'admin',
      joined_at: Date.now() / 1000 - 86400 * 14,
    },
    {
      id: 'm3',
      name: 'Le Van C',
      email: 'developer@dify.local',
      role: 'member',
      joined_at: Date.now() / 1000 - 86400 * 5,
    },
  ]);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [sending, setSending] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setMembers((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: inviteEmail.split('@')[0] || 'New Member',
        email: inviteEmail.trim(),
        role: inviteRole,
        joined_at: Date.now() / 1000,
      },
    ]);
    setSending(false);
    setInviteEmail('');
    setInviteModalOpen(false);
  };

  const getRoleBadge = (role: Member['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 bg-white p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/user-profile"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Team Members & RBAC
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Manage workspace access permissions, roles, and pending invitations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          + Invite Member
        </button>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th scope="col" className="px-6 py-3.5">Member</th>
              <th scope="col" className="px-6 py-3.5">Email</th>
              <th scope="col" className="px-6 py-3.5">Role</th>
              <th scope="col" className="px-6 py-3.5">Joined Date</th>
              <th scope="col" className="relative px-6 py-3.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {m.name.charAt(0)}
                    </div>
                    {m.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                  {m.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold capitalize ${getRoleBadge(m.role)}`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {new Date(m.joined_at * 1000).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {m.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
                      className="text-xs text-red-600 hover:text-red-500 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Invite Team Member</h3>
            <p className="mt-1 text-xs text-gray-500">
              Send an invitation to join this Dify workspace.
            </p>

            <form onSubmit={handleInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="member">Normal Member (Can use and build apps)</option>
                  <option value="admin">Administrator (Can manage settings and API keys)</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || !inviteEmail.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  {sending ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
