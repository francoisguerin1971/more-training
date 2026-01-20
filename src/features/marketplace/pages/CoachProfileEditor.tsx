import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { Card } from '@/shared/components/ui/Card';
import { toast } from 'sonner';
import { supabase } from '@/core/services/supabase';
import { Save, User, Image, Target, Video, Briefcase, Plus, X, Wand2, Instagram, Music2, Globe, Sparkles } from 'lucide-react';
import { CoachPricing } from '@/features/billing/pages/CoachPricing'; // Reusing existing component
import { CoachProfile } from '@/features/marketplace/components/CoachProfile';

export function CoachProfileEditor() {
    const { t } = useLanguage();
    const { currentUser, updateProfile } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'gallery' | 'pricing' | 'preview'>('general');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [showAiPrompt, setShowAiPrompt] = useState(false);
    const [aiPromptText, setAiPromptText] = useState('');

    // Profile Data State
    const [formData, setFormData] = useState({
        bio: '',
        specialties: [] as string[],
        years_experience: '',
        video_url: '',
        instagram_url: '',
        tiktok_url: '',
        gallery_urls: [] as string[],
        newTag: '',
        newImageUrl: ''
    });

    useEffect(() => {
        if (currentUser?.profile_data) {
            setFormData(prev => ({
                ...prev,
                bio: currentUser.profile_data.bio || '',
                specialties: currentUser.profile_data.specialties || [],
                years_experience: currentUser.profile_data.years_experience || '',
                video_url: currentUser.profile_data.video_url || '',
                instagram_url: currentUser.profile_data.instagram_url || '',
                tiktok_url: currentUser.profile_data.tiktok_url || '',
                gallery_urls: currentUser.profile_data.gallery_urls || []
            }));
        }
    }, [currentUser]);

    const handleSaveGeneral = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const updatedProfileData = {
                ...currentUser.profile_data,
                bio: formData.bio,
                specialties: formData.specialties,
                years_experience: formData.years_experience,
                video_url: formData.video_url,
                instagram_url: formData.instagram_url,
                tiktok_url: formData.tiktok_url,
                gallery_urls: formData.gallery_urls
            };

            // FIX: Check for DEMO/Mock IDs to avoid Postgres BigInt errors
            const isDemoUser = currentUser.id.startsWith('admin-') || currentUser.id.startsWith('demo-');

            if (!isDemoUser) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ profile_data: updatedProfileData })
                    .eq('id', currentUser.id);

                if (error) throw error;
            } else {
                // Simulate network delay for demo
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            // Sync local state
            useAuthStore.setState(state => ({
                currentUser: {
                    ...state.currentUser!,
                    profile_data: updatedProfileData
                }
            }));

            toast.success(t('profile_updated', 'Profil mis à jour avec succès'));

        } catch (err: any) {
            toast.error(t('error_saving', 'Erreur lors de la sauvegarde: ') + err.message);
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (!formData.newTag.trim()) return;
        setFormData(prev => ({
            ...prev,
            specialties: [...prev.specialties, prev.newTag.trim()],
            newTag: ''
        }));
    };

    const removeTag = (t: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.filter(tag => tag !== t)
        }));
    };

    const addImage = () => {
        if (!formData.newImageUrl.trim()) return;
        setFormData(prev => ({
            ...prev,
            gallery_urls: [...prev.gallery_urls, prev.newImageUrl.trim()],
            newImageUrl: ''
        }));
    };

    const removeImage = (url: string) => {
        setFormData(prev => ({
            ...prev,
            gallery_urls: prev.gallery_urls.filter(u => u !== url)
        }));
    }

    const generateAiBio = async () => {
        if (!aiPromptText.trim()) {
            toast.error("Veuillez décrire votre style ou vos points forts pour l'IA.");
            return;
        }
        setAiGenerating(true);

        // Improved Mock AI generation that uses the User's prompt
        setTimeout(() => {
            const keywords = aiPromptText.split(' ').filter(w => w.length > 3).join(', ');
            const mockBio = `Coach passionné spécialisé en ${keywords || "performance et dépassement de soi"}. \n\nAvec une approche centrée sur l'athlète et basée sur ${aiPromptText.includes('data') ? 'l\'analyse précise des données' : 'l\'écoute et l\'adaptation'}, je construis des programmes sur-mesure pour atteindre vos objectifs. \n\nMon expérience me permet de comprendre les défis uniques que vous rencontrez. Ensemble, transformons votre potentiel en résultats durables.`;

            setFormData(prev => ({ ...prev, bio: mockBio }));
            setAiGenerating(false);
            setShowAiPrompt(false);
            toast.success("Biographie générée sur mesure !");
        }, 1500);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-32">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                {t('my_public_profile', 'Mon Profil Public')}
            </h1>
            <p className="text-slate-400 mb-8 max-w-2xl">
                C'est ici que vous configurez ce que voient les athlètes sur la Marketplace. Soignez votre présentation pour maximiser vos conversions.
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'general', label: t('general_info', 'Infos Générales'), icon: User },
                    { id: 'gallery', label: t('photos_media', 'Photos & Média'), icon: Image },
                    { id: 'pricing', label: t('offers_rates', 'Offres & Tarifs'), icon: Briefcase },
                    { id: 'preview', label: t('preview', 'Prévisualisation'), icon: Target },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'general' && (
                    <Card className="p-8 bg-slate-900/50 border-slate-800 max-w-4xl">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                                        Biographie
                                    </label>
                                    <button
                                        onClick={() => setShowAiPrompt(!showAiPrompt)}
                                        className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-indigo-300 transition-colors"
                                    >
                                        <Wand2 size={12} /> {t('bio_assistant', 'Assistant IA')}
                                    </button>
                                </div>

                                {showAiPrompt && (
                                    <div className="mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 animate-in slide-in-from-top-2">
                                        <label className="block text-[10px] font-bold text-indigo-300 mb-2 uppercase tracking-wide">
                                            {t('bio_assistant_prompt', 'Vos points clés (ex: Triathlon, 10 ans exp, bienveillance)')}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                                placeholder="Mots-clés..."
                                                value={aiPromptText}
                                                onChange={e => setAiPromptText(e.target.value)}
                                            />
                                            <button
                                                onClick={generateAiBio}
                                                disabled={aiGenerating}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 flex items-center gap-2"
                                            >
                                                {aiGenerating ? <Sparkles size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                                {t('generate_bio_btn', 'Générer')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <textarea
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 focus:outline-none min-h-[150px]"
                                    placeholder={t('bio_placeholder', "Présentez-vous, votre méthodologie, vos valeurs...")}
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            {/* Social Media Section */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                                    {t('social_media', 'Réseaux Sociaux')}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={18} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:outline-none"
                                            placeholder={t('instagram_placeholder', 'Lien Profile Instagram')}
                                            value={formData.instagram_url}
                                            onChange={e => setFormData({ ...formData, instagram_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Music2 className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:outline-none"
                                            placeholder={t('tiktok_placeholder', 'Lien Profile TikTok')}
                                            value={formData.tiktok_url}
                                            onChange={e => setFormData({ ...formData, tiktok_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                        Années d'expérience
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="ex: 10+, 5 ans..."
                                        value={formData.years_experience}
                                        onChange={e => setFormData({ ...formData, years_experience: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                        Lien Vidéo (YouTube/Vimeo)
                                    </label>
                                    <div className="relative">
                                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:outline-none"
                                            placeholder="https://..."
                                            value={formData.video_url}
                                            onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Spécialités (Tags)
                                </label>
                                <div className="flex gap-2 mb-3 flex-wrap">
                                    {formData.specialties.map(tag => (
                                        <span key={tag} className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/20">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="Ajouter une spécialité (ex: Triathlon, Nutrition...)"
                                        value={formData.newTag}
                                        onChange={e => setFormData({ ...formData, newTag: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                    />
                                    <button onClick={addTag} className="p-3 bg-slate-800 rounded-xl text-white hover:bg-slate-700">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex justify-end">
                                <button
                                    onClick={handleSaveGeneral}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                                </button>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'gallery' && (
                    <Card className="p-8 bg-slate-900/50 border-slate-800 max-w-4xl">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Galerie Photos (URLs)
                                </label>
                                <p className="text-sm text-slate-400 mb-4">
                                    Ajoutez des liens vers vos images pour l'instant. (L'upload de fichier direct arrivera bientôt).
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {formData.gallery_urls.map((url, i) => (
                                        <div key={i} className="relative aspect-square group rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(url)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="aspect-square rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-600">
                                        <Image size={32} />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="https://..."
                                        value={formData.newImageUrl}
                                        onChange={e => setFormData({ ...formData, newImageUrl: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && addImage()}
                                    />
                                    <button onClick={addImage} className="p-3 bg-slate-800 rounded-xl text-white hover:bg-slate-700" title="Ajouter URL">
                                        <Plus size={20} />
                                    </button>
                                    <label className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white cursor-pointer transition-all shadow-lg shadow-indigo-500/20" title="Uploader une image">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                // Create a local preview URL immediately for UX
                                                const previewUrl = URL.createObjectURL(file);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    gallery_urls: [...prev.gallery_urls, previewUrl]
                                                }));

                                                // In a real app, we would upload to Supabase here:
                                                // const { path, error } = await uploadGalleryImage(file);
                                                // if (!error) replacePreviewWithRealUrl(...)

                                                toast.success("Image ajoutée ! (Stockage local temporaire)");
                                            }}
                                        />
                                        <Image size={20} />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex justify-end">
                                <button
                                    onClick={handleSaveGeneral}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    Enregistrer la galerie
                                </button>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'pricing' && (
                    <div className="max-w-5xl">
                        {/* Embedding the existing pricing component directly logic here or showing it */}
                        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6">
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Configuration des Offres</h3>
                            <CoachPricing />
                        </div>
                    </div>
                )}

                {activeTab === 'preview' && currentUser && (
                    <div className="fixed inset-0 z-[100] bg-black">
                        {/* We can reuse the component but we need to mock the object structure to match what Marketplace expects */}
                        <CoachProfile
                            coach={{
                                ...currentUser,
                                ...formData, // Use current form data for live preview
                                offerings: [], // We can't easily preview real offerings without fetching, or we assume they are saved.
                                // Ideally rework CoachProfile to accept offerings prop optionally or fetch.
                                // For preview, we skip offerings or show placeholders if empty.
                            } as any}
                            onClose={() => setActiveTab('general')}
                            onSelectOffering={() => { }}
                        />
                        <button
                            onClick={() => setActiveTab('general')}
                            className="fixed top-6 right-20 z-[120] bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-xl"
                        >
                            Fermer la prévisualisation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
