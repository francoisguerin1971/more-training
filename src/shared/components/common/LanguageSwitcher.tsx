import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'ca', label: 'Català' },
    { code: 'it', label: 'Italiano' },
    { code: 'de', label: 'Deutsch' }
];

export function LanguageSwitcher({ variant = 'default' }) {
    const { language, setLanguage } = useLanguage();

    const isCompact = variant === 'compact';

    return (
        <div className={cn(
            "flex items-center gap-1",
            variant === 'sidebar' ? "flex-col w-full" : "flex-row"
        )}>
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                        "transition-all duration-300 flex items-center justify-center",
                        language === lang.code
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                            : "text-slate-500 hover:text-white border border-transparent hover:bg-white/5",
                        variant === 'sidebar'
                            ? "w-full py-3 rounded-xl gap-3 px-4 justify-start"
                            : isCompact
                                ? "w-10 h-10 rounded-xl text-[10px] font-black"
                                : "px-4 py-2 rounded-2xl text-[10px] font-black gap-2"
                    )}
                    title={lang.label}
                >
                    <span className="uppercase tracking-widest">{lang.code}</span>
                    {(variant === 'sidebar' || (!isCompact && variant !== 'default')) && (
                        <span className="text-[10px] font-medium opacity-60 ml-1">{lang.label}</span>
                    )}
                </button>
            ))}
        </div>
    );
}
