
import React, { useState } from 'react';
import { Clock, TrendingUp, Activity, Flame, Wind, Play, Info, CheckCircle2, X, Calendar, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLanguage } from '@/shared/context/LanguageContext';

interface SessionBlock {
    duration: number; // minutes
    type: 'warmup' | 'main' | 'cooldown';
    description: string;
    exercises?: { name: string; duration?: string; notes?: string; sketchUrl?: string }[];
    intensity?: string;
}

export interface SessionDetailProps {
    title: string;
    type: string;
    duration: number;
    tss: number;
    intensity: 'low' | 'moderate' | 'high' | 'very-high';
    warmup: SessionBlock;
    mainSet: SessionBlock[];
    cooldown: SessionBlock;
    coachNotes?: string;
    // New fields for date handling and editing
    id?: string;
    date?: string;
    onClose?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const SessionDetailCard: React.FC<SessionDetailProps> = ({
    title,
    type,
    duration,
    tss,
    intensity,
    warmup,
    mainSet,
    cooldown,
    coachNotes,
    onClose,
    date,
    onEdit,
    onDelete
}) => {
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const getIntensityColor = (intensity: string) => {
        switch (intensity) {
            case 'very-high': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'moderate': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getBlockIcon = (type: string) => {
        switch (type) {
            case 'warmup': return <Wind size={16} className="text-emerald-400" />;
            case 'main': return <Flame size={16} className="text-orange-400" />;
            case 'cooldown': return <Activity size={16} className="text-blue-400" />;
            default: return <Play size={16} />;
        }
    };

    return (
        <>
            {/* Lightbox Overlay */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] p-4">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Exercise Sketch"
                            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-slate-700 bg-white p-4"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <p className="text-center text-slate-400 mt-4 font-medium uppercase tracking-widest text-sm">Cliquer à l'extérieur pour fermer</p>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-900/50 p-6 border-b border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", getIntensityColor(intensity))}>
                                    {type}
                                </span>
                                <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                                    TSS {tss}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-400 relative z-10">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-indigo-400" />
                            <span>{duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-400" />
                            <span>Load: {Math.round(duration * (intensity === 'very-high' ? 1.2 : intensity === 'high' ? 1 : 0.8))}</span>
                        </div>
                    </div>
                </div>

                {/* Date & Actions Bar (New) */}
                <div className="px-6 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-slate-300 font-bold">
                        <Calendar size={14} className="text-indigo-400" />
                        {date || 'Date non définie'}
                    </div>
                    <div className="flex gap-2">
                        {onEdit && (
                            <button onClick={onEdit} className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors">
                                <Edit2 size={12} />
                                <span>Éditer</span>
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={onDelete} className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors">
                                <Trash2 size={12} />
                                <span>Suppr.</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Motivation / Notes */}
                    {coachNotes && (
                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
                            <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Note du Coach</h4>
                                <p className="text-sm text-indigo-100/80 italic">"{coachNotes}"</p>
                            </div>
                        </div>
                    )}

                    {/* Blocks */}
                    <div className="space-y-4 relative">
                        <div className="absolute left-3.5 top-4 bottom-4 w-px bg-slate-800" />

                        {/* Warmup */}
                        <div className="relative pl-10">
                            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center z-10">
                                {getBlockIcon('warmup')}
                            </div>
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                                <h4 className="font-bold text-white text-sm mb-1">Échauffement • {warmup.duration} min</h4>
                                <p className="text-sm text-slate-400 mb-3">{warmup.description}</p>

                                {warmup.exercises && warmup.exercises.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-700/50">
                                        {warmup.exercises.map((ex, i) => (
                                            <div key={i} className="flex gap-3 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors">
                                                {ex.sketchUrl && (
                                                    <div className="cursor-zoom-in shrink-0 bg-white rounded-md p-0.5" onClick={() => setSelectedImage(ex.sketchUrl!)}>
                                                        <img src={ex.sketchUrl} alt={ex.name} className="w-12 h-12 object-contain" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-200 truncate">{ex.name}</p>
                                                    {ex.duration && <p className="text-[10px] text-emerald-400 font-mono">{ex.duration}</p>}
                                                    {ex.notes && <p className="text-[10px] text-slate-500 italic truncate">{ex.notes}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Set */}
                        {mainSet.map((block, idx) => (
                            <div key={idx} className="relative pl-10">
                                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 border border-orange-500/30 flex items-center justify-center z-10 shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]">
                                    {getBlockIcon('main')}
                                </div>
                                <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700 rounded-xl p-4 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-orange-500/10 transition-colors" />

                                    <h4 className="font-bold text-white text-sm mb-1">Corps de Séance • {block.duration} min</h4>
                                    <p className="text-sm text-slate-300">{block.description}</p>

                                    {block.exercises && block.exercises.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                            {block.exercises.map((ex, i) => (
                                                <div key={i} className="flex gap-3 p-2 rounded-lg bg-slate-950/50 hover:bg-slate-900 transition-colors border border-slate-700/30">
                                                    {ex.sketchUrl && (
                                                        <div className="cursor-zoom-in shrink-0 bg-white rounded-md p-0.5" onClick={() => setSelectedImage(ex.sketchUrl!)}>
                                                            <img src={ex.sketchUrl} alt={ex.name} className="w-16 h-16 object-contain" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <p className="text-xs font-bold text-white mb-0.5">{ex.name}</p>
                                                        {ex.duration && <p className="text-[10px] text-orange-400 font-mono font-bold">{ex.duration}</p>}
                                                        {ex.notes && <p className="text-[10px] text-slate-500 leading-tight mt-1">{ex.notes}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Cooldown */}
                        <div className="relative pl-10">
                            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center z-10">
                                {getBlockIcon('cooldown')}
                            </div>
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                                <h4 className="font-bold text-white text-sm mb-1">Retour au Calme • {cooldown.duration} min</h4>
                                <p className="text-sm text-slate-400 mb-3">{cooldown.description}</p>
                                {cooldown.exercises && cooldown.exercises.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-700/50">
                                        {cooldown.exercises.map((ex, i) => (
                                            <div key={i} className="flex gap-3 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors">
                                                {ex.sketchUrl && (
                                                    <div className="cursor-zoom-in shrink-0 bg-white rounded-md p-0.5" onClick={() => setSelectedImage(ex.sketchUrl!)}>
                                                        <img src={ex.sketchUrl} alt={ex.name} className="w-10 h-10 object-contain" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-slate-300 font-medium text-xs">{ex.name}</span>
                                                    {ex.duration && <span className="text-slate-500 ml-1 text-[10px]">({ex.duration})</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center">
                    <button onClick={onClose} className="text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-bold">Fermer</button>
                </div>
            </div>
        </>
    );
};
