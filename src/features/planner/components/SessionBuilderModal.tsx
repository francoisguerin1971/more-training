import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { useLanguage } from '@/shared/context/LanguageContext';
import {
    X, Save, Dumbbell, Clock, Flame,
    Plus, Trash2, ChevronRight, Activity,
    Image as ImageIcon, MoreVertical
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Workout as Session } from '@/features/planner/types/training';
import { ExerciseSketchService } from '@/shared/services/ExerciseSketchService';

interface SessionBuilderModalProps {
    isOpen: boolean;
    initialSession: any; // Using any for flexibility during refactor, strictly Session type later
    onClose: () => void;
    onSave: (session: any) => void;
}

export function SessionBuilderModal({ isOpen, initialSession, onClose, onSave }: SessionBuilderModalProps) {
    const { t } = useLanguage();
    const [session, setSession] = useState<any>(initialSession);
    const [activeTab, setActiveTab] = useState<'structure' | 'exercises' | 'settings'>('structure');

    // Update local state when initialSession changes or modal opens
    useEffect(() => {
        if (isOpen && initialSession) {
            setSession(JSON.parse(JSON.stringify(initialSession))); // Deep copy
        }
    }, [isOpen, initialSession]);

    if (!isOpen || !session) return null;

    const handleDetailChange = (field: string, value: string) => {
        setSession((prev: any) => ({
            ...prev,
            details: { ...prev.details, [field]: value }
        }));
    };

    const addExercise = () => {
        const newExercise = {
            id: Math.random().toString(36).substr(2, 9),
            name: "Nouvel Exercice",
            description: "",
            default_sets: 3,
            default_reps: "10",
            default_rest: "90s",
            sketch_url: ""
        };
        setSession((prev: any) => ({
            ...prev,
            exercises: [...(prev.exercises || []), newExercise]
        }));
        setActiveTab('exercises');
    };

    const updateExercise = (index: number, field: string, value: any) => {
        const newExercises = [...(session.exercises || [])];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setSession((prev: any) => ({ ...prev, exercises: newExercises }));
    };

    const removeExercise = (index: number) => {
        const newExercises = [...(session.exercises || [])];
        newExercises.splice(index, 1);
        setSession((prev: any) => ({ ...prev, exercises: newExercises }));
    };

    // Calculate Estimated Load
    const estimatedDuration = (session.exercises || []).reduce((acc: number, ex: any) => {
        // Rough estimate: sets * (reps * 3s + rest)
        return acc + (ex.default_sets || 1) * 2; // Dummy calc
    }, 60);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl h-[90vh] animate-in fade-in zoom-in duration-300 flex flex-col">
                <Card className="flex-1 flex flex-col bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">

                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center border border-indigo-400/20">
                                <Activity className="text-white" size={24} />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={session.title}
                                    onChange={(e) => setSession({ ...session, title: e.target.value })}
                                    className="bg-transparent text-xl font-black text-white uppercase tracking-tight focus:outline-none placeholder:text-slate-600 w-full"
                                    placeholder={t('session_title_placeholder')}
                                />
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} /> {estimatedDuration} {t('est_duration')}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        <Flame size={12} /> {session.intensity || 'Modérée'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-800 bg-slate-950/30">
                        {[
                            { id: 'structure', label: t('tab_structure'), icon: Dumbbell },
                            { id: 'exercises', label: `${t('tab_exercises')} (${session.exercises?.length || 0})`, icon: (activity: any) => <div className="flex gap-0.5">{[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-current rounded-full" />)}</div> },
                            { id: 'settings', label: t('tab_metadata'), icon: Activity }
                        ].map(tab => {
                            const Icon: any = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2",
                                        activeTab === tab.id
                                            ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                                            : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                                    )}
                                >
                                    {typeof Icon === 'function' && tab.id === 'exercises' ? Icon(tab.id) : <Icon size={16} />}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900">

                        {activeTab === 'structure' && (
                            <div className="space-y-6 max-w-2xl mx-auto">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} /> {t('warmup_label')}
                                    </label>
                                    <textarea
                                        value={session.details?.warmup || ''}
                                        onChange={(e) => handleDetailChange('warmup', e.target.value)}
                                        className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-medium text-slate-300 focus:border-emerald-500 outline-none resize-none"
                                        placeholder={t('warmup_placeholder')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Dumbbell size={12} /> {t('main_block_label')}
                                    </label>
                                    <textarea
                                        value={session.details?.main || ''}
                                        onChange={(e) => handleDetailChange('main', e.target.value)}
                                        className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-medium text-slate-300 focus:border-indigo-500 outline-none resize-none"
                                        placeholder={t('main_block_placeholder')}
                                    />
                                    <p className="text-[10px] text-slate-600 italic">
                                        * Astuce : Utilisez l'onglet "Exercices" pour ajouter des blocs détaillés.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} /> {t('cooldown_label')}
                                    </label>
                                    <textarea
                                        value={session.details?.cooldown || ''}
                                        onChange={(e) => handleDetailChange('cooldown', e.target.value)}
                                        className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-medium text-slate-300 focus:border-indigo-500 outline-none resize-none"
                                        placeholder={t('cooldown_placeholder')}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'exercises' && (
                            <div className="space-y-4">
                                {(session.exercises || []).map((ex: any, idx: number) => (
                                    <div key={idx} className="group bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-indigo-500/50 transition-all flex gap-4 animate-in slide-in-from-bottom-2">
                                        {/* Drag Handle & Index */}
                                        <div className="flex flex-col items-center gap-2 pt-2">
                                            <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                {idx + 1}
                                            </div>
                                            <div className="h-full w-0.5 bg-slate-900 group-hover:bg-slate-800 transition-colors" />
                                        </div>

                                        {/* Edit Form */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={ex.name}
                                                    onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                                                    className="flex-1 bg-transparent border-b border-transparent hover:border-slate-800 focus:border-indigo-500 outline-none text-sm font-black text-white uppercase tracking-tight py-1"
                                                    placeholder={t('exercise_name_placeholder')}
                                                />
                                                <button onClick={() => removeExercise(idx)} className="text-slate-600 hover:text-rose-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-4 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase">{t('exercise_sets')}</label>
                                                    <input
                                                        type="number"
                                                        value={ex.default_sets || ''}
                                                        onChange={(e) => updateExercise(idx, 'default_sets', e.target.value)}
                                                        className="w-full bg-slate-900 rounded-lg px-3 py-2 text-xs font-bold text-white border border-slate-800 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase">{t('exercise_reps')}</label>
                                                    <input
                                                        type="text"
                                                        value={ex.default_reps || ''}
                                                        onChange={(e) => updateExercise(idx, 'default_reps', e.target.value)}
                                                        className="w-full bg-slate-900 rounded-lg px-3 py-2 text-xs font-bold text-white border border-slate-800 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase">{t('exercise_rest')}</label>
                                                    <input
                                                        type="text"
                                                        value={ex.default_rest || ''}
                                                        onChange={(e) => updateExercise(idx, 'default_rest', e.target.value)}
                                                        className="w-full bg-slate-900 rounded-lg px-3 py-2 text-xs font-bold text-white border border-slate-800 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase">{t('exercise_intensity')}</label>
                                                    <input
                                                        type="text"
                                                        value={ex.default_intensity || ''}
                                                        onChange={(e) => updateExercise(idx, 'default_intensity', e.target.value)}
                                                        className="w-full bg-slate-900 rounded-lg px-3 py-2 text-xs font-bold text-white border border-slate-800 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <textarea
                                                    value={ex.description || ''}
                                                    onChange={(e) => updateExercise(idx, 'description', e.target.value)}
                                                    className="w-full bg-slate-900 rounded-lg p-3 text-xs font-medium text-slate-400 border border-slate-800 focus:border-indigo-500 outline-none resize-none h-16"
                                                    placeholder={t('exercise_notes_placeholder')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addExercise}
                                    className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest"
                                >
                                    <Plus size={16} /> {t('add_exercise_btn')}
                                </button>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6 max-w-xl mx-auto">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                    <Flame className="text-amber-500 mt-1" size={20} />
                                    <div>
                                        <h4 className="text-sm font-black text-amber-500 uppercase">{t('expert_mode_title')}</h4>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {t('expert_mode_desc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type d'effort</label>
                                    <select
                                        value={session.intensity}
                                        onChange={(e) => setSession({ ...session, intensity: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 outline-none appearance-none"
                                    >
                                        <option value="Récupération Active">Récupération Active (Zone 1)</option>
                                        <option value="Endurance Fondamentale">Endurance Fondamentale (Zone 2)</option>
                                        <option value="Tempo">Tempo / Sweet Spot (Zone 3)</option>
                                        <option value="Seuil">Seuil Lactique (Zone 4)</option>
                                        <option value="VO2 Max">VO2 Max (Zone 5)</option>
                                        <option value="Neuromusculaire">Neuromusculaire (Zone 6)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Focus Technique</label>
                                    <input
                                        type="text"
                                        value={session.details?.tech_focus || ''}
                                        onChange={(e) => handleDetailChange('tech_focus', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 outline-none"
                                        placeholder={t('tech_focus_placeholder')}
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                            {t('cancel_btn') || 'Annuler'}
                        </button>
                        <button
                            onClick={() => onSave(session)}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Save size={16} /> {t('save_btn') || 'Enregistrer'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
