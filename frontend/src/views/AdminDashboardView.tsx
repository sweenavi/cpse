import React, { useState, useEffect, useMemo } from 'react';
import type { UserProfile, UserRole, CPSEEntity } from '../types';
import {
  fetchAdminUsers,
  createAdminUser,
  updateUserRoleAdmin,
  updateUserStatus,
  deleteAdminUser,
  fetchAdminStats,
} from '../services/api';
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Building2,
  Lock,
  KeyRound,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  Copy,
  Activity,
  LogOut,
  Trash2,
  Edit3,
  Filter,
  Eye,
  CheckSquare,
  AlertOctagon,
  ShieldAlert,
} from 'lucide-react';

interface AdminDashboardViewProps {
  currentUser: UserProfile | null;
  onImpersonateUser: (user: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

const FIVE_STAKEHOLDER_ROLES: {
  role: UserRole;
  title: string;
  badge: string;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
  primaryCockpit: string;
}[] = [
  {
    role: 'MOPNG_GOVERNMENT',
    title: 'MoPNG / Ministry Government',
    badge: 'MoPNG Govt',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    borderColor: 'border-indigo-300',
    description: 'National DPI governance, 1:N Universal Catalog Explorer & cross-CPSE policy oversight',
    primaryCockpit: 'National Master Registry',
  },
  {
    role: 'CPSE_MANAGEMENT',
    title: 'CPSE Plant Management',
    badge: 'CPSE Mgt',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-800',
    borderColor: 'border-blue-300',
    description: 'Plant-level material normalizations, batch CSV ingestion & multimodal blueprint OCR',
    primaryCockpit: 'Legacy OCR & Normalization',
  },
  {
    role: 'PROCUREMENT_TEAM',
    title: 'Procurement & Sourcing Team',
    badge: 'Procurement',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    borderColor: 'border-emerald-300',
    description: 'Joint demand pooling, volume elasticity discounts & statutory 25% MSE quota lot-slicing',
    primaryCockpit: 'Strategic Sourcing Simulator',
  },
  {
    role: 'ENGINEERING_EXPERT',
    title: 'Engineering & Technical Experts',
    badge: 'Engineering',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-800',
    borderColor: 'border-rose-300',
    description: 'Yellow-Tier HITL equivalence review, 5-axis factor radar & XAI token diff sign-off',
    primaryCockpit: 'Reviewer Portal (HITL)',
  },
  {
    role: 'IT_SAP_TEAM',
    title: 'IT & SAP Basis Team',
    badge: 'SAP / IT',
    color: 'text-slate-800',
    bgLight: 'bg-slate-100 border-slate-300 text-slate-900',
    borderColor: 'border-slate-400',
    description: 'NetWeaver RFC BAPI sync authorization, rogue override detection & Merkle chain audits',
    primaryCockpit: 'Vigilance & Drift Monitor',
  },
];

export function AdminDashboardView({ currentUser, onImpersonateUser }: AdminDashboardViewProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedCPSEFilter, setSelectedCPSEFilter] = useState<string>('ALL');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('ENGINEERING_EXPERT');
  const [roleChangeReason, setRoleChangeReason] = useState<string>('');

  // New User Form State
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserCPSE, setNewUserCPSE] = useState<CPSEEntity>('IOCL');
  const [newUserPlant, setNewUserPlant] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('PROCUREMENT_TEAM');
  const [newUserBadge, setNewUserBadge] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userList, statsData] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminStats().catch(() => null),
      ]);
      if (Array.isArray(userList)) {
        setUsers(userList);
      }
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPlant) {
      alert('Please fill all required fields');
      return;
    }
    try {
      await createAdminUser({
        name: newUserName,
        email: newUserEmail,
        cpse: newUserCPSE,
        plantLocation: newUserPlant,
        role: newUserRole,
        badgeId: newUserBadge || undefined,
      });
      showNotification(`Successfully provisioned stakeholder ${newUserName} with role ${newUserRole}`);
      setIsCreateModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPlant('');
      setNewUserBadge('');
      loadData();
    } catch (err: any) {
      alert(`Provisioning failed: ${err.message}`);
    }
  };

  const handleOpenRoleModal = (user: UserProfile) => {
    setTargetUser(user);
    setSelectedNewRole(user.role);
    setRoleChangeReason(`Administrative role adjustment for ${user.cpse} operations`);
    setIsEditRoleModalOpen(true);
  };

  const handleSaveRoleChange = async () => {
    if (!targetUser) return;
    try {
      await updateUserRoleAdmin(targetUser.id, selectedNewRole, roleChangeReason);
      showNotification(`Reassigned ${targetUser.name} to role ${selectedNewRole} (Recorded in Merkle Ledger)`);
      setIsEditRoleModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Role change failed: ${err.message}`);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateUserStatus(user.id, nextStatus, `Administrative policy toggle by ${currentUser?.name}`);
      showNotification(`Account for ${user.name} set to ${nextStatus}`);
      loadData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (confirm(`Are you sure you want to revoke and delete stakeholder ${user.name} (${user.id})?`)) {
      try {
        await deleteAdminUser(user.id);
        showNotification(`Revoked and removed stakeholder ${user.name}`);
        loadData();
      } catch (err: any) {
        alert(`Deletion failed: ${err.message}`);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.cpse.toLowerCase().includes(q) ||
        u.badgeId?.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);

      const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
      const matchesCPSE = selectedCPSEFilter === 'ALL' || u.cpse === selectedCPSEFilter;

      return matchesSearch && matchesRole && matchesCPSE;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedCPSEFilter]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner & Control Plane Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/10 via-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg ring-2 ring-rose-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                  Unified Stakeholder &amp; RBAC Administration Portal
                </h1>
                <span className="text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
                  NATIONAL GOVERNANCE CONTROL PLANE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Authoritative centralized directory for assigning, authenticating, and auditing the 5 core stakeholder personas across all CPSEs &amp; MoPNG.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ring-2 ring-rose-400/20"
            >
              <UserPlus className="w-4 h-4" />
              Provision Stakeholder
            </button>
            <button
              onClick={loadData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Registry Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionFeedback && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* KPI Ribbon: Platform Stakeholder Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Total Stakeholders
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-sans">
              {stats?.totalStakeholders ?? users.length}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              {stats?.activeStakeholders ?? users.filter(u => u.status === 'ACTIVE').length} Verified &amp; Active
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Operational Roles
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-sans">
              5 Core Roles
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Strictly Governed Taxonomy
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Enterprises Covered
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-sans">
              {stats?.enterprisesCovered ?? new Set(users.map(u => u.cpse)).size} CPSEs
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              MoPNG, CPCL, IOCL, ONGC, BPCL...
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Merkle Security Ledger
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-sans flex items-center gap-1.5">
              <ShieldCheck className="w-6 h-6" /> SECURE
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {stats?.merkleBlocksCount ?? 105} Cryptographic Blocks
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 5 Core Stakeholder Personas Card Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            The 5 Standard Stakeholder Personas &amp; Operational Remits
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Click any role to filter directory below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FIVE_STAKEHOLDER_ROLES.map((roleItem) => {
            const count = users.filter((u) => u.role === roleItem.role).length;
            const isSelected = selectedRoleFilter === roleItem.role;
            return (
              <button
                key={roleItem.role}
                onClick={() => setSelectedRoleFilter(isSelected ? 'ALL' : roleItem.role)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? `${roleItem.bgLight} ${roleItem.borderColor} ring-2 ring-indigo-500/20 shadow-xs`
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${roleItem.bgLight}`}>
                    {roleItem.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    {count} {count === 1 ? 'User' : 'Users'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-2 font-sans line-clamp-1">
                  {roleItem.title}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {roleItem.description}
                </div>
                <div className="text-[9px] font-mono text-indigo-600 mt-2 font-semibold flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> {roleItem.primaryCockpit}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stakeholder Directory Table & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stakeholder by name, email, badge ID..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-sans shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Filter className="w-3.5 h-3.5" />
              <span>CPSE:</span>
            </div>
            <select
              value={selectedCPSEFilter}
              onChange={(e) => setSelectedCPSEFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans text-slate-700"
            >
              <option value="ALL">All CPSEs</option>
              <option value="MoPNG">MoPNG (National)</option>
              <option value="CPCL">CPCL</option>
              <option value="IOCL">IOCL</option>
              <option value="ONGC">ONGC</option>
              <option value="BPCL">BPCL</option>
              <option value="HPCL">HPCL</option>
              <option value="SAIL">SAIL</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono ml-2">
              <span>Role:</span>
            </div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans text-slate-700"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MOPNG_GOVERNMENT">1. MoPNG Govt</option>
              <option value="CPSE_MANAGEMENT">2. CPSE Management</option>
              <option value="PROCUREMENT_TEAM">3. Procurement Team</option>
              <option value="ENGINEERING_EXPERT">4. Engineering Expert</option>
              <option value="IT_SAP_TEAM">5. IT / SAP Team</option>
            </select>

            {(selectedRoleFilter !== 'ALL' || selectedCPSEFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedRoleFilter('ALL');
                  setSelectedCPSEFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-[11px] font-mono text-rose-600 hover:text-rose-700 underline cursor-pointer ml-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50 text-[11px] font-mono text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Stakeholder Identity</th>
                <th className="py-3 px-4">Organization &amp; Location</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Capabilities</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-mono text-xs">
                    No stakeholders found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = FIVE_STAKEHOLDER_ROLES.find((r) => r.role === user.role);
                  const isSuperAdmin = user.role === 'SUPER_ADMIN';
                  const isSuspended = user.status === 'SUSPENDED';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSuspended ? 'bg-rose-50/20 opacity-70' : ''
                      }`}
                    >
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase shrink-0 ${
                              isSuperAdmin
                                ? 'bg-gradient-to-tr from-rose-600 to-indigo-600 ring-2 ring-rose-500/20'
                                : 'bg-slate-700'
                            }`}
                          >
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isSuperAdmin && (
                                <span className="text-[9px] font-mono bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded-md font-bold">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {user.id} • Badge: {user.badgeId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Organization & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.cpse}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                          {user.plantLocation}
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-3.5 px-4">
                        {isSuperAdmin ? (
                          <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg">
                            👑 National Admin Portal
                          </span>
                        ) : roleConfig ? (
                          <span
                            className={`text-[10px] font-mono font-bold border px-2.5 py-1 rounded-lg inline-block ${roleConfig.bgLight}`}
                          >
                            {roleConfig.title}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {user.role}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                            <AlertOctagon className="w-3 h-3 text-rose-600" /> SUSPENDED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Capabilities */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] font-mono text-slate-600">
                          <span className="font-bold text-slate-900">{user.permissions?.length ?? 12}</span>{' '}
                          Capabilities Granted
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                          {user.permissions?.slice(0, 2).join(', ')}...
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Reassignment */}
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Assign or Reassign Stakeholder Role"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Role</span>
                          </button>

                          {/* Authenticate As / Impersonate */}
                          <button
                            onClick={() => onImpersonateUser(user)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Authenticate as this stakeholder and launch their exact cockpit"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Verify Cockpit</span>
                          </button>

                          {/* Status Toggle (Suspend / Activate) */}
                          {!isSuperAdmin && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                                isSuspended
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                              title={isSuspended ? 'Re-activate Account' : 'Suspend Account Access'}
                            >
                              {isSuspended ? 'Activate' : 'Suspend'}
                            </button>
                          )}

                          {/* Delete */}
                          {!isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Stakeholder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {isEditRoleModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-sans">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                Assign Stakeholder Role
              </div>
              <button
                onClick={() => setIsEditRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900">{targetUser.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {targetUser.cpse} • {targetUser.email}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Current Role:{' '}
                  <strong className="text-slate-700">{targetUser.role.replace(/_/g, ' ')}</strong>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1.5">
                  Select New Operational Role (Strict 5-Stakeholder Taxonomy)
                </label>
                <div className="space-y-2">
                  {FIVE_STAKEHOLDER_ROLES.map((r) => (
                    <label
                      key={r.role}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedNewRole === r.role
                          ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="newRole"
                        value={r.role}
                        checked={selectedNewRole === r.role}
                        onChange={() => setSelectedNewRole(r.role)}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs font-sans">{r.title}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {r.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1">
                  Administrative Reason (Committed to SHA-256 Merkle Ledger)
                </label>
                <input
                  type="text"
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                  placeholder="e.g. Promotion to General Manager SCM"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditRoleModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoleChange}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm Role Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision Stakeholder Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-sans">
                <UserPlus className="w-4 h-4 text-rose-600" />
                Provision New Stakeholder Account
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Smt. Radhika Ramanathan"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@cpcl.co.in"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1">
                    Enterprise / CPSE *
                  </label>
                  <select
                    value={newUserCPSE}
                    onChange={(e) => setNewUserCPSE(e.target.value as CPSEEntity)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-sans"
                  >
                    <option value="CPCL">CPCL (Chennai Petroleum)</option>
                    <option value="IOCL">IOCL (Indian Oil)</option>
                    <option value="ONGC">ONGC</option>
                    <option value="BPCL">BPCL</option>
                    <option value="HPCL">HPCL</option>
                    <option value="SAIL">SAIL</option>
                    <option value="MoPNG">MoPNG (Ministry)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1">
                    Plant Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPlant}
                    onChange={(e) => setNewUserPlant(e.target.value)}
                    placeholder="e.g. Manali Refinery, Chennai"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1">
                    Badge / Employee ID
                  </label>
                  <input
                    type="text"
                    value={newUserBadge}
                    onChange={(e) => setNewUserBadge(e.target.value)}
                    placeholder="CPCL-ENG-5102"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1.5">
                  Assigned Operational Role (1 of 5 Core Stakeholders) *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-sans font-bold text-slate-800"
                >
                  <option value="MOPNG_GOVERNMENT">1. MoPNG / Ministry Government</option>
                  <option value="CPSE_MANAGEMENT">2. CPSE Plant Management</option>
                  <option value="PROCUREMENT_TEAM">3. Procurement &amp; Sourcing Team</option>
                  <option value="ENGINEERING_EXPERT">4. Engineering &amp; Technical Experts</option>
                  <option value="IT_SAP_TEAM">5. IT &amp; SAP Basis Team</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Provision Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export default AdminDashboardView;
