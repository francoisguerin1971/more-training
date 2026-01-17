import React, { useState } from 'react';
import { Shield, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLanguage } from '@/shared/context/LanguageContext';

export function ClubSelector({ value, onChange, label, placeholder }) {
    const { t } = useLanguage();
    const [isSearching, setIsSearching] = useState(false);
    const [search, setSearch] = useState(value);

    // Mock popular clubs for demo
    const POPULAR_CLUBS = [
        "Running Elite Barcelona",
        "Paris Triathlon Hub",
        "Madrid Cycling Academy",
        "London Athletics Club",
        "Berlin Fitness Pro"
    ];

    const filteredClubs = POPULAR_CLUBS.filter(c =>
        c.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <div className={cn(
                    "relative flex items-center bg-slate-900/50 border-2 rounded-2xl transition-all duration-300 border-slate-800",
                    isSearching ? "border-emerald-500/50 ring-4 ring-emerald-500/10" : ""
                )}>
                    <div className="pl-4 pr-2 text-slate-500">
                        <Shield size={18} />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onFocus={() => setIsSearching(true)}
                        onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            onChange(e.target.value);
                        }}
                        placeholder={placeholder}
                        className="w-full bg-transparent p-4 text-white placeholder:text-slate-600 focus:outline-none"
                    />
                </div>

                {isSearching && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <button
                            onMouseDown={() => {
                                setSearch(t('club_independent'));
                                onChange('independent');
                            }}
                            className="w-full p-4 text-left hover:bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-800 transition-colors"
                        >
                            + {t('club_independent')}
                        </button>
                        {filteredClubs.map((club, idx) => (
                            <button
                                key={idx}
                                onMouseDown={() => {
                                    setSearch(club);
                                    onChange(club);
                                }}
                                className="w-full p-4 text-left hover:bg-white/5 text-slate-300 text-sm transition-colors border-b border-slate-800/50 last:border-0"
                            >
                                {club}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
