import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    Users, Trophy, Calendar, Zap, Layout, ArrowRight,
    BrainCircuit, MousePointer2
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';
import { AIPlanGenerator } from './AIPlanGenerator';
import { ManualPlanBuilder } from './ManualPlanBuilder';
import { useAuthStore } from '@/features/auth/stores/authStore';

import { PlanAnamnesis } from '@/features/planner/components/PlanAnamnesis';

export function TrainingPlanner() {
    const { t } = useLanguage();
    const { currentUser, getAthletesForCoach } = useAuthStore();

    // Core Wizard State
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    // 1: Selection, 2: Context/Profile, 3: Mode Choice, 4: Execution

    // Shared Data
    const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);

    // Detailed Context State
    const [fullContext, setFullContext] = useState<any>(null); // Stores the result of Anamnesis

    const [mode, setMode] = useState<'ai' | 'manual' | null>(null);

    // --- EXECUTION STEPS ---

    if (step === 4 && mode === 'ai') {
        return <AIPlanGenerator
            initialAthletes={selectedAthletes}
            initialContext={fullContext ? {
                primarySport: fullContext.sportObjectives.primarySport,
                targetEvent: fullContext.sportObjectives.targetEvent,
                startDate: fullContext.periodization.deadlineDate ? new Date(fullContext.periodization.deadlineDate).toISOString() : new Date().toISOString(),
                durationWeeks: parseInt(fullContext.periodization.deadlineValue),
                deadlineType: fullContext.periodization.deadlineType,
                intensity: fullContext.periodization.intensity,
                loadPreference: fullContext.periodization.loadPreference,
                startingLevel: fullContext.sportObjectives.level,
                availability: fullContext.availability
            } : undefined}
            onBack={() => setStep(3)}
        />;
    }

    if (step === 4 && mode === 'manual') {
        const manualContext = fullContext ? {
            primarySport: fullContext.sportObjectives.primarySport,
            targetEvent: fullContext.sportObjectives.targetEvent,
            startDate: fullContext.periodization.deadlineDate || new Date(),
            durationWeeks: parseInt(fullContext.periodization.deadlineValue),
            startingLevel: fullContext.sportObjectives.level,
            availability: fullContext.availability
        } : undefined;

        return <ManualPlanBuilder
            initialAthletes={selectedAthletes}
            initialContext={manualContext}
            onBack={() => setStep(3)}
        />;
    }

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                        PLANIFICATEUR
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
                        {step === 1 && "Étape 1: Qui entraîne-t-on ?"}
                        {step === 2 && "Étape 2: Quel est le contexte ?"}
                        {step === 3 && "Étape 3: Choix de l'Architecte"}
                    </p>
                </div>
            </div>

            {/* Steps Visualization */}
            <div className="flex gap-2">
                {[1, 2, 3].map(s => (
                    <div key={s} className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-500",
                        step >= s ? "bg-indigo-500" : "bg-slate-800"
                    )} />
                ))}
            </div>

            {/* STEP 1: ATHLETE SELECTION */}
            {step === 1 && (
                <AthleteSelectionStep
                    selected={selectedAthletes}
                    onSelect={setSelectedAthletes}
                    onNext={() => setStep(2)}
                />
            )}

            {/* STEP 2: FULL ANAMNESIS (Replaces simple ContextStep) */}
            {step === 2 && (
                <PlanAnamnesis
                    onBack={() => setStep(1)}
                    onComplete={(data) => {
                        setFullContext(data);
                        setStep(3);
                    }}
                    initialData={fullContext}
                />
            )}

            {/* STEP 3: MODE SELECTION */}
            {step === 3 && (
                <ModeSelectionStep
                    onSelectMode={(m) => { setMode(m); setStep(4); }}
                    onBack={() => setStep(2)}
                />
            )}
        </div>
    );
}

// --- SUB-COMPONENTS (Simplified for this file) ---

function AthleteSelectionStep({ selected, onSelect, onNext }: any) {
    const { currentUser, getAthletesForCoach, getAthleteStats } = useAuthStore();
    const [athletes, setAthletes] = React.useState<any[]>([]);

    React.useEffect(() => {
        const loadAthletes = async () => {
            // Define rich mocks for fallback or enrichment
            const demoMocks: Record<string, string> = {
                'Thomas Anderson': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
                'Sarah Connor': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
                'Bruce Wayne': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
                'Lara Croft': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop'
            };

            if (currentUser?.id) {
                const data = await getAthletesForCoach(currentUser.id);

                if (data && data.length > 0) {
                    // Enrich existing data with demo images if missing
                    const enriched = data.map((a: any) => ({
                        ...a,
                        avatar_url: a.avatar_url || demoMocks[a.name] || null
                    }));
                    setAthletes(enriched);
                } else {
                    // Fallback to pure mocks if DB is empty
                    const mocks = [
                        {
                            id: 'mock-neo',
                            name: 'Thomas Anderson',
                            avatar_url: demoMocks['Thomas Anderson'],
                            nextRaceName: "Save Zion",
                            profile: { coaching: 'Kung Fu', goal: 'Liberate Humanity', level: 'The One' }
                        },
                        {
                            id: 'mock-sarah',
                            name: 'Sarah Connor',
                            avatar_url: demoMocks['Sarah Connor'],
                            nextRaceName: "Judgment Day",
                            profile: { coaching: 'Survival', goal: 'Protect John', level: 'Elite' }
                        },
                        {
                            id: 'mock-bruce',
                            name: 'Bruce Wayne',
                            avatar_url: demoMocks['Bruce Wayne'],
                            nextRaceName: "Gotham Marathon",
                            profile: { coaching: 'Multisport', goal: 'Clean up Gotham', level: 'Vigilante' }
                        }
                    ];
                    setAthletes(mocks);
                }
            }
        };
        loadAthletes();
    }, [currentUser?.id]);

    const toggle = (id: string) => {
        onSelect((prev: string[]) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    const strategyFromProfile = (a: any) => {
        return null;
    }

    return (
        <div className="space-y-8 animate-in float-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {athletes.map(athlete => {
                    const isSelected = selected.includes(athlete.id);
                    return (
                        <div
                            key={athlete.id}
                            onClick={() => toggle(athlete.id)}
                            className={cn(
                                "group cursor-pointer relative p-6 rounded-3xl border-2 transition-all duration-300",
                                isSelected
                                    ? "bg-slate-900/80 border-emerald-500 shadow-2xl shadow-emerald-500/10"
                                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl transition-all overflow-hidden border border-slate-700",
                                        isSelected ? "border-emerald-500" : "bg-slate-800"
                                    )}>
                                        {athlete.avatar_url ? (
                                            <img src={athlete.avatar_url} alt={athlete.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className={isSelected ? "text-slate-950" : "text-slate-500"}>
                                                {athlete.avatar || athlete.name?.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className={cn("font-black uppercase text-lg transition-colors", isSelected ? "text-white" : "text-slate-400 group-hover:text-white")}>
                                            {athlete.name}
                                        </h3>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">En Forme</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {athlete.profile?.coaching || 'Running'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    isSelected ? "border-emerald-500 bg-emerald-500 text-slate-950" : "border-slate-700 bg-transparent"
                                )}>
                                    {isSelected && <ArrowRight size={14} strokeWidth={4} className="rotate-45" />}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800/50 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Trophy size={12} /> Objectif
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-white italic line-clamp-2">
                                    "{athlete.profile?.goal || athlete.nextRaceName || 'Préparation Générale'}"
                                </p>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 uppercase font-bold tracking-wider">
                                    ID: {athlete.id.substring(0, 8).toUpperCase()}
                                </span>
                                {athlete.profile?.level && (
                                    <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 uppercase font-bold tracking-wider ml-auto">
                                        {athlete.profile.level}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {athletes.length === 0 && (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                    <Users className="mx-auto text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest">No athletes found</p>
                </div>
            )}

            <div className="flex justify-end p-6 border-t border-slate-800 mt-8">
                <button
                    onClick={onNext}
                    disabled={selected.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-900/20"
                >
                    Continuer vers le Profil <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}

function ContextStep({ context, setContext, onBack, onNext }: any) {
    return (
        <div className="animate-in slide-in-from-right-8 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Performance Profile</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base line for the plan</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} /> Primary Sport
                            </label>
                            <select
                                value={context.primarySport}
                                onChange={(e) => setContext({ ...context, primarySport: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white font-bold uppercase outline-none focus:border-indigo-500 transition-all hover:bg-slate-900"
                            >
                                <option value="Running">Running</option>
                                <option value="Cycling">Cycling</option>
                                <option value="Triathlon">Triathlon</option>
                                <option value="Trail">Trail</option>
                                <option value="Swimming">Swimming</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> Start Date
                            </label>
                            <input
                                type="date"
                                value={context.startDate}
                                onChange={(e) => setContext({ ...context, startDate: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white font-bold uppercase outline-none focus:border-indigo-500 transition-all hover:bg-slate-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Trophy size={12} /> Target Event
                            </label>
                            <input
                                type="text"
                                value={context.targetEvent}
                                onChange={(e) => setContext({ ...context, targetEvent: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white font-bold placeholder:text-slate-700 outline-none focus:border-indigo-500 transition-all hover:bg-slate-900"
                                placeholder="e.g. Paris Marathon"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} /> Duration (Weeks)
                            </label>
                            <input
                                type="number"
                                min={1} max={52}
                                value={context.durationWeeks}
                                onChange={(e) => setContext({ ...context, durationWeeks: parseInt(e.target.value) })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white font-bold placeholder:text-slate-700 outline-none focus:border-indigo-500 transition-all hover:bg-slate-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <button onClick={onBack} className="text-slate-500 font-bold uppercase text-xs hover:text-white transition-colors px-4">
                    Retour
                </button>
                <button
                    onClick={onNext}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-900/20"
                >
                    Choisir le Mode <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}

function ModeSelectionStep({ onSelectMode, onBack }: { onSelectMode: (m: 'ai' | 'manual') => void; onBack: () => void }) {
    return (
        <div className="animate-in slide-in-from-right-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* AI Card */}
                <div
                    onClick={() => onSelectMode('ai')}
                    className="group relative p-8 bg-slate-900 border-2 border-slate-800 hover:border-emerald-500 rounded-[32px] cursor-pointer transition-all hover:bg-slate-900/80"
                >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                        <BrainCircuit size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Générateur I.A.</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Laissez l'intelligence artificielle construire une base optimisée en fonction de l'anamnèse complète. Idéal pour gagner du temps.
                    </p>
                    <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest">
                        Sélectionner <ArrowRight size={16} />
                    </div>
                </div>

                {/* Manual Card */}
                <div
                    onClick={() => onSelectMode('manual')}
                    className="group relative p-8 bg-slate-900 border-2 border-slate-800 hover:border-indigo-500 rounded-[32px] cursor-pointer transition-all hover:bg-slate-900/80"
                >
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                        <MousePointer2 size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Studio Expert</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Construisez le plan de A à Z avec une précision chirurgicale. Accès complet à la bibliothèque et au calendrier.
                    </p>
                    <div className="flex items-center gap-2 text-indigo-500 font-black uppercase text-xs tracking-widest">
                        Sélectionner <ArrowRight size={16} />
                    </div>
                </div>
            </div>
            <button onClick={onBack} className="text-slate-500 font-bold uppercase text-xs">Retour</button>
        </div>
    )
}
