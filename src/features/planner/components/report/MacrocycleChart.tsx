import React, { useState } from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';

export interface TrainingWeek {
    weekNumber: number;
    phase: 'base' | 'build' | 'peak' | 'race' | 'recovery';
    weekType: 'normal' | 'overload' | 'recovery';
    volumeHours: number;
    intensity: 'low' | 'moderate' | 'high' | 'very-high';
    focusSession: string;
    tssTarget: number;
}

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

interface MacrocycleChartProps {
    macrocycle: MacrocycleData;
}

export function MacrocycleChart({ macrocycle }: MacrocycleChartProps) {
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
