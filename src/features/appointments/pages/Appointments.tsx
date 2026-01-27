import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/context/LanguageContext';
import { CoachAppointmentsView } from '../components/Calendar/CoachAppointmentsView';
import { BookingWizard } from '../components/Booking/BookingWizard';
import { CoachSettings } from '../components/Settings/CoachSettings';
import { useAppointments } from '../hooks/useAppointments';
import { Card } from '@/shared/components/ui/Card';
import { User, ChevronLeft, Calendar as CalendarIcon, Info, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function Appointments() {
    const { t } = useLanguage();
    const { currentUser, getCoachesForAthlete, getAthletesForCoach } = useAuthStore();
    const isPro = currentUser?.role === 'pro';

    // Coach State
    const [view, setView] = useState<'dashboard' | 'settings' | 'manual_booking'>('dashboard');
    const { settings, refreshSettings } = useAppointments(currentUser?.id);
    const [coachAthletes, setCoachAthletes] = useState<any[]>([]);

    useEffect(() => {
        if (isPro && currentUser) {
            getAthletesForCoach(currentUser.id).then(setCoachAthletes);
        }
    }, [isPro, currentUser, getAthletesForCoach]);

    // Athlete State
    const [coaches, setCoaches] = useState<any[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<any>(null);

    useEffect(() => {
        const fetchCoaches = async () => {
            if (!isPro && currentUser) {
                const data = await getCoachesForAthlete(currentUser.id);
                if (Array.isArray(data)) {
                    setCoaches(data);
                    if (data.length > 0) setSelectedCoach(data[0]);
                }
            }
        };
        fetchCoaches();
    }, [isPro, currentUser, getCoachesForAthlete]);

    if (!currentUser) return null;

    // --- COACH VIEW ---
    if (isPro) {
        return (
            <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6">
                {view === 'dashboard' && (
                    <CoachAppointmentsView
                        coachId={currentUser.id}
                        onOpenSettings={() => setView('settings')}
                        onBookManual={() => setView('manual_booking')}
                    />
                )}

                {view === 'settings' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setView('dashboard')}
                            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            <ChevronLeft size={16} /> Retour à l'agenda
                        </button>
                        <CoachSettings
                            coachId={currentUser.id}
                            pseudo={currentUser.pseudo || ''}
                            initialSettings={settings}
                            onSave={() => {
                                refreshSettings();
                                setView('dashboard');
                            }}
                        />
                    </div>
                )}

                {view === 'manual_booking' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setView('dashboard')}
                            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            <ChevronLeft size={16} /> Annuler
                        </button>
                        <div className="max-w-xl mx-auto">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 text-center">Nouveau Rendez-vous <span className="text-emerald-400">Manuel</span></h2>
                            <BookingWizard
                                coachId={currentUser.id}
                                coachName={currentUser.full_name || 'Coach'}
                                isExternal={true}
                                availableAthletes={coachAthletes}
                                bookingWindowDays={settings?.booking_window_days}
                                sessionPriceCents={settings?.session_price_cents}
                                onComplete={() => setView('dashboard')}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- ATHLETE VIEW ---
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{t('weekly_meetings') || "Rendez-vous"}</h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Planifiez vos sessions avec votre coach</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coaches Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('select_coach') || "Choisir un Coach"}</p>
                    <div className="space-y-4">
                        {coaches.map(coach => (
                            <div
                                key={coach.id}
                                onClick={() => setSelectedCoach(coach)}
                                className={cn(
                                    "p-4 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden",
                                    selectedCoach?.id === coach.id
                                        ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10"
                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-105",
                                        selectedCoach?.id === coach.id ? "bg-slate-800 text-white" : "bg-slate-950 text-slate-500"
                                    )}>
                                        {coach.avatar}
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "font-black uppercase text-sm tracking-tight",
                                            selectedCoach?.id === coach.id ? "text-white" : "text-slate-400"
                                        )}>{coach.name}</h3>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">{coach.specialty}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Wizard Area */}
                <div className="lg:col-span-9">
                    {selectedCoach ? (
                        <Card className="bg-slate-950/40 border-slate-800 p-6 md:p-10 rounded-[3rem]">
                            <BookingWizard
                                coachId={selectedCoach.id}
                                coachName={selectedCoach.name}
                                athleteId={currentUser.id}
                                bookingWindowDays={selectedCoach.booking_window_days}
                                onComplete={() => { }}
                            />
                        </Card>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center bg-slate-900/20 rounded-[3rem] border-2 border-slate-800 border-dashed">
                            <User className="text-slate-800 mb-4" size={48} />
                            <p className="text-slate-600 font-black uppercase text-xs tracking-widest text-center">Vous n'avez pas encore de coach.<br />Utilisez la bibliothèque pour en trouver un.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
