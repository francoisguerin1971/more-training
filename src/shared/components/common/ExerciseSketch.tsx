import React from 'react';
import { Exercise } from '@/shared/types';
import { Wind, Activity, Timer, RotateCcw, Box, Gauge, Dumbbell, StickyNote, Zap } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';

interface ExerciseSketchProps {
    exercise: Exercise;
}

export function ExerciseSketch({ exercise }: ExerciseSketchProps) {
    const { t } = useLanguage();

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 flex flex-col sm:flex-row h-full">
            {/* Sketch / Visual Representation - TICKET STUB LEFT */}
            <div className="sm:w-1/3 bg-white relative overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-800 shrink-0 flex items-center justify-center p-4">
                {exercise.sketch_url ? (
                    <img
                        src={exercise.sketch_url}
                        alt={exercise.name}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 opacity-20">
                        <Box size={48} className="text-slate-900" />
                        <span className="text-[10px] text-slate-900 font-black uppercase tracking-widest">{t('sketch')}</span>
                    </div>
                )}

                {/* Overlay Badge for Intensity */}
                {exercise.intensity_target && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-tighter shadow-lg">
                        {exercise.intensity_target}
                    </div>
                )}
            </div>

            {/* Content - TICKET BODY RIGHT */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-black text-white uppercase tracking-tight leading-none">{exercise.name || 'Exercise'}</h4>
                    </div>
                    {exercise.description && (
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-2 line-clamp-2">{exercise.description}</p>
                    )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/50">
                    {/* Sets / Reps */}
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{t('sets')}/{t('reps')}</span>
                        <div className="flex items-end gap-1">
                            <span className="text-sm font-bold text-emerald-400 leading-none">{exercise.sets || 1}</span>
                            <span className="text-[10px] text-slate-400 font-bold mb-0.5">x {exercise.reps || '-'}</span>
                        </div>
                    </div>

                    {/* Weight / Load */}
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{t('weight')}</span>
                        <span className="text-sm font-bold text-rose-400 leading-none">{exercise.weight || '--'}</span>
                    </div>

                    {/* Tempo */}
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{t('tempo')}</span>
                        <span className="text-sm font-bold text-cyan-400 leading-none">{exercise.tempo || '2-0-2'}</span>
                    </div>

                    {/* Rest */}
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{t('recovery')}</span>
                        <span className="text-sm font-bold text-amber-400 leading-none">{exercise.rest || '--'}</span>
                    </div>
                </div>

                {/* Technical Notes Footer */}
                {exercise.notes && (
                    <div className="mt-auto pt-3 flex items-start gap-2">
                        <StickyNote size={12} className="text-slate-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-400 italic leading-snug">{exercise.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
