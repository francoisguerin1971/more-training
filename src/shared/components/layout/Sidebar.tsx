import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LogOut, BrainCircuit, LayoutGrid, LayoutDashboard, Users, Calendar, Settings,
    Watch, Video, ChevronDown, MessageSquare, FileText, CreditCard, BookOpen,
    List, Clock, UserPlus, Globe
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useMessages } from '@/shared/context/MessageContext';

interface SidebarProps {
    onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
    const { t } = useLanguage();
    const { currentUser, setShowInviteModal } = useAuthStore();
    const { messages = [] } = useMessages();

    if (!currentUser) return null;

    const unreadCount = messages?.filter((m: any) => !m.read && m.to === currentUser.id)?.length || 0;

    const proLinks = [
        { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { path: '/athletes', label: t('athletes'), icon: Users },
        // Planning Suite
        // Planning Suite
        { path: '/calendar', label: t('planner'), icon: LayoutGrid }, // Global Calendar
        { path: '/planner', label: t('planificateur'), icon: BrainCircuit, group: 'MasterPlan' },
        // { path: '/ai-planner', label: t('ai_planner_title'), icon: BrainCircuit, group: 'MasterPlan' },
        // { path: '/manual-builder', label: t('manual_studio'), icon: List, group: 'MasterPlan' },

        { path: '/integrations', label: t('integrations'), icon: Watch },
        { path: '/appointments', label: t('weekly_meetings'), icon: Calendar },
        { path: '/messages', label: t('messages'), icon: MessageSquare, badge: unreadCount },
        { path: '/invoices', label: t('billing'), icon: CreditCard },
        { path: '/resources', label: t('library'), icon: BookOpen },
        { path: '/my-profile', label: t('my_public_profile'), icon: Globe },
    ];

    const athleteLinks = [
        { path: '/dashboard', label: t('my_training'), icon: LayoutDashboard },
        { path: '/calendar', label: t('schedule'), icon: Calendar },
        { path: '/integrations', label: t('integrations'), icon: Watch },
        { path: '/appointments', label: t('weekly_meetings'), icon: Clock },
        { path: '/messages', label: t('messages'), icon: MessageSquare, badge: unreadCount },
        { path: '/billing', label: t('my_subscription'), icon: CreditCard },
        { path: '/resources', label: t('library'), icon: BookOpen },
    ];

    const links = currentUser.role === 'pro' ? proLinks : athleteLinks;

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* User Profile Header */}
            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {currentUser.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                            {currentUser.first_name && currentUser.last_name
                                ? `${currentUser.first_name} ${currentUser.last_name}`
                                : (currentUser.full_name || currentUser.name || currentUser.pseudo || 'User')}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentUser.role === 'pro' ? 'Coach' : 'Athlète'}</p>
                    </div>
                    <ChevronDown size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
            </div>

            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20">
                    M
                </div>
                <span className="font-bold text-lg text-white tracking-tight">
                    More <span className="text-emerald-400 underline decoration-indigo-500/30 underline-offset-4">Training</span>
                </span>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {links.map((link, index) => {
                    const Icon = link.icon;
                    // Add separator before specialized groups if needed
                    const isGroupStart = (link as any).group && (index === 0 || (links[index - 1] as any).group !== (link as any).group);

                    return (
                        <div key={link.path}>
                            {isGroupStart && (link as any).group !== 'MasterPlan' && (
                                <div className="px-3 mt-4 mb-2">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        {(link as any).group}
                                    </p>
                                </div>
                            )}
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={18} />
                                    {link.label}
                                </div>
                                {(link as any).badge !== undefined && ((link as any).badge > 0 || typeof (link as any).badge === 'string') && (
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                        typeof (link as any).badge === 'string' ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
                                    )}>
                                        {(link as any).badge}
                                    </span>
                                )}
                            </NavLink>
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-4">
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-emerald-500/20"
                >
                    <UserPlus size={18} />
                    {currentUser.role === 'pro' ? t('invite_athlete') : t('invite_partners')}
                </button>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border",
                        isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent"
                    )}
                >
                    <Settings size={18} />
                    {t('settings')}
                </NavLink>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                    <LogOut size={18} />
                    {t('logout')}
                </button>
            </div>
        </aside>
    );
}
