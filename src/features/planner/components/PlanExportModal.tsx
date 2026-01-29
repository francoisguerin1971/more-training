
import React, { useState } from 'react';
import { X, Calendar, Share2, Mail, Download, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PlanExportModalProps {
    onClose: () => void;
    onExport: (scope: 'full' | 'month' | 'week', format: 'calendar' | 'pdf' | 'email') => void;
    totalWeeks: number;
}

export function PlanExportModal({ onClose, onExport, totalWeeks }: PlanExportModalProps) {
    const { t } = useLanguage();
    const [scope, setScope] = useState<'full' | 'month' | 'week'>('full');
    const [format, setFormat] = useState<'calendar' | 'pdf' | 'email'>('calendar');

    const handleExport = () => {
        onExport(scope, format);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-indigo-500/10">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Share2 className="text-indigo-400" size={24} />
                            {t('sharePlan') || "Partager le Plan"}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Configurez l'envoi de ce plan d'entraînement</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Scope Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            {t('exportScope') || "Portée de l'envoi"}
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => setScope('full')}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                    scope === 'full'
                                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50"
                                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", scope === 'full' ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-500")}>
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Plan Complet</p>
                                        <p className="text-xs opacity-70">L'intégralité des {totalWeeks} semaines</p>
                                    </div>
                                </div>
                                {scope === 'full' && <CheckCircle2 size={18} className="text-indigo-400" />}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setScope('month')}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                        scope === 'month'
                                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50"
                                            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", scope === 'month' ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-500")}>
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">4 Semaines</p>
                                            <p className="text-xs opacity-70">Mésocycle actif</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setScope('week')}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                        scope === 'week'
                                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50"
                                            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", scope === 'week' ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-500")}>
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">1 Semaine</p>
                                            <p className="text-xs opacity-70">Prochaine semaine</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            {t('exportFormat') || "Format"}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'calendar', label: 'Calendrier', icon: Calendar },
                                { id: 'pdf', label: 'PDF', icon: Download },
                                { id: 'email', label: 'Email', icon: Mail }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setFormat(item.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                        format === item.id
                                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800/80"
                                    )}
                                >
                                    <item.icon size={20} />
                                    <span className="text-xs font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                    >
                        {t('cancel') || "Annuler"}
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
                    >
                        <span>{t('send') || "Envoyer"}</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
