import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { useLanguage } from '@/shared/context/LanguageContext';
import { X, Bell, Check, Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Athlete {
    id: string;
    name: string;
    avatar: string;
    lastActive: string;
}

interface CheckinReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    athletes: Athlete[];
    onSendReminders: (selectedIds: string[]) => void;
    remindedIds: Set<string>;
}

export function CheckinReminderModal({ isOpen, onClose, athletes, onSendReminders, remindedIds }: CheckinReminderModalProps) {
    const { t } = useLanguage();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Initialize selection when opening/athletes change
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(new Set(athletes.map(a => a.id).filter(id => !remindedIds.has(id))));
        }
    }, [isOpen, athletes, remindedIds]);

    if (!isOpen) return null;

    const toggleAthlete = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleSend = () => {
        onSendReminders(Array.from(selectedIds));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg animate-in zoom-in-95 duration-300">
                <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Bell className="text-indigo-400" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                    {t('reminder_modal_title') || 'Relance des Oubliés'}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                    {selectedIds.size} {t('athletes_selected') || 'athlètes sélectionnés'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
                        {athletes.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="mx-auto text-slate-800 mb-4 opacity-20" size={48} />
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('no_athletes_to_remind') || 'Tous les athlètes sont à jour !'}</p>
                            </div>
                        ) : (
                            athletes.map((athlete) => {
                                const isReminded = remindedIds.has(athlete.id);
                                const isSelected = selectedIds.has(athlete.id);

                                return (
                                    <div
                                        key={athlete.id}
                                        onClick={() => !isReminded && toggleAthlete(athlete.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                            isSelected
                                                ? "bg-indigo-500/10 border-indigo-500/30"
                                                : "bg-slate-950/50 border-slate-800 hover:border-slate-700",
                                            isReminded && "opacity-50 cursor-not-allowed grayscale"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                                                isSelected ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                                            )}>
                                                {athlete.avatar || (athlete.name ? athlete.name[0] : 'A')}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{athlete.name}</h4>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                    {t('last_active_label')}: {athlete.lastActive}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                                            isSelected
                                                ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                : "border-slate-800 bg-slate-900 group-hover:border-slate-700"
                                        )}>
                                            {isSelected && <Check size={14} />}
                                            {isReminded && <Check size={14} className="text-emerald-400" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-3 items-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                            {t('cancel_btn') || 'Annuler'}
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={selectedIds.size === 0}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20"
                        >
                            <Bell size={16} />
                            {t('send_reminders_btn') || 'Envoyer les relances'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
