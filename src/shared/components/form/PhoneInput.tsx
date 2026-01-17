import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function PhoneInput({ value, onChange, error, label, placeholder }) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    {label}
                </label>
            )}
            <div className={cn(
                "relative flex items-center bg-slate-900/50 border-2 rounded-2xl transition-all duration-300",
                error ? "border-red-500/50" : "border-slate-800 focus-within:border-emerald-500/50"
            )}>
                <div className="pl-4 pr-2 text-slate-500 border-r border-slate-800">
                    <Phone size={18} />
                </div>
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent p-4 text-white placeholder:text-slate-600 focus:outline-none"
                />
            </div>
            {error && <span className="text-[10px] text-red-400 ml-1 font-bold italic">{error}</span>}
        </div>
    );
}
