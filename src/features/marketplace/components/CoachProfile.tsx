import React, { useState } from 'react';
import {
    X, PlayCircle, Star, Camera, CreditCard,
    Globe, MapPin, Info, Check, Clock, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/core/utils/cn';
import { CoachProfile as ICoachProfile, CoachOffering } from '../stores/marketplaceStore';
import { useLanguage } from '@/shared/context/LanguageContext';

interface CoachProfileProps {
    coach: ICoachProfile;
    onClose: () => void;
    onSelectOffering: (offering: CoachOffering) => void;
}

export function CoachProfile({ coach, onClose, onSelectOffering }: CoachProfileProps) {
    const { t } = useLanguage();

    // Derived state
    const packages = coach.offerings?.filter(o => o.type === 'PACKAGE' && o.is_active) || [];
    const hourlyRates = coach.offerings?.filter(o => o.type === 'HOURLY' && o.is_active) || [];

    // Sort logic: Recommended first, then by price
    const sortedPackages = [...packages].sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
        return b.price_cents - a.price_cents;
    });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 backdrop-blur-2xl bg-slate-950/90 animate-in fade-in duration-300">
            <Card className="w-full max-w-7xl h-full md:h-[90vh] bg-[#0A0D14] border-white/5 shadow-3xl overflow-hidden flex flex-col md:flex-row p-0 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[120] w-12 h-12 bg-black/50 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/10 group"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                </button>

                {/* VISUAL COLUMN (Left) */}
                <div className="hidden md:flex md:w-1/3 h-full bg-slate-900 relative overflow-hidden flex-col items-center text-center">
                    {/* Background Image / Texture */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-slate-900/50 to-transparent" />

                    <div className="relative z-10 p-12 h-full flex flex-col items-center">
                        <div className="mt-8 mb-8 relative group cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative w-48 h-48 rounded-[2.5rem] p-1 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/10">
                                {coach.avatar_url ? (
                                    <img
                                        src={coach.avatar_url}
                                        alt={coach.full_name}
                                        className="w-full h-full object-cover rounded-[2.3rem]"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-950 rounded-[2.3rem] flex items-center justify-center text-6xl font-black text-white">
                                        {(coach.first_name?.[0] || 'C')}{(coach.last_name?.[0] || '')}
                                    </div>
                                )}
                            </div>
                            {coach.video_url && (
                                <div className="absolute bottom-[-10px] right-[-10px] bg-white text-black p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                    <PlayCircle size={24} fill="currentColor" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 leading-none">
                            {coach.first_name} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">
                                {coach.last_name}
                            </span>
                        </h2>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                            {(coach.specialties || ['Performance', 'Strength']).slice(0, 3).map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto w-full grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Rating</p>
                                <div className="flex items-center justify-center gap-2">
                                    <Star size={16} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xl font-black text-white">{coach.rating?.toFixed(1) || '5.0'}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Expérience</p>
                                <p className="text-xl font-black text-white">{coach.years_experience || '10+'} Ans</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT COLUMN (Right) */}
                <div className="md:w-2/3 h-full overflow-y-auto bg-[#0A0D14] scrollbar-hide">
                    <div className="p-8 md:p-16 space-y-16">

                        {/* Mobile Header (Visible only on mobile) */}
                        <div className="md:hidden flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-xl font-black text-white overflow-hidden shrink-0">
                                {coach.avatar_url ? (
                                    <img src={coach.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{(coach.first_name?.[0])}</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase text-white">{coach.full_name}</h2>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">
                                    {coach.specialties?.[0] || 'Coach Pro'}
                                </p>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <section>
                            <h4 className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">
                                <Info size={14} className="text-indigo-500" />
                                {t('about_coach', 'À propos du coach')}
                            </h4>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-xl md:text-2xl font-medium text-slate-200 leading-relaxed">
                                    {coach.bio || t('no_bio', 'Aucune biographie disponible.')}
                                </p>
                            </div>
                        </section>

                        {/* Gallery Section - Only show if images exist */}
                        {coach.gallery_urls && coach.gallery_urls.length > 0 && (
                            <section>
                                <h4 className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">
                                    <Camera size={14} className="text-emerald-500" />
                                    {t('gallery', 'Gallerie')}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {coach.gallery_urls.map((url, i) => (
                                        <div key={i} className="aspect-square bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group relative cursor-zoom-in">
                                            <img src={url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* PACKAGES Section */}
                        <section>
                            <h4 className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">
                                <Globe size={14} className="text-emerald-500" />
                                {t('training_packages', 'Programmes & Suivi')}
                            </h4>

                            <div className="grid grid-cols-1 gap-4">
                                {packages.length === 0 ? (
                                    <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center">
                                        <p className="text-slate-500 text-xs uppercase tracking-widest">Aucun forfait disponible</p>
                                    </div>
                                ) : (
                                    sortedPackages.map(pkg => (
                                        <PublicPricingCard
                                            key={pkg.id}
                                            offering={pkg}
                                            onSelect={() => onSelectOffering(pkg)}
                                            t={t}
                                        />
                                    ))
                                )}
                            </div>
                        </section>

                        {/* HOURLY RATES Section */}
                        {hourlyRates.length > 0 && (
                            <section>
                                <h4 className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">
                                    <Clock size={14} className="text-indigo-500" />
                                    {t('consultations', 'Consultations & Séances')}
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {hourlyRates.map(rate => (
                                        <PublicPricingCard
                                            key={rate.id}
                                            offering={rate}
                                            onSelect={() => onSelectOffering(rate)}
                                            t={t}
                                            variant="compact"
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Footer Disclaimer */}
                        <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl mt-12">
                            <div className="flex items-start gap-4">
                                <Info size={16} className="text-indigo-400 mt-1 shrink-0" />
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                    <span className="text-indigo-300 font-bold uppercase tracking-wider block mb-1">Garantie Souveraineté Financière</span>
                                    {t('marketplace_disclaimer', 'Les paiements sont traités directement via le terminal Stripe du coach. More Training ne prélève aucune commission sur les revenus des coachs.')}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </Card>
        </div>
    );
}

function PublicPricingCard({ offering, onSelect, t, variant = 'full' }: { offering: CoachOffering, onSelect: () => void, t: any, variant?: 'full' | 'compact' }) {
    const isPackage = offering.type === 'PACKAGE';
    const isRecommended = offering.is_recommended;

    if (variant === 'compact') {
        return (
            <div
                onClick={onSelect}
                className="group relative p-6 bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 rounded-3xl cursor-pointer transition-all hover:bg-slate-900"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Clock size={18} />
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-white block">€{offering.price_cents / 100}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">/ séance</span>
                    </div>
                </div>
                <h5 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                    {offering.name}
                </h5>
                <p className="text-[10px] text-slate-500 line-clamp-2 mb-4">
                    {offering.description}
                </p>
                <button className="w-full py-2 bg-slate-800 group-hover:bg-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-colors">
                    Réserver
                </button>
            </div>
        )
    }

    return (
        <div
            onClick={onSelect}
            className={cn(
                "group relative p-8 rounded-3xl border transition-all cursor-pointer overflow-hidden",
                isRecommended
                    ? "bg-[#0F1218] border-emerald-500/30 shadow-2xl shadow-emerald-900/10"
                    : "bg-slate-900/30 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700"
            )}
        >
            {isRecommended && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                    Recommandé
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            isRecommended ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-white transition-colors"
                        )}>
                            <Tag size={20} />
                        </div>
                        <div>
                            <h5 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">
                                {offering.name}
                            </h5>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {isRecommended ? 'Le choix le plus populaire' : 'Formule standard'}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl mb-6">
                        {offering.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {offering.features.map((feat, i) => (
                            <span key={i} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950/50 px-2 py-1 rounded-lg border border-white/5">
                                <Check size={10} className="text-emerald-500" /> {feat}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end gap-6 md:gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-800/50 pt-6 md:pt-0">
                    <div className="text-left md:text-right">
                        <span className="text-3xl md:text-4xl font-black text-white block">€{offering.price_cents / 100}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">par mois</span>
                    </div>

                    <button className={cn(
                        "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg whitespace-nowrap",
                        isRecommended
                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                            : "bg-slate-800 hover:bg-white text-white hover:text-slate-950"
                    )}>
                        Choisir ce plan
                    </button>
                </div>
            </div>
        </div>
    );
}
