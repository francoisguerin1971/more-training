import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    Calendar, Clock, Dumbbell, Trash2, Edit3,
    ChevronRight, Save, Plus, Tag, Flame
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface Session {
    id: string;
    date: Date;
    title: string;
    medal?: string;
    details: {
        warmup: string;
        main: string;
        cooldown: string;
        tech_focus?: string;
    };
    intensity: string;
    visual: string;
}

interface PlanEditorProps {
    sessions: Session[];
    onUpdate: (id: string, updates: Partial<Session>) => void;
    onDelete: (id: string) => void;
    onInsert: () => void;
}

export function PlanEditor({ sessions, onUpdate, onDelete, onInsert }: PlanEditorProps) {
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Calendar className="text-emerald-400" size={24} />
                    Éditeur de Sessions
                </h3>
                <button
                    onClick={onInsert}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border border-slate-700"
                >
                    <Plus size={16} /> Ajouter une session
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sessions.map((session, idx) => (
                    <div key={session.id} className="group relative">
                        <Card className={cn(
                            "bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all overflow-hidden",
                            editingId === session.id && "border-emerald-500/50 bg-slate-900 shadow-2xl shadow-emerald-500/5"
                        )}>
                            <div className="flex flex-col md:flex-row gap-6 p-6">
                                {/* Date Badge */}
                                <div className="w-20 h-20 rounded-[24px] bg-slate-950 flex flex-col items-center justify-center border border-slate-800 shrink-0 group-hover:border-emerald-500/30 transition-colors">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                        {format(new Date(session.date), 'MMM')}
                                    </span>
                                    <span className="text-2xl font-black text-white -mt-1">
                                        {format(new Date(session.date), 'dd')}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-4">
                                    {editingId === session.id ? (
                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                            <input
                                                type="text"
                                                value={session.title}
                                                onChange={(e) => onUpdate(session.id, { title: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-black text-white uppercase focus:border-emerald-500 outline-none"
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Cœur de séance</label>
                                                    <textarea
                                                        value={session.details.main}
                                                        onChange={(e) => onUpdate(session.id, { details: { ...session.details, main: e.target.value } })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-medium text-slate-300 focus:border-emerald-500 outline-none h-20"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Intensité / Objectif</label>
                                                    <textarea
                                                        value={session.intensity}
                                                        onChange={(e) => onUpdate(session.id, { intensity: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-medium text-slate-300 focus:border-emerald-500 outline-none h-20"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20"
                                            >
                                                <Save size={14} /> Sauvegarder
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{session.title}</h4>
                                                    {session.medal && (
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                            session.medal === 'Or' ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500" :
                                                                session.medal === 'Argent' ? "bg-slate-300/10 border-slate-300/50 text-slate-300" :
                                                                    "bg-orange-500/10 border-orange-500/50 text-orange-500"
                                                        )}>
                                                            {session.medal}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium line-clamp-2 max-w-xl">{session.details.main}</p>
                                                <div className="flex flex-wrap gap-4 pt-2">
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Flame size={12} className="text-orange-500" /> {session.intensity}
                                                    </div>
                                                    {session.details.tech_focus && (
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                                            <Tag size={12} /> {session.details.tech_focus}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-start md:self-center">
                                                <button
                                                    onClick={() => setEditingId(session.id)}
                                                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(session.id)}
                                                    className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-rose-500/20"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
