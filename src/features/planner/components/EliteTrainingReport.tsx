import React, { useState, useMemo } from 'react';
import {
    Brain, Target, Calendar, Activity, Dumbbell, Utensils, Heart, Shield, TrendingUp,
    ChevronRight, ChevronDown, CheckCircle2, AlertTriangle, Info, Zap, Clock, ArrowRight,
    LineChart, BarChart3, Mountain, Timer, Flame, Droplets, Download, Share2, Printer,
    User, Trophy, Award, Sparkles, Edit2, Trash2
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';
import { SessionDetailProps, SessionDetailCard } from './SessionDetailCard';
import { SessionBuilderModal } from './SessionBuilderModal';
import { PlanExportModal } from './PlanExportModal';
import { ExerciseSketchService } from '@/shared/services/ExerciseSketchService';


// Types for the report
export interface TrainingWeek {
    weekNumber: number;
    phase: 'base' | 'build' | 'peak' | 'race' | 'recovery';
    weekType: 'normal' | 'overload' | 'recovery';
    volumeHours: number;
    intensity: 'low' | 'moderate' | 'high' | 'very-high';
    focusSession: string;
    tssTarget: number;
}
import { PlanValidationWorkflow, PlanStatus } from './PlanValidationWorkflow';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { EliteProPDF } from './pdf/EliteProPDF';

export interface MacrocycleData {
    totalWeeks: number;
    phases: {
        name: string;
        duration: number;
        color: string;
        description: string;
    }[];
    weeks: TrainingWeek[];
}

export interface NutriRecommendation {
    type: 'pre' | 'during' | 'post' | 'daily';
    timing: string;
    recommendation: string;
    products?: string[];
    priority: 'essential' | 'recommended' | 'optional';
}

export interface MedicalAlert {
    severity: 'info' | 'warning' | 'critical';
    category: string;
    message: string;
    action?: string;
    triageLevel?: 'green' | 'orange' | 'red'; // Sports-med-guard triage
    source?: 'system' | 'coach' | 'athlete'; // Alert origin
}

// Recovery Protocol Interface (Phase A)
export interface RecoveryProtocol {
    type: 'sleep' | 'ice_bath' | 'massage' | 'compression' | 'stretching' | 'nutrition' | 'hydration';
    timing: string;
    duration: number; // minutes
    priority: 'essential' | 'recommended' | 'optional';
    phase: 'post-intensity' | 'rest-day' | 'pre-competition' | 'daily';
    description: string;
    targetHours?: number; // For sleep
}

export interface EliteTrainingReportData {
    athleteName: string;
    athletePhoto?: string;
    eventName: string;
    eventDate: string;
    generatedDate: string;
    coachStyle: string;
    planSummary: {
        totalWeeks: number;
        hoursPerWeek: number;
        sessionsPerWeek: number;
        keyWorkouts: string[];
    };
    macrocycle: MacrocycleData;
    nutriRecommendations: NutriRecommendation[];
    medicalAlerts: MedicalAlert[];
    recoveryProtocols: RecoveryProtocol[]; // Phase A: Sleep & Recovery
    weeklySchedule: Record<string, { activity: string; duration: number }>;
    detailedSessions?: SessionDetailProps[]; // Phase C: Detailed sessions
}

interface EliteTrainingReportProps {
    data: EliteTrainingReportData;
    onBack?: () => void;
    onExport?: () => void;
    onApplyPlan?: () => void;
}

// Macrocycle Visual Chart Component
function MacrocycleChart({ macrocycle }: { macrocycle: MacrocycleData }) {
    const { t } = useLanguage();
    const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

    const phaseColors: Record<string, { bg: string; bar: string; text: string }> = {
        base: { bg: 'bg-sky-500/10', bar: 'bg-sky-500', text: 'text-sky-400' },
        build: { bg: 'bg-amber-500/10', bar: 'bg-amber-500', text: 'text-amber-400' },
        peak: { bg: 'bg-rose-500/10', bar: 'bg-rose-500', text: 'text-rose-400' },
        race: { bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', text: 'text-emerald-400' },
        recovery: { bg: 'bg-violet-500/10', bar: 'bg-violet-500', text: 'text-violet-400' }
    };

    const weekTypeIndicator: Record<string, string> = {
        normal: '',
        overload: '⬆️',
        recovery: '🔻'
    };

    const maxVolume = Math.max(...macrocycle.weeks.map(w => w.volumeHours));

    return (
        <div className="space-y-6">
            {/* Phase Legend */}
            <div className="flex flex-wrap gap-4">
                {macrocycle.phases.map((phase, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", phase.color)} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {phase.name} ({phase.duration}s)
                        </span>
                    </div>
                ))}
            </div>

            {/* Main Chart */}
            <div className="relative bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50">
                {/* Y-Axis Labels */}
                <div className="absolute left-0 top-6 bottom-16 w-12 flex flex-col justify-between items-end pr-3 text-[9px] text-slate-600 font-bold">
                    <span>{maxVolume}h</span>
                    <span>{Math.round(maxVolume * 0.75)}h</span>
                    <span>{Math.round(maxVolume * 0.5)}h</span>
                    <span>{Math.round(maxVolume * 0.25)}h</span>
                    <span>0h</span>
                </div>

                {/* Chart Area */}
                <div className="ml-12 flex items-end gap-1 h-48">
                    {macrocycle.weeks.map((week, idx) => {
                        const heightPercent = (week.volumeHours / maxVolume) * 100;
                        const colors = phaseColors[week.phase];

                        return (
                            <div
                                key={idx}
                                className="flex-1 flex flex-col items-center gap-1 relative group"
                                onMouseEnter={() => setHoveredWeek(idx)}
                                onMouseLeave={() => setHoveredWeek(null)}
                            >
                                {/* Week Type Indicator */}
                                <span className="text-[9px] opacity-70">{weekTypeIndicator[week.weekType]}</span>

                                {/* Bar */}
                                <div
                                    className={cn(
                                        "w-full rounded-t-lg transition-all duration-300 cursor-pointer",
                                        colors.bar,
                                        hoveredWeek === idx ? "opacity-100 scale-105" : "opacity-70 hover:opacity-90"
                                    )}
                                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                                />

                                {/* Tooltip */}
                                {hoveredWeek === idx && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-10 min-w-[160px] text-center animate-in fade-in zoom-in-95 duration-200">
                                        <div className={cn("text-xs font-black uppercase mb-1", colors.text)}>
                                            {t(`phase_${week.phase}`) || week.phase}
                                        </div>
                                        <div className="text-lg font-black text-white">S{week.weekNumber}</div>
                                        <div className="text-sm text-slate-400">{week.volumeHours}h • TSS {week.tssTarget}</div>
                                        <div className="text-[10px] text-slate-500 mt-1">{week.focusSession}</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* X-Axis Labels */}
                <div className="ml-12 flex gap-1 mt-2">
                    {macrocycle.weeks.map((week, idx) => (
                        <div key={idx} className="flex-1 text-center">
                            <span className={cn(
                                "text-[9px] font-bold",
                                week.phase === 'race' ? "text-emerald-400" : "text-slate-600"
                            )}>
                                {week.weekNumber}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Phase Regions */}
                <div className="ml-12 flex gap-1 mt-3">
                    {macrocycle.phases.map((phase, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "rounded-lg py-1.5 px-2 text-center border",
                                phase.color.replace('bg-', 'bg-').replace('-500', '-500/20'),
                                phase.color.replace('bg-', 'border-').replace('-500', '-500/30')
                            )}
                            style={{ flex: phase.duration }}
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {phase.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Legend */}
            <div className="flex justify-center gap-6 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                    <span>⬆️</span>
                    <span>{t('overload_week') || 'Semaine Surcharge'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>🔻</span>
                    <span>{t('recovery_week') || 'Semaine Récupération'}</span>
                </div>
            </div>
        </div>
    );
}

// Nutri Section Component
function NutriSection({ recommendations }: { recommendations: NutriRecommendation[] }) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(true);

    const priorityColors = {
        essential: { icon: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
        recommended: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        optional: { icon: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' }
    };

    const typeIcons = {
        pre: '🥤',
        during: '🍌',
        post: '🥛',
        daily: '🍽️'
    };

    return (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-900/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Utensils size={24} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            {t('nutri_recommendations') || 'Recommandations Nutritionnelles'}
                        </h4>
                        <p className="text-[10px] text-slate-500">{recommendations.length} {t('recommendations') || 'recommandations'}</p>
                    </div>
                </div>
                <ChevronDown className={cn("transition-transform text-slate-500", expanded && "rotate-180")} size={20} />
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {recommendations.map((rec, idx) => {
                        const colors = priorityColors[rec.priority];
                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "p-4 rounded-xl border",
                                    colors.bg, colors.border
                                )}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg">{typeIcons[rec.type]}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {rec.timing}
                                    </span>
                                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", colors.bg, colors.icon)}>
                                        {rec.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 font-medium">{rec.recommendation}</p>
                                {rec.products && rec.products.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {rec.products.map((product, pIdx) => (
                                            <span key={pIdx} className="text-[10px] px-3 py-1 bg-slate-800 rounded-full text-slate-400">
                                                {product}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Recovery Section Component (Phase A: Sleep & Recovery)
function RecoverySection({ protocols }: { protocols: RecoveryProtocol[] }) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(true);

    const typeConfig: Record<string, { icon: typeof Heart; color: string; label: string }> = {
        sleep: { icon: Timer, color: 'text-violet-400', label: t('recovery_sleep') || 'Sommeil' },
        ice_bath: { icon: Droplets, color: 'text-sky-400', label: t('recovery_ice_bath') || 'Bain Froid' },
        massage: { icon: Heart, color: 'text-rose-400', label: t('recovery_massage') || 'Massage' },
        compression: { icon: Activity, color: 'text-amber-400', label: t('recovery_compression') || 'Compression' },
        stretching: { icon: Dumbbell, color: 'text-emerald-400', label: t('recovery_stretching') || 'Étirements' },
        nutrition: { icon: Flame, color: 'text-orange-400', label: t('recovery_nutrition') || 'Nutrition' },
        hydration: { icon: Droplets, color: 'text-cyan-400', label: t('recovery_hydration') || 'Hydratation' }
    };

    const priorityColors = {
        essential: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        recommended: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
        optional: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' }
    };

    const phaseLabels: Record<string, string> = {
        'post-intensity': t('phase_post_intensity') || 'Post-Intensité',
        'rest-day': t('phase_rest_day') || 'Jour de Repos',
        'pre-competition': t('phase_pre_competition') || 'Pré-Compétition',
        'daily': t('phase_daily') || 'Quotidien'
    };

    // Group protocols by phase
    const groupedProtocols = protocols.reduce((acc, protocol) => {
        if (!acc[protocol.phase]) acc[protocol.phase] = [];
        acc[protocol.phase].push(protocol);
        return acc;
    }, {} as Record<string, RecoveryProtocol[]>);

    // Calculate sleep summary
    const sleepProtocol = protocols.find(p => p.type === 'sleep');
    const targetSleepHours = sleepProtocol?.targetHours || 8;

    return (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-900/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                        <Timer size={24} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            {t('recovery_protocols') || 'Protocoles de Récupération'}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                            {t('target_sleep') || 'Objectif sommeil'}: <span className="text-violet-400 font-bold">{targetSleepHours}h</span> · {protocols.length} {t('protocols') || 'protocoles'}
                        </p>
                    </div>
                </div>
                <ChevronDown className={cn("transition-transform text-slate-500", expanded && "rotate-180")} size={20} />
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Sleep Highlight Card */}
                    {sleepProtocol && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                                    <Timer size={20} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-black text-white uppercase tracking-wider">
                                        {t('sleep_protocol') || 'Protocole Sommeil'}
                                    </h5>
                                    <p className="text-[10px] text-slate-500">{sleepProtocol.timing}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="text-center p-3 bg-slate-950/50 rounded-lg">
                                    <div className="text-2xl font-black text-violet-400">{targetSleepHours}h</div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">{t('target') || 'Cible'}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-950/50 rounded-lg">
                                    <div className="text-2xl font-black text-sky-400">22:30</div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">{t('bedtime') || 'Coucher'}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-950/50 rounded-lg">
                                    <div className="text-2xl font-black text-amber-400">6:30</div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">{t('wakeup') || 'Réveil'}</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-3">{sleepProtocol.description}</p>
                        </div>
                    )}

                    {/* Grouped Protocols by Phase */}
                    {Object.entries(groupedProtocols).filter(([phase]) => phase !== 'daily' || !sleepProtocol).map(([phase, phaseProtocols]) => (
                        <div key={phase}>
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                {phaseLabels[phase] || phase}
                            </h5>
                            <div className="space-y-2">
                                {phaseProtocols.filter(p => p.type !== 'sleep').map((protocol, idx) => {
                                    const config = typeConfig[protocol.type] || { icon: Heart, color: 'text-slate-400', label: protocol.type };
                                    const IconComponent = config.icon;
                                    const priority = priorityColors[protocol.priority];

                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "p-4 rounded-xl border flex items-start gap-4",
                                                priority.bg, priority.border
                                            )}
                                        >
                                            <IconComponent className={config.color} size={18} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-white">{config.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-slate-500">{protocol.duration} min</span>
                                                        <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", priority.bg, priority.text)}>
                                                            {protocol.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400">{protocol.description}</p>
                                                <p className="text-[10px] text-slate-600 mt-1 italic">{protocol.timing}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Medical Alerts Section (Enhanced with sports-med-guard triage)
function MedicalSection({ alerts }: { alerts: MedicalAlert[] }) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(true);

    const severityColors = {
        info: { icon: Info, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
        warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        critical: { icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
    };

    // Sports-med-guard triage colors
    const triageColors = {
        green: { bg: 'bg-emerald-500', label: t('triage_green') || 'Feu Vert', desc: t('triage_green_desc') || 'Fatigue normale, poursuite du plan' },
        orange: { bg: 'bg-amber-500', label: t('triage_orange') || 'Vigilance', desc: t('triage_orange_desc') || 'Repos 48h ou réduction drastique' },
        red: { bg: 'bg-rose-500', label: t('triage_red') || 'Stop', desc: t('triage_red_desc') || 'Arrêt immédiat, consultation obligatoire' }
    };

    // Count alerts by triage level
    const triageCounts = {
        green: alerts.filter(a => a.triageLevel === 'green').length,
        orange: alerts.filter(a => a.triageLevel === 'orange').length,
        red: alerts.filter(a => a.triageLevel === 'red').length
    };

    // Critical alerts first
    const sortedAlerts = [...alerts].sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
    });

    return (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-900/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <Heart size={24} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            {t('medical_alerts') || 'Vigilance Médicale'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            {/* Triage Summary Pills */}
                            {triageCounts.red > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                    <span className="text-[9px] font-black text-rose-400">{triageCounts.red}</span>
                                </span>
                            )}
                            {triageCounts.orange > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="text-[9px] font-black text-amber-400">{triageCounts.orange}</span>
                                </span>
                            )}
                            {triageCounts.green > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-[9px] font-black text-emerald-400">{triageCounts.green}</span>
                                </span>
                            )}
                            <span className="text-[10px] text-slate-500 ml-1">{alerts.length} {t('alerts') || 'points'}</span>
                        </div>
                    </div>
                </div>
                <ChevronDown className={cn("transition-transform text-slate-500", expanded && "rotate-180")} size={20} />
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Triage Legend */}
                    <div className="flex gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                        {Object.entries(triageColors).map(([level, config]) => (
                            <div key={level} className="flex-1 flex items-center gap-2">
                                <span className={cn("w-3 h-3 rounded-full", config.bg)}></span>
                                <div>
                                    <span className="text-[10px] font-black text-white uppercase">{config.label}</span>
                                    <p className="text-[8px] text-slate-500">{config.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-3">
                        {sortedAlerts.map((alert, idx) => {
                            const severity = severityColors[alert.severity];
                            const IconComponent = severity.icon;
                            const triage = alert.triageLevel ? triageColors[alert.triageLevel] : null;

                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-4 rounded-xl border flex items-start gap-4 relative overflow-hidden",
                                        severity.bg, severity.border,
                                        alert.severity === 'critical' && "ring-1 ring-rose-500/50"
                                    )}
                                >
                                    {/* Triage indicator bar */}
                                    {triage && (
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", triage.bg)}></div>
                                    )}

                                    <IconComponent className={cn(severity.color, "ml-2")} size={20} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    {alert.category}
                                                </span>
                                                {alert.source && (
                                                    <span className="text-[8px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 uppercase">
                                                        {alert.source}
                                                    </span>
                                                )}
                                            </div>
                                            {triage && (
                                                <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                                                    alert.triageLevel === 'red' ? 'bg-rose-500/20 text-rose-400' :
                                                        alert.triageLevel === 'orange' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-emerald-500/20 text-emerald-400'
                                                )}>
                                                    {triage.label}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-300 font-medium">{alert.message}</p>
                                        {alert.action && (
                                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                                <ArrowRight size={12} />
                                                {alert.action}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// Main Report Component
// Imports at top

// ... (keep existing interfaces)

export function EliteTrainingReport({ data, onBack, onExport, onApplyPlan }: EliteTrainingReportProps) {
    const { t } = useLanguage();
    const [reportData, setReportData] = useState<EliteTrainingReportData>(data); // Local state for edits
    const [activeTab, setActiveTab] = useState<'overview' | 'macrocycle' | 'details'>('overview');
    const [selectedSession, setSelectedSession] = useState<SessionDetailProps | null>(null);
    const [showSessionModal, setShowSessionModal] = useState(false);

    // Edit Mode State
    const [editingSession, setEditingSession] = useState<any>(null); // Format for Builder
    const [showEditModal, setShowEditModal] = useState(false);
    const [originalSessionId, setOriginalSessionId] = useState<string | null>(null);

    const [planStatus, setPlanStatus] = useState<PlanStatus>('draft');
    const [showExportModal, setShowExportModal] = useState(false);

    // --- Helpers for Format Conversion ---

    const aiToBuilder = (aiSession: SessionDetailProps) => {
        // Flatten exercises from all blocks for the builder
        const flattenExercises = [
            ...(aiSession.warmup?.exercises || []),
            ...(aiSession.mainSet?.flatMap(b => b.exercises || []) || []),
            ...(aiSession.cooldown?.exercises || [])
        ].map(ex => ({
            id: crypto.randomUUID(),
            name: ex.name,
            description: ex.notes || '',
            default_sets: 1, // Default assumption
            default_reps: ex.duration || '10 min',
            default_rest: '0',
            sketch_url: ex.sketchUrl
        }));

        return {
            title: aiSession.title,
            intensity: aiSession.intensity,
            details: {
                warmup: aiSession.warmup?.description || '',
                main: aiSession.mainSet?.map(b => b.description).join('\n') || '',
                cooldown: aiSession.cooldown?.description || '',
                tech_focus: ''
            },
            exercises: flattenExercises
        };
    };

    const builderToAi = (builderSession: any, original: SessionDetailProps): SessionDetailProps => {
        // Reconstruct AI format
        // This is a simplification: we put all builder exercises into Main Set for now, 
        // because we can't easily auto-sort them back into warmup/cool without logic.
        // OR we can keep the original warmup/cooldown text descriptions and just update the main set exercises.

        // Better approach for "Modify":
        // 1. Keep original Warmup/Cooldown blocks (text).
        // 2. Replace Main Set exercises with the new list from Builder.
        // 3. Update sketches.

        const newExercises = builderSession.exercises.map((ex: any) => ({
            name: ex.name,
            duration: ex.default_reps, // Mapping reps to duration string
            notes: ex.description,
            sketchUrl: ExerciseSketchService.getSketchForExercise(ex.name) // Refresh sketch
        }));

        return {
            ...original,
            title: builderSession.title,
            intensity: builderSession.intensity || original.intensity,
            warmup: {
                ...original.warmup,
                description: builderSession.details?.warmup || original.warmup.description
            },
            cooldown: {
                ...original.cooldown,
                description: builderSession.details?.cooldown || original.cooldown.description
            },
            mainSet: [
                {
                    type: 'main',
                    duration: original.mainSet[0]?.duration || 40,
                    description: builderSession.details?.main || original.mainSet[0]?.description || '',
                    exercises: newExercises,
                    intensity: 'high'
                }
            ]
        };
    };

    // --- Handlers ---

    const handleEditSession = (session: SessionDetailProps) => {
        const builderFormat = aiToBuilder(session);
        setEditingSession(builderFormat);
        setOriginalSessionId(session.id!);
        setShowEditModal(true);
    };

    const handleDeleteSession = (sessionId: string) => {
        if (confirm(t('confirm_delete_session') || 'Supprimer cette séance ?')) {
            setReportData(prev => ({
                ...prev,
                detailedSessions: prev.detailedSessions?.filter(s => s.id !== sessionId)
            }));
        }
    };

    const handleSaveSession = (updatedBuilderSession: any) => {
        setReportData(prev => {
            const original = prev.detailedSessions?.find(s => s.id === originalSessionId);
            if (!original) return prev;

            const updatedAiSession = builderToAi(updatedBuilderSession, original);

            return {
                ...prev,
                detailedSessions: prev.detailedSessions?.map(s =>
                    s.id === originalSessionId ? updatedAiSession : s
                )
            };
        });
        setShowEditModal(false);
    };


    // Ensure we close the detail modal when editing starts
    const handleEditWithClose = (session: SessionDetailProps) => {
        setShowSessionModal(false);
        handleEditSession(session);
    };

    const handleDeleteWithClose = (sessionId: string) => {
        handleDeleteSession(sessionId);
        setShowSessionModal(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            {/* Premium Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 rounded-[32px] border border-slate-800/50 p-8 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {data.athletePhoto ? (
                                <img src={data.athletePhoto} alt={data.athleteName} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-3xl font-black text-white">
                                    {reportData.athleteName.charAt(0)}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <Sparkles className="text-amber-400" size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                                        {t('elite_training_plan') || 'Plan d\'Entraînement Élite'}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
                                    {reportData.athleteName}
                                </h1>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Trophy size={14} className="text-amber-400" />
                                    <span className="text-sm font-medium">{reportData.eventName}</span>
                                    <span className="text-slate-600">•</span>
                                    <Calendar size={14} />
                                    <span className="text-sm">{reportData.eventDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                                <Share2 size={18} />
                            </button>
                            <button className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                                <Printer size={18} />
                            </button>
                            <PDFDownloadLink
                                document={<EliteProPDF data={reportData} />}
                                fileName={`Plan_Elite_${reportData.athleteName.replace(/\s+/g, '_')}.pdf`}
                            >
                                {({ loading }) => (
                                    <button className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center">
                                        {loading ? <span className="text-[10px] font-bold">...</span> : <Download size={18} />}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-4 gap-4 mt-8">
                        {[
                            { icon: Calendar, label: t('total_weeks') || 'Semaines', value: reportData.planSummary.totalWeeks, color: 'emerald' },
                            { icon: Clock, label: t('hours_per_week') || 'Heures/Sem', value: reportData.planSummary.hoursPerWeek, color: 'sky' },
                            { icon: Activity, label: t('sessions_per_week') || 'Séances/Sem', value: reportData.planSummary.sessionsPerWeek, color: 'amber' },
                            { icon: Brain, label: t('coach_style_short') || 'Style Coach', value: reportData.coachStyle.split(' ')[0], color: 'violet' }
                        ].map((stat, idx) => (
                            <div key={idx} className={cn("bg-slate-950/50 border border-slate-800 rounded-2xl p-4")}>
                                <stat.icon className={`text-${stat.color}-400 mb-2`} size={20} />
                                <div className="text-2xl font-black text-white">{stat.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/50">
                {[
                    { id: 'overview', icon: Target, label: t('overview') || 'Vue d\'ensemble' },
                    { id: 'macrocycle', icon: BarChart3, label: t('macrocycle') || 'Macrocycle' },
                    { id: 'details', icon: Dumbbell, label: t('details') || 'Détails' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'overview' | 'macrocycle' | 'details')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                            activeTab === tab.id
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-500 hover:text-white"
                        )}
                    >
                        <tab.icon size={16} />
                        <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Key Workouts */}
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <Zap className="text-amber-400" size={20} />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                {t('key_workouts') || 'Séances Clés du Programme'}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {reportData.planSummary.keyWorkouts.map((workout, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors">
                                    <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={16} />
                                    <span className="text-sm text-slate-300 font-medium">{workout}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nutri + Recovery + Medical Sections */}
                    <NutriSection recommendations={reportData.nutriRecommendations} />
                    {reportData.recoveryProtocols && reportData.recoveryProtocols.length > 0 && (
                        <RecoverySection protocols={reportData.recoveryProtocols} />
                    )}
                    <MedicalSection alerts={reportData.medicalAlerts} />
                </div>
            )}

            {activeTab === 'macrocycle' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 className="text-indigo-400" size={20} />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                {t('macrocycle_view') || 'Planification Macrocycle'}
                            </h3>
                        </div>
                        <MacrocycleChart macrocycle={reportData.macrocycle} />
                    </div>
                </div>
            )}

            {activeTab === 'details' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportData.detailedSessions?.map((session, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setSelectedSession(session); setShowSessionModal(true); }}
                                className="group relative bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                            >
                                {/* Quick Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditSession(session); }}
                                        className="p-1.5 bg-slate-800 hover:bg-indigo-500 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-indigo-500"
                                        title={t('edit') || "Modifier"}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(t('confirmDelete') || "Supprimer cette séance ?")) {
                                                setReportData(prev => ({
                                                    ...prev,
                                                    detailedSessions: prev.detailedSessions?.filter(s => s.id !== session.id)
                                                }));
                                            }
                                        }}
                                        className="p-1.5 bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-rose-500"
                                        title={t('delete') || "Supprimer"}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={cn(
                                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                                        session.intensity === 'very-high' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                                            session.intensity === 'high' ? 'text-orange-400 border-orange-500/20 bg-orange-500/10' :
                                                session.intensity === 'moderate' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                                                    'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                                    )}>
                                        {session.type}
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-400 transition-colors">
                                        TSS {session.tss}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                                    {session.title}
                                </h3>

                                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-300">
                                        <Calendar size={14} className="text-emerald-400" />
                                        {session.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-indigo-400" />
                                        {session.duration} min
                                    </div>
                                    {session.coachNotes && (
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Info size={14} />
                                            Note du coach
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={16} className="text-indigo-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showSessionModal && selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSessionModal(false)}>
                    <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl">
                        <SessionDetailCard
                            {...selectedSession}
                            onClose={() => setShowSessionModal(false)}
                            onEdit={() => handleEditWithClose(selectedSession)}
                            onDelete={() => handleDeleteWithClose(selectedSession.id!)}
                        />
                    </div>
                </div>
            )}

            {/* Validation Workflow Footer */}
            <div className="mt-8">
                {onBack && planStatus === 'draft' && (
                    <div className="mb-4 flex justify-start">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800"
                        >
                            <ChevronRight size={16} className="rotate-180" />
                            {t('back') || 'Retour'}
                        </button>
                    </div>
                )}

                <PlanValidationWorkflow
                    status={planStatus}
                    onStatusChange={setPlanStatus}
                    onApply={() => setShowExportModal(true)}
                />
            </div>

            <SessionBuilderModal
                isOpen={showEditModal}
                initialSession={editingSession}
                onClose={() => setShowEditModal(false)}
                onSave={handleSaveSession}
            />

            {showExportModal && (
                <PlanExportModal
                    onClose={() => setShowExportModal(false)}
                    totalWeeks={reportData.planSummary.totalWeeks}
                    onExport={(scope, format) => {
                        // In a real app, this would trigger backend logic or PDF generation
                        console.log('Exporting plan:', scope, format);
                        if (onApplyPlan) onApplyPlan();
                        alert(`Plan exporté (${scope} / ${format}) avec succès !`);
                        setShowExportModal(false);
                    }}
                />
            )}
        </div>
    );
}

// Export mock data for testing
export const mockReportData: EliteTrainingReportData = {
    athleteName: 'Jean Dupont',
    eventName: 'Marathon de Paris',
    eventDate: '6 Avril 2026',
    generatedDate: new Date().toISOString(),
    coachStyle: 'Directif et Scientifique',
    planSummary: {
        totalWeeks: 16,
        hoursPerWeek: 8,
        sessionsPerWeek: 5,
        keyWorkouts: [
            'Sortie longue progressive (2h30)',
            'Tempo Run Zone 3 (45min)',
            'Intervalles 6x1000m',
            'Récupération active (45min)',
            'Séance spécifique allure marathon'
        ]
    },
    macrocycle: {
        totalWeeks: 16,
        phases: [
            { name: 'Base', duration: 4, color: 'bg-sky-500', description: 'Construction aérobie' },
            { name: 'Build', duration: 6, color: 'bg-amber-500', description: 'Montée en charge' },
            { name: 'Peak', duration: 4, color: 'bg-rose-500', description: 'Affûtage' },
            { name: 'Race', duration: 2, color: 'bg-emerald-500', description: 'Compétition' }
        ],
        weeks: [
            // Base Phase
            { weekNumber: 1, phase: 'base', weekType: 'normal', volumeHours: 5, intensity: 'low', focusSession: 'Endurance fondamentale', tssTarget: 250 },
            { weekNumber: 2, phase: 'base', weekType: 'normal', volumeHours: 6, intensity: 'low', focusSession: 'Sortie longue', tssTarget: 300 },
            { weekNumber: 3, phase: 'base', weekType: 'overload', volumeHours: 7, intensity: 'moderate', focusSession: 'Fartlek', tssTarget: 380 },
            { weekNumber: 4, phase: 'base', weekType: 'recovery', volumeHours: 4, intensity: 'low', focusSession: 'Récupération', tssTarget: 200 },
            // Build Phase
            { weekNumber: 5, phase: 'build', weekType: 'normal', volumeHours: 7, intensity: 'moderate', focusSession: 'Tempo', tssTarget: 400 },
            { weekNumber: 6, phase: 'build', weekType: 'normal', volumeHours: 8, intensity: 'moderate', focusSession: 'Intervalles', tssTarget: 450 },
            { weekNumber: 7, phase: 'build', weekType: 'overload', volumeHours: 9, intensity: 'high', focusSession: 'Sortie longue allure marathon', tssTarget: 520 },
            { weekNumber: 8, phase: 'build', weekType: 'recovery', volumeHours: 5, intensity: 'low', focusSession: 'Régénération', tssTarget: 280 },
            { weekNumber: 9, phase: 'build', weekType: 'overload', volumeHours: 10, intensity: 'high', focusSession: '20km allure cible', tssTarget: 580 },
            { weekNumber: 10, phase: 'build', weekType: 'recovery', volumeHours: 6, intensity: 'moderate', focusSession: 'Récupération active', tssTarget: 320 },
            // Peak Phase
            { weekNumber: 11, phase: 'peak', weekType: 'normal', volumeHours: 9, intensity: 'very-high', focusSession: 'Seuil + allure marathon', tssTarget: 500 },
            { weekNumber: 12, phase: 'peak', weekType: 'overload', volumeHours: 8, intensity: 'very-high', focusSession: 'Simulation semi', tssTarget: 480 },
            { weekNumber: 13, phase: 'peak', weekType: 'normal', volumeHours: 6, intensity: 'high', focusSession: 'Affûtage', tssTarget: 350 },
            { weekNumber: 14, phase: 'peak', weekType: 'recovery', volumeHours: 4, intensity: 'low', focusSession: 'Taper', tssTarget: 200 },
            // Race Phase
            { weekNumber: 15, phase: 'race', weekType: 'recovery', volumeHours: 3, intensity: 'low', focusSession: 'Activation pré-course', tssTarget: 150 },
            { weekNumber: 16, phase: 'race', weekType: 'normal', volumeHours: 4, intensity: 'moderate', focusSession: '🏁 MARATHON', tssTarget: 300 }
        ]
    },
    nutriRecommendations: [
        { type: 'pre', timing: '3h avant entraînement', recommendation: 'Petit-déjeuner riche en glucides complexes avec protéines légères', products: ['Flocons avoine', 'Banane', 'Œufs'], priority: 'essential' },
        { type: 'during', timing: 'Pendant > 90min', recommendation: 'Apport glucidique de 60-90g/h sous forme liquide ou gel', products: ['Gel énergétique', 'Boisson isotonique'], priority: 'essential' },
        { type: 'post', timing: '30min après', recommendation: 'Fenêtre anabolique - ratio 3:1 glucides/protéines', products: ['Shake protéiné', 'Fruits'], priority: 'recommended' },
        { type: 'daily', timing: 'Quotidien', recommendation: 'Hydratation 40ml/kg + électrolytes si forte transpiration', priority: 'essential' }
    ],
    medicalAlerts: [
        { severity: 'warning', category: 'Prévention', message: 'Surveiller les signes de surentraînement lors des semaines de surcharge (S3, S7, S9, S12)', action: 'Réduire de 20% si fatigue persistante > 3 jours', triageLevel: 'orange' },
        { severity: 'info', category: 'Récupération', message: 'Privilégier 8h de sommeil minimum pendant les phases Build et Peak', action: undefined, triageLevel: 'green' },
        { severity: 'critical', category: 'Alerte', message: 'Antécédent tendinite achilléenne signalé - progression volume prudente', action: 'Échauffement prolongé + étirements excentiques quotidiens', triageLevel: 'red' }
    ],
    recoveryProtocols: [
        // Sleep - Daily
        { type: 'sleep', timing: 'Coucher: 22h30 - Réveil: 6h30', duration: 480, priority: 'essential', phase: 'daily', description: 'Maintenir un rythme circadien régulier. Chambre à 18°C, pas d\'écran 1h avant.', targetHours: 8 },
        // Post-Intensity Recovery
        { type: 'ice_bath', timing: 'Dans les 30min post-entraînement intensif', duration: 10, priority: 'recommended', phase: 'post-intensity', description: 'Immersion eau froide (10-15°C) pour réduire l\'inflammation musculaire.' },
        { type: 'stretching', timing: '2h après la séance', duration: 15, priority: 'essential', phase: 'post-intensity', description: 'Étirements statiques des membres inférieurs (30s par groupe musculaire).' },
        { type: 'compression', timing: 'Soir après séance longue', duration: 30, priority: 'recommended', phase: 'post-intensity', description: 'Port de manchons de compression pour favoriser le retour veineux.' },
        // Rest Day Protocols
        { type: 'massage', timing: 'Jour de repos (S4, S8, S10, S14)', duration: 45, priority: 'recommended', phase: 'rest-day', description: 'Massage sportif pour dénouer les tensions et améliorer la récupération.' },
        { type: 'stretching', timing: 'Matin jour de repos', duration: 20, priority: 'optional', phase: 'rest-day', description: 'Routine yoga légère ou stretching dynamique pour maintenir la mobilité.' },
        // Pre-Competition
        { type: 'massage', timing: 'J-3 avant course', duration: 30, priority: 'essential', phase: 'pre-competition', description: 'Massage léger (effleurage) pour détendre sans fatiguer les muscles.' },
        { type: 'hydration', timing: 'J-2 à J-1', duration: 0, priority: 'essential', phase: 'pre-competition', description: 'Hyperhydratation progressive (3L/jour) avec électrolytes.' }
    ],
    weeklySchedule: {
        'Lun': { activity: 'Repos', duration: 0 },
        'Mar': { activity: 'Tempo', duration: 50 },
        'Mer': { activity: 'Récup', duration: 40 },
        'Jeu': { activity: 'Intervalles', duration: 55 },
        'Ven': { activity: 'Renfo', duration: 30 },
        'Sam': { activity: 'Sortie Longue', duration: 120 },
        'Dim': { activity: 'Actif/Off', duration: 30 }
    }
};
