'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { request } from '@/services/api-client';

type Member = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | string;
  joined_at: number;
};

export default function WorkspaceMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [sending, setSending] = useState(false);

  const loadMembers = async () => {
    try {
      const res = await request<{ accounts?: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        created_at: number;
      }> }>('/console/api/workspaces/current/members');

      if (res?.accounts) {
        setMembers(
          res.accounts.map((acc) => ({
            id: acc.id,
            name: acc.name || acc.email?.split('@')[0] || 'Member',
            email: acc.email,
            role: acc.role,
            joined_at: acc.created_at || Math.floor(Date.now() / 1000),
          })),
        );
      }
    } catch (err) {
      console.error('Failed to load workspace members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSending(true);
    try {
      await request('/console/api/workspaces/current/members/invite-email', {
        method: 'POST',
        body: {
          emails: [inviteEmail.trim()],
          role: inviteRole,
          language: 'en-US',
        },
      });
      await loadMembers();
      setInviteEmail('');
      setInviteModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await request(`/console/api/workspaces/current/members/${memberId}`, {
        method: 'DELETE',
      });
      setMembers((prev) => prev.filter((x) => x.id !== memberId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const getRoleBadge = (role: string) => {
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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  Loading workspace members...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  No members found in this workspace.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {m.name.charAt(0).toUpperCase()}
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
                        onClick={() => handleRemove(m.id)}
                        className="text-xs text-red-600 hover:text-red-500 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Invite Team Member</h2>
            <p className="mt-1 text-xs text-gray-500">
              An invitation email will be sent with workspace join instructions.
            </p>

            <form onSubmit={handleInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="member">Member - Can use apps, studio, and run workflows</option>
                  <option value="admin">Admin - Full access to settings, members, and keys</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
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
