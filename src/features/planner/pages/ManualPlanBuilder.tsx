import React, { useState } from 'react';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    Plus, Search, Save, Trash2, Layout,
    Dumbbell, Play, Sparkles, ChevronRight,
    TrendingUp, Calendar as CalendarIcon
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/shared/lib/utils';
import { startOfToday, addDays, format } from 'date-fns';

export function ManualPlanBuilder() {
    const { t } = useLanguage();
    const { savePlan } = useTraining();
    const { currentUser, getAthletesForCoach } = useAuthStore();

    const [selectedAthletes, setSelectedAthletes] = useState([]);
    const [weeklyLoads, setWeeklyLoads] = useState([300, 450, 600, 400]); // Default 4 weeks
    const [sessions, setSessions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const athletes = getAthletesForCoach(currentUser.id);

    const library = [
        { id: 'sq', title: 'Back Squat', category: 'Strength', visual: '3D Schematic SQ-1' },
        { id: 'bp', title: 'Bench Press', category: 'Strength', visual: '3D Schematic BP-4' },
        { id: 'hiit', title: 'HIIT Sprints', category: 'Cardio', visual: '3D Schematic SP-2' },
        { id: 'swim', title: 'Threshold Swim', category: 'Endurance', visual: '3D Schematic SW-1' },
        { id: 'yoga', title: 'Static Mobility', category: 'Recovery', visual: '3D Schematic YO-9' },
    ];

    const filteredLibrary = library.filter(ex =>
        ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAthleteSelection = (id) => {
        setSelectedAthletes(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const addSession = (exercise) => {
        const nextDate = sessions.length > 0
            ? addDays(new Date(sessions[sessions.length - 1].date), 1)
            : startOfToday();

        const newSession = {
            id: Math.random().toString(36).substr(2, 9),
            date: nextDate,
            title: exercise.title,
            description: `Manual custom session for ${exercise.title}. Assigned via Studio.`,
            load: Math.round(weeklyLoads[Math.floor(sessions.length / 7) % weeklyLoads.length] / 3),
            visualType: exercise.visual
        };
        setSessions([...sessions, newSession]);
    };

    const removeSession = (id) => {
        setSessions(sessions.filter(s => s.id !== id));
    };

    const handleSave = () => {
        if (selectedAthletes.length === 0) return alert("Select at least one athlete first");
        savePlan(currentUser.id, selectedAthletes, {
            objective: "Manual Coach Custom Plan",
            sessions: sessions
        });
        alert(`Plan assigned to ${selectedAthletes.length} athletes!`);
        setSessions([]);
        setSelectedAthletes([]);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-500/20 p-4 rounded-3xl border border-indigo-500/20 shadow-xl shadow-indigo-900/10">
                        <Layout size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Manual <span className="text-indigo-400 underline decoration-emerald-500/30 underline-offset-8">Studio</span></h1>
                        <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">Pixel-perfect Session Orchestration</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={sessions.length === 0 || selectedAthletes.length === 0}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-900/40"
                >
                    <Save size={20} /> Publish to Rosters
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: Library & Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader title="1. Select Rosters" subtitle="Includes Templates" />
                        <div className="grid grid-cols-1 gap-2 mt-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {athletes.map(a => (
                                <button
                                    key={a.id}
                                    onClick={() => toggleAthleteSelection(a.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                        selectedAthletes.includes(a.id) ? "bg-indigo-500/10 border-indigo-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                                        {a.avatar}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-tight">{a.name}</span>
                                    {selectedAthletes.includes(a.id) && <Sparkles size={12} className="ml-auto text-indigo-400" />}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card className="flex-1 bg-slate-900/50">
                        <CardHeader title="2. Component Library" subtitle="High Fidelity Visuals" />
                        <div className="relative mb-4 mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input
                                type="text"
                                placeholder="Search library..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white uppercase font-bold focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredLibrary.map(ex => (
                                <div
                                    key={ex.id}
                                    onClick={() => addSession(ex)}
                                    className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-indigo-500 cursor-pointer transition-all active:scale-95"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 transition-colors border border-slate-800">
                                            <Plus size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{ex.title}</p>
                                            <p className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">{ex.category}</p>
                                        </div>
                                    </div>
                                    <TrendingUp size={14} className="text-slate-800 group-hover:text-indigo-500/50" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Main Workspace: Session Timeline */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-indigo-500/10 bg-slate-900 border-2">
                        <CardHeader
                            title="3. Timeline Orchestration"
                            subtitle={`Queued Units: ${sessions.length}`}
                        />

                        <div className="space-y-3 mt-6">
                            {sessions.length === 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
                                    <div className="p-4 bg-slate-950 rounded-full mb-4 border border-slate-800">
                                        <CalendarIcon size={32} className="opacity-20" />
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-[10px]">Timeline Inactive</p>
                                    <p className="text-[9px] uppercase font-bold tracking-tighter mt-1">Select components to build the macro-structure</p>
                                </div>
                            ) : (
                                sessions.map((session, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-6 p-5 bg-slate-950 border border-slate-800 rounded-3xl group animate-in slide-in-from-right-2 hover:border-indigo-500/30 transition-all"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-slate-500 border border-slate-800 shadow-inner">
                                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{format(session.date, 'MMM')}</span>
                                            <span className="text-xl font-black text-white -mt-1">{format(session.date, 'dd')}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-black text-md uppercase tracking-tight">{session.title}</h4>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <div className="flex items-center gap-1.5 text-[9px] text-indigo-400 font-black uppercase tracking-[0.1em]">
                                                    <TrendingUp size={12} /> Load: {session.load} AU
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-black uppercase tracking-[0.1em]">
                                                    <Sparkles size={12} className="text-indigo-400/50" /> {session.visualType}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeSession(session.id)}
                                            className="p-3 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900 border-indigo-500/10">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Macrocyle Load Projection</p>
                            <div className="flex items-end gap-1.5 h-20">
                                {weeklyLoads.map((l, i) => (
                                    <div
                                        key={i}
                                        style={{ height: `${(l / 800) * 100}%` }}
                                        className="flex-1 bg-indigo-500/10 border-t-2 border-indigo-500 rounded-t-lg shadow-[0_-5px_15px_rgba(99,102,241,0.2)]"
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">Volume Trend</p>
                                <span className="text-[9px] text-indigo-400 font-black uppercase tracking-tighter italic">Progressive Overload Active</span>
                            </div>
                        </Card>
                        <Card className="bg-slate-900 border-dashed border-2 flex flex-col items-center justify-center group cursor-pointer hover:border-indigo-500/50 transition-all">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-700 group-hover:text-indigo-400 transition-colors">
                                <Plus size={24} />
                            </div>
                            <p className="text-[10px] text-slate-600 mt-2 uppercase font-black tracking-widest group-hover:text-white transition-colors">Add Macro-Week</p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
