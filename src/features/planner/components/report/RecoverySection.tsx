import React, { useState } from 'react';
import { ChevronDown, Timer, Heart, Activity, Dumbbell, Droplets, Flame } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';

export interface RecoveryProtocol {
    type: 'sleep' | 'ice_bath' | 'massage' | 'compression' | 'stretching' | 'nutrition' | 'hydration';
    timing: string;
    duration: number;
    priority: 'essential' | 'recommended' | 'optional';
    phase: 'post-intensity' | 'rest-day' | 'pre-competition' | 'daily';
    description: string;
    targetHours?: number;
}

interface RecoverySectionProps {
    protocols: RecoveryProtocol[];
}

export function RecoverySection({ protocols }: RecoverySectionProps) {
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

    const groupedProtocols = protocols.reduce((acc, protocol) => {
        if (!acc[protocol.phase]) acc[protocol.phase] = [];
        acc[protocol.phase].push(protocol);
        return acc;
    }, {} as Record<string, RecoveryProtocol[]>);

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
