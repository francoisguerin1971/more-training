import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    BookOpen, Search, FileText, Video, Link as LinkIcon,
    ExternalLink, Download, PlayCircle, Filter, Plus,
    Trash2, Edit2, X, CheckCircle2, Globe, Lock, Loader2
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/core/utils/cn';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, es, it, de, ca } from 'date-fns/locale';

const locales: Record<string, any> = { fr, es, it, de, ca };

export function ResourcesLibrary() {
    const { t, language } = useLanguage();
    const { currentUser, getCoachResources, getSharedResources, saveCoachResource, deleteCoachResource } = useAuthStore();

    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);

    const isCoach = currentUser?.role === 'pro';

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'document',
        content_url: '',
        is_public: true
    });

    const loadResources = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const data = isCoach
                ? await getCoachResources(currentUser.id)
                : await getSharedResources();
            setResources(data || []);
        } catch (err) {
            console.error('Failed to load resources:', err);
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, [currentUser, isCoach]);

    const filters = [
        { id: 'all', label: t('category_all'), icon: Filter },
        { id: 'document', label: t('category_documents'), icon: FileText },
        { id: 'video', label: t('category_videos'), icon: Video },
        { id: 'link', label: t('category_links'), icon: LinkIcon },
    ];

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || resource.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleOpenModal = (resource?: any) => {
        if (resource) {
            setEditingResource(resource);
            setFormData({
                title: resource.title,
                description: resource.description || '',
                type: resource.type,
                content_url: resource.content_url,
                is_public: resource.is_public
            });
        } else {
            setEditingResource(null);
            setFormData({
                title: '',
                description: '',
                type: 'document',
                content_url: '',
                is_public: true
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.id) return;

        const payload = {
            ...formData,
            id: editingResource?.id,
            coach_id: currentUser.id
        };

        const { error } = await saveCoachResource(payload);
        if (error) {
            toast.error(t('error_generic'));
        } else {
            toast.success(t('save_success'));
            setShowModal(false);
            loadResources();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;
        const { error } = await deleteCoachResource(id);
        if (error) {
            toast.error(t('error_generic'));
        } else {
            toast.success(t('delete_success'));
            loadResources();
        }
    };

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
            case 'video': return t('open_resource');
            case 'link': return t('open_resource');
            default: return t('open_resource');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        {t('library')}
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
                        {t('library_subtitle')}
                    </p>
                </div>
                {isCoach && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
                    >
                        <Plus size={16} /> {t('add_resource')}
                    </button>
                )}
            </div>

            {/* Controls: Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
                {/* Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs placeholder-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-bold uppercase tracking-widest"
                        placeholder={t('search_resources')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-slate-800 w-full md:w-auto">
                    {filters.map((filter) => {
                        const Icon = filter.icon;
                        const isActive = activeFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={cn(
                                    "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    isActive
                                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                                        : "text-slate-500 hover:text-white hover:bg-slate-900"
                                )}
                            >
                                <Icon size={14} />
                                <span className="hidden sm:inline">{filter.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={40} className="text-emerald-500 animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">{t('syncing_library')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResources.length > 0 ? (
                        filteredResources.map((resource) => (
                            <Card key={resource.id} className="group bg-slate-950 border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer h-full flex flex-col shadow-2xl overflow-hidden">
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 group-hover:bg-slate-800 transition-colors shadow-inner">
                                            {getIcon(resource.type)}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                                                {resource.type}
                                            </span>
                                            {isCoach && (
                                                <div className="flex items-center gap-1">
                                                    {resource.is_public ? <Globe size={12} className="text-emerald-500" /> : <Lock size={12} className="text-amber-500" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-white mb-3 line-clamp-2 uppercase tracking-tighter group-hover:text-emerald-400 transition-colors leading-none">
                                        {resource.title}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3 uppercase tracking-tight">
                                        {resource.description}
                                    </p>
                                </div>

                                <div className="px-8 py-5 border-t border-slate-900 bg-slate-900/20 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                        {resource.created_at ? format(new Date(resource.created_at), 'dd MMM yyyy', { locale: locales[language] }) : t('not_available') || 'N/A'}
                                    </span>

                                    <div className="flex items-center gap-4">
                                        {isCoach && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(resource); }}
                                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors border border-transparent hover:border-slate-700"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(resource.id); }}
                                                    className="p-2 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-500 transition-colors border border-transparent hover:border-rose-500/20"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <a
                                            href={resource.content_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-all bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10 group-hover:bg-emerald-500/10"
                                        >
                                            {getActionLabel(resource.type)}
                                            {resource.type === 'link' ? <ExternalLink size={12} /> : <Download size={12} />}
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800 shadow-2xl relative">
                                <BookOpen size={32} className="text-slate-700" />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-950">
                                    <Search size={14} className="text-slate-500" />
                                </div>
                            </div>
                            <h3 className="text-white font-black text-xl uppercase tracking-tighter">{t('no_resources_found')}</h3>
                            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-3 max-w-sm">
                                {isCoach ? t('build_library_coach_hint') : t('no_resources_shared_hint')}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950 p-10 shadow-emerald-500/10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {editingResource ? t('edit_resource') : t('add_resource')}
                                </h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('share_expertise_subtitle')}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:border-slate-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('resource_title')}</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={t('resource_title_placeholder')}
                                        value={formData.title}
                                        onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all transition-all placeholder:text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('resource_type')}</label>
                                    <div className="flex p-1.5 bg-slate-900 rounded-2xl border border-slate-800 gap-1">
                                        {['document', 'video', 'link'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, type }))}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    formData.type === type
                                                        ? "bg-emerald-500 text-slate-950 shadow-lg"
                                                        : "text-slate-500 hover:text-white"
                                                )}
                                            >
                                                {type === 'document' && <FileText size={14} className="inline mr-1" />}
                                                {type === 'video' && <PlayCircle size={14} className="inline mr-1" />}
                                                {type === 'link' && <LinkIcon size={14} className="inline mr-1" />}
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('resource_url')}</label>
                                <input
                                    type="url"
                                    required
                                    placeholder={t('resource_url_placeholder')}
                                    value={formData.content_url}
                                    onChange={e => setFormData(p => ({ ...p, content_url: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('resource_description')}</label>
                                <textarea
                                    placeholder={t('resource_desc_placeholder')}
                                    value={formData.description}
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm font-medium h-32 resize-none focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
                                />
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-3xl group hover:border-emerald-500/30 transition-all cursor-pointer select-none"
                                onClick={() => setFormData(p => ({ ...p, is_public: !p.is_public }))}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-2xl transition-all", formData.is_public ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-900 text-slate-600")}>
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest">{t('resource_public')}</h4>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                                            {formData.is_public ? t('visible_by_all_hint') : t('restricted_privacy_hint')}
                                        </p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-14 h-8 rounded-full transition-all relative p-1",
                                    formData.is_public ? "bg-emerald-600" : "bg-slate-800"
                                )}>
                                    <div className={cn(
                                        "w-6 h-6 bg-white rounded-full transition-all shadow-xl",
                                        formData.is_public ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {t('save_resource')} <CheckCircle2 size={20} />
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
