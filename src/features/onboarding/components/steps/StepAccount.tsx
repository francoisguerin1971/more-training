import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { Mail, Lock, Phone, UserCircle } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface StepAccountProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: any;
}

export function StepAccount({ formData, setFormData, errors }: StepAccountProps) {
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('email_label')}
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="athlete@example.com"
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                                errors.email ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                            )}
                        />
                    </div>
                    {errors.email && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('phone_label')}
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+33 6 12 34 56 78"
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                                errors.phone ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                            )}
                        />
                    </div>
                    {errors.phone && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('password_label')}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                                errors.password ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                            )}
                        />
                    </div>
                    {errors.password && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('confirm_password_label')}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                                errors.confirmPassword ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                            )}
                        />
                    </div>
                    {errors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.confirmPassword}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('account_type')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData((prev: any) => ({ ...prev, role: 'athlete' }))}
                        className={cn(
                            "flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all duration-300",
                            formData.role === 'athlete'
                                ? "bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/10"
                                : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                        )}
                    >
                        <UserCircle size={32} className={formData.role === 'athlete' ? "text-emerald-400" : "text-slate-500"} />
                        <div className="text-center">
                            <p className={cn("text-sm font-black uppercase tracking-tight", formData.role === 'athlete' ? "text-white" : "text-slate-500")}>
                                {t('role_athlete')}
                            </p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Ready to Moov</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFormData((prev: any) => ({ ...prev, role: 'pro' }))}
                        className={cn(
                            "flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all duration-300",
                            formData.role === 'pro'
                                ? "bg-indigo-500/10 border-indigo-500 shadow-xl shadow-indigo-500/10"
                                : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                        )}
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-slate-950 font-black text-xs">P</div>
                        <div className="text-center">
                            <p className={cn("text-sm font-black uppercase tracking-tight", formData.role === 'pro' ? "text-white" : "text-slate-500")}>
                                {t('role_pro')}
                            </p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Elite Architect</p>
                        </div>
                    </button>
                </div>
            </div>
            {errors.auth && <p className="text-center text-xs text-rose-500 font-bold uppercase p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">{errors.auth}</p>}
        </div>
    );
}
