import React from 'react';
import { X, Users, Video, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';

interface FreeConsultationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function FreeConsultationModal({ onClose, onSuccess }: FreeConsultationModalProps) {
    const { t } = useLanguage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
                        <Users size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t('free_consultation_title') || 'Free Consultation'}</h2>
                    <p className="text-slate-400">{t('consult_coach_free_desc') || 'Get matched with an elite coach for a free strategic session.'}</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                        <Video className="text-indigo-400" size={20} />
                        <div>
                            <p className="text-white font-bold uppercase text-[10px] tracking-widest">{t('video_call') || 'Video Call'}</p>
                            <p className="text-xs text-slate-500">30-minute strategic session</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                        <Calendar className="text-emerald-400" size={20} />
                        <div>
                            <p className="text-white font-bold uppercase text-[10px] tracking-widest">{t('flexible_sync') || 'Flexible Scheduling'}</p>
                            <p className="text-xs text-slate-500">Choose a time that works for you</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                        <ShieldCheck className="text-amber-400" size={20} />
                        <div>
                            <p className="text-white font-bold uppercase text-[10px] tracking-widest">{t('no_commitment') || 'No Commitment'}</p>
                            <p className="text-xs text-slate-500">100% free, no credit card required</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                    <CheckCircle2 size={18} /> {t('claim_free_session') || 'Claim Free Session'}
                </button>
            </div>
        </div>
    );
}
