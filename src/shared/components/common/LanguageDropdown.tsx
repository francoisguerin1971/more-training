import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/core/utils/cn';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'ca', label: 'Català' },
    { code: 'it', label: 'Italiano' },
    { code: 'de', label: 'Deutsch' }
];

export function LanguageDropdown() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[2]; // Default to French

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLanguageChange = (code: string) => {
        setLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-all text-sm font-medium text-white"
            >
                <Globe size={16} className="text-slate-400" />
                <span className="uppercase font-bold text-xs">{currentLang.code}</span>
                <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                                "w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between",
                                language === lang.code
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <span>{lang.label}</span>
                            <span className="text-xs font-bold uppercase text-slate-500">{lang.code}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
