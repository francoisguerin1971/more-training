import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    BookOpen, Search, FileText, Video, Link as LinkIcon,
    ExternalLink, Download, PlayCircle, Filter
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/core/utils/cn';

// Mock Data for Resources
const MOCK_RESOURCES = [
    {
        id: 1,
        title: "Guide Nutrition 2026",
        description: "Protocole complet pour l'optimisation de la performance.",
        type: "document",
        date: "15 Jan 2026",
        author: "Coach Alex"
    },
    {
        id: 2,
        title: "Technique Squat Analysis",
        description: "Décomposition mouvement par mouvement du Back Squat.",
        type: "video",
        date: "12 Jan 2026",
        author: "Coach Alex",
        duration: "12:30"
    },
    {
        id: 3,
        title: "Strava Team Club",
        description: "Rejoignez le club privé pour les challenges hebdomadaires.",
        type: "link",
        date: "01 Jan 2026",
        url: "https://strava.com"
    },
    {
        id: 4,
        title: "Sommeil & Récupération",
        description: "Les 10 commandements pour un sommeil réparateur.",
        type: "document",
        date: "20 Dec 2025",
        author: "Dr. Sleep"
    },
    {
        id: 5,
        title: "Mental Prep Routine",
        description: "Visualisation guidée avant compétition.",
        type: "video",
        date: "10 Dec 2025",
        author: "Coach Chill",
        duration: "15:00"
    },
    {
        id: 6,
        title: "Whoop Team Invite",
        description: "Lien d'invitation pour partager vos données biométriques.",
        type: "link",
        date: "01 Dec 2025",
        url: "https://whoop.com"
    }
];

export function ResourcesLibrary() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: t('category_all'), icon: Filter },
        { id: 'document', label: t('category_documents'), icon: FileText },
        { id: 'video', label: t('category_videos'), icon: Video },
        { id: 'link', label: t('category_links'), icon: LinkIcon },
    ];

    const filteredResources = MOCK_RESOURCES.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || resource.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'document': return <FileText size={24} className="text-emerald-400" />;
            case 'video': return <PlayCircle size={24} className="text-indigo-400" />;
            case 'link': return <LinkIcon size={24} className="text-amber-400" />;
            default: return <BookOpen size={24} className="text-slate-400" />;
        }
    };

    const getActionLabel = (type: string) => {
        switch (type) {
            case 'document': return t('download_resource');
            case 'video': return t('open_resource'); // "Watch" in future
            case 'link': return t('open_resource');
            default: return t('open_resource');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                    {t('library')}
                </h1>
                <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
                    {t('library_subtitle') || "Éducation & Ressources"}
                </p>
            </div>

            {/* Controls: Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                        placeholder={t('search_resources')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
                    {filters.map((filter) => {
                        const Icon = filter.icon;
                        const isActive = activeFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all",
                                    isActive
                                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon size={14} />
                                <span className="hidden md:inline">{filter.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.length > 0 ? (
                    filteredResources.map((resource) => (
                        <Card key={resource.id} className="bg-slate-950 border-slate-800 hover:border-emerald-500/30 transition-all group cursor-pointer h-full flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 group-hover:bg-slate-800 transition-colors">
                                        {getIcon(resource.type)}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded-md">
                                        {resource.type}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                    {resource.title}
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                                    {resource.description}
                                </p>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-900/30 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {resource.date}
                                </span>
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:translate-x-1 transition-transform">
                                    {getActionLabel(resource.type)}
                                    {resource.type === 'link' ? <ExternalLink size={12} /> : <Download size={12} />}
                                </button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                            <Search size={24} className="text-slate-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg">{t('no_resources_found')}</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-md">
                            Essayez de modifier vos filtres ou votre recherche.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
