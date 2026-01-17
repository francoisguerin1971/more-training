import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { Activity, Target, Zap, Waves, Bike } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface StepAthleticProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: any;
}

const SPORTS = [
    { id: 'running', label: 'Running', icon: Activity, color: 'text-emerald-400' },
    { id: 'cycling', label: 'Cycling', icon: Bike, color: 'text-indigo-400' },
    { id: 'swimming', label: 'Swimming', icon: Waves, color: 'text-blue-400' },
    { id: 'triathlon', label: 'Triathlon', icon: Zap, color: 'text-amber-400' },
];

const LEVELS = ['beginner', 'intermediate', 'advanced', 'elite'];

export function StepAthletic({ formData, setFormData, errors }: StepAthleticProps) {
    const { t } = useLanguage();

    const handleSportSelect = (id: string) => {
        setFormData((prev: any) => ({ ...prev, primarySport: id }));
    };

    const handleLevelSelect = (level: string) => {
        setFormData((prev: any) => ({ ...prev, level }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('primary_sport_label')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SPORTS.map((sport) => (
                        <button
                            key={sport.id}
                            type="button"
                            onClick={() => handleSportSelect(sport.id)}
                            className={cn(
                                "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all duration-300",
                                formData.primarySport === sport.id
                                    ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/5"
                                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            <sport.icon size={24} className={formData.primarySport === sport.id ? sport.color : "text-slate-500"} />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", formData.primarySport === sport.id ? "text-white" : "text-slate-500")}>
                                {sport.label}
                            </span>
                        </button>
                    ))}
                </div>
                {errors.primarySport && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.primarySport}</p>}
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('current_level_label')}
                </label>
                <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
                    {LEVELS.map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => handleLevelSelect(level)}
                            className={cn(
                                "flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                formData.level === level
                                    ? "bg-emerald-500 text-slate-950 shadow-lg"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            {t(`level_${level}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('main_goal_label')}
                </label>
                <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        name="goalDetail"
                        value={formData.goalDetail}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, goalDetail: e.target.value }))}
                        placeholder="e.g. Sub 3h Marathon, IronMan Finisher..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                    />
                </div>
            </div>
        </div>
    );
}
