import React, { useState, useEffect } from 'react';
import { supabase } from '@/core/services/supabase';
import { Card } from '@/shared/components/ui/Card';
import { format, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, Video, MapPin, Settings, Plus, LayoutGrid, List, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { AppointmentService } from '../../services/AppointmentService';

interface CoachAppointmentsViewProps {
    coachId: string;
    onOpenSettings: () => void;
    onBookManual: () => void;
}

export function CoachAppointmentsView({ coachId, onOpenSettings, onBookManual }: CoachAppointmentsViewProps) {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    athlete:athlete_id (full_name, avatar_url, first_name, last_name, email)
                `)
                .eq('coach_id', coachId)
                .neq('status', 'CANCELLED')
                .gte('start_time', startOfToday().toISOString())
                .order('start_time', { ascending: true });

            if (error) throw error;
            setAppointments(data || []);
        } catch (err: any) {
            toast.error("Erreur lors de la récupération des rendez-vous");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appId: string) => {
        const reason = window.prompt("Raison de l'annulation (ex: Empêchement de dernière minute) :");
        if (reason === null) return; // Cancel prompt

        try {
            const { error } = await AppointmentService.cancelAppointment(appId, 'coach', reason || undefined);

            if (error) throw error;
            toast.success("Rendez-vous annulé");
            fetchAppointments();
        } catch (err: any) {
            toast.error("Erreur lors de l'annulation");
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [coachId]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Calendar className="text-emerald-500" /> Votre Agenda <span className="text-emerald-400">Pro</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gérez vos sessions et vos athlètes</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl mr-4">
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-slate-800 text-white" : "text-slate-600")}><List size={18} /></button>
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-slate-800 text-white" : "text-slate-600")}><LayoutGrid size={18} /></button>
                    </div>

                    <button
                        onClick={onOpenSettings}
                        className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white rounded-2xl transition-all"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={onBookManual}
                        className="flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-emerald-500/20"
                    >
                        <Plus size={18} /> Nouveau RDV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-[2.5rem] border border-slate-800"></div>
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-[3rem] border-2 border-slate-800 border-dashed">
                    <Calendar className="text-slate-700 mb-4" size={48} />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Aucun rendez-vous à venir</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Partagez votre lien de réservation pour remplir votre agenda</p>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-6",
                    viewMode === 'list' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                    {appointments.map((app) => (
                        <Card key={app.id} className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-emerald-500/10 transition-colors"></div>

                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-lg font-black text-white overflow-hidden">
                                        {app.athlete?.avatar_url ? <img src={app.athlete.avatar_url} className="w-full h-full object-cover" /> : (app.athlete?.first_name?.[0] || app.client_name?.[0] || <User size={20} />)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                            {app.athlete ? (app.athlete.first_name + ' ' + app.athlete.last_name) : (app.client_name || 'Client Externe')}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded-md uppercase border",
                                                app.appointment_type === 'video' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            )}>
                                                {app.appointment_type === 'video' ? 'Appel Vidéo' : 'Présentiel'}
                                            </span>
                                            {!app.athlete && <span className="text-[8px] font-black px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md uppercase">Externe</span>}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCancel(app.id)}
                                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                >
                                    <Cancel size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/50 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-950 rounded-xl text-emerald-500">
                                        <Calendar size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase">{format(new Date(app.start_time), 'dd MMM', { locale: fr })}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-950 rounded-xl text-indigo-400">
                                        <Clock size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase">{format(new Date(app.start_time), 'HH:mm')}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {app.billing_status === 'paid' ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <CheckCircle size={10} className="text-emerald-500" />
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Payé ({(app.amount_cents / 100).toFixed(2)}€)</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                        <AlertCircle size={10} className="text-indigo-400" />
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Inclus Forfait</span>
                                    </div>
                                )}
                            </div>

                            {app.appointment_type === 'video' && (
                                <button className="w-full mt-6 py-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                    <Video size={14} /> Rejoindre l'appel
                                </button>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function Cancel({ size }: { size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban"><circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" /></svg>;
}
