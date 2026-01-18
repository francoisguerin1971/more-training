import React from 'react';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { cn } from '@/core/utils/cn';

// Ensure the styles are available
import './PhoneInput.css';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    country?: string;
}

export function PhoneInput({
    value,
    onChange,
    error,
    label,
    placeholder,
    required,
    className,
    country = 'fr'
}: PhoneInputProps) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center">
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}
            <div className="phone-input-container">
                <ReactPhoneInput
                    country={country}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    containerClass="w-full"
                    inputClass={cn(
                        "w-full !bg-slate-950/50 !border !rounded-2xl !pl-16 !pr-4 !py-7 !text-white focus:!outline-none transition-all !font-medium !h-auto",
                        error ? "!border-rose-500/50 focus:!border-rose-500" : "!border-slate-800 focus:!border-emerald-500"
                    )}
                    buttonClass="!bg-transparent !border-none !rounded-l-2xl !pl-4"
                    dropdownClass="!bg-slate-900 !text-white !border-slate-800"
                />
            </div>
            {error && <span className="text-[10px] text-rose-500 ml-2 font-bold uppercase">{error}</span>}
        </div>
    );
}
