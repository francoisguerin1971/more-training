import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { useLanguage } from '@/shared/context/LanguageContext';
import { X, Moon, Activity, ThumbsUp, HeartPulse, Save } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CheckinData {
    sleepScore: number; // 0-100
    rpe: number; // 1-10
    stress: number; // 1-10
    soreness: number; // 1-10
    hrv?: number; // Optional
}

interface DailyCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CheckinData) => void;
}

export function DailyCheckinModal({ isOpen, onClose, onSubmit }: DailyCheckinModalProps) {
    const { t } = useLanguage();
    const [data, setData] = useState<CheckinData>({
        sleepScore: 70,
        rpe: 5,
        stress: 3,
        soreness: 2,
        hrv: undefined
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg animate-in fade-in zoom-in duration-300">
                <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <Activity className="text-emerald-500" size={24} />
                                {t('daily_checkin_title') || 'Check-in Quotidien'}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">
                                {t('daily_checkin_subtitle')}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-8">

                        {/* 1. Sleep */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Moon size={14} className="text-indigo-400" />
                                    {t('sleep_quality_label')}
                                </label>
                                <span className={cn("text-xs font-black px-2 py-1 rounded bg-slate-800",
                                    data.sleepScore >= 80 ? "text-emerald-400" :
                                        data.sleepScore >= 50 ? "text-amber-400" : "text-rose-400"
                                )}>
                                    {data.sleepScore}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100" step="5"
                                value={data.sleepScore}
                                onChange={(e) => setData({ ...data, sleepScore: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        {/* 2. RPE (Effort) */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <HeartPulse size={14} className="text-rose-400" />
                                    {t('rpe_yesterday_label')}
                                </label>
                                <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                                    {data.rpe} / 10
                                </span>
                            </div>
                            <div className="flex justify-between gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setData({ ...data, rpe: val })}
                                        className={cn(
                                            "flex-1 h-8 rounded-md text-[10px] font-black transition-all",
                                            data.rpe === val
                                                ? "bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/20"
                                                : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                                        )}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Stress & Soreness (Grid) */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {t('stress_label')}
                                </label>
                                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                    <button onClick={() => setData(d => ({ ...d, stress: Math.max(1, d.stress - 1) }))} className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center hover:bg-slate-800 font-bold">-</button>
                                    <span className="flex-1 text-center font-black text-white">{data.stress}/10</span>
                                    <button onClick={() => setData(d => ({ ...d, stress: Math.min(10, d.stress + 1) }))} className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center hover:bg-slate-800 font-bold">+</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {t('soreness_label')}
                                </label>
                                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                    <button onClick={() => setData(d => ({ ...d, soreness: Math.max(1, d.soreness - 1) }))} className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center hover:bg-slate-800 font-bold">-</button>
                                    <span className="flex-1 text-center font-black text-white">{data.soreness}/10</span>
                                    <button onClick={() => setData(d => ({ ...d, soreness: Math.min(10, d.soreness + 1) }))} className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center hover:bg-slate-800 font-bold">+</button>
                                </div>
                            </div>
                        </div>

                        {/* 4. Optional HRV */}
                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
                                    {t('hrv_label', 'HRV (ms) - Optionnel')}
                                </label>
                                <input
                                    type="number"
                                    placeholder={t('hrv_placeholder', 'Ex: 65')}
                                    value={data.hrv || ''}
                                    onChange={(e) => setData({ ...data, hrv: parseInt(e.target.value) || undefined })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-bold focus:border-emerald-500 outline-none placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Save size={16} />
                            {t('save_btn')}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
