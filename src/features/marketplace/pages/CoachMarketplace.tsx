import React, { useState } from 'react';
import {
    Search, Filter, MapPin,
    Globe, Star, PlayCircle,
    ChevronRight, CreditCard,
    X, Check, Video, Camera,
    ArrowRight, Info
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/Card';
import { LanguageSwitcher } from '@/shared/components/common/LanguageSwitcher';
import { SEO } from '@/shared/components/common/SEO';

interface Coach {
    id: string;
    name: string;
    role: string;
    specialty: string;
    rating: number;
    distancePrice: string;
    presencialPrice: string;
    avatar: string;
    tags: string[];
    bio: string;
    experience: string;
    gallery: number[];
    videoUrl: string;
    presencial: boolean;
    distance: boolean;
}

const MOCK_COACHES: Coach[] = [
    {
        id: 'c1',
        name: 'Mike Henderson',
        role: 'Endurance Specialist',
        specialty: 'Marathon & Ironman Prep',
        rating: 4.9,
        distancePrice: '85€/mo',
        presencialPrice: '45€/hr',
        avatar: 'M',
        tags: ['Running', 'Cycling', 'Triathlon'],
        bio: 'Former elite triathlete dedicated to data-driven performance. I combine physiological analysis with psychological toughness training.',
        experience: '12+ Years',
        gallery: [1, 2, 3],
        videoUrl: '#',
        presencial: true,
        distance: true
    },
    {
        id: 'c2',
        name: 'Sarah Chen',
        role: 'Strength & Conditioning',
        specialty: 'Explosive Power & Injury Prevention',
        rating: 5.0,
        distancePrice: '120€/mo',
        presencialPrice: '60€/hr',
        avatar: 'S',
        tags: ['CrossFit', 'Trail', 'Fitness'],
        bio: 'Specialized in building robust athletes who last. My methods focus on biomechanical efficiency and sustainable growth.',
        experience: '8 Years',
        gallery: [1, 2],
        videoUrl: '#',
        presencial: true,
        distance: true
    },
    {
        id: 'c3',
        name: 'Lorenzo Valli',
        role: 'Cycling Technical Director',
        specialty: 'Aero Optimization & FTP Build',
        rating: 4.8,
        distancePrice: '95€/mo',
        presencialPrice: 'N/A',
        avatar: 'L',
        tags: ['Cycling', 'Triathlon'],
        bio: 'Italian performance coach focusing on cycling mechanics and metabolic efficiency. Remote-only elite program.',
        experience: '15 Years',
        gallery: [1, 2, 3, 4],
        videoUrl: '#',
        presencial: false,
        distance: true
    }
];

interface CoachMarketplaceProps {
    onSelectCoach: (coach: Coach) => void;
    onBackToLanding: () => void;
}

export function CoachMarketplace({ onSelectCoach, onBackToLanding }: CoachMarketplaceProps) {
    const { t } = useLanguage();
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [filterType, setFilterType] = useState('all'); // all, distance, presencial
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCoaches = MOCK_COACHES.filter(c => {
        const matchesType = filterType === 'all'
            ? true
            : filterType === 'distance' ? c.distance : c.presencial;
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
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
                schemaData={{
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": t('marketplace_title'),
                    "itemListElement": MOCK_COACHES.map((coach, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Person",
                            "name": coach.name,
                            "jobTitle": coach.role,
                            "description": coach.bio,
                            "url": `https://more-training.com/marketplace?coach=${coach.id}`
                        }
                    }))
                }}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCoaches.map(coach => (
                        <Card
                            key={coach.id}
                            onClick={() => setSelectedCoach(coach)}
                            className="group p-0 bg-slate-950 border-slate-900 overflow-hidden hover:border-indigo-500/30 hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                        >
                            <div className="relative h-48 bg-slate-900 border-b border-slate-800 flex items-center justify-center">
                                <div className="absolute top-4 right-4 z-20">
                                    <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-xl">
                                        <Star className="text-amber-400 fill-amber-400" size={14} />
                                        <span className="text-[10px] font-black">{coach.rating}</span>
                                    </div>
                                </div>
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    {coach.avatar}
                                </div>
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    {coach.distance && <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20"><Globe size={14} /></div>}
                                    {coach.presencial && <div className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20"><MapPin size={14} /></div>}
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">{coach.name}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">{coach.role}</p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {coach.tags.map(tag => (
                                        <span key={tag} className="text-[9px] font-black uppercase tracking-tighter px-3 py-1 bg-slate-900 text-slate-400 rounded-lg">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-900 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Starting from</p>
                                        <p className="text-lg font-black text-white">{coach.distancePrice}</p>
                                    </div>
                                    <button className="bg-slate-900 group-hover:bg-indigo-600 p-3 rounded-2xl border border-slate-800 group-hover:border-indigo-500 transition-all">
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Coach CV Modal */}
            {selectedCoach && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-5xl h-[85vh] bg-slate-950 border-white/5 shadow-3xl overflow-hidden flex flex-col md:flex-row p-0">
                        <button
                            onClick={() => setSelectedCoach(null)}
                            className="absolute top-6 right-6 z-[120] w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-2xl"
                        >
                            <X size={24} />
                        </button>

                        {/* Visual Column */}
                        <div className="md:w-2/5 h-full bg-slate-900 border-r border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
                            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover"></div>
                            <div className="relative z-10">
                                <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-emerald-400 to-indigo-600 p-1 flex items-center justify-center shadow-3xl mb-8 group cursor-pointer">
                                    <div className="w-full h-full bg-slate-950 rounded-[2.8rem] flex items-center justify-center text-6xl font-black text-white group-hover:scale-95 transition-transform duration-500">
                                        {selectedCoach.avatar}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle size={48} className="text-white" />
                                    </div>
                                </div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">{selectedCoach.name}</h2>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mb-8">{selectedCoach.specialty}</p>
                                <div className="flex gap-4 mb-2">
                                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex-1">
                                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Ratings</p>
                                        <p className="text-lg font-black text-white">{selectedCoach.rating}/5.0</p>
                                    </div>
                                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex-1">
                                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Exp.</p>
                                        <p className="text-lg font-black text-white">{selectedCoach.experience}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="md:w-3/5 h-full overflow-y-auto p-12 scrollbar-hide">
                            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Interactive Curriculum Vitae</h4>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-xl font-medium text-slate-300 leading-relaxed italic mb-12">
                                    "{selectedCoach.bio}"
                                </p>
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <h5 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white mb-6">
                                        <Camera className="text-emerald-400" size={18} /> Experience Gallery
                                    </h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {selectedCoach.gallery.map(i => (
                                            <div key={i} className="aspect-square bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-700 hover:border-emerald-500 transition-all overflow-hidden group">
                                                <div className="w-full h-full bg-slate-800 bg-opacity-20 flex items-center justify-center">
                                                    <Info size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h5 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white mb-6">
                                        <CreditCard className="text-indigo-400" size={18} /> Training Packages
                                    </h5>
                                    <div className="space-y-4">
                                        {selectedCoach.distance && (
                                            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <Globe size={24} />
                                                    </div>
                                                    <div>
                                                        <h6 className="text-sm font-black uppercase">{t('training_distance')}</h6>
                                                        <ul className="text-[9px] font-bold text-slate-500 uppercase flex gap-3 mt-1">
                                                            <li>• Weekly Feedback</li>
                                                            <li>• AI Analysis</li>
                                                            <li>• Chat Access</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-6">
                                                    <p className="text-2xl font-black text-emerald-400">{selectedCoach.distancePrice}</p>
                                                    <button
                                                        onClick={() => onSelectCoach(selectedCoach)}
                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                                                    >
                                                        Hire Now
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCoach.presencial && (
                                            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                        <MapPin size={24} />
                                                    </div>
                                                    <div>
                                                        <h6 className="text-sm font-black uppercase">{t('training_presencial')}</h6>
                                                        <ul className="text-[9px] font-bold text-slate-500 uppercase flex gap-3 mt-1">
                                                            <li>• Biometric Setup</li>
                                                            <li>• Field Drill</li>
                                                            <li>• Equipment Check</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-6">
                                                    <p className="text-2xl font-black text-indigo-400">{selectedCoach.presencialPrice}</p>
                                                    <button
                                                        onClick={() => onSelectCoach(selectedCoach)}
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                                                    >
                                                        Book Session
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
                                        <Info className="text-indigo-400 shrink-0 mt-0.5" size={16} />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">
                                            The payment will be processed directly with the coach's Stripe terminal. More Training takes 0% commission on professional athletic contracts.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
