
import React from 'react';
import { CheckCircle2, XCircle, Send, FileEdit, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLanguage } from '@/shared/context/LanguageContext';

export type PlanStatus = 'draft' | 'approved' | 'sent';

interface PlanValidationWorkflowProps {
    status: PlanStatus;
    onStatusChange: (status: PlanStatus) => void;
    onApply: () => void;
}

export const PlanValidationWorkflow: React.FC<PlanValidationWorkflowProps> = ({
    status,
    onStatusChange,
    onApply
}) => {
    const { t } = useLanguage();

    const getStatusConfig = (status: PlanStatus) => {
        switch (status) {
            case 'draft':
                return {
                    label: 'Brouillon',
                    color: 'slate',
                    icon: FileEdit,
                    description: 'En cours de création'
                };
            case 'approved':
                return {
                    label: 'Approuvé',
                    color: 'emerald',
                    icon: CheckCircle2,
                    description: 'Prêt à être envoyé'
                };
            case 'sent':
                return {
                    label: 'Envoyé',
                    color: 'blue',
                    icon: Send,
                    description: 'Assigné à l\'athlète'
                };
        }
    };

    const currentConfig = getStatusConfig(status);

    return (
        <div className="bg-slate-900 border-t border-slate-800 p-6 rounded-b-[32px] animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">

                {/* Status Indicator */}
                <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse",
                        status === 'draft' ? "bg-slate-400" :
                            status === 'approved' ? "bg-emerald-400" : "bg-blue-400"
                    )} />
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wide">
                        Statut: <span className="text-white ml-1">{currentConfig.label}</span>
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {status === 'draft' && (
                        <>
                            <button
                                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors flex items-center gap-2 border border-slate-700"
                                onClick={() => {/* Suggest changes logic if needed */ }}
                            >
                                <XCircle size={18} className="text-red-400" />
                                <span>Rejeter</span>
                            </button>
                            <button
                                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                onClick={() => onStatusChange('approved')}
                            >
                                <CheckCircle2 size={18} />
                                <span>Valider le Plan</span>
                            </button>
                        </>
                    )}

                    {status === 'approved' && (
                        <>
                            <button
                                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors flex items-center gap-2 border border-slate-700"
                                onClick={() => onStatusChange('draft')}
                            >
                                <FileEdit size={18} />
                                <span>Editer</span>
                            </button>
                            <button
                                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
                                onClick={() => {
                                    onStatusChange('sent');
                                    onApply();
                                }}
                            >
                                <Send size={18} />
                                <span>Envoyer à l'Athlète</span>
                            </button>
                        </>
                    )}

                    {status === 'sent' && (
                        <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-6 py-3 rounded-xl border border-emerald-500/20">
                            <CheckCircle2 size={18} />
                            <span>Plan Assigné avec succès</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
