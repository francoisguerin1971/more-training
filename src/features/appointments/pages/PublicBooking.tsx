import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/core/services/supabase';
import { BookingWizard } from '../components/Booking/BookingWizard';
import { Card } from '@/shared/components/ui/Card';
import { Loader2, Globe } from 'lucide-react';

import { useLanguage } from '@/shared/context/LanguageContext';
import { SEO } from '@/shared/components/common/SEO';

export function PublicBooking() {
    const { t } = useLanguage();
    const { pseudo } = useParams<{ pseudo: string }>();
    const [coach, setCoach] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoach = async () => {
            if (!pseudo) return;
            try {
                // Fetch both profile AND appointment settings to check activation
                const { data: profile, error: pError } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, role, pseudo')
                    .eq('pseudo', pseudo)
                    .single();

                if (profile && profile.role === 'pro') {
                    const { data: settings } = await supabase
                        .from('coach_appointment_settings')
                        .select('is_external_booking_enabled, is_public, session_price_cents, booking_window_days')
                        .eq('coach_id', profile.id)
                        .single();

                    setCoach({
                        ...profile,
                        is_active: settings?.is_external_booking_enabled && settings?.is_public,
                        session_price_cents: settings?.session_price_cents || 4500,
                        booking_window_days: settings?.booking_window_days || 30
                    });
                }
            } catch (err) {
                console.error("Error fetching coach for public booking:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoach();
    }, [pseudo]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
                <Loader2 className="text-emerald-500 animate-spin mb-4" size={48} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">{t('loading_booking_page')}</p>
            </div>
        );
    }

    if (!coach || !coach.is_active) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
                <SEO title={t('service_not_activated')} />
                <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mb-6">
                    <Globe size={40} />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{t('service_not_activated')}</h1>
                <p className="text-slate-500 text-sm max-w-xs">{!coach ? t('booking_link_invalid') : `${t('booking_not_active_for')} ${coach.full_name}.`}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 selection:bg-emerald-500/30">
            <SEO
                title={`${t('booking_window_label')} | ${coach.full_name}`}
                description={`${t('appointments_subtitle')} ${coach.full_name}`}
            />
            {/* Minimalist Header */}
            <div className="max-w-4xl mx-auto flex items-center justify-center mb-12 gap-4">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent to-emerald-500/50 rounded-full"></div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter">More <span className="text-emerald-400">Training</span></h1>
                <div className="w-12 h-1 bg-gradient-to-l from-transparent to-emerald-500/50 rounded-full"></div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Artist/Coach Intro */}
                <div className="text-center space-y-4">
                    <div className="inline-block p-1 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl">
                        <div className="w-24 h-24 rounded-[1.8rem] bg-slate-800 flex items-center justify-center text-3xl font-black text-white overflow-hidden">
                            {coach.avatar_url ? <img src={coach.avatar_url} className="w-full h-full object-cover" /> : coach.full_name?.[0]}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{coach.full_name}</h2>
                        <p className="text-emerald-500 text-xs font-black uppercase tracking-widest mt-1">{t('partner_coach_label')}</p>
                    </div>
                </div>

                <Card className="bg-slate-900/50 border-slate-800 p-6 md:p-12 rounded-[3.5rem] shadow-3xl">
                    <BookingWizard
                        coachId={coach.id}
                        coachName={coach.full_name}
                        isExternal={true}
                        sessionPriceCents={coach.session_price_cents}
                        bookingWindowDays={coach.booking_window_days}
                        onComplete={() => {
                            // Optionally redirect to a thank you page or More Training home
                        }}
                    />
                </Card>

                {/* Footer */}
                <footer className="text-center pt-8">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                        {t('powered_by')} <span className="text-emerald-500/50">More Training</span> & Moovoow Engine
                    </p>
                </footer>
            </div>
        </div>
    );
}
