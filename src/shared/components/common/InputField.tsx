import React from 'react';
import { cn } from '@/shared/lib/utils';

export function InputField({ label, icon: Icon, value, onChange, type = "text", error, placeholder, helpText, className, rightIcon: RightIcon, onRightIconClick }) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    {label}
                </label>
            )}
            <div className={cn(
                "relative flex items-center bg-slate-900/50 border-2 rounded-2xl transition-all duration-300",
                error ? "border-red-500/50" : "border-slate-800 focus-within:border-emerald-500/50"
            )}>
                {Icon && (
                    <div className="pl-4 pr-2 text-slate-500 border-r border-slate-800">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full bg-transparent p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 rounded-2xl",
                        !Icon && "pl-4",
                        RightIcon && "pr-12"
                    )}
                />
                {RightIcon && (
                    <button
                        type="button"
                        onClick={onRightIconClick}
                        className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <RightIcon size={18} />
                    </button>
                )}
            </div>
            {error && typeof error === 'string' && (
                <p className="text-[9px] text-red-400 font-bold uppercase tracking-tighter ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
            {helpText && !error && (
                <p className="text-[8px] text-slate-500 font-medium ml-1">
                    {helpText}
                </p>
            )}
        </div>
    );
}
