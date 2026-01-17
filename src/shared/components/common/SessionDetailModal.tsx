import React from 'react';
import { X, Flame, Activity, Wind, Target, Play, BookOpen, Youtube, Trophy, Download, CheckCircle, XCircle, BrainCircuit, MessageSquare } from 'lucide-react';
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { format } from 'date-fns';
import { fr, es, ca, enUS, it, de } from 'date-fns/locale';
import { cn } from '@/shared/lib/utils';
import { useLanguage } from '@/shared/context/LanguageContext';
import { exportToTCX, exportToFIT } from '@/shared/utils/workoutExport';
import { ExerciseSketch } from './ExerciseSketch';
import { Workout } from '@/shared/types';

// Extend Workout with UI-specific optional fields if needed, or use as is
// Assuming 'session' in UI maps to 'Workout' type
interface SessionDetailModalProps {
    session: Workout & {
        medal?: string;
        intensity?: string;
        intensity_context?: string;
        breathing_sensation?: string;
        visual?: string;
        coach_notes?: string; // Added coach_notes here
        details?: {
            warmup?: string;
            main?: string;
            cooldown?: string;
            tech_focus?: string;
        };
        resources?: {
            article?: string;
            video?: string;
        };
    } | null;
    onClose: () => void;
}

export function SessionDetailModal({ session, onClose }: SessionDetailModalProps) {
    const { language, t } = useLanguage();
    const { respondToWorkout } = useTraining();

    // Map language to date-fns locale
    const currentLocale = React.useMemo(() => {
        switch (language) {
            case 'fr': return fr;
            case 'es': return es;
            case 'ca': return ca;
            case 'it': return it;
            case 'de': return de;
            default: return enUS;
        }
    }, [language]);

    if (!session) return null;

    const isPending = session.status === 'PENDING_ACCEPTANCE';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-6 flex items-start justify-between z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                                {format(new Date(session.date), 'EEEE d MMMM yyyy', { locale: currentLocale })}
                            </span>
                            {session.medal && (
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-black uppercase",
                                    (session.medal as string) === 'Or' || (session.medal as string) === 'Gold' ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                        (session.medal as string) === 'Argent' || (session.medal as string) === 'Silver' ? "bg-slate-400/10 text-slate-400 border border-slate-400/20" :
                                            "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                )}>
                                    <Trophy size={12} className="inline mr-1" />
                                    {(session.medal as string) === 'Or' || (session.medal as string) === 'Gold' ? t('medal_gold') :
                                        (session.medal as string) === 'Argent' || (session.medal as string) === 'Silver' ? t('medal_silver') :
                                            t('medal_bronze')}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{session.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Content Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* LEFT PANEL: Context & Details (Sticky) */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="sticky top-28 space-y-6">
                            {/* Intensity Card */}
                            {(session.intensity || session.intensity_context) && (
                                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity size={16} className="text-indigo-400" />
                                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">{t('intensity_target')}</h3>
                                    </div>
                                    <p className="text-white font-bold text-base leading-tight">{session.intensity || session.intensity_context}</p>
                                    {session.breathing_sensation && (
                                        <div className="mt-3 pt-3 border-t border-indigo-500/10 flex items-center gap-2 text-indigo-300/70">
                                            <Wind size={14} />
                                            <span className="text-[10px] uppercase tracking-widest">{session.breathing_sensation}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Warmup Detail */}
                            {(session.warmup || session.details?.warmup) && (
                                <div className="relative pl-4 border-l-2 border-slate-800">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-700" />
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('warmup')}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {session.warmup?.description || session.details?.warmup}
                                    </p>
                                </div>
                            )}

                            {/* Tech Focus */}
                            {session.details?.tech_focus && (
                                <div className="relative pl-4 border-l-2 border-purple-500/30">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-purple-500" />
                                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">{t('tech_focus_label')}</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                        "{session.details.tech_focus}"
                                    </p>
                                </div>
                            )}

                            {/* Cooldown Detail */}
                            {(session.cooldown || session.details?.cooldown) && (
                                <div className="relative pl-4 border-l-2 border-slate-800">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-700" />
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('cooldown')}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {session.cooldown?.description || session.details?.cooldown}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Main Content */}
                    <div className="md:col-span-8 space-y-8">
                        {/* Coach's Insight Hero */}
                        {session.coach_notes && (
                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <MessageSquare size={100} className="text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                            <BrainCircuit size={16} />
                                        </div>
                                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{t('insight_coach_title')}</h3>
                                    </div>
                                    <p className="text-lg font-medium text-white italic leading-relaxed border-l-4 border-indigo-500 pl-4">
                                        "{session.coach_notes}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Main Workout Block */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                                <Flame size={18} className="text-emerald-500" />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">{t('body_of_session')}</h3>
                                {session.details?.main && (
                                    <span className="text-xs text-slate-500 font-medium truncate ml-auto">{session.details.main}</span>
                                )}
                            </div>

                            {/* Exercises List */}
                            {session.exercises && session.exercises.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {session.exercises.map((exercise, idx) => (
                                        <div key={idx} className="h-40"> {/* Fixed height for uniformity */}
                                            <ExerciseSketch exercise={exercise} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center">
                                    <p className="text-slate-500 text-sm">{t('no_exercises_found')}</p>
                                </div>
                            )}
                        </div>

                        {/* Resources Section if exists */}
                        {session.resources && (session.resources.article || session.resources.video) && (
                            <div className="pt-6 border-t border-slate-800/50">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{t('resources_and_media')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {session.resources.article && (
                                        <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all flex items-center gap-3 text-left">
                                            <BookOpen size={16} className="text-slate-400" />
                                            <span className="text-xs text-slate-300 font-medium line-clamp-1">{session.resources.article}</span>
                                        </button>
                                    )}
                                    {session.resources.video && (
                                        <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-red-500/30 transition-all flex items-center gap-3 text-left">
                                            <Youtube size={16} className="text-slate-400" />
                                            <span className="text-xs text-slate-300 font-medium line-clamp-1">{session.resources.video}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-6 space-y-4">
                    {isPending && (
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    await respondToWorkout(session.id, 'accept');
                                    onClose();
                                }}
                                className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 group"
                            >
                                <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                                {t('accept')}
                            </button>
                            <button
                                onClick={async () => {
                                    await respondToWorkout(session.id, 'refuse');
                                    onClose();
                                }}
                                className="flex-1 py-5 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-500 font-black rounded-2xl uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
                            >
                                <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                                {t('refuse')}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => exportToTCX(session)}
                            className="py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 font-black rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            Strava (.tcx)
                        </button>
                        <button
                            onClick={() => exportToFIT(session)}
                            className="py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 font-black rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            Garmin (.txt)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
