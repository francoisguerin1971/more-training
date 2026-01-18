import React, { useState } from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { X, Mail, ChevronRight, CheckCircle2, User, Zap, Activity } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/core/utils/cn';
import { TechnicalAssessmentData } from '../types';

interface InviteAthleteModalProps {
    onClose: () => void;
    onInvite: (data: {
        firstName: string;
        lastName: string;
        email: string;
        planType: 'AI_ELITE' | 'HYBRID' | 'MANUAL_PRO';
        technicalAssessment: TechnicalAssessmentData;
    }) => Promise<void>;
}

type Step = 'identity' | 'assessment' | 'review';

export function InviteAthleteModal({ onClose, onInvite }: InviteAthleteModalProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState<Step>('identity');
    const [loading, setLoading] = useState(false);

    // Form Data
    const [identity, setIdentity] = useState({
        firstName: '',
        lastName: '',
        email: '',
        planType: 'AI_ELITE' as 'AI_ELITE' | 'HYBRID' | 'MANUAL_PRO'
    });

    const [assessment, setAssessment] = useState<TechnicalAssessmentData>({
        formStatus: 'optimal',
        fatigue: 3,
        motivation: 8,
        focus: 'technique'
    });

    const handleInvite = async () => {
        setLoading(true);
        await onInvite({
            ...identity,
            technicalAssessment: assessment
        });
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950 p-0 overflow-hidden shadow-emerald-500/10">
                {/* Header Steps */}
                <div className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                            {t('new_athlete_title')}
                        </h2>
                        <div className="flex gap-4 mt-2 text-[10px] font-bold uppercase tracking-widest">
                            <span className={cn("flex items-center gap-1", step === 'identity' ? "text-emerald-400" : "text-emerald-500/50")}>
                                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">1</div>
                                {t('wizard_step_identity')}
                            </span>
                            <span className="text-slate-700">/</span>
                            <span className={cn("flex items-center gap-1", step === 'assessment' ? "text-emerald-400" : step === 'review' ? "text-emerald-500/50" : "text-slate-600")}>
                                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">2</div>
                                {t('wizard_step_technical')}
                            </span>
                            <span className="text-slate-700">/</span>
                            <span className={cn("flex items-center gap-1", step === 'review' ? "text-emerald-400" : "text-slate-600")}>
                                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">3</div>
                                {t('wizard_step_review')}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 'identity' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('first_name')}</label>
                                    <input
                                        type="text"
                                        value={identity.firstName}
                                        onChange={(e) => setIdentity({ ...identity, firstName: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('last_name')}</label>
                                    <input
                                        type="text"
                                        value={identity.lastName}
                                        onChange={(e) => setIdentity({ ...identity, lastName: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('email_label')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="email"
                                        value={identity.email}
                                        onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                                        placeholder="athlete@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('plan')}</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {(['AI_ELITE', 'HYBRID', 'MANUAL_PRO'] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setIdentity({ ...identity, planType: p as 'AI_ELITE' | 'HYBRID' | 'MANUAL_PRO' })}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-left transition-all relative group",
                                                identity.planType === p
                                                    ? "border-emerald-500 bg-emerald-500/10"
                                                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={cn(
                                                    "font-black text-xs uppercase tracking-wider",
                                                    identity.planType === p ? "text-emerald-400" : "text-white"
                                                )}>
                                                    {t(`plan_${p.toLowerCase()}_label`)}
                                                </span>
                                                {identity.planType === p && <CheckCircle2 size={14} className="text-emerald-500" />}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                                {t(`plan_${p.toLowerCase()}_desc`)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'assessment' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('initial_form')}</label>
                                <div className="flex gap-2">
                                    {['recovering', 'optimal', 'peak'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setAssessment({ ...assessment, formStatus: s })}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl border-2 font-black uppercase tracking-tighter text-[9px] transition-all",
                                                assessment.formStatus === s ? "border-emerald-500 bg-emerald-500/5 text-white" : "border-slate-800 text-slate-600"
                                            )}
                                        >
                                            {t(`status_${s}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('fatigue_level')}</label>
                                    <input
                                        type="range" min="1" max="10" value={assessment.fatigue}
                                        onChange={(e) => setAssessment({ ...assessment, fatigue: parseInt(e.target.value) })}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
                                        <span>1</span> <span className="text-emerald-500 text-lg">{assessment.fatigue}</span> <span>10</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('motivation_level')}</label>
                                    <input
                                        type="range" min="1" max="10" value={assessment.motivation}
                                        onChange={(e) => setAssessment({ ...assessment, motivation: parseInt(e.target.value) })}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
                                        <span>1</span> <span className="text-emerald-500 text-lg">{assessment.motivation}</span> <span>10</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
                                <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl">
                                        {identity.firstName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-lg">{identity.firstName} {identity.lastName}</h3>
                                        <p className="text-slate-500 text-xs font-medium">{identity.email}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="bg-slate-800 text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {t(`plan_${identity.planType.toLowerCase()}_label`)}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-2">
                                    <div className="text-center">
                                        <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-1">{t('review_label_form')}</div>
                                        <div className="text-white font-black text-sm">{t(`status_${assessment.formStatus}`)}</div>
                                    </div>
                                    <div className="text-center border-l border-slate-800">
                                        <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-1">{t('review_label_fatigue')}</div>
                                        <div className="text-white font-black text-sm">{assessment.fatigue}/10</div>
                                    </div>
                                    <div className="text-center border-l border-slate-800">
                                        <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-1">{t('review_label_motivation')}</div>
                                        <div className="text-white font-black text-sm">{assessment.motivation}/10</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                <Zap className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
                                    {t('invite_magic_link_info')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-0 flex justify-between items-center">
                    {step !== 'identity' ? (
                        <button
                            onClick={() => setStep(step === 'review' ? 'assessment' : 'identity')}
                            className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            {t('btn_back')}
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 'review' ? (
                        <button
                            onClick={handleInvite}
                            disabled={loading}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? <Activity className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                            {t('btn_confirm_invite')}
                        </button>
                    ) : (
                        <button
                            onClick={() => setStep(step === 'identity' ? 'assessment' : 'review')}
                            disabled={step === 'identity' && (!identity.firstName || !identity.email)}
                            className="bg-slate-100 hover:bg-white text-slate-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {t('btn_continue')} <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}
