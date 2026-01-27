import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Clock, Plus, Trash2, Save, Globe, Shield, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLanguage } from '@/shared/context/LanguageContext';
import { supabase } from '@/core/services/supabase';
import { toast } from 'sonner';

interface TimeRange {
    start: string;
    end: string;
}

interface WeeklyHours {
    [key: string]: TimeRange[];
}

interface CoachSettingsProps {
    coachId: string;
    pseudo: string;
    initialSettings?: any;
    onSave?: () => void;
}

export function CoachSettings({ coachId, pseudo, initialSettings, onSave }: CoachSettingsProps) {
    const { t } = useLanguage();
    const [settings, setSettings] = useState<any>(initialSettings || {
        weekly_hours: {
            mon: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
            tue: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
            wed: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
            thu: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
            fri: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
            sat: [],
            sun: []
        },
        default_duration: 60,
        buffer_time: 15,
        is_public: true,
        is_external_booking_enabled: false,
        confirmation_email: true,
        confirmation_sms: false,
        session_price_cents: 4500,
        session_currency: 'EUR',
        booking_window_days: 30,
        timezone: 'Europe/Paris'
    });

    const [loading, setLoading] = useState(false);
    const [displayUnit, setDisplayUnit] = useState<'days' | 'weeks' | 'months'>(() => {
        const days = settings?.booking_window_days || 30;
        if (days % 30 === 0) return 'months';
        if (days % 7 === 0) return 'weeks';
        return 'days';
    });

    useEffect(() => {
        if (initialSettings) {
            setSettings(initialSettings);
        }
    }, [initialSettings]);

    const handleAddTimeSlot = (day: string) => {
        const newWeeklyHours = { ...settings.weekly_hours };
        const lastSlot = newWeeklyHours[day][newWeeklyHours[day].length - 1];
        const newStart = lastSlot ? lastSlot.end : "09:00";
        newWeeklyHours[day] = [...newWeeklyHours[day], { start: newStart, end: "18:00" }];
        setSettings({ ...settings, weekly_hours: newWeeklyHours });
    };

    const handleRemoveTimeSlot = (day: string, index: number) => {
        const newWeeklyHours = { ...settings.weekly_hours };
        newWeeklyHours[day] = newWeeklyHours[day].filter((_: any, i: number) => i !== index);
        setSettings({ ...settings, weekly_hours: newWeeklyHours });
    };

    const handleUpdateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
        const newWeeklyHours = { ...settings.weekly_hours };
        newWeeklyHours[day][index][field] = value;
        setSettings({ ...settings, weekly_hours: newWeeklyHours });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('coach_appointment_settings')
                .upsert([{
                    coach_id: coachId,
                    ...settings,
                    updated_at: new Date().toISOString()
                }]);

            if (error) throw error;
            toast.success(t('settings_saved') || "Paramètres enregistrés");
            if (onSave) onSave();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    const days = [
        { id: 'mon', label: t('day_monday') || 'Lundi' },
        { id: 'tue', label: t('day_tuesday') || 'Mardi' },
        { id: 'wed', label: t('day_wednesday') || 'Mercredi' },
        { id: 'thu', label: t('day_thursday') || 'Jeudi' },
        { id: 'fri', label: t('day_friday') || 'Vendredi' },
        { id: 'sat', label: t('day_saturday') || 'Samedi' },
        { id: 'sun', label: t('day_sunday') || 'Dimanche' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Clock className="text-emerald-500" /> {t('appointment_settings_title') || "Configuration des Disponibilités"}
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gérez vos horaires et règles de réservation</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-emerald-500/20"
                >
                    {loading ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div> : <Save size={16} />}
                    {t('save') || "Enregistrer"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: General Rules */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-4 flex items-center gap-2">
                            <Shield size={16} className="text-indigo-400" /> Règles Générales
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Durée par défaut (min)</label>
                                <input
                                    type="number"
                                    value={settings.default_duration}
                                    onChange={(e) => setSettings({ ...settings, default_duration: parseInt(e.target.value) })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('buffer_time_label')}</label>
                                <input
                                    type="number"
                                    value={settings.buffer_time}
                                    onChange={(e) => setSettings({ ...settings, buffer_time: parseInt(e.target.value) })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-emerald-500/50"
                                />
                                <p className="text-[9px] text-slate-500 italic mt-1">{t('buffer_time_desc')}</p>
                            </div>

                            <div className="space-y-3 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t('booking_window_label')}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={(() => {
                                            const daysVal = settings.booking_window_days || 0;
                                            if (daysVal === 0) return "";
                                            const fact = displayUnit === 'months' ? 30 : displayUnit === 'weeks' ? 7 : 1;
                                            return Math.floor(daysVal / fact);
                                        })()}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            if (inputValue === "") {
                                                setSettings({ ...settings, booking_window_days: 0 });
                                                return;
                                            }

                                            const val = parseInt(inputValue);
                                            const multiplier = displayUnit === 'months' ? 30 : displayUnit === 'weeks' ? 7 : 1;
                                            setSettings({ ...settings, booking_window_days: val * multiplier });
                                        }}
                                        className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-emerald-500/50"
                                        placeholder="0"
                                    />
                                    <select
                                        id="window-unit"
                                        value={displayUnit}
                                        onChange={(e) => {
                                            const unit = e.target.value as 'days' | 'weeks' | 'months';
                                            const daysVal = settings.booking_window_days || 0;
                                            const oldFactor = displayUnit === 'months' ? 30 : displayUnit === 'weeks' ? 7 : 1;
                                            const baseValue = daysVal > 0 ? Math.round(daysVal / oldFactor) : 1;
                                            const newMultiplier = unit === 'months' ? 30 : unit === 'weeks' ? 7 : 1;

                                            setDisplayUnit(unit);
                                            setSettings({ ...settings, booking_window_days: baseValue * newMultiplier });
                                        }}
                                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-[10px] font-black uppercase outline-none"
                                    >
                                        <option value="days">{t('days')}</option>
                                        <option value="weeks">{t('weeks')}</option>
                                        <option value="months">{t('months')}</option>
                                    </select>
                                </div>
                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">
                                    {settings.booking_window_days > 0
                                        ? `${t('booking_window_info_prefix')} ${settings.booking_window_days} ${t('days')}.`
                                        : t('enter_duration')}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest">{t('public_page_label')}</label>
                                    <p className="text-[9px] text-slate-500">{t('public_page_desc')}</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, is_public: !settings.is_public })}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative",
                                        settings.is_public ? "bg-emerald-500" : "bg-slate-800"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                                        settings.is_public ? "right-1" : "left-1"
                                    )}></div>
                                </button>
                            </div>

                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Notifications Automatiques</h4>

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-300">Email de confirmation</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.confirmation_email}
                                        onChange={(e) => setSettings({ ...settings, confirmation_email: e.target.checked })}
                                        className="accent-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-300">SMS de confirmation</span>
                                        <span className="text-[8px] text-slate-600 italic">Nécessite des crédits SMS</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.confirmation_sms}
                                        onChange={(e) => setSettings({ ...settings, confirmation_sms: e.target.checked })}
                                        className="accent-emerald-500"
                                    />
                                </div>
                            </div>

                            <Card className={cn(
                                "p-4 border-2 transition-all",
                                settings.is_external_booking_enabled ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                            )}>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-black text-white uppercase tracking-widest">Activer Réservation Externe</label>
                                            <span className="text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded-md">PREMIUM</span>
                                        </div>
                                        <p className="text-[9px] text-slate-400">Facturation du calendrier externe activée.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!settings.is_external_booking_enabled) {
                                                const platformFee = 29;
                                                const confirmed = window.confirm(`L'activation de cette option générera une facturation de ${platformFee}€/mois sur votre compte More Training. Souhaitez-vous continuer ?`);
                                                if (!confirmed) return;
                                            }
                                            setSettings({ ...settings, is_external_booking_enabled: !settings.is_external_booking_enabled });
                                        }}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative",
                                            settings.is_external_booking_enabled ? "bg-indigo-500" : "bg-slate-800"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                                            settings.is_external_booking_enabled ? "right-1" : "left-1"
                                        )}></div>
                                    </button>
                                </div>
                            </Card>

                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prix de la session (Client Externe)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.session_price_cents / 100}
                                        onChange={(e) => setSettings({ ...settings, session_price_cents: Math.round(parseFloat(e.target.value) * 100) })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-emerald-500/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600">EUR</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={12} /> Fuseau Horaire
                                </label>
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none"
                                >
                                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                                    <option value="Europe/London">Europe/London (UTC+0)</option>
                                    <option value="America/New_York">New York (UTC-5)</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-indigo-500/5 border-indigo-500/20">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Lien de Partage</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">Partagez ce lien sur vos réseaux sociaux pour permettre des réservations directes.</p>
                                <div className="flex bg-slate-950 rounded-lg p-2 border border-slate-800 overflow-hidden">
                                    <code className="text-[9px] text-emerald-400 truncate flex-1">more-training.com/book/{pseudo || "votre-pseudo"}</code>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Weekly Schedule */}
                <div className="lg:col-span-2 space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Horaires d'ouverture hebdomadaires</p>
                    <div className="space-y-3">
                        {days.map((day) => (
                            <div key={day.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-[2rem] transition-all hover:border-slate-700">
                                <div className="w-24 shrink-0">
                                    <span className="text-xs font-black text-white uppercase tracking-tighter">{day.label}</span>
                                </div>

                                <div className="flex-1 flex flex-wrap gap-2">
                                    {settings.weekly_hours[day.id].length === 0 ? (
                                        <span className="text-[10px] font-bold text-slate-600 uppercase italic">Fermé</span>
                                    ) : (
                                        settings.weekly_hours[day.id].map((slot: TimeRange, slotIdx: number) => (
                                            <div key={slotIdx} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 group">
                                                <input
                                                    type="time"
                                                    value={slot.start}
                                                    onChange={(e) => handleUpdateTimeSlot(day.id, slotIdx, 'start', e.target.value)}
                                                    className="bg-transparent text-white text-xs font-bold outline-none"
                                                />
                                                <span className="text-slate-600 text-[10px]">—</span>
                                                <input
                                                    type="time"
                                                    value={slot.end}
                                                    onChange={(e) => handleUpdateTimeSlot(day.id, slotIdx, 'end', e.target.value)}
                                                    className="bg-transparent text-white text-xs font-bold outline-none"
                                                />
                                                <button
                                                    onClick={() => handleRemoveTimeSlot(day.id, slotIdx)}
                                                    className="text-slate-600 hover:text-red-400 transition-colors ml-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAddTimeSlot(day.id)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
