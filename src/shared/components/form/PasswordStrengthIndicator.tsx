import React, { useMemo } from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/core/utils/cn';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const { t } = useLanguage();

    const requirements = useMemo(() => [
        { key: 'length', label: t('password_req_length'), met: password.length >= 8 },
        { key: 'upper', label: t('password_req_upper'), met: /[A-Z]/.test(password) },
        { key: 'lower', label: t('password_req_lower'), met: /[a-z]/.test(password) },
        { key: 'number', label: t('password_req_number'), met: /[0-9]/.test(password) },
        { key: 'special', label: t('password_req_special'), met: /[@$!%*?&]/.test(password) },
    ], [password, t]);

    const score = useMemo(() => {
        return requirements.filter(r => r.met).length;
    }, [requirements]);

    const strengthInfo = useMemo(() => {
        if (!password) return { label: '', color: 'bg-slate-800' };
        if (score <= 1) return { label: t('password_strength_too_weak'), color: 'bg-rose-500' };
        if (score <= 2) return { label: t('password_strength_weak'), color: 'bg-orange-500' };
        if (score <= 3) return { label: t('password_strength_fair'), color: 'bg-yellow-500' };
        if (score <= 4) return { label: t('password_strength_good'), color: 'bg-blue-500' };
        return { label: t('password_strength_strong'), color: 'bg-emerald-500' };
    }, [score, password, t]);

    return (
        <div className="space-y-4 mt-2 p-4 bg-slate-900/30 rounded-2xl border border-white/5 transition-all">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {t('status')}
                </span>
                <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                    strengthInfo.color.replace('bg-', 'text-')
                )}>
                    {strengthInfo.label}
                </span>
            </div>

            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={cn(
                            "h-1 px-4 flex-1 rounded-full transition-all duration-500",
                            score >= level ? strengthInfo.color : "bg-slate-800"
                        )}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {requirements.map((req) => (
                    <div key={req.key} className="flex items-center gap-2">
                        {req.met ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Check size={10} className="text-emerald-500" />
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                            </div>
                        )}
                        <span className={cn(
                            "text-[10px] font-medium tracking-wide transition-colors",
                            req.met ? "text-slate-300" : "text-slate-600"
                        )}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
