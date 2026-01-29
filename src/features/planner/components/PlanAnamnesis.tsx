import React, { useState } from 'react';
import {
    BrainCircuit, Activity, Calendar, Scale, Trophy, Dumbbell, Stethoscope, Heart,
    ChevronRight, LayoutGrid, Zap, Settings2, Box, Map, CheckCircle2, Info, User, Target
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

    // Nouvelle structure: 5 étapes harmonisées
    const steps = [
        { id: 1, title: t('eval_step_mode') || 'Mode de Création', icon: LayoutGrid, color: 'emerald' },
        { id: 2, title: t('eval_step_profile') || 'Profil Athlète', icon: User, color: 'sky' },
        { id: 3, title: t('eval_step_objectives') || 'Objectifs & Sport', icon: Target, color: 'amber' },
        { id: 4, title: t('eval_step_planning') || 'Planning', icon: Calendar, color: 'violet' },
        { id: 5, title: t('eval_step_environment') || 'Environnement', icon: Settings2, color: 'rose' }
    ];

    const totalSteps = 5;

    const handleNext = () => {
        if (subStep < totalSteps) {
            setSubStep(subStep + 1);
        } else {
            onComplete({
                biometrics, sportObjectives, availability, periodization, equipment, healthRecovery, coachPreferences
            });
        }
    };

    const handleBack = () => {
        if (subStep > 1) setSubStep(subStep - 1);
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
    const toggleEquipment = (id: string) => setEquipment(p => ({
        ...p,
        available: p.available.includes(id) ? p.available.filter(x => x !== id) : [...p.available, id]
    }));

    const toggleRecovery = (id: string) => setHealthRecovery(p => ({
        ...p,
        recoveryPreferences: p.recoveryPreferences.includes(id) ? p.recoveryPreferences.filter(x => x !== id) : [...p.recoveryPreferences, id]
    }));

    const getCurrentColor = () => {
        const colors: Record<string, string> = {
            emerald: 'emerald', sky: 'sky', amber: 'amber', violet: 'violet', rose: 'rose'
        };
        return colors[steps[subStep - 1]?.color] || 'emerald';
    };

    const colorClasses: Record<string, { bg: string; border: string; text: string; shadow: string; gradient: string }> = {
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-400', shadow: 'shadow-emerald-500/20', gradient: 'from-emerald-600 to-emerald-500' },
        sky: { bg: 'bg-sky-500/10', border: 'border-sky-500', text: 'text-sky-400', shadow: 'shadow-sky-500/20', gradient: 'from-sky-600 to-sky-500' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-400', shadow: 'shadow-amber-500/20', gradient: 'from-amber-600 to-amber-500' },
        violet: { bg: 'bg-violet-500/10', border: 'border-violet-500', text: 'text-violet-400', shadow: 'shadow-violet-500/20', gradient: 'from-violet-600 to-violet-500' },
        rose: { bg: 'bg-rose-500/10', border: 'border-rose-500', text: 'text-rose-400', shadow: 'shadow-rose-500/20', gradient: 'from-rose-600 to-rose-500' }
    };

    const currentColor = getCurrentColor();
    const cc = colorClasses[currentColor];

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
            {/* Steps Progress - Style harmonisé */}
            <div className="flex items-center gap-2 mb-6">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.id}>
                        <div
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 cursor-pointer",
                                subStep === s.id
                                    ? `${colorClasses[s.color].bg} ${colorClasses[s.color].border} border-2`
                                    : subStep > s.id
                                        ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                                        : "bg-slate-900/50 border-2 border-slate-800"
                            )}
                            onClick={() => subStep > s.id && setSubStep(s.id)}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black",
                                subStep === s.id ? colorClasses[s.color].text : subStep > s.id ? "text-emerald-400" : "text-slate-600"
                            )}>
                                {subStep > s.id ? <CheckCircle2 size={16} /> : s.id}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-wider hidden md:block",
                                subStep === s.id ? colorClasses[s.color].text : subStep > s.id ? "text-emerald-400" : "text-slate-600"
                            )}>
                                {s.title}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-0.5 rounded-full transition-all duration-500",
                                subStep > s.id ? "bg-emerald-500" : "bg-slate-800"
                            )} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Container principal - hauteur fixe harmonisée */}
            <div className={cn(
                "bg-slate-900/50 backdrop-blur-xl border-2 rounded-[32px] p-8 shadow-2xl relative overflow-hidden min-h-[520px] transition-all duration-500",
                cc.border.replace('border-', 'border-')
            )}>
                {/* Background gradient */}
                <div className={cn("absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10", cc.bg)} />

                {/* Header */}
                <div className="flex items-center gap-5 mb-8 relative z-10">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500", cc.bg, cc.border, cc.text)}>
                        {React.createElement(steps[subStep - 1].icon, { size: 28, strokeWidth: 2.5 })}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                            {steps[subStep - 1].title}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                            {t('evaluation_label') || 'Évaluation'} • {t('step_indicator') || 'Étape'} {subStep}/{totalSteps}
                        </p>
                    </div>
                </div>

                {/* ÉTAPE 1: MODE DE CRÉATION */}
                {subStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
                        <button
                            onClick={() => {
                                setCreationMode('ai');
                                setCoachPreferences({ ...coachPreferences, reportType: 'pure-ai' });
                            }}
                            className={cn(
                                "group relative p-8 rounded-[24px] border-2 text-left transition-all overflow-hidden h-full flex flex-col justify-between min-h-[280px]",
                                creationMode === 'ai' ? "bg-emerald-500/10 border-emerald-500 shadow-2xl shadow-emerald-500/10" : "bg-slate-950/40 border-slate-800 hover:border-emerald-500/30"
                            )}
                        >
                            <div className="relative z-10">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500", creationMode === 'ai' ? "bg-emerald-500 text-slate-950 scale-110" : "bg-slate-900 text-slate-500 group-hover:text-emerald-400")}>
                                    <BrainCircuit size={32} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 leading-none">
                                    {t('architect_ai_title') || 'GÉNÉRATEUR I.A.'}
                                </h4>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                    {t('architect_ai_desc') || "L'IA construit une base optimisée selon votre profil complet."}
                                </p>
                            </div>
                            <div className={cn("flex items-center gap-3 font-black uppercase text-xs tracking-widest transition-colors", creationMode === 'ai' ? "text-emerald-400" : "text-slate-500")}>
                                {creationMode === 'ai' && <CheckCircle2 size={18} className="text-emerald-500" />}
                                <span>{creationMode === 'ai' ? t('selected') || 'Sélectionné' : t('select_label') || 'Sélectionner'}</span>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                setCreationMode('manual');
                                setCoachPreferences({ ...coachPreferences, reportType: 'manual' });
                            }}
                            className={cn(
                                "group relative p-8 rounded-[24px] border-2 text-left transition-all overflow-hidden h-full flex flex-col justify-between min-h-[280px]",
                                creationMode === 'manual' ? "bg-indigo-500/10 border-indigo-500 shadow-2xl shadow-indigo-500/10" : "bg-slate-950/40 border-slate-800 hover:border-indigo-500/30"
                            )}
                        >
                            <div className="relative z-10">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500", creationMode === 'manual' ? "bg-indigo-500 text-slate-950 scale-110" : "bg-slate-900 text-slate-500 group-hover:text-indigo-400")}>
                                    <Zap size={32} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 leading-none">
                                    {t('architect_manual_title') || 'STUDIO EXPERT'}
                                </h4>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                    {t('architect_manual_desc') || "Construisez le plan de A à Z avec une précision chirurgicale."}
                                </p>
                            </div>
                            <div className={cn("flex items-center gap-3 font-black uppercase text-xs tracking-widest transition-colors", creationMode === 'manual' ? "text-indigo-400" : "text-slate-500")}>
                                {creationMode === 'manual' && <CheckCircle2 size={18} className="text-indigo-500" />}
                                <span>{creationMode === 'manual' ? t('selected') || 'Sélectionné' : t('select_label') || 'Sélectionner'}</span>
                            </div>
                        </button>
                    </div>
                )}

                {/* ÉTAPE 2: PROFIL ATHLÈTE (Biométrie + Santé fusionnés) */}
                {subStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Biométrie */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('gender_label')}</label>
                                <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                    {['male', 'female'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setBiometrics({ ...biometrics, gender: g as 'male' | 'female' })}
                                            className={cn(
                                                "flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all",
                                                biometrics.gender === g ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20" : "text-slate-500 hover:text-white"
                                            )}
                                        >
                                            {t(`gender_${g}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('age_label')}</label>
                                <input type="number" value={biometrics.age} onChange={e => setBiometrics({ ...biometrics, age: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:border-sky-500 outline-none transition-all" placeholder="30" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('weight_label')} (kg)</label>
                                <input type="number" value={biometrics.weight} onChange={e => setBiometrics({ ...biometrics, weight: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:border-sky-500 outline-none transition-all" placeholder="70" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('height_label')} (cm)</label>
                                <input type="number" value={biometrics.height} onChange={e => setBiometrics({ ...biometrics, height: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:border-sky-500 outline-none transition-all" placeholder="180" />
                            </div>
                        </div>

                        {/* Santé - intégré */}
                        <div className="pt-6 border-t border-slate-800/50">
                            <div className="flex items-center gap-3 mb-6">
                                <Heart size={18} className="text-rose-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('health_section') || 'État de Santé'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="h-4 flex items-center">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_sleep_quality')}</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['excellent', 'good', 'average', 'poor'].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setHealthRecovery(prev => ({ ...prev, sleepQuality: s }))}
                                                className={cn(
                                                    "relative z-30 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all cursor-pointer",
                                                    healthRecovery.sleepQuality === s
                                                        ? "bg-sky-500 border-sky-400 text-slate-950 shadow-lg shadow-sky-500/20"
                                                        : "bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700"
                                                )}
                                            >
                                                {t(`anamnesis_sleep_${s}`) || s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 flex items-center gap-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('hrv_status_label') || 'Statut HRV'}</label>
                                        <InfoTooltip content={t('info_hrv_status')} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['stable', 'high', 'low', 'unknown'].map(h => (
                                            <button
                                                key={h}
                                                type="button"
                                                onClick={() => setHealthRecovery(prev => ({ ...prev, hrvStatus: h }))}
                                                className={cn(
                                                    "relative z-30 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all cursor-pointer",
                                                    healthRecovery.hrvStatus === h
                                                        ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                                                        : "bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700"
                                                )}
                                            >
                                                {t(`hrv_${h}`) || h}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_injuries')}</label>
                                <textarea
                                    value={healthRecovery.injuries}
                                    onChange={(e) => setHealthRecovery({ ...healthRecovery, injuries: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-sky-500 outline-none h-20 resize-none transition-all"
                                    placeholder={t('medical_placeholder') || 'Renseignez blessures passées ou actuelles...'}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 3: OBJECTIFS & SPORT */}
                {subStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_primary_sport')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Running', 'Cycling', 'Triathlon', 'Trail Running', 'Fitness', 'Autre'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSportObjectives({ ...sportObjectives, primarySport: s })}
                                            className={cn(
                                                "py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all",
                                                sportObjectives.primarySport === s ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-slate-950/50 border-slate-800 text-slate-500 hover:text-white"
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
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none"
                                        placeholder={t('specify_sport') || 'Préciser le sport...'}
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_level')}</label>
                                <div className="space-y-2">
                                    {['beginner', 'intermediate', 'advanced', 'elite'].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => setSportObjectives({ ...sportObjectives, level: lvl })}
                                            className={cn(
                                                "w-full text-left px-5 py-3 rounded-xl border-2 transition-all flex items-center justify-between group",
                                                sportObjectives.level === lvl ? "bg-amber-500/10 border-amber-500" : "bg-slate-950/50 border-slate-800"
                                            )}
                                        >
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", sportObjectives.level === lvl ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300")}>
                                                {t(`anamnesis_level_${lvl}`) || lvl}
                                            </span>
                                            {sportObjectives.level === lvl && <CheckCircle2 size={16} className="text-amber-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('cross_training_label') || 'Sports Croisés / Complémentaires'}</label>
                            <div className="flex flex-wrap gap-2">
                                {['Natation', 'Vélo', 'Yoga', 'Renforcement', 'Marche', 'Pilates', 'Boxe', 'Escalade', 'Ski', 'Autre'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleCrossTraining(s)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all",
                                            sportObjectives.crossTraining.includes(s) ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                        )}
                                    >
                                        {t(`cross_${s.toLowerCase()}`) || s}
                                    </button>
                                ))}
                            </div>
                            {sportObjectives.crossTraining.includes('Autre') && (
                                <input
                                    type="text"
                                    value={sportObjectives.otherCrossTraining}
                                    onChange={e => setSportObjectives({ ...sportObjectives, otherCrossTraining: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none mt-3"
                                    placeholder={t('specify_cross') || 'Préciser les sports croisés...'}
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_target_event')}</label>
                            <div className="relative">
                                <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                                <input type="text" value={sportObjectives.targetEvent} onChange={e => setSportObjectives({ ...sportObjectives, targetEvent: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white font-medium focus:border-amber-500 outline-none transition-all placeholder:text-slate-700" placeholder="Ex: Marathon de Paris, Ironman..." />
                            </div>
                        </div>
                    </div>
                )
                }

                {/* ÉTAPE 4: PLANNING & PÉRIODISATION */}
                {
                    subStep === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Jours disponibles */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    {t('anamnesis_available_days') || 'Jours Disponibles'}
                                    <InfoTooltip content={t('info_time')} />
                                </label>
                                <div className="grid grid-cols-7 gap-2">
                                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(slug => (
                                        <button
                                            key={slug}
                                            onClick={() => toggleDay(slug)}
                                            className={cn(
                                                "aspect-square rounded-xl text-[9px] font-black uppercase border-2 transition-all flex flex-col items-center justify-center gap-1 p-2",
                                                availability.days.includes(slug)
                                                    ? "bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20"
                                                    : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"
                                            )}
                                        >
                                            <span className="leading-tight text-center">{t(`day_${slug}`) || slug}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Temps par jour */}
                            {availability.days.length > 0 && (
                                <div className="space-y-4 p-4 bg-slate-950/30 rounded-xl border border-slate-800/50">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_time_per_day') || 'Minutes par jour'}</label>
                                    <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                                        {availability.days.map(d => (
                                            <div key={d} className="space-y-2">
                                                <span className="text-[9px] font-black text-slate-500 uppercase block text-center">{t(`day_${d}`) || d}</span>
                                                <input
                                                    type="number"
                                                    value={availability.timePerDay[d] || ''}
                                                    onChange={e => setDayTime(d, e.target.value)}
                                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-2 py-3 text-white font-bold focus:border-violet-500 outline-none text-xs text-center transition-all"
                                                    placeholder="60"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Périodisation */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/50">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('deadline_type_label') || 'Unité d\'Horizon'}</label>
                                    <select
                                        value={periodization.deadlineType}
                                        onChange={e => setPeriodization({ ...periodization, deadlineType: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-bold uppercase outline-none focus:border-violet-500 text-sm transition-all"
                                    >
                                        <option value="months">{t('months') || 'Mois'}</option>
                                        <option value="weeks">{t('weeks') || 'Semaines'}</option>
                                        <option value="days">{t('days') || 'Jours'}</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('deadline_value_label') || 'Horizon Temporel'}</label>
                                    <input
                                        type="number"
                                        value={periodization.deadlineValue}
                                        onChange={e => setPeriodization({ ...periodization, deadlineValue: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-bold focus:border-violet-500 outline-none text-sm transition-all"
                                        placeholder="4"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('preferred_time_label') || 'Moment Préféré'}</label>
                                    <select
                                        value={availability.preferredTime}
                                        onChange={e => setAvailability({ ...availability, preferredTime: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-bold uppercase outline-none focus:border-violet-500 text-sm transition-all"
                                    >
                                        <option value="morning">{t('time_morning') || 'Matin'}</option>
                                        <option value="noon">{t('time_noon') || 'Midi'}</option>
                                        <option value="afternoon">{t('time_afternoon') || 'Après-midi'}</option>
                                        <option value="evening">{t('time_evening') || 'Soir'}</option>
                                        <option value="night">{t('time_night') || 'Nuit'}</option>
                                        <option value="flexible">{t('time_flexible') || 'Flexible'}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Intensité et Charge */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('intensity_label') || 'Intensité'}</label>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'progressive', title: t('periodization_progressive') || 'Progressive' },
                                            { id: 'intensive', title: t('periodization_intensive') || 'Intensive' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setPeriodization({ ...periodization, intensity: opt.id })}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between",
                                                    periodization.intensity === opt.id ? "bg-violet-500/10 border-violet-500 text-violet-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                                )}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{opt.title}</span>
                                                {periodization.intensity === opt.id && <CheckCircle2 size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('load_preference_label') || 'Charge'}</label>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'balanced', title: t('preference_sustainable') || 'Équilibrée' },
                                            { id: 'aggressive', title: t('preference_aggressive') || 'Agressive' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setPeriodization({ ...periodization, loadPreference: opt.id })}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between",
                                                    periodization.loadPreference === opt.id ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                                )}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{opt.title}</span>
                                                {periodization.loadPreference === opt.id && <CheckCircle2 size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* ÉTAPE 5: ENVIRONNEMENT & PRÉFÉRENCES */}
                {
                    subStep === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Équipement */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('anamnesis_equipment_list') || 'Équipement Disponible'}</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'watch', label: `⌚ ${t('eq_watch')}` },
                                        { id: 'cardio', label: `❤️ ${t('eq_cardio')}` },
                                        { id: 'hometrainer', label: `🚴 ${t('eq_hometrainer')}` },
                                        { id: 'dumbbells', label: `🏋️ ${t('eq_dumbbells')}` },
                                        { id: 'kettlebells', label: `💪 ${t('eq_kettlebells')}` },
                                        { id: 'gym', label: `🏢 ${t('eq_gym')}` },
                                        { id: 'yoga', label: `🧘 ${t('eq_yoga')}` },
                                        { id: 'pullup', label: `💪 ${t('eq_pullup')}` },
                                        { id: 'bands', label: `🎗️ ${t('eq_bands')}` },
                                        { id: 'bike', label: `🚲 ${t('eq_bike')}` },
                                        { id: 'pool', label: `🏊 ${t('eq_pool')}` },
                                        { id: 'track', label: `🏃 ${t('eq_track')}` },
                                        { id: 'other', label: `➕ ${t('eq_other')}` }
                                    ].map(eq => (
                                        <button
                                            key={eq.id}
                                            type="button"
                                            onClick={() => toggleEquipment(eq.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all cursor-pointer relative z-40",
                                                equipment.available.includes(eq.id) ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-slate-950/50 border-slate-800 text-slate-500 hover:text-white"
                                            )}
                                        >
                                            {eq.label}
                                        </button>
                                    ))}
                                </div>
                                {equipment.available.includes('other') && (
                                    <input
                                        type="text"
                                        value={equipment.otherEquipment}
                                        onChange={e => setEquipment({ ...equipment, otherEquipment: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 outline-none mt-3"
                                        placeholder={t('specify_eq')}
                                    />
                                )}
                            </div>

                            {/* Récupération */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('recovery_preferences_label') || 'Méthodes de Récupération'}</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'sauna', label: t('rec_sauna') },
                                        { id: 'cryo', label: t('rec_cryo') },
                                        { id: 'compression', label: t('rec_compression') },
                                        { id: 'massage', label: t('rec_massage') },
                                        { id: 'meditation', label: t('rec_meditation') },
                                        { id: 'other', label: t('rec_other') }
                                    ].map(r => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => toggleRecovery(r.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all cursor-pointer relative z-40",
                                                healthRecovery.recoveryPreferences.includes(r.id) ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-950/50 border-slate-800 text-slate-500"
                                            )}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                                {healthRecovery.recoveryPreferences.includes('other') && (
                                    <input
                                        type="text"
                                        value={healthRecovery.otherRecovery}
                                        onChange={e => setHealthRecovery({ ...healthRecovery, otherRecovery: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none mt-3"
                                        placeholder={t('specify_recovery')}
                                    />
                                )}
                            </div>

                            {/* Style Coach (si mode AI) */}
                            {creationMode === 'ai' && (
                                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('coach_style_label')}</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[
                                            { id: 'Directif et Scientifique', title: t('coach_style_authoritarian') || 'Directif', desc: t('coach_style_authoritarian_desc') || 'Ordres clairs, méthodologie stricte' },
                                            { id: 'Collaboratif et Encourageant', title: t('coach_style_collaborative') || 'Collaboratif', desc: t('coach_style_collaborative_desc') || 'Partage, empathie, motivation' },
                                            { id: 'Éducatif et Pédagogue', title: t('coach_style_educational') || 'Éducatif', desc: t('coach_style_educational_desc') || 'Explications détaillées' }
                                        ].map(style => (
                                            <div
                                                key={style.id}
                                                onClick={() => setCoachPreferences({ ...coachPreferences, coachStyle: style.id })}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-950/50 group",
                                                    coachPreferences.coachStyle === style.id ? "bg-rose-500/10 border-rose-500" : "bg-slate-950/50 border-slate-800"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={cn("font-black uppercase text-xs", coachPreferences.coachStyle === style.id ? "text-rose-400" : "text-slate-400")}>{style.title}</span>
                                                    {coachPreferences.coachStyle === style.id && <CheckCircle2 size={14} className="text-rose-500" />}
                                                </div>
                                                <p className="text-[10px] text-slate-500 leading-relaxed">{style.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >

            {/* Navigation - style harmonisé */}
            <div className="flex justify-between items-center pt-6">
                <button
                    onClick={handleBack}
                    className="group flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-white transition-all px-6 py-4 rounded-xl bg-slate-950/30 border border-slate-800"
                >
                    <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    {subStep > 1 ? t('back') : t('anamnesis_back_selection')}
                </button>
                <button
                    onClick={handleNext}
                    className={cn(
                        "group bg-gradient-to-r text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl hover:scale-[1.02]",
                        cc.gradient,
                        cc.shadow
                    )}
                >
                    {subStep < totalSteps ? t('next') : (creationMode === 'ai' ? t('generate_plan') : t('finish'))}
                    <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
