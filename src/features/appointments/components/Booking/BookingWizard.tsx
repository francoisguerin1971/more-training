import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, User, Mail, Phone, ChevronLeft, ChevronRight, Video, MapPin, Activity, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { SlotPicker } from './SlotPicker';
import { useAppointments } from '../../hooks/useAppointments';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/shared/context/LanguageContext';

interface BookingWizardProps {
    coachId: string;
    coachName: string;
    athleteId?: string; // If logged in
    availableAthletes?: any[]; // For coach manual booking
    isExternal?: boolean;
    sessionPriceCents?: number;
    bookingWindowDays?: number;
    onComplete?: () => void;
}

export function BookingWizard({ coachId, coachName, athleteId, availableAthletes, isExternal, sessionPriceCents = 4500, bookingWindowDays = 30, onComplete }: BookingWizardProps) {
    const { t } = useLanguage();
    const { availableSlots, loadAvailableSlots, bookAppointment, loading } = useAppointments(coachId);

    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(athleteId || null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 300;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    // External Client Info
    const [clientInfo, setClientInfo] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'video'
    });

    useEffect(() => {
        loadAvailableSlots(selectedDate);
    }, [selectedDate, loadAvailableSlots]);

    const handleConfirm = async () => {
        if (!selectedSlot) return;

        const start_time = new Date(selectedDate);
        const [hours, minutes] = selectedSlot.split(':');
        start_time.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Assume default 60min for now, or fetch from settings
        const end_time = new Date(start_time);
        end_time.setMinutes(end_time.getMinutes() + 60);

        const selectedAthlete = availableAthletes?.find(a => a.id === selectedAthleteId);

        const appointmentData = {
            coach_id: coachId,
            athlete_id: selectedAthleteId || undefined,
            title: `Session avec ${coachName}`,
            start_time: start_time.toISOString(),
            end_time: end_time.toISOString(),
            appointment_type: clientInfo.type,
            client_name: isExternal ? (selectedAthlete?.name || clientInfo.name) : undefined,
            client_email: isExternal ? (selectedAthlete?.email || clientInfo.email) : undefined,
            client_phone: isExternal ? clientInfo.phone : undefined,
            billing_status: isExternal ? (selectedAthleteId ? 'included' : 'paid') : 'included',
            amount_cents: isExternal && !selectedAthleteId ? sessionPriceCents : 0,
        };

        const { error } = await bookAppointment(appointmentData);
        if (!error && onComplete) {
            setStep(3); // Success Step
            setTimeout(onComplete, 3000);
        }
    };

    // Generate days based on coach settings (defaulting to 30)
    const nextDays = Array.from({ length: bookingWindowDays }, (_, i) => addDays(startOfToday(), i));

    return (
        <div className="max-w-4xl mx-auto">
            {step < 3 && (
                <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <div className={cn("flex items-center gap-2 shrink-0 px-4 py-2 rounded-full border transition-all", step === 1 ? "bg-emerald-500 border-emerald-400 text-slate-950 font-black" : "bg-slate-900 border-slate-800 text-slate-500 font-bold")}>
                        <span className="text-xs">1. {isExternal ? "Infos & " : ""}Date</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-700 shrink-0" />
                    <div className={cn("flex items-center gap-2 shrink-0 px-4 py-2 rounded-full border transition-all", step === 2 ? "bg-emerald-500 border-emerald-400 text-slate-950 font-black" : "bg-slate-900 border-slate-800 text-slate-500 font-bold")}>
                        <span className="text-xs">2. Créneau</span>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* User Info if External */}
                    {isExternal && (
                        <Card className="p-6 bg-slate-900 border-slate-800 space-y-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <User size={16} className="text-emerald-400" /> {availableAthletes ? t('select_athlete') : t('your_info')}
                            </h3>

                            {availableAthletes && availableAthletes.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {availableAthletes.map(a => (
                                            <button
                                                key={a.id}
                                                onClick={() => setSelectedAthleteId(a.id)}
                                                className={cn(
                                                    "shrink-0 px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all",
                                                    selectedAthleteId === a.id ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20" : "bg-slate-950 border-slate-800 text-slate-500"
                                                )}
                                            >
                                                {a.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setSelectedAthleteId(null)}
                                            className={cn(
                                                "shrink-0 px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all",
                                                selectedAthleteId === null ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20" : "bg-slate-950 border-slate-800 text-slate-500"
                                            )}
                                        >
                                            {t('new_external_client')}
                                        </button>
                                    </div>
                                    <div className="h-px bg-slate-800/50 my-2" />
                                </div>
                            )}

                            {!selectedAthleteId && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('full_name')}</label>
                                        <input
                                            type="text"
                                            value={clientInfo.name}
                                            onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-emerald-500/50"
                                            placeholder="Jean Moover"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('email_address')}</label>
                                        <input
                                            type="email"
                                            value={clientInfo.email}
                                            onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-emerald-500/50"
                                            placeholder="jean@example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedAthleteId && (
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950">
                                            {availableAthletes?.find(a => a.id === selectedAthleteId)?.avatar || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase">{availableAthletes?.find(a => a.id === selectedAthleteId)?.name}</p>
                                            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{t('athlete_selected')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Date Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon size={16} className="text-emerald-400" /> {t('choose_date')}
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scroll('left')}
                                    className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => scroll('right')}
                                    className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                        <div
                            ref={scrollRef}
                            className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2 scroll-smooth"
                        >
                            {nextDays.map((date) => {
                                const isSelected = isSameDay(date, selectedDate);
                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "flex flex-col items-center min-w-[80px] p-4 rounded-[2rem] border transition-all",
                                            isSelected
                                                ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20 scale-105"
                                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                        )}
                                    >
                                        <span className="text-[10px] uppercase font-black">{format(date, 'eee', { locale: fr })}</span>
                                        <span className="text-xl font-black">{format(date, 'dd')}</span>
                                        <span className="text-[10px] font-bold opacity-60">{format(date, 'MMM', { locale: fr })}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setStep(2)}
                            disabled={isExternal && (!clientInfo.name || !clientInfo.email)}
                            className="px-8 py-4 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                        >
                            Suivant <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Card className="p-8 bg-slate-900 border-slate-800 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                                </h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('select_slot_desc')}</p>
                            </div>

                            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                                <button
                                    onClick={() => setClientInfo({ ...clientInfo, type: 'video' })}
                                    className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", clientInfo.type === 'video' ? "bg-emerald-500 text-slate-950" : "text-slate-500")}
                                >
                                    <Video size={14} /> {t('session_video')}
                                </button>
                                <button
                                    onClick={() => setClientInfo({ ...clientInfo, type: 'presencial' })}
                                    className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", clientInfo.type === 'presencial' ? "bg-emerald-500 text-slate-950" : "text-slate-500")}
                                >
                                    <MapPin size={14} /> {t('session_presencial')}
                                </button>
                            </div>
                        </div>

                        <SlotPicker
                            slots={availableSlots}
                            selectedSlot={selectedSlot}
                            onSelect={setSelectedSlot}
                            loading={loading}
                        />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-800">
                            <button
                                onClick={() => setStep(1)}
                                className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                            >
                                Retour à la date
                            </button>

                            <button
                                onClick={handleConfirm}
                                disabled={!selectedSlot || loading}
                                className="w-full md:w-auto px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent animate-spin rounded-full"></div> : <><CheckCircle2 size={18} /> Confirmer la Réservation</>}
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {step === 3 && (
                <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-8">
                        <CheckCircle2 size={48} className="text-slate-950" />
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter text-center">{t('booking_confirmed')}</h2>
                    <p className="text-slate-400 font-bold mt-4 text-center max-w-md">{t('booking_success_desc')?.replace('{coach}', coachName)}</p>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                        <Card className="p-4 bg-slate-900 border-slate-800 flex items-center gap-4">
                            <CalendarIcon className="text-emerald-500" />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('date_and_time')}</p>
                                <p className="text-sm font-bold text-white">{format(selectedDate, 'd MMM')} à {selectedSlot}</p>
                            </div>
                        </Card>
                        <Card className="p-4 bg-slate-900 border-slate-800 flex items-center gap-4">
                            <Video className="text-indigo-400" />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('mode')}</p>
                                <p className="text-sm font-bold text-white">{clientInfo.type === 'video' ? t('session_video') : t('session_presencial')}</p>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
