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
    const [isListening, setIsListening] = React.useState(false);
    const [showOtherSpecialty, setShowOtherSpecialty] = React.useState(false);
    const [otherSpecialty, setOtherSpecialty] = React.useState('');
    const [showOtherLanguage, setShowOtherLanguage] = React.useState(false);
    const [otherLanguage, setOtherLanguage] = React.useState('');

    const toggleSpecialty = (specialty: string) => {
        const current = formData.specialties || [];
        const next = current.includes(specialty)
            ? current.filter((s: string) => s !== specialty)
            : [...current, specialty];
        setFormData((prev: any) => ({ ...prev, specialties: next }));
    };

    const addCustomSpecialty = () => {
        if (!otherSpecialty.trim()) return;
        const current = formData.specialties || [];
        if (!current.includes(otherSpecialty.trim())) {
            setFormData((prev: any) => ({ ...prev, specialties: [...current, otherSpecialty.trim()] }));
        }
        setOtherSpecialty('');
        setShowOtherSpecialty(false);
    };

    const toggleLanguage = (langCode: string) => {
        const current = formData.coachingLanguages || [];
        const next = current.includes(langCode)
            ? current.filter((l: string) => l !== langCode)
            : [...current, langCode];
        setFormData((prev: any) => ({ ...prev, coachingLanguages: next }));
    };

    const addCustomLanguage = () => {
        if (!otherLanguage.trim()) return;
        const current = formData.coachingLanguages || [];
        if (!current.includes(otherLanguage.trim())) {
            setFormData((prev: any) => ({ ...prev, coachingLanguages: [...current, otherLanguage.trim()] }));
        }
        setOtherLanguage('');
        setShowOtherLanguage(false);
    };

    const handleGenerateBio = async () => {
        const input = aiInput || formData.bio;
        if (!input) return;
        setIsGenerating(true);
        try {
            // Simulated AI Generation - in a real app this would call an API
            await new Promise(resolve => setTimeout(resolve, 1500));

            const specialties = formData.specialties?.length > 0
                ? formData.specialties.join(', ')
                : 'sport de haut niveau';

            const drafts = [
                `Coach expert spécialisé en ${specialties}. Mon approche est centrée sur ${input}. J'aide mes athlètes à repousser leurs limites avec un accompagnement personnalisé et scientifique.`,
                `Spécialiste de la performance en ${specialties}, j'intègre ${input} au cœur de ma méthode pour garantir des résultats durables et une progression constante.`,
                `Ma philosophie de coaching en ${specialties} repose sur ${input}. Je m'engage à fournir un cadre structuré et motivant pour chaque athlète.`
            ];

            const generatedBio = drafts[Math.floor(Math.random() * drafts.length)];
            setFormData((prev: any) => ({ ...prev, bio: generatedBio }));
            setAiInput('');
        } catch (err) {
            console.error('AI Bio Generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setAiInput(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.start();
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

                    {/* Display custom specialties already added */}
                    {formData.specialties?.filter((s: string) => !SPECIALTIES.includes(s)).map((s: string) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => toggleSpecialty(s)}
                            className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        >
                            {s}
                        </button>
                    ))}

                    {showOtherSpecialty ? (
                        <div className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={otherSpecialty}
                                onChange={(e) => setOtherSpecialty(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCustomSpecialty()}
                                placeholder={t('expertise_placeholder')}
                                className="bg-slate-900 border border-indigo-500/50 rounded-xl px-4 py-2 text-[10px] font-bold text-white w-48 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={addCustomSpecialty}
                                className="p-2 bg-indigo-500 text-white rounded-xl"
                            >
                                <Check size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowOtherSpecialty(true)}
                            className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900/50 border border-dashed border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                        >
                            + {t('sport_other')}
                        </button>
                    )}
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
                        <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-tight">{t('ai_assisted')}</span>
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
                            <Mic className={cn(
                                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                                isListening ? "text-rose-500 animate-pulse" : "text-slate-500"
                            )} size={16} />
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerateBio()}
                                placeholder={t('bio_ai_describe')}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-12 py-3 text-xs text-white placeholder:text-slate-600 focus:border-amber-500/50 transition-all"
                            />
                            <button
                                type="button"
                                onClick={startListening}
                                className={cn(
                                    "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all",
                                    isListening ? "bg-rose-500/20 text-rose-500" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <Mic size={14} />
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleGenerateBio}
                            disabled={isGenerating || (!aiInput && !formData.bio)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center min-w-[44px] border border-amber-500/20 shadow-lg shadow-amber-500/5"
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

                        {/* Display custom languages */}
                        {formData.coachingLanguages?.filter((l: string) => !APP_LANGUAGES.find(al => al.code === l)).map((l: string) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => toggleLanguage(l)}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl border bg-indigo-500/10 border-indigo-500/50 text-indigo-400 text-[10px] font-bold uppercase tracking-tight"
                            >
                                {l}
                                <Check size={12} />
                            </button>
                        ))}

                        {showOtherLanguage ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    value={otherLanguage}
                                    onChange={(e) => setOtherLanguage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomLanguage()}
                                    placeholder={t('languages_label')}
                                    className="bg-slate-900 border border-indigo-500/50 rounded-xl px-4 py-2 text-[10px] font-bold text-white w-full focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={addCustomLanguage}
                                    className="p-2 bg-indigo-500 text-white rounded-xl"
                                >
                                    <Check size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowOtherLanguage(true)}
                                className="px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900/50 border border-dashed border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                            >
                                + {t('other')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Award size={14} className="text-emerald-400" />
                        {t('certifications')}
                    </label>
                    <div className="relative">
                        <textarea
                            placeholder={t('certifications_placeholder')}
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
