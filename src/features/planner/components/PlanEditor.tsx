import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    Calendar, Clock, Dumbbell, Trash2, Edit3,
    ChevronRight, Save, Plus, Tag, Flame,
    LayoutGrid, List, GripVertical, Copy, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { SessionBuilderModal } from './SessionBuilderModal';

interface Session {
    id: string;
    date: string | Date; // Date can be string from JSON or Date object
    title: string;
    description?: string;
    duration?: number; // minutes
    intensity?: string;
    medal?: string;
    details: {
        warmup: string;
        main: string;
        cooldown: string;
        tech_focus?: string;
    };
    exercises?: any[];
}

interface PlanEditorProps {
    sessions: Session[];
    onUpdate: (id: string, updates: Partial<Session>) => void;
    onDelete: (id: string) => void;
    onInsert: (date?: Date) => void; // Optional date for drag-drop/calendar clicks
}

export function PlanEditor({ sessions, onUpdate, onDelete, onInsert }: PlanEditorProps) {
    const [view, setView] = useState<'week' | 'list'>('week');
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

    // Group sessions by date for Week View
    // Normalize date to string YYYY-MM-DD for grouping
    const normalizeDate = (d: string | Date) => format(new Date(d), 'yyyy-MM-dd');

    // Ensure sessions are handled correctly whether date is string or object
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get current week range (assuming the plan starts from the first session or today)
    const startDate = sortedSessions.length > 0 ? startOfWeek(new Date(sortedSessions[0].date), { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const handleSaveSession = (updatedSession: Session) => {
        if (updatedSession.id) {
            onUpdate(updatedSession.id, updatedSession);
        }
        setEditingSession(null);
    };

    return (
        <div className="space-y-6">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Éditeur de Planification</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sessions.length} Séances • {format(startDate, 'MMMM yyyy', { locale: fr })}</p>
                    </div>
                </div>

                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setView('week')}
                        className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2", view === 'week' ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        <LayoutGrid size={14} /> Semaine
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2", view === 'list' ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        <List size={14} /> Liste
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {view === 'week' ? (
                    <motion.div
                        key="week"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-7 gap-4"
                    >
                        {weekDays.map((day, i) => {
                            const dateKey = normalizeDate(day);
                            const daySessions = sortedSessions.filter(s => normalizeDate(s.date) === dateKey);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "min-h-[300px] rounded-2xl border flex flex-col transition-all",
                                        isToday ? "bg-emerald-500/5 border-emerald-500/30" : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/60"
                                    )}
                                    onClick={() => onInsert(day)} // Click background to add to this day
                                >
                                    {/* Day Header */}
                                    <div className={cn(
                                        "p-3 border-b text-center",
                                        isToday ? "border-emerald-500/20 bg-emerald-500/10" : "border-slate-800/50"
                                    )}>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                                            {format(day, 'EEE', { locale: fr })}
                                        </span>
                                        <span className={cn(
                                            "text-lg font-black",
                                            isToday ? "text-emerald-400" : "text-white"
                                        )}>
                                            {format(day, 'dd')}
                                        </span>
                                    </div>

                                    {/* Sessions Container */}
                                    <div className="p-2 flex-1 space-y-2">
                                        {daySessions.map(session => (
                                            <motion.div
                                                layoutId={session.id}
                                                key={session.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingSession(session);
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                className="bg-slate-800 border border-slate-700 p-3 rounded-xl cursor-pointer group hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all relative overflow-hidden"
                                            >
                                                {/* Intensity Strip */}
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-1",
                                                    session.intensity === 'VO2 Max' ? "bg-red-500" :
                                                        session.intensity === 'Seuil' ? "bg-orange-500" :
                                                            session.intensity === 'Endurance Fondamentale' ? "bg-emerald-500" :
                                                                "bg-blue-500"
                                                )} />

                                                <div className="pl-2">
                                                    <h5 className="font-bold text-xs text-white line-clamp-2 leading-tight mb-1">
                                                        {session.title}
                                                    </h5>

                                                    {session.details.main && (
                                                        <p className="text-[9px] text-slate-400 line-clamp-2 mb-2">
                                                            {session.details.main}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2 mt-auto">
                                                        {session.exercises && session.exercises.length > 0 && (
                                                            <span className="flex items-center gap-1 text-[8px] font-black text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded uppercase">
                                                                <Dumbbell size={8} /> {session.exercises.length}
                                                            </span>
                                                        )}
                                                        {session.details.tech_focus && (
                                                            <span className="flex items-center gap-1 text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase border border-indigo-500/20">
                                                                <Tag size={8} /> Tech
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Hover actions */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(session.id);
                                                        }}
                                                        className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Add Button Hint (hover) */}
                                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <div className="text-slate-600 text-[10px] font-black uppercase flex items-center gap-1">
                                                <Plus size={10} /> Ajouter
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-3"
                    >
                        <Reorder.Group axis="y" values={sortedSessions} onReorder={(newOrder) => {
                            // Reorder logic would go here if we were reordering the array directly
                            // For date-based sessions, drag-drop usually effectively changes the DATE
                            // Implementation of full drag-to-reorder-date is complex but let's provide visual list
                            console.log("Reorder not fully implemented for date change in list view");
                        }}>
                            {sortedSessions.map(session => (
                                <Reorder.Item key={session.id} value={session}>
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-6 hover:border-slate-700 transition-all group">
                                        <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-white">
                                            <GripVertical size={20} />
                                        </div>

                                        <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-slate-500 uppercase">
                                                {format(new Date(session.date), 'MMM', { locale: fr })}
                                            </span>
                                            <span className="text-xl font-black text-white">
                                                {format(new Date(session.date), 'dd')}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-bold text-white uppercase text-lg">{session.title}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> {session.duration || 60} min
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Flame size={12} /> {session.intensity || 'Modéré'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingSession(session)}
                                                className="p-2 bg-slate-800 text-white rounded-xl hover:bg-emerald-500 transition-colors"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(session.id)}
                                                className="p-2 bg-slate-800 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        {sortedSessions.length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                                <p className="text-sm font-medium">Aucune séance planifiée.</p>
                                <button onClick={() => onInsert()} className="mt-4 text-emerald-500 font-bold uppercase text-xs hover:underline">
                                    Créer une première séance
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Session Builder Modal */}
            <SessionBuilderModal
                isOpen={!!editingSession}
                initialSession={editingSession}
                onClose={() => setEditingSession(null)}
                onSave={handleSaveSession}
            />
        </div>
    );
}
