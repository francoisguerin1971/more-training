import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    Users, Search, Filter, MoreVertical, Activity, TrendingUp,
    CheckCircle2, UserPlus, Target, MessageSquare, Calendar,
    CreditCard, Brain, FileEdit, HeartPulse, ShieldAlert,
    Banknote, Zap, Timer, Plus, Send, ClipboardList
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/core/utils/cn';
import { CoachTechnicalForm } from '../components/CoachTechnicalForm';
import { supabase } from '@/core/services/supabase';
import { logger } from '@/core/utils/security';
import { AthleteWithStats, TechnicalAssessmentData } from '../types';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';
import { InviteAthleteModal } from '../components/InviteAthleteModal';

export function AthletesList() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { currentUser, getAthletesForCoach } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
    const [showObjectiveModal, setShowObjectiveModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedAthleteForTech, setSelectedAthleteForTech] = useState<AthleteWithStats | null>(null);
    const [groupObjective, setGroupObjective] = useState('');
    const [athletes, setAthletes] = useState<AthleteWithStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAthletes = async () => {
            if (!currentUser?.id) return;
            setLoading(true);
            try {
                const data = await getAthletesForCoach(currentUser.id);

                let validData = data || [];

                // DEMO MODE: If no athletes found, generate mock data
                if (validData.length === 0) {
                    validData = [
                        {
                            id: 'mock-1',
                            name: 'Alex "The Rocket" Mercer',
                            avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
                            email: 'alex.mercer@example.com',
                            role: 'athlete',
                            billingStatus: 'paid',
                            planType: 'AI_ELITE',
                            healthStatus: 'training_well', // Using a generic status for now
                            fitScore: 92,
                            ltv: 1450,
                            compliance: 96,
                            lastWorkout: 'Today',
                            nextRaceDate: '2026-04-12',
                            nextRaceName: 'Paris Marathon',
                            plannedLoad: [100, 120, 110, 140, 160, 180, 120, 200, 220, 150].map((v, i) => ({ x: i, y: v })),
                            actualLoad: [90, 125, 105, 130, 165, 175, 115, 205, 215, 140].map((v, i) => ({ x: i, y: v })),
                            rpeLoad: [4, 6, 5, 7, 8, 8, 4, 9, 8, 6].map((v, i) => ({ x: i, y: v * 20 })), // Scaled to match load
                            created_at: new Date().toISOString()
                        },
                        {
                            id: 'mock-2',
                            name: 'Sarah Connor',
                            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
                            email: 'sarah.c@example.com',
                            role: 'athlete',
                            billingStatus: 'overdue',
                            planType: 'HYBRID',
                            healthStatus: 'injured',
                            fitScore: 78,
                            ltv: 850,
                            compliance: 45,
                            lastWorkout: '3 days ago',
                            nextRaceDate: '2026-06-21',
                            nextRaceName: 'Ironman 70.3',
                            plannedLoad: [100, 120, 110, 140, 160, 180, 120, 200, 220, 150].map((v, i) => ({ x: i, y: v })),
                            actualLoad: [100, 120, 110, 140, 0, 0, 0, 0, 0, 0].map((v, i) => ({ x: i, y: v })),
                            rpeLoad: [4, 6, 5, 7, 0, 0, 0, 0, 0, 0].map((v, i) => ({ x: i, y: v * 20 })),
                            created_at: new Date().toISOString()
                        },
                        {
                            id: 'mock-3',
                            name: 'Marcus Fenix',
                            avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
                            email: 'marcus.f@example.com',
                            role: 'athlete',
                            billingStatus: 'pending',
                            planType: 'MANUAL_PRO',
                            healthStatus: 'tired',
                            fitScore: 88,
                            ltv: 2100,
                            compliance: 82,
                            lastWorkout: 'Yesterday',
                            nextRaceDate: '2026-03-01',
                            nextRaceName: 'Tokyo Marathon',
                            plannedLoad: [110, 130, 120, 150, 160, 170, 130, 210, 230, 160].map((v, i) => ({ x: i, y: v })),
                            actualLoad: [105, 125, 115, 145, 155, 165, 125, 205, 225, 155].map((v, i) => ({ x: i, y: v })),
                            rpeLoad: [6, 7, 6, 8, 9, 8, 5, 9, 9, 7].map((v, i) => ({ x: i, y: v * 20 })),
                            created_at: new Date().toISOString()
                        }
                    ] as any[]; // Using any to bypass stricter load graph checks for now as we build
                } else {
                    // Enrich real data with Mock CRM Data for Demo
                    validData = validData.map(a => ({
                        ...a,
                        billingStatus: Math.random() > 0.8 ? 'overdue' : Math.random() > 0.9 ? 'pending' : 'paid',
                        planType: Math.random() > 0.6 ? 'AI_ELITE' : Math.random() > 0.3 ? 'HYBRID' : 'MANUAL_PRO',
                        healthStatus: Math.random() > 0.9 ? 'injured' : Math.random() > 0.8 ? 'tired' : 'ok',
                        fitScore: Math.floor(Math.random() * (95 - 60) + 60),
                        ltv: Math.floor(Math.random() * 2000) + 100,
                        compliance: a.compliance || Math.floor(Math.random() * 40) + 60,
                        nextRaceDate: new Date(Date.now() + Math.random() * 10000000000).toISOString().split('T')[0],
                        nextRaceName: ['Paris Marathon', 'Ironman 70.3', 'UTMB', '10k local'][Math.floor(Math.random() * 4)],
                        // Generate simple arrays for sparklines
                        plannedLoad: Array.from({ length: 10 }, (_, i) => ({ x: i, y: 100 + Math.random() * 50 })),
                        actualLoad: Array.from({ length: 10 }, (_, i) => ({ x: i, y: 90 + Math.random() * 60 })),
                        rpeLoad: Array.from({ length: 10 }, (_, i) => ({ x: i, y: (Math.random() * 10) * 20 })),
                    })) as AthleteWithStats[];
                }

                setAthletes(validData);
            } catch (err) {
                logger.error('Error loading athletes in AthletesList:', err);
            } finally {
                setLoading(false);
            }
        };

        loadAthletes();
    }, [currentUser?.id, getAthletesForCoach]);

    const filteredAthletes = athletes.filter(athlete =>
        athlete.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAthleteSelection = (id: string) => {
        setSelectedAthletes(prev =>
            prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
        );
    };

    const handleSetObjective = () => {
        setShowObjectiveModal(false);
        setSelectedAthletes([]);
    };

    const handleSaveTechnicalAssessment = async (data: TechnicalAssessmentData) => {
        if (!selectedAthleteForTech || !currentUser?.id) return;
        try {
            const { error } = await supabase
                .from('technical_assessments')
                .insert([{
                    coach_id: currentUser.id,
                    athlete_id: selectedAthleteForTech.id,
                    form_status: data.formStatus,
                    fatigue: data.fatigue,
                    motivation: data.motivation,
                    focus: data.focus,
                    notes: ''
                }]);
            if (error) {
                logger.error('Error saving technical assessment:', error);
            } else {
                setSelectedAthleteForTech(null);
            }
        } catch (err) {
            logger.error('Exception saving technical assessment:', err);
        }
    };

    // Helper for simple SVG sparkline path
    const generatePath = (data: { x: number, y: number }[], width: number, height: number, maxVal: number) => {
        if (!data || data.length === 0) return "";
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (d.y / maxVal) * height;
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        {t('athletes')} <span className="text-emerald-400">Roster</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
                        Elite athlete lifecycle management
                    </p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/20"
                >
                    <UserPlus size={18} /> {t('new_athlete_btn')}
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder={t('marketplace_search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold uppercase text-[10px] tracking-widest"
                    />
                </div>
                <button className="bg-slate-900 border border-slate-800 text-slate-400 p-4 rounded-2xl hover:text-white hover:bg-slate-800 transition-all">
                    <Filter size={20} />
                </button>
            </div>

            {/* Main Grid */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Activity className="animate-spin text-emerald-500" size={32} />
                        <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Loading Roster...</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAthletes.map((athlete) => {
                        // Calculate days to goal
                        const daysToGoal = athlete.nextRaceDate
                            ? Math.ceil((new Date(athlete.nextRaceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            : null;

                        // Prepare graph paths
                        const graphWidth = 120;
                        const graphHeight = 40;
                        const maxLoad = 250;
                        const plannedPath = generatePath(athlete.plannedLoad as any, graphWidth, graphHeight, maxLoad);
                        const actualPath = generatePath(athlete.actualLoad as any, graphWidth, graphHeight, maxLoad);
                        const rpePath = generatePath(athlete.rpeLoad as any, graphWidth, graphHeight, maxLoad);

                        const isSelected = selectedAthletes.includes(athlete.id);

                        return (
                            <Card
                                key={athlete.id}
                                className={cn(
                                    "group relative overflow-visible flex flex-col justify-between transition-all duration-300 border-2 cursor-pointer",
                                    isSelected
                                        ? "border-emerald-500 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10 scale-[1.02]"
                                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900"
                                )}
                                onClick={() => toggleAthleteSelection(athlete.id)}
                            >
                                {/* Selection Checkbox Overlay */}
                                <div className={cn(
                                    "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10",
                                    isSelected ? "border-emerald-500 bg-emerald-500 text-slate-950" : "border-slate-700 bg-slate-900/50 text-transparent hover:border-emerald-500/50"
                                )}>
                                    <CheckCircle2 size={12} strokeWidth={4} />
                                </div>

                                {/* CRM Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-xl text-white shadow-lg border border-slate-700 overflow-hidden">
                                                {athlete.avatar_url ? (
                                                    <img src={athlete.avatar_url} alt={athlete.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    athlete.avatar || athlete.name?.[0]
                                                )}
                                            </div>
                                            <div className={cn(
                                                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center",
                                                athlete.healthStatus === 'injured' ? "bg-rose-500" :
                                                    athlete.healthStatus === 'tired' ? "bg-amber-500" : "bg-emerald-500"
                                            )} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight leading-none mb-1">
                                                {athlete.name}
                                            </h3>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate max-w-[150px] bg-slate-800/50 px-2 py-0.5 rounded">
                                                        {athlete.planType === 'AI_ELITE' ? t('plan_ai_elite_label') :
                                                            athlete.planType === 'HYBRID' ? t('plan_hybrid_label') : t('plan_manual_pro_label')}
                                                    </span>
                                                    {/* Days to Goal Badge */}
                                                    {daysToGoal !== null && (
                                                        <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-black text-emerald-400 uppercase tracking-wider">
                                                            <Timer size={8} />
                                                            J-{daysToGoal}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Member Since / Tenure */}
                                                <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider px-1">
                                                    {t('managed_since') || "Since"} {new Date(athlete.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Load Chart */}
                                <div className="mb-4 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div className="h-8 w-full relative border-b border-l border-slate-800/50 bg-slate-900/20 rounded-bl-sm overflow-hidden">
                                        <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full preserve-3d">
                                            <path d={plannedPath} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2,2" className="opacity-50" />
                                            <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="1.5" />
                                            <path d={rpePath} fill="none" stroke="#a855f7" strokeWidth="1.5" className="opacity-80" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Performance Grid */}
                                <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-800/50 bg-slate-900/30 rounded-b-xl px-2">
                                    <div className="text-center p-1">
                                        <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                            <Activity size={10} />
                                            <span className="text-[8px] font-bold uppercase">{t('compliance')}</span>
                                        </div>
                                        <span className={cn(
                                            "text-base font-black",
                                            (athlete.compliance || 0) > 80 ? "text-white" : "text-amber-500"
                                        )}>{athlete.compliance}%</span>
                                    </div>
                                    <div className="text-center p-1 border-l border-r border-slate-800/50">
                                        <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                            <Zap size={10} />
                                            <span className="text-[8px] font-bold uppercase">{t('crm_metric_fit')}</span>
                                        </div>
                                        <span className="text-base font-black text-emerald-400">{athlete.fitScore}</span>
                                    </div>
                                    <div className="text-center p-1">
                                        <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                            <Banknote size={10} />
                                            <span className="text-[8px] font-bold uppercase">{t('crm_metric_ltv')}</span>
                                        </div>
                                        <span className="text-base font-black text-white">€{athlete.ltv}</span>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Global Actions Bar - Floating Bottom */}
            {selectedAthletes.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-2 flex items-center gap-2 pr-6">
                        <div className="bg-emerald-500 text-slate-950 px-3 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 mr-2">
                            <CheckCircle2 size={16} />
                            {selectedAthletes.length}
                        </div>

                        <div className="h-8 w-[1px] bg-slate-700 mx-1" />

                        <InfoTooltip content={t('crm_action_message')}>
                            <button
                                onClick={() => {
                                    if (selectedAthletes.length === 1) navigate(`/messages?athlete=${selectedAthletes[0]}`);
                                    // else handle bulk message logic here
                                }}
                                className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors relative group"
                            >
                                <MessageSquare size={20} />
                            </button>
                        </InfoTooltip>

                        <InfoTooltip content={t('crm_action_ai_plan')}>
                            <button
                                onClick={() => setShowObjectiveModal(true)}
                                className="p-3 hover:bg-indigo-500/20 rounded-xl text-indigo-400 hover:text-indigo-300 transition-colors relative group"
                            >
                                <Brain size={20} />
                            </button>
                        </InfoTooltip>

                        <InfoTooltip content={t('crm_action_manual_plan')}>
                            <button
                                onClick={() => {
                                    if (selectedAthletes.length === 1) navigate(`/planner/manual?athlete=${selectedAthletes[0]}`);
                                }}
                                className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors relative group"
                            >
                                <FileEdit size={20} />
                            </button>
                        </InfoTooltip>

                        <InfoTooltip content={t('crm_action_calendar')}>
                            <button
                                onClick={() => {
                                    if (selectedAthletes.length === 1) navigate(`/calendar?athlete=${selectedAthletes[0]}`);
                                }}
                                className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors relative group"
                            >
                                <Calendar size={20} />
                            </button>
                        </InfoTooltip>

                        <InfoTooltip content={t('crm_action_billing')}>
                            <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors relative group">
                                <CreditCard size={20} />
                            </button>
                        </InfoTooltip>

                        <InfoTooltip content={t('crm_action_tech_assess')}>
                            <button
                                onClick={() => {
                                    if (selectedAthletes.length === 1) {
                                        const athlete = athletes.find(a => a.id === selectedAthletes[0]);
                                        if (athlete) setSelectedAthleteForTech(athlete);
                                    }
                                }}
                                className="p-3 hover:bg-emerald-500/20 rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors relative group"
                            >
                                <Target size={20} />
                            </button>
                        </InfoTooltip>

                        <div className="h-8 w-[1px] bg-slate-700 mx-1" />

                        <button
                            onClick={() => setSelectedAthletes([])}
                            className="ml-2 p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
                        >
                            <Plus size={16} className="rotate-45" />
                        </button>
                    </div>
                </div>
            )}

            {/* Objective Modal */}
            {showObjectiveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950">
                        <CardHeader title="Assign Collective Goal" icon={<Target className="text-emerald-400" size={24} />} />
                        <div className="space-y-6 pt-6">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Defining a shared performance milestone for {selectedAthletes.length} selected profiles.</p>
                            <textarea
                                value={groupObjective}
                                onChange={(e) => setGroupObjective(e.target.value)}
                                placeholder="Sub 3h Marathon, Ultra-trail Peak, Threshold Improvement..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-emerald-500 h-32 transition-all font-medium shadow-inner"
                            />
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowObjectiveModal(false)}
                                    className="flex-1 py-4 text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSetObjective}
                                    className="flex-2 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-900/40 transition-all"
                                >
                                    Enforce Objective
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Technical Assessment Modal */}
            {selectedAthleteForTech && (
                <CoachTechnicalForm
                    athlete={selectedAthleteForTech}
                    onClose={() => setSelectedAthleteForTech(null)}
                    onSave={handleSaveTechnicalAssessment}
                />
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteAthleteModal
                    onClose={() => setShowInviteModal(false)}
                    onInvite={async (data) => {
                        // MOCK INVITE LOGIC
                        logger.info('Inviting athlete:', data);

                        // Simulate API delay
                        await new Promise(r => setTimeout(r, 1500));

                        // Create a mock pending athlete locally for immediate feedback
                        const mockNewAthlete: AthleteWithStats = {
                            id: `pending-${Date.now()}`,
                            name: `${data.firstName} ${data.lastName}`,
                            email: data.email,
                            role: 'athlete',
                            billingStatus: 'pending',
                            planType: data.planType,
                            auth_status: 'invited', // New Concept
                            healthStatus: 'ok',
                            fitScore: 0,
                            ltv: 0,
                            compliance: 0,
                            lastWorkout: 'Pending',
                            created_at: new Date().toISOString()
                        };

                        setAthletes(prev => [mockNewAthlete, ...prev]);

                        // We would also save the technical assessment here linked to the new Pending User ID
                    }}
                />
            )}
        </div>
    );
}
