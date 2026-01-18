import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { BrainCircuit, Award, Languages, BookText, Sparkles, Mic, Loader2, Check } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface StepProExpertiseProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: any;
}

const SPECIALTIES = ['Running', 'Cycling', 'Triathlon', 'Swimming', 'Strength', 'Nutrition', 'Mental'];
const APP_LANGUAGES = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ca', label: 'Català' },
];

export function StepProExpertise({ formData, setFormData, errors }: StepProExpertiseProps) {
    const { t } = useLanguage();
    const [aiInput, setAiInput] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);

    const toggleSpecialty = (specialty: string) => {
        const current = formData.specialties || [];
        const next = current.includes(specialty)
            ? current.filter((s: string) => s !== specialty)
            : [...current, specialty];
        setFormData((prev: any) => ({ ...prev, specialties: next }));
    };

    const toggleLanguage = (langCode: string) => {
        const current = formData.coachingLanguages || [];
        const next = current.includes(langCode)
            ? current.filter((l: string) => l !== langCode)
            : [...current, langCode];
        setFormData((prev: any) => ({ ...prev, coachingLanguages: next }));
    };

    const handleGenerateBio = async () => {
        if (!aiInput) return;
        setIsGenerating(true);
        try {
            // Simulated AI Generation - in a real app this would call an API
            await new Promise(resolve => setTimeout(resolve, 2000));
            const generatedBio = `Coach passionné spécialisé en ${formData.specialties?.join(', ') || 'sport'}. Mon approche est basée sur ${aiInput}. J'accompagne mes athlètes avec rigueur et bienveillance pour les aider à atteindre leurs objectifs de performance et de santé.`;
            setFormData((prev: any) => ({ ...prev, bio: generatedBio }));
            setAiInput('');
        } catch (err) {
            console.error('AI Bio Generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Specialties */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center">
                    {t('specialties_label')}
                    <span className="text-rose-500 ml-1">*</span>
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

            {/* Bio with AI */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                        {t('bio_label')}
                        <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-tight">AI Assisted</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <BookText className="absolute left-4 top-4 text-slate-500" size={18} />
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
                            placeholder={t('bio_placeholder')}
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium h-32 resize-none",
                                errors.bio ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
                            )}
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mic className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder={t('bio_ai_describe')}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-600 focus:border-amber-500/50 transition-all"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleGenerateBio}
                            disabled={isGenerating || !aiInput}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center min-w-[44px]"
                        >
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        </button>
                    </div>
                </div>
                {errors.bio && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.bio}</p>}
            </div>

            {/* Languages and Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-800/50">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Languages size={14} className="text-indigo-400" />
                        {t('coaching_languages')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {APP_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => toggleLanguage(lang.code)}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-tight",
                                    formData.coachingLanguages?.includes(lang.code)
                                        ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400"
                                        : "bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700"
                                )}
                            >
                                {lang.label}
                                {formData.coachingLanguages?.includes(lang.code) && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Award size={14} className="text-emerald-400" />
                        {t('certifications')}
                    </label>
                    <div className="relative">
                        <textarea
                            placeholder="Add your certifications (one per line)"
                            value={formData.certifications?.join('\n')}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, certifications: e.target.value.split('\n').filter(s => s.trim()) }))}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium h-32 resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
