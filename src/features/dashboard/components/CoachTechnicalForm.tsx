import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { Target, Activity, Zap, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import { TechnicalAssessmentData } from '../types';
import { UserProfile } from '@/features/auth/types';

interface CoachTechnicalFormProps {
    athlete: UserProfile;
    onClose: () => void;
    onSave: (data: TechnicalAssessmentData) => void;
}

export function CoachTechnicalForm({ athlete, onClose, onSave }: CoachTechnicalFormProps) {
    const { t } = useLanguage();

    const [technicalData, setTechnicalData] = React.useState<TechnicalAssessmentData>({
        formStatus: 'optimal',
        fatigue: 3,
        motivation: 8,
        focus: 'technique'
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
            <Card className="w-full max-w-lg border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950 p-8 shadow-emerald-500/10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                            {t('assessment_title')}: {athlete.full_name}
                        </h2>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">{t('technical_deep_dive')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-900 rounded-xl text-slate-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('initial_form')}</label>
                        <div className="flex gap-2">
                            {['recovering', 'optimal', 'peak'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setTechnicalData({ ...technicalData, formStatus: s })}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl border-2 font-black uppercase tracking-tighter text-[9px] transition-all",
                                        technicalData.formStatus === s ? "border-emerald-500 bg-emerald-500/5 text-white" : "border-slate-800 text-slate-600"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('fatigue_level')}</label>
                            <input
                                type="range" min="1" max="10" value={technicalData.fatigue}
                                onChange={(e) => setTechnicalData({ ...technicalData, fatigue: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
                                <span>1</span>
                                <span>10</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('motivation_level')}</label>
                            <input
                                type="range" min="1" max="10" value={technicalData.motivation}
                                onChange={(e) => setTechnicalData({ ...technicalData, motivation: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
                                <span>1</span>
                                <span>10</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="button"
                            onClick={() => { onSave(technicalData); onClose(); }}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {t('complete_assessment')} <CheckCircle2 size={16} />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
