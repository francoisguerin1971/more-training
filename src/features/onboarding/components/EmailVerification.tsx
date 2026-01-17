import React, { useState } from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { Card } from '@/shared/components/ui/Card';

interface EmailVerificationProps {
    email: string;
    onVerify: () => void;
    onBack: () => void;
}

export function EmailVerification({ email, onVerify, onBack }: EmailVerificationProps) {
    const { t } = useLanguage();
    const [isResending, setIsResending] = useState(false);

    const handleResend = () => {
        setIsResending(true);
        setTimeout(() => setIsResending(false), 2000);
    };

    return (
        <Card className="max-w-md w-full p-12 bg-slate-900/30 border-slate-800/50 backdrop-blur-xl rounded-[40px] shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto text-emerald-500 ring-8 ring-emerald-500/5">
                <Mail size={40} />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    {t('verify_your_email') || 'Check Your Inbox'}
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    {t('verification_link_sent_to') || 'We sent a verification link to'}
                </p>
                <p className="text-emerald-400 font-black text-sm">{email}</p>
            </div>

            <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50 text-left space-y-4">
                <div className="flex gap-4">
                    <ShieldCheck className="text-indigo-400 shrink-0" size={20} />
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        {t('verification_instruction') || 'Please click the link in the email to activate your account and start your elite training journey.'}
                    </p>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <button
                    onClick={onVerify}
                    className="w-full bg-emerald-500 text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest text-[12px] hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                >
                    {t('i_have_verified') || "I've Clicked the Link"} <ArrowRight size={18} />
                </button>

                <div className="flex items-center justify-between px-2">
                    <button
                        onClick={onBack}
                        className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                    >
                        <ChevronLeft size={14} /> {t('back')}
                    </button>
                    <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isResending ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                        {t('resend_email') || 'Resend Email'}
                    </button>
                </div>
            </div>
        </Card>
    );
}
