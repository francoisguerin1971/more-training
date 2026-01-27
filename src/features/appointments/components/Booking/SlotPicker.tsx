import React from 'react';
import { AppointmentSlot } from '../../services/AppointmentService';
import { cn } from '@/shared/lib/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface SlotPickerProps {
    slots: AppointmentSlot[];
    selectedSlot: string | null;
    onSelect: (time: string) => void;
    loading?: boolean;
}

export function SlotPicker({ slots, selectedSlot, onSelect, loading }: SlotPickerProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-900 animate-pulse rounded-2xl border border-slate-800"></div>
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 border-dashed">
                <AlertCircle className="text-slate-600 mb-2" size={32} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Aucun créneau disponible pour cette journée</p>
                <p className="text-[9px] text-slate-600 text-center mt-1">Sélectionnez une autre date ou contactez le coach.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Clock size={12} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Créneaux disponibles</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {slots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;

                    return (
                        <button
                            key={slot.time}
                            disabled={!slot.isAvailable}
                            onClick={() => onSelect(slot.time)}
                            className={cn(
                                "relative py-3 px-2 rounded-[1.2rem] text-xs font-black transition-all flex items-center justify-center border",
                                slot.isAvailable
                                    ? isSelected
                                        ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105"
                                        : "bg-slate-950 border-slate-800 text-white hover:border-emerald-500/50 hover:bg-slate-900"
                                    : "bg-slate-900 border-transparent text-slate-700 cursor-not-allowed opacity-50 grayscale"
                            )}
                        >
                            {slot.time}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 bg-white text-emerald-600 rounded-full p-0.5 shadow-sm border border-emerald-100">
                                    <Check size={8} strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[8px] font-black text-slate-600 uppercase">Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                    <span className="text-[8px] font-black text-slate-600 uppercase">Réservé / Passé</span>
                </div>
            </div>
        </div>
    );
}
