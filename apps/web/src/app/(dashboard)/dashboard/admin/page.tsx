'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { StatCard } from '../../../../components/ui/StatCard';
import { StatusBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { LoadingSkeleton } from '../../../../components/ui/LoadingSkeleton';
import {
  ShieldCheck,
  Building2,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download
} from 'lucide-react';

export default function AdminDashboard() {
  const [impact, setImpact] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orgs' | 'users' | 'audit' | 'reports'>('orgs');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [impRes, orgsRes, usersRes, logsRes] = await Promise.all([
        api.get('/impact/overview'),
        api.get('/admin/organizations'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs')
      ]);
      setImpact(impRes);
      setOrganizations(orgsRes || []);
      setUsers(usersRes || []);
      setAuditLogs(logsRes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyOrg = async (orgId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/organizations/${orgId}/verify`, { status });
      setMsg(`Organization status updated to ${status}`);
      await fetchData();
    } catch {
      // quiet
    }
  };

  const handleToggleUser = async (userId: string, currentActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentActive });
      setMsg(`User status changed`);
      await fetchData();
    } catch {
      // quiet
    }
  };

  const handleExportCSV = async (type: string) => {
    try {
      const csvData = await api.get(`/admin/export/${type}`);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `foodbridge_${type}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // quiet
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Platform Administration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Governance, NGO verification, user access control, and audit trail
        </p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      {loading ? (
        <LoadingSkeleton rows={2} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Food Rescued"
            value={`${impact?.foodRescuedKg?.toLocaleString() || 0} kg`}
            subtitle={`${impact?.wastePreventedKg || 0} kg waste prevented`}
            icon={<span className="text-xl">🌱</span>}
          />
          <StatCard
            title="Meals Provided"
            value={impact?.mealsProvided?.toLocaleString() || 0}
            subtitle={`${impact?.estimatedPeopleServed || 0} estimated beneficiaries`}
            icon={<span className="text-xl">🍱</span>}
          />
          <StatCard
            title="Active Entities"
            value={`${impact?.activeDonors || 0} Donors / ${impact?.activeNGOs || 0} NGOs`}
            subtitle={`${impact?.activeVolunteers || 0} active courier volunteers`}
            icon={<Building2 className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Completed Rescues"
            value={impact?.totalCompletedDeliveries || 0}
            subtitle="100% verified deliveries"
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          />
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 p-2 bg-slate-50/60">
          {(
            [
              { key: 'orgs', label: 'Organizations & Verification', icon: Building2 },
              { key: 'users', label: 'User Directory', icon: Users },
              { key: 'audit', label: 'Audit Trail Logs', icon: ShieldCheck },
              { key: 'reports', label: 'CSV Export Reports', icon: FileSpreadsheet }
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'orgs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Partner Organization Registry ({organizations.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-[10px] uppercase font-semibold">
                      <th className="py-2.5 px-4">Organization</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">City</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {org.name}
                          <div className="text-[10px] text-slate-400 font-normal">{org.address}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{org.type.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4">{org.city}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={org.verifiedStatus} />
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {org.verifiedStatus !== 'VERIFIED' ? (
                            <button
                              onClick={() => handleVerifyOrg(org.id, 'VERIFIED')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyOrg(org.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold hover:bg-rose-100"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block pb-2 border-b border-slate-100">
                Registered Platform Users ({users.length})
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-[10px] uppercase font-semibold">
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Access Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUser(u.id, u.isActive)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                              u.isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block pb-2 border-b border-slate-100">
                System Audit Trail Logs
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-[10px] uppercase font-semibold">
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Actor</th>
                      <th className="py-2.5 px-4">Entity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                        <td className="py-3 px-4">{log.user?.name || 'System Actor'}</td>
                        <td className="py-3 px-4 text-slate-500">{log.entityType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Export Verified CSV Reports</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Generate compliance data sheets for municipal bodies and corporate ESG reporting.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleExportCSV('donations')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Donations Log</span>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">All logged food batches with weights and statuses</p>
                </button>

                <button
                  onClick={() => handleExportCSV('ngos')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">NGO Shelters</span>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Shelter verification records & meal capacities</p>
                </button>

                <button
                  onClick={() => handleExportCSV('donors')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 text-left transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Donor Directory</span>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Registered restaurants and cafeteria partners</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
