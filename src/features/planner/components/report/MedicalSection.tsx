import React, { useState } from 'react';
import { ChevronDown, Heart, Info, AlertTriangle, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';

export interface MedicalAlert {
    severity: 'info' | 'warning' | 'critical';
    category: string;
    message: string;
    action?: string;
    triageLevel?: 'green' | 'orange' | 'red';
    source?: 'system' | 'coach' | 'athlete';
}

interface MedicalSectionProps {
    alerts: MedicalAlert[];
}

export function MedicalSection({ alerts }: MedicalSectionProps) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(true);

    const severityColors = {
        info: { icon: Info, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
        warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        critical: { icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
    };

    const triageColors = {
        green: { bg: 'bg-emerald-500', label: t('triage_green') || 'Feu Vert', desc: t('triage_green_desc') || 'Fatigue normale, poursuite du plan' },
        orange: { bg: 'bg-amber-500', label: t('triage_orange') || 'Vigilance', desc: t('triage_orange_desc') || 'Repos 48h ou réduction drastique' },
        red: { bg: 'bg-rose-500', label: t('triage_red') || 'Stop', desc: t('triage_red_desc') || 'Arrêt immédiat, consultation obligatoire' }
    };

    const triageCounts = {
        green: alerts.filter(a => a.triageLevel === 'green').length,
        orange: alerts.filter(a => a.triageLevel === 'orange').length,
        red: alerts.filter(a => a.triageLevel === 'red').length
    };

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
