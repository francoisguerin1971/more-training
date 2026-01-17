import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { BrainCircuit, Award, Languages, BookText } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface StepProExpertiseProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: any;
}

const SPECIALTIES = ['Running', 'Cycling', 'Triathlon', 'Swimming', 'Strength', 'Nutrition', 'Mental'];

export function StepProExpertise({ formData, setFormData, errors }: StepProExpertiseProps) {
    const { t } = useLanguage();

    const toggleSpecialty = (specialty: string) => {
        const current = formData.specialties || [];
        const next = current.includes(specialty)
            ? current.filter((s: string) => s !== specialty)
            : [...current, specialty];
        setFormData((prev: any) => ({ ...prev, specialties: next }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('specialties_label')}
                </label>
                <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => toggleSpecialty(s)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                formData.specialties?.includes(s)
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                    : "bg-slate-950/50 border border-slate-800 text-slate-500 hover:text-white"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                {errors.specialties && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.specialties}</p>}
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('bio_label')}
                </label>
                <div className="relative">
                    <BookText className="absolute left-4 top-4 text-slate-500" size={18} />
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Describe your coaching philosophy and experience..."
                        className={cn(
                            "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium h-32 resize-none",
                            errors.bio ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
                        )}
                    />
                </div>
                {errors.bio && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.bio}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('coaching_languages')}
                    </label>
                    <div className="relative">
                        <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            name="coachingLanguages"
                            value={formData.coachingLanguages}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, coachingLanguages: e.target.value }))}
                            placeholder="Français, English, Espagnol"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('certifications')}
                    </label>
                    <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Add certification (comma separated)"
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, certifications: e.target.value.split(',').map(s => s.trim()) }))}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
