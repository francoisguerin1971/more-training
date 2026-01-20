import React, { useState, useEffect } from 'react';
import {
    Search, Filter, MapPin,
    Globe, Star, PlayCircle,
    ChevronRight, CreditCard,
    X, Check, Video, Camera,
    ArrowRight, Info
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/core/utils/cn';
import { Card } from '@/shared/components/ui/Card';
import { LanguageSwitcher } from '@/shared/components/common/LanguageSwitcher';
import { SEO } from '@/shared/components/common/SEO';
import { useMarketplaceStore, CoachProfile as ICoachProfile } from '@/features/marketplace/stores/marketplaceStore';
import { CoachProfile } from '@/features/marketplace/components/CoachProfile';

export function CoachMarketplace({ onSelectCoach: onSelectCoachProp, onBackToLanding }: { onSelectCoach: any, onBackToLanding: () => void }) {
    const { t } = useLanguage();
    const { coaches, loading, fetchCoaches } = useMarketplaceStore();
    const [selectedCoach, setSelectedCoach] = useState<ICoachProfile | null>(null);
    const [filterType, setFilterType] = useState('all'); // all, distance, presencial
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCoaches();
    }, [fetchCoaches]);

    const filteredCoaches = coaches.filter(c => {
        // Determine capabilities based on offerings
        const hasDistance = c.offerings?.some(o => o.type === 'PACKAGE') || false;
        const hasPresencial = c.offerings?.some(o => o.type === 'HOURLY') || false; // Approximation for now

        const matchesType = filterType === 'all'
            ? true
            : filterType === 'distance' ? hasDistance : hasPresencial;

        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            (c.full_name || '').toLowerCase().includes(searchLower) ||
            (c.specialties || []).some(tag => tag.toLowerCase().includes(searchLower));

        return matchesType && matchesSearch;
    });

    return (
        <div className="bg-slate-950 min-h-screen text-white pb-20 selection:bg-indigo-500/30">
            <SEO
                titleKey="seo_marketplace_title"
                descriptionKey="seo_default_description"
                keywords={["find sports coach", "endurance expert", "athletic conditioning", "performance coaching", "hire a coach"]}
                internalLink="/pricing"
                canonicalPath="/marketplace"
            />

            {/* Header */}
            <div className="pt-24 pb-12 bg-slate-900/50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={onBackToLanding}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <ChevronRight className="rotate-180" size={14} /> {t('back_to_ecosystem')}
                        </button>
                        <LanguageSwitcher variant="compact" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight max-w-2xl">
                        {t('marketplace_title').split(' ').slice(0, -2).join(' ')} <span className="text-indigo-400">{t('marketplace_title').split(' ').slice(-2).join(' ')}</span>
                    </h1>

                    <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder={t('marketplace_search_placeholder')}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl w-full md:w-auto">
                            {[
                                { id: 'all', label: t('marketplace_filter_all') },
                                { id: 'distance', label: t('training_distance') },
                                { id: 'presencial', label: t('training_presencial') }
                            ].map(btn => (
                                <button
                                    key={btn.id}
                                    onClick={() => setFilterType(btn.id)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filterType === btn.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading && (
                    <div className="text-center py-20 text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">
                        Chargement des coachs...
                    </div>
                )}

                {!loading && filteredCoaches.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Aucun coach trouvé</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCoaches.map(coach => {
                        // Helper to find lowest price
                        const packages = coach.offerings?.filter(o => o.type === 'PACKAGE') || [];
                        const lowestPrice = packages.length > 0
                            ? Math.min(...packages.map(p => p.price_cents))
                            : null;

                        return (
                            <Card
                                key={coach.id}
                                onClick={() => setSelectedCoach(coach)}
                                className="group p-0 bg-slate-950 border-slate-900 overflow-hidden hover:border-indigo-500/30 hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                            >
                                <div className="relative h-48 bg-slate-900 border-b border-slate-800 flex items-center justify-center overflow-hidden">
                                    {/* Background blur for avatar */}
                                    <div className="absolute inset-0 opacity-20 bg-indigo-500/10 blur-3xl group-hover:opacity-40 transition-opacity" />

                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-xl">
                                            <Star className="text-amber-400 fill-amber-400" size={14} />
                                            <span className="text-[10px] font-black">{coach.rating?.toFixed(1) || '5.0'}</span>
                                        </div>
                                    </div>

                                    <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                        <div className="w-full h-full bg-slate-950 rounded-[1.9rem] flex items-center justify-center text-4xl font-black text-white overflow-hidden">
                                            {coach.avatar_url ? (
                                                <img src={coach.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{(coach.first_name?.[0])}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 flex gap-2">
                                        {(coach.offerings?.some(o => o.type === 'PACKAGE')) && <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20"><Globe size={14} /></div>}
                                        {(coach.offerings?.some(o => o.type === 'HOURLY')) && <div className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20"><MapPin size={14} /></div>}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors truncate">
                                        {coach.full_name || coach.email.split('@')[0]}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 truncate">
                                        {coach.specialties?.[0] || 'Coach Certifié'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6 min-h-[50px] content-start">
                                        {(coach.specialties || []).slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[9px] font-black uppercase tracking-tighter px-3 py-1 bg-slate-900 text-slate-400 rounded-lg border border-slate-800">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-slate-900 flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Starting from</p>
                                            <p className="text-lg font-black text-white">
                                                {lowestPrice ? `€${lowestPrice / 100}/mo` : 'Sur devis'}
                                            </p>
                                        </div>
                                        <button className="bg-slate-900 group-hover:bg-indigo-600 p-3 rounded-2xl border border-slate-800 group-hover:border-indigo-500 transition-all">
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Coach Profile Modal */}
            {selectedCoach && (
                <CoachProfile
                    coach={selectedCoach}
                    onClose={() => setSelectedCoach(null)}
                    onSelectOffering={(offering) => {
                        console.log('Selected offering:', offering);
                        // Future: Navigate to checkout / Stripe or Message
                    }}
                />
            )}
        </div>
    );
}

