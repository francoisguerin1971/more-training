import React, { useState } from 'react';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import { Users, Search, Filter, MoreVertical, Activity, TrendingUp, CheckCircle2, UserPlus, Target } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/shared/lib/utils';
import { CoachTechnicalForm } from '../components/coach/CoachTechnicalForm';

export function AthletesList() {
    const { t } = useLanguage();
    const { currentUser, getAthletesForCoach } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAthletes, setSelectedAthletes] = useState([]);
    const [showObjectiveModal, setShowObjectiveModal] = useState(false);
    const [selectedAthleteForTech, setSelectedAthleteForTech] = useState(null);
    const [groupObjective, setGroupObjective] = useState('');

    const athletes = getAthletesForCoach(currentUser.id);

    const filteredAthletes = athletes.filter(athlete =>
        athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAthleteSelection = (id) => {
        setSelectedAthletes(prev =>
            prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
        );
    };

    const handleSetObjective = () => {
        alert(`Objective set for ${selectedAthletes.length} athletes: ${groupObjective}`);
        setShowObjectiveModal(false);
        setSelectedAthletes([]);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{t('athletes')} <span className="text-emerald-400">Roster</span></h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">Elite athlete lifecycle management</p>
                </div>
                <div className="flex gap-3">
                    {selectedAthletes.length > 0 && (
                        <button
                            onClick={() => setShowObjectiveModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-900/40"
                        >
                            <Target size={18} /> {t('ai_bulk_action')} ({selectedAthletes.length})
                        </button>
                    )}
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/20">
                        <UserPlus size={18} /> {t('new_athlete_btn')}
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search athletes or templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold uppercase text-[10px] tracking-widest"
                    />
                </div>
                <button className="bg-slate-900 border border-slate-800 text-slate-400 p-4 rounded-2xl hover:text-white hover:bg-slate-800 transition-all">
                    <Filter size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAthletes.map((athlete) => (
                    <Card
                        key={athlete.id}
                        className={cn(
                            "group cursor-pointer transition-all border-2 overflow-hidden",
                            selectedAthletes.includes(athlete.id) ? "border-emerald-500 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10" : "hover:border-slate-700 border-slate-800 bg-slate-900/10"
                        )}
                        onClick={() => toggleAthleteSelection(athlete.id)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-2xl text-white shadow-xl border border-slate-700 transition-all group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:scale-110">
                                    {athlete.avatar}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{athlete.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase font-black tracking-widest border border-emerald-500/20">
                                            {athlete.id === 'generic' ? 'Template' : t('active')}
                                        </span>
                                        <Activity size={12} className="text-slate-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAthleteForTech(athlete);
                                    }}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all flex items-center gap-2"
                                >
                                    <Target size={12} /> Examen Technique
                                </button>
                                {selectedAthletes.includes(athlete.id) && (
                                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 shadow-lg">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                                <button className="text-slate-600 hover:text-white p-2 transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-800/50">
                            <div>
                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">{t('compliance')}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-black text-white">92%</p>
                                    <TrendingUp className="text-emerald-400" size={14} />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">{t('last_active')}</p>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">2h ago</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Performance Momentum</p>
                                <span className="text-[9px] text-emerald-400 font-black uppercase">Stable</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[75%] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Objective Modal */}
            {showObjectiveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950">
                        <CardHeader title="Assign Collective Goal" icon={<Target className="text-emerald-400" size={24} />} />
                        <div className="space-y-6 pt-6">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Defining a shared performance milestone for {selectedAthletes.length} selected profiles.</p>
                            <textarea
                                value={groupObjective}
                                onChange={(e) => setGroupObjective(e.target.value)}
                                placeholder="Sub 3h Marathon, Ultra-trail Peak, Threshold Improvement..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-emerald-500 h-32 transition-all font-medium shadow-inner"
                            />
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowObjectiveModal(false)}
                                    className="flex-1 py-4 text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSetObjective}
                                    className="flex-2 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-900/40 transition-all"
                                >
                                    Enforce Objective
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
            {/* Technical Assessment Modal */}
            {selectedAthleteForTech && (
                <CoachTechnicalForm
                    athlete={selectedAthleteForTech}
                    onClose={() => setSelectedAthleteForTech(null)}
                    onSave={(data) => {
                        console.log('Technical Data Saved:', data);
                        // Future: Sync to Supabase
                    }}
                />
            )}
        </div>
    );
}
