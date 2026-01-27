import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    Calendar, Dumbbell, Trash2, Edit3,
    Save, Plus, Tag, Flame, Map, Clock, Activity,
    Box, Youtube, BookOpen
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ExerciseSketch } from './ExerciseSketch';
import { ExerciseSketchService } from '@/shared/services/ExerciseSketchService';

interface Exercise {
    id?: string;
    name: string;
    description?: string;
    sets?: number;
    reps?: string | number;
    duration?: string;
    rest?: string;
    intensity?: string;
    notes?: string;
    sketch_url?: string;
    category?: string;
}

interface Session {
    id: string;
    date: Date;
    title: string;
    medal?: string;
    details: {
        warmup: string;
        main: string;
        cooldown: string;
        tech_focus?: string;
    };
    intensity: string;
    visual?: string;
    exercises?: Exercise[];
    resources?: {
        article?: string;
        video?: string;
    };
}

interface PlanEditorProps {
    sessions: Session[];
    onUpdate: (id: string, updates: Partial<Session>) => void;
    onDelete: (id: string) => void;
    onInsert: () => void;
}

export function PlanEditor({ sessions, onUpdate, onDelete, onInsert }: PlanEditorProps) {
    const [editingId, setEditingId] = useState<string | null>(null);

    const getSketchUrl = (exercise: Exercise): string => {
        if (exercise.sketch_url) return exercise.sketch_url;
        return ExerciseSketchService.getSketchForExercise(exercise.name, exercise.category || 'running');
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Calendar className="text-emerald-400" size={32} />
                        Plan d'Entraînement Détaillé
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        {sessions.length} séances programmées pour votre réussite.
                    </p>
                </div>
                <button
                    onClick={onInsert}
                    className="px-8 py-3 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transform hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                >
                    <Plus size={18} strokeWidth={3} /> Ajouter une session
                </button>
            </div>

            <div className="space-y-16">
                {sessions.map((session, idx) => (
                    <div key={session.id} className="relative pl-12 border-l-2 border-slate-800 pb-12 last:pb-0">
                        {/* Timeline Node */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />

                        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                            {/* Session Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[28px] bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{format(new Date(session.date), 'MMM', { locale: fr })}</span>
                                        <span className="text-3xl font-black text-white -mt-1">{format(new Date(session.date), 'dd')}</span>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase">{format(new Date(session.date), 'EEEE', { locale: fr })}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-2xl font-black text-white uppercase tracking-tight">{session.title}</h4>
                                            {session.medal && (
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border",
                                                    session.medal === 'Or' ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500" :
                                                        session.medal === 'Argent' ? "bg-slate-300/10 border-slate-300/50 text-slate-300" :
                                                            "bg-orange-500/10 border-orange-500/50 text-orange-500"
                                                )}>
                                                    🏆 {session.medal}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <Flame size={14} className="text-orange-500" /> {session.intensity}
                                            </span>
                                            {session.details.tech_focus && (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                                    <Tag size={14} /> {session.details.tech_focus}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingId(session.id === editingId ? null : session.id)}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-slate-700"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(session.id)}
                                        className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-rose-500/20"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Session Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Details Column */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
                                            <div>
                                                <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                    <Activity size={12} /> Échauffement
                                                </h5>
                                                <p className="text-xs text-slate-300 leading-relaxed font-medium">{session.details.warmup || 'Non spécifié'}</p>
                                            </div>
                                            <div className="pt-4 border-t border-slate-800/50">
                                                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                    <Activity size={12} /> Retour au calme
                                                </h5>
                                                <p className="text-xs text-slate-300 leading-relaxed font-medium">{session.details.cooldown || 'Non spécifié'}</p>
                                            </div>
                                        </div>

                                        {session.resources && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
                                                    <Youtube size={16} className="text-red-500" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Vidéo Tech</span>
                                                </div>
                                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
                                                    <BookOpen size={16} className="text-blue-500" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Article</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Exercises Column */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Dumbbell size={14} /> Corps de Séance & Exercices
                                        </h5>
                                    </div>

                                    {session.exercises && session.exercises.length > 0 ? (
                                        <div className="space-y-6">
                                            {/* Main Description */}
                                            <p className="text-sm text-slate-200 font-semibold leading-relaxed bg-slate-900/80 border border-slate-800 p-6 rounded-3xl italic">
                                                "{session.details.main}"
                                            </p>

                                            {/* Exercises Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {session.exercises.map((ex, exIdx) => (
                                                    <div key={ex.id || exIdx} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group/ex hover:border-emerald-500/30 transition-all flex flex-col">
                                                        <ExerciseSketch
                                                            prompt={ex.name}
                                                            sketchUrl={getSketchUrl(ex)}
                                                            className="h-40"
                                                        />
                                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                                            <div>
                                                                <h6 className="text-sm font-black text-white uppercase tracking-tight mb-1">{ex.name}</h6>
                                                                <p className="text-[10px] text-slate-400 line-clamp-2 mb-4 font-medium">{ex.description || ex.notes}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                                                                {ex.sets && <span className="text-[9px] font-black text-emerald-400 uppercase">{ex.sets} Blocks</span>}
                                                                {ex.reps && <span className="text-[9px] font-black text-white uppercase">• {ex.reps} Reps</span>}
                                                                {ex.duration && <span className="text-[9px] font-black text-indigo-400 uppercase">• {ex.duration}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-900/50 border border-slate-800 border-dashed p-12 rounded-3xl text-center">
                                            <p className="text-sm text-slate-500 font-medium">"{session.details.main}"</p>
                                            <p className="text-[10px] text-slate-600 uppercase font-black mt-2 tracking-widest">(Aucun exercice spécifique détaillé)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Editing Inline Form (if active) */}
                            {editingId === session.id && (
                                <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-3xl p-8 space-y-6 animate-in zoom-in-95 duration-300 shadow-2xl shadow-emerald-500/10">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                                        <h5 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                            <Edit3 size={14} className="text-emerald-500" /> Mode Édition Expert
                                        </h5>
                                        <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-white"><Plus className="rotate-45" size={20} /></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Titre de la Séance</label>
                                                <input
                                                    type="text"
                                                    value={session.title}
                                                    onChange={(e) => onUpdate(session.id, { title: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold uppercase focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Intensité</label>
                                                <input
                                                    type="text"
                                                    value={session.intensity}
                                                    onChange={(e) => onUpdate(session.id, { intensity: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Cœur de Séance (Notes AI)</label>
                                                <textarea
                                                    value={session.details.main}
                                                    onChange={(e) => onUpdate(session.id, { details: { ...session.details, main: e.target.value } })}
                                                    className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-medium focus:border-emerald-500 outline-none resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-8 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <Save size={16} /> Sauvegarder les modifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {sessions.length === 0 && (
                    <div className="text-center py-32 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[40px]">
                        <Calendar className="mx-auto mb-6 text-slate-700" size={64} />
                        <h4 className="text-xl font-black text-slate-500 uppercase tracking-tighter">Aucun plan généré</h4>
                        <p className="text-slate-600 font-medium mt-2">Utilisez l'Architecte Elite pour concevoir votre programme.</p>
                        <button onClick={onInsert} className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">
                            Créer manuellement
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
