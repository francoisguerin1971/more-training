import React, { useState } from 'react';
import {
    BrainCircuit, Activity, Calendar, Scale, Trophy, Dumbbell, Stethoscope,
    ChevronRight, LayoutGrid, Zap, Settings2, Box, Map, CheckCircle2, Info
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';
import { Card } from '@/shared/components/ui/Card';

// Define types locally to avoid circular dependencies
export interface Biometrics {
    age: string;
    weight: string;
    height: string;
    gender: 'male' | 'female';
}

export interface SportObjectives {
    primarySport: string;
    crossTraining: string[];
    objective: string;
    level: string;
    targetEvent: string;
    otherSport: string;
    otherCrossTraining: string;
}

export interface Availability {
    days: string[];
    timePerDay: Record<string, number>;
    preferredTime: string;
}

export interface Periodization {
    deadlineType: string;
    deadlineValue: string;
    deadlineDate: Date | null;
    intensity: string;
    loadPreference: string;
}

export interface Equipment {
    available: string[];
    gymAccess: boolean;
    poolAccess: boolean;
    trackAccess: boolean;
    environment: string;
    otherEquipment: string;
}

export interface HealthRecovery {
    injuries: string;
    sleepQuality: string;
    hrvStatus: string;
    recoveryPreferences: string[];
    nutritionConstraints: string;
    otherRecovery: string;
}

export interface CoachPreferences {
    coachStyle: string;
    reportType: string;
    customFormulas: string;
}

interface PlanAnamnesisProps {
    onBack?: () => void;
    onComplete: (data: {
        biometrics: Biometrics;
        sportObjectives: SportObjectives;
        availability: Availability;
        periodization: Periodization;
        equipment: Equipment;
        healthRecovery: HealthRecovery;
        coachPreferences: CoachPreferences;
    }) => void;
    initialData?: {
        biometrics?: Biometrics;
        sportObjectives?: SportObjectives;
        availability?: Availability;
        periodization?: Periodization;
        equipment?: Equipment;
        healthRecovery?: HealthRecovery;
        coachPreferences?: CoachPreferences;
    };
}

export function PlanAnamnesis({ onBack, onComplete, initialData }: PlanAnamnesisProps) {
    const { t } = useLanguage();

    // Initial States
    const [biometrics, setBiometrics] = useState<Biometrics>(initialData?.biometrics || { age: '', weight: '', height: '', gender: 'male' });
    const [sportObjectives, setSportObjectives] = useState<SportObjectives>(initialData?.sportObjectives || {
        primarySport: 'Running', crossTraining: [], objective: 'Competition', level: 'Intermédiaire', targetEvent: '', otherSport: '', otherCrossTraining: ''
    });
    const [availability, setAvailability] = useState<Availability>(initialData?.availability || {
        days: [], timePerDay: {}, preferredTime: 'morning'
    });
    const [periodization, setPeriodization] = useState<Periodization>(initialData?.periodization || {
        deadlineType: 'months', deadlineValue: '4', deadlineDate: null, intensity: 'progressive', loadPreference: 'balanced'
    });
    const [equipment, setEquipment] = useState<Equipment>(initialData?.equipment || {
        available: [], gymAccess: false, poolAccess: false, trackAccess: false, environment: 'mixed', otherEquipment: ''
    });
    const [healthRecovery, setHealthRecovery] = useState<HealthRecovery>(initialData?.healthRecovery || {
        injuries: '', sleepQuality: 'good', hrvStatus: 'stable', recoveryPreferences: [], nutritionConstraints: '', otherRecovery: ''
    });
    const [coachPreferences, setCoachPreferences] = useState<CoachPreferences>(initialData?.coachPreferences || {
        coachStyle: 'Directif et Scientifique', reportType: 'pure-ai', customFormulas: ''
    });
    const [creationMode, setCreationMode] = useState<'ai' | 'manual'>(
        initialData?.coachPreferences?.reportType === 'manual' ? 'manual' : 'ai'
    );

    const [subStep, setSubStep] = useState(1);

    const steps = [
        { id: 1, title: t('architect_selection_title') || 'Architecte', icon: LayoutGrid },
        { id: 2, title: t('coach_preferences_label') || 'Réglages IA', icon: Settings2 },
        { id: 3, title: t('biometrics_title') || 'Biométrie', icon: Scale },
        { id: 4, title: t('objectives') || 'Objectifs', icon: Trophy },
        { id: 5, title: t('weekly_availability') || 'Disponibilité', icon: Calendar },
        { id: 6, title: t('anamnesis_step_logistics') || 'Logistique', icon: Activity },
        { id: 7, title: t('medical') || 'Santé', icon: Stethoscope }
    ];

    const handleNext = () => {
        if (subStep === 1) {
            if (creationMode === 'ai') setSubStep(2);
            else setSubStep(3);
        } else if (subStep < 7) {
            setSubStep(subStep + 1);
        } else {
            onComplete({
                biometrics, sportObjectives, availability, periodization, equipment, healthRecovery, coachPreferences
            });
        }
    };

    const handleBack = () => {
        if (subStep === 3 && creationMode === 'manual') setSubStep(1);
        else if (subStep > 1) setSubStep(subStep - 1);
        else if (onBack) onBack();
    };

    // Helpers
    const toggleCrossTraining = (s: string) => setSportObjectives(p => ({
        ...p, crossTraining: p.crossTraining.includes(s) ? p.crossTraining.filter(x => x !== s) : [...p.crossTraining, s]
    }));
    const toggleDay = (d: string) => setAvailability(p => ({
        ...p, days: p.days.includes(d) ? p.days.filter(x => x !== d) : [...p.days, d]
    }));
    const setDayTime = (d: string, v: string) => setAvailability(p => ({
        ...p, timePerDay: { ...p.timePerDay, [d]: parseInt(v) || 0 }
    }));
    const toggleEquipment = (e: string) => setEquipment(p => ({
        ...p, available: p.available.includes(e) ? p.available.filter(x => x !== e) : [...p.available, e]
    }));
    const toggleRecovery = (r: string) => setHealthRecovery(p => ({
        ...p, recoveryPreferences: p.recoveryPreferences.includes(r) ? p.recoveryPreferences.filter(x => x !== r) : [...p.recoveryPreferences, r]
    }));

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
            {/* Steps Progress */}
            <div className="flex gap-2 mb-4">
                {steps.map(s => {
                    const isHidden = s.id === 2 && creationMode === 'manual';
                    if (isHidden) return null;
                    return (
                        <div
                            key={s.id}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                subStep >= s.id ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-slate-800"
                            )}
                        />
                    );
                })}
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        {React.createElement(steps[subStep - 1].icon, { size: 28, strokeWidth: 2.5 })}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                            {steps[subStep - 1].title}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                            {t('anamnesis_data_collection') || 'Données Architecte'} • {t('step_indicator') || 'Étape'} {subStep}/{creationMode === 'manual' ? '6' : '7'}
                        </p>
                    </div>
                </div>

                {/* STEP 1: ARCHITECT SELECTION */}
                {subStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
                        <button
                            onClick={() => {
                                setCreationMode('ai');
                                setCoachPreferences({ ...coachPreferences, reportType: 'pure-ai' });
                            }}
                            className={cn(
                                "group relative p-8 rounded-[32px] border-2 text-left transition-all overflow-hidden h-full flex flex-col justify-between min-h-[320px]",
                                creationMode === 'ai' ? "bg-emerald-500/10 border-emerald-500 shadow-2xl shadow-emerald-500/10" : "bg-slate-950/40 border-slate-800 hover:border-emerald-500/30"
                            )}
                        >
                            <div className="relative z-10">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500", creationMode === 'ai' ? "bg-emerald-500 text-slate-950 scale-110" : "bg-slate-900 text-slate-500 group-hover:text-emerald-400")}>
                                    <BrainCircuit size={36} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                                    {t('architect_ai_title') || 'GÉNÉRATEUR I.A.'}
                                </h4>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                                    {t('architect_ai_desc') || "Laissez l'intelligence artificielle construire une base optimisée en fonction de l'anamnèse complète."}
                                </p>
                            </div>
                            <div className={cn("flex items-center gap-3 font-black uppercase text-xs tracking-widest transition-colors", creationMode === 'ai' ? "text-emerald-400" : "text-slate-500")}>
                                <span className="bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">{t('select_label') || 'SÉLECTIONNER'}</span>
                            </div>
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
                        </button>

                        <button
                            onClick={() => {
                                setCreationMode('manual');
                                setCoachPreferences({ ...coachPreferences, reportType: 'manual' });
                            }}
                            className={cn(
                                "group relative p-8 rounded-[32px] border-2 text-left transition-all overflow-hidden h-full flex flex-col justify-between min-h-[320px]",
                                creationMode === 'manual' ? "bg-indigo-500/10 border-indigo-500 shadow-2xl shadow-indigo-500/10" : "bg-slate-950/40 border-slate-800 hover:border-indigo-500/30"
                            )}
                        >
                            <div className="relative z-10">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500", creationMode === 'manual' ? "bg-indigo-500 text-slate-950 scale-110" : "bg-slate-900 text-slate-500 group-hover:text-indigo-400")}>
                                    <Zap size={36} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                                    {t('architect_manual_title') || 'STUDIO EXPERT'}
                                </h4>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                                    {t('architect_manual_desc') || "Construisez le plan de A à Z avec une précision chirurgicale. Accès complet à la bibliothèque."}
                                </p>
                            </div>
                            <div className={cn("flex items-center gap-3 font-black uppercase text-xs tracking-widest transition-colors", creationMode === 'manual' ? "text-indigo-400" : "text-slate-500")}>
                                <span className="bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">{t('select_label') || 'SÉLECTIONNER'}</span>
                            </div>
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
                        </button>
                    </div>
                )}

                {/* STEP 2: AI SETTINGS */}
                {subStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    {t('report_type_label')}
                                    <InfoTooltip content={t('info_rapport')} />
                                </label>
                                <div className="space-y-3">
                                    {[
                                        { id: 'pure-ai', title: t('report_type_ai'), desc: t('report_type_ai_desc') },
                                        { id: 'hybrid', title: t('report_type_hybrid'), desc: t('report_type_hybrid_desc') }
                                    ].map(report => (
                                        <div
                                            key={report.id}
                                            onClick={() => setCoachPreferences({ ...coachPreferences, reportType: report.id })}
                                            className={cn(
                                                "p-6 rounded-2xl border-2 cursor-pointer transition-all hover:bg-slate-950/50 group",
                                                coachPreferences.reportType === report.id ? "bg-indigo-500/10 border-indigo-500 shadow-xl shadow-indigo-500/5" : "bg-slate-950 border-slate-800"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn("font-black uppercase text-sm tracking-tight", coachPreferences.reportType === report.id ? "text-indigo-400" : "text-slate-300")}>{report.title}</span>
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", coachPreferences.reportType === report.id ? "border-indigo-500" : "border-slate-800")}>
                                                    {coachPreferences.reportType === report.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed group-hover:text-slate-400">{report.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('coach_style_label')}</label>
                                <div className="space-y-3">
                                    {[
                                        { id: 'Directif et Scientifique', title: t('coach_style_authoritarian') || 'Directif', desc: t('coach_style_authoritarian_desc') },
                                        { id: 'Collaboratif et Encourageant', title: t('coach_style_collaborative') || 'Collaboratif', desc: t('coach_style_collaborative_desc') },
                                        { id: 'Éducatif et Pédagogue', title: t('coach_style_educational') || 'Éducatif', desc: t('coach_style_educational_desc') }
                                    ].map(style => (
                                        <div
                                            key={style.id}
                                            onClick={() => setCoachPreferences({ ...coachPreferences, coachStyle: style.id })}
                                            className={cn(
                                                "p-6 rounded-2xl border-2 cursor-pointer transition-all hover:bg-slate-950/50 group",
                                                coachPreferences.coachStyle === style.id ? "bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/5" : "bg-slate-950 border-slate-800"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn("font-black uppercase text-sm tracking-tight", coachPreferences.coachStyle === style.id ? "text-emerald-400" : "text-slate-300")}>{style.title}</span>
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", coachPreferences.coachStyle === style.id ? "border-emerald-500" : "border-slate-800")}>
                                                    {coachPreferences.coachStyle === style.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed group-hover:text-slate-400">{style.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: BIOMETRICS */}
                {subStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('gender_label')}</label>
                            <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800">
                                {['male', 'female'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setBiometrics({ ...biometrics, gender: g as 'male' | 'female' })}
                                        className={cn(
                                            "flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all",
                                            biometrics.gender === g ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white"
                                        )}
                                    >
                                        {t(`gender_${g}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('age_label')}</label>
                            <input type="number" value={biometrics.age} onChange={e => setBiometrics({ ...biometrics, age: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none transition-all" placeholder="30" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('weight_label')} (kg)</label>
                            <input type="number" value={biometrics.weight} onChange={e => setBiometrics({ ...biometrics, weight: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none transition-all" placeholder="70" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('height_label')} (cm)</label>
                            <input type="number" value={biometrics.height} onChange={e => setBiometrics({ ...biometrics, height: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none transition-all" placeholder="180" />
                        </div>
                    </div>
                )}

                {/* STEP 4: SPORT OBJECTIVES */}
                {subStep === 4 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_primary_sport')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Running', 'Cycling', 'Triathlon', 'Trail Running', 'Fitness', 'Autre'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSportObjectives({ ...sportObjectives, primarySport: s })}
                                            className={cn(
                                                "py-4 rounded-xl text-[10px] font-black uppercase border-2 transition-all",
                                                sportObjectives.primarySport === s ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-950/50 border-slate-800 text-slate-500 hover:text-white"
                                            )}
                                        >
                                            {t(`sport_${s.toLowerCase().replace(' ', '_')}`) || s}
                                        </button>
                                    ))}
                                </div>
                                {sportObjectives.primarySport === 'Autre' && (
                                    <input
                                        type="text"
                                        value={sportObjectives.otherSport}
                                        onChange={e => setSportObjectives({ ...sportObjectives, otherSport: e.target.value })}
                                        className="w-full mt-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                                        placeholder={t('specify_sport') || 'Préciser le sport...'}
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_level')}</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['beginner', 'intermediate', 'advanced', 'elite'].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => setSportObjectives({ ...sportObjectives, level: lvl })}
                                            className={cn(
                                                "w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                                                sportObjectives.level === lvl ? "bg-emerald-500/10 border-emerald-500" : "bg-slate-950/50 border-slate-800"
                                            )}
                                        >
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", sportObjectives.level === lvl ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")}>
                                                {t(`anamnesis_level_${lvl}`) || lvl}
                                            </span>
                                            {sportObjectives.level === lvl && <CheckCircle2 size={16} className="text-emerald-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('cross_training_label') || 'Sports Croisés / Complémentaires'}</label>
                            <div className="flex flex-wrap gap-3">
                                {['Natation', 'Vélo', 'Yoga', 'Renforcement', 'Marche', 'Autre'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleCrossTraining(s)}
                                        className={cn(
                                            "px-5 py-3 rounded-full text-[10px] font-black uppercase border-2 transition-all",
                                            sportObjectives.crossTraining.includes(s) ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            {sportObjectives.crossTraining.includes('Autre') && (
                                <input
                                    type="text"
                                    value={sportObjectives.otherCrossTraining}
                                    onChange={e => setSportObjectives({ ...sportObjectives, otherCrossTraining: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                                    placeholder={t('specify_cross') || 'Préciser les sports croisés...'}
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_target_event')}</label>
                            <div className="relative">
                                <Trophy className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                                <input type="text" value={sportObjectives.targetEvent} onChange={e => setSportObjectives({ ...sportObjectives, targetEvent: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-medium focus:border-emerald-500 outline-none transition-all placeholder:text-slate-800" placeholder="Ex: Marathon de Paris, Ironman..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: AVAILABILITY */}
                {subStep === 5 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                {t('anamnesis_available_days')}
                                <InfoTooltip content={t('info_time')} />
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(slug => (
                                    <button
                                        key={slug}
                                        onClick={() => toggleDay(slug)}
                                        className={cn(
                                            "aspect-square rounded-2xl text-[10px] font-black uppercase border-2 transition-all flex flex-col items-center justify-center gap-1",
                                            availability.days.includes(slug)
                                                ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-xl shadow-emerald-500/20"
                                                : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"
                                        )}
                                    >
                                        <span>{t(`day_${slug}`)?.slice(0, 3) || slug.slice(0, 3)}</span>
                                        {availability.days.includes(slug) && <div className="w-1 h-1 rounded-full bg-slate-950" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {availability.days.length > 0 && (
                            <div className="space-y-6 pt-10 border-t border-slate-800/50">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_time_per_day')} (min)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {availability.days.map(d => (
                                        <div key={d} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                                            <span className="text-[9px] font-black text-slate-500 uppercase mb-2 block">{t(`day_${d}`) || d}</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={availability.timePerDay[d] || ''}
                                                    onChange={e => setDayTime(d, e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white font-black focus:border-emerald-500 outline-none text-sm"
                                                    placeholder="60"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('preferred_time_label') || 'Moment privilégié'}</label>
                            <div className="flex gap-4">
                                {['morning', 'afternoon', 'evening'].map(t_slug => (
                                    <button
                                        key={t_slug}
                                        onClick={() => setAvailability({ ...availability, preferredTime: t_slug })}
                                        className={cn(
                                            "flex-1 py-4 rounded-xl text-[10px] font-black uppercase border-2 transition-all",
                                            availability.preferredTime === t_slug ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                        )}
                                    >
                                        {t(`time_${t_slug}`) || t_slug}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 6: LOGISTICS */}
                {subStep === 6 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card className="bg-slate-950/50 border-slate-800 p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('deadline_type_label')}</label>
                                    <select value={periodization.deadlineType} onChange={e => setPeriodization({ ...periodization, deadlineType: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-black uppercase outline-none focus:border-emerald-500">
                                        <option value="months">{t('months') || 'Mois'}</option>
                                        <option value="weeks">{t('weeks') || 'Semaines'}</option>
                                        <option value="days">{t('days') || 'Jours'}</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('deadline_value_label')}</label>
                                    <input type="number" value={periodization.deadlineValue} onChange={e => setPeriodization({ ...periodization, deadlineValue: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-black focus:border-emerald-500 outline-none" placeholder="4" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('intensity_label') || 'Progression de l\'Intensité'}</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'progressive', title: t('periodization_progressive') || 'Linéaire / Progressive' },
                                            { id: 'intensive', title: t('periodization_intensive') || 'Blocs de Choc / Intensif' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setPeriodization({ ...periodization, intensity: opt.id })}
                                                className={cn(
                                                    "w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between",
                                                    periodization.intensity === opt.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500"
                                                )}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{opt.title}</span>
                                                {periodization.intensity === opt.id && <CheckCircle2 size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('load_preference_label') || 'Répartition de Charge'}</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'balanced', title: t('preference_sustainable') || 'Équilibrée / Durable' },
                                            { id: 'aggressive', title: t('preference_aggressive') || 'Agressive / Volume Max' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setPeriodization({ ...periodization, loadPreference: opt.id })}
                                                className={cn(
                                                    "w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between",
                                                    periodization.loadPreference === opt.id ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "bg-slate-900 border-slate-800 text-slate-500"
                                                )}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{opt.title}</span>
                                                {periodization.loadPreference === opt.id && <CheckCircle2 size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_equipment_list')}</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { id: 'Montre GPS', label: 'Montre GPS' },
                                    { id: 'Capteur Cardiaque', label: 'Ceinture Cardio' },
                                    { id: 'Home Trainer', label: 'Home Trainer' },
                                    { id: 'Dumbbells', label: 'Haltères' },
                                    { id: 'Kettlebells', label: 'Kettlebells' },
                                    { id: 'Gym', label: 'Accès Salle de Sport' },
                                    { id: 'YogaMat', label: 'Tapis de Yoga' },
                                    { id: 'PullUpBar', label: 'Barre de Tractions' },
                                    { id: 'Other', label: 'Autre' }
                                ].map(eq => (
                                    <button
                                        key={eq.id}
                                        onClick={() => toggleEquipment(eq.id)}
                                        className={cn(
                                            "px-5 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all",
                                            equipment.available.includes(eq.id)
                                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                                : "bg-slate-950/50 border-slate-800 text-slate-500 hover:text-white"
                                        )}
                                    >
                                        {eq.label}
                                    </button>
                                ))}
                            </div>
                            {equipment.available.includes('Other') && (
                                <input
                                    type="text"
                                    value={equipment.otherEquipment}
                                    onChange={e => setEquipment({ ...equipment, otherEquipment: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                                    placeholder={t('specify_eq') || 'Détaillez vos équipements...'}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 7: HEALTH & RECOVERY */}
                {subStep === 7 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_injuries')}</label>
                            <textarea
                                value={healthRecovery.injuries}
                                onChange={(e) => setHealthRecovery({ ...healthRecovery, injuries: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-sm font-medium focus:border-emerald-500 outline-none h-32 resize-none transition-all"
                                placeholder={t('medical_placeholder') || 'Renseignez toute blessure passée ou actuelle...'}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_sleep_quality')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['excellent', 'good', 'average', 'poor'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setHealthRecovery({ ...healthRecovery, sleepQuality: s })}
                                            className={cn(
                                                "py-4 rounded-xl text-[10px] font-black uppercase border-2 transition-all",
                                                healthRecovery.sleepQuality === s ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                            )}
                                        >
                                            {t(`anamnesis_sleep_${s}`) || s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('hrv_status_label') || 'Statut HRV Habituel'}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['stable', 'high', 'low', 'unknown'].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setHealthRecovery({ ...healthRecovery, hrvStatus: h })}
                                            className={cn(
                                                "py-4 rounded-xl text-[10px] font-black uppercase border-2 transition-all",
                                                healthRecovery.hrvStatus === h ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                            )}
                                        >
                                            {t(`hrv_${h}`) || h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('recovery_preferences_label') || 'Méthodes de Récupération Favorites'}</label>
                            <div className="flex flex-wrap gap-3">
                                {['Sauna / Bain Chaud', 'Cryothérapie', 'Compression', 'Massage / Foam Roll', 'Respiration / Méditation', 'Autre'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => toggleRecovery(r)}
                                        className={cn(
                                            "px-5 py-3 rounded-full text-[10px] font-black uppercase border-2 transition-all",
                                            healthRecovery.recoveryPreferences.includes(r) ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                        )}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-10">
                <button
                    onClick={handleBack}
                    className="group flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-white transition-all px-8 py-5 rounded-[20px] bg-slate-950/30 border border-slate-800"
                >
                    <ChevronRight size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    {subStep > 1 ? t('back') : t('anamnesis_back_selection')}
                </button>
                <button
                    onClick={handleNext}
                    className="group bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 px-12 py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-4 transition-all shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] hover:shadow-emerald-500/40"
                >
                    {subStep < 7 ? t('next') : (creationMode === 'ai' ? t('generate_plan') || 'Lancer l\'Architecte' : t('finish') || 'Ouvrir le Studio')}
                    <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div >
    );
}
