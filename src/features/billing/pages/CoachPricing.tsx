import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Tag, Plus, Check, Edit2, Trash2, CreditCard, Clock, Star, AlertCircle, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/core/utils/cn';
import { logger } from '@/core/utils/security';
import { toast } from 'sonner';

export function CoachPricing() {
    const { t } = useLanguage();
    const { currentUser, getCoachOfferings, saveCoachOffering, deleteCoachOffering } = useAuthStore();

    const [offerings, setOfferings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffering, setEditingOffering] = useState<any>(null);
    const [newFeature, setNewFeature] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_cents: 0,
        billing_interval: 'MONTH',
        type: 'PACKAGE',
        features: [] as string[],
        is_active: true,
        is_recommended: false
    });

    const loadOfferings = async () => {
        if (!currentUser?.id) return;
        setLoading(true);
        try {
            const data = await getCoachOfferings(currentUser.id);
            setOfferings(data);
        } catch (err) {
            logger.error('Failed to load offerings', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOfferings();
    }, [currentUser]);

    const packages = offerings.filter(o => o.type === 'PACKAGE');
    const hourlyRates = offerings.filter(o => o.type === 'HOURLY');

    const handleOpenModal = (offering?: any) => {
        if (offering) {
            setEditingOffering(offering);
            setFormData({
                name: offering.name,
                description: offering.description || '',
                price_cents: offering.price_cents,
                billing_interval: offering.billing_interval || 'MONTH',
                type: offering.type || 'PACKAGE',
                features: offering.features || [],
                is_active: offering.is_active,
                is_recommended: offering.is_recommended
            });
        } else {
            setEditingOffering(null);
            setFormData({
                name: '',
                description: '',
                price_cents: 0,
                billing_interval: 'MONTH',
                type: 'PACKAGE',
                features: [],
                is_active: true,
                is_recommended: false
            });
        }
        setNewFeature('');
        setShowModal(true);
    };

    const addFeature = () => {
        if (!newFeature.trim()) return;
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, newFeature.trim()]
        }));
        setNewFeature('');
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.id) return;

        // Check limits
        if (!editingOffering) {
            if (formData.type === 'PACKAGE' && packages.length >= 10) {
                toast.error(t('limit_reached_packages'));
                return;
            }
            if (formData.type === 'HOURLY' && hourlyRates.length >= 3) {
                toast.error(t('limit_reached_hourly'));
                return;
            }
        }

        const payload = {
            ...formData,
            id: editingOffering?.id,
            coach_id: currentUser.id
        };

        const { error } = await saveCoachOffering(payload);
        if (error) {
            toast.error(t('error_profile_update'));
        } else {
            toast.success(t('save_success'));
            setShowModal(false);
            loadOfferings();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;
        const { error } = await deleteCoachOffering(id);
        if (error) {
            toast.error(t('error_profile_update'));
        } else {
            toast.success(t('delete_success'));
            loadOfferings();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        {t('pricing_title').split(' ')[0]} <span className="text-emerald-400">{t('pricing_title').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
                        {t('pricing_subtitle')}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleOpenModal()}
                        disabled={packages.length >= 10 && hourlyRates.length >= 3}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/10"
                    >
                        <Plus size={16} /> {t('add_offering_btn')}
                    </button>
                </div>
            </div>

            {/* Subscriptions / Packages */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Tag className="text-emerald-400" size={20} /> {t('packages_title')}
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                            {packages.length}/10
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            t={t}
                            onEdit={() => handleOpenModal(plan)}
                            onDelete={() => handleDelete(plan.id)}
                        />
                    ))}
                    {packages.length === 0 && !loading && (
                        <div className="col-span-full py-12 border-2 border-dashed border-slate-800 rounded-[32px] flex flex-col items-center justify-center text-slate-600">
                            <Plus size={32} className="mb-2 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Aucun forfait configuré</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hourly Rates */}
            <div className="space-y-6 pt-8 border-t border-slate-900">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Clock className="text-indigo-400" size={20} /> {t('hourly_rates_title')}
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                            {hourlyRates.length}/3
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hourlyRates.map((rate) => (
                        <PricingCard
                            key={rate.id}
                            plan={rate}
                            t={t}
                            isHourly
                            onEdit={() => handleOpenModal(rate)}
                            onDelete={() => handleDelete(rate.id)}
                        />
                    ))}
                    {hourlyRates.length === 0 && !loading && (
                        <div className="col-span-full py-12 border-2 border-dashed border-slate-800 rounded-[32px] flex flex-col items-center justify-center text-slate-600">
                            <Clock size={32} className="mb-2 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Aucun tarif horaire configuré</p>
                        </div>
                    )}
                </div>
            </div>

            <Card className="bg-indigo-500/5 border-indigo-500/20 p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <CreditCard size={32} />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-sm tracking-widest mb-1">{t('financial_sovereignty_title')}</h4>
                            <p className="text-slate-500 text-[10px] font-bold leading-relaxed max-w-md">
                                {t('financial_sovereignty_desc')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => toast.info('Redirection vers Stripe Express...')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
                    >
                        {t('stripe_config_btn')}
                    </button>
                </div>
            </Card>

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950 p-8 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {editingOffering ? t('edit') : t('add_offering_btn')}
                                </h2>
                                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Configurez vos services pro</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-900 rounded-xl text-slate-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('offering_type_label')}</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-bold appearance-none"
                                    >
                                        <option value="PACKAGE">FORFAIT (Mensuel)</option>
                                        <option value="HOURLY">TARIF HORAIRE (Consul)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('price_label')}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">€</span>
                                        <input
                                            type="number"
                                            value={formData.price_cents / 100}
                                            onChange={(e) => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value) * 100 || 0) })}
                                            placeholder="49"
                                            required
                                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('service_name_label')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Coaching Trail Performance"
                                    required
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('description_label')}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Décrivez ce que contient cette offre..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-bold h-24 resize-none"
                                />
                            </div>

                            {/* Features Management */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('features_label')}</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                            placeholder={t('add_feature_placeholder')}
                                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-all"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight group">
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="p-0.5 hover:bg-emerald-500/20 rounded transition-all"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={cn(
                                        "w-10 h-5 rounded-full relative transition-all duration-300",
                                        formData.is_active ? "bg-emerald-500" : "bg-slate-800"
                                    )}>
                                        <div className={cn(
                                            "w-3 h-3 bg-white rounded-full absolute top-1 transition-all duration-300",
                                            formData.is_active ? "left-6" : "left-1"
                                        )} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white transition-colors">{t('active_offering')}</span>
                                </label>

                                {formData.type === 'PACKAGE' && (
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_recommended}
                                            onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
                                            className="hidden"
                                        />
                                        <div className={cn(
                                            "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                                            formData.is_recommended ? "bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/20" : "border-slate-700"
                                        )}>
                                            {formData.is_recommended && <Star size={10} className="text-slate-950 fill-current" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white transition-colors">{t('recommended_label')}</span>
                                    </label>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {t('save')} <Check size={16} />
                            </button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

function PricingCard({ plan, isHourly, t, onEdit, onDelete }: { plan: any, isHourly?: boolean, t: any, onEdit: () => void, onDelete: () => void }) {
    return (
        <Card
            className={cn(
                "relative overflow-hidden group transition-all duration-500 bg-slate-900 border-slate-800",
                !plan.is_active && "opacity-60 grayscale",
                plan.is_recommended && "border-amber-500/50 shadow-2xl shadow-amber-500/5"
            )}
        >
            {plan.is_recommended && plan.type === 'PACKAGE' && (
                <div className="absolute top-4 right-[-35px] bg-amber-500 text-slate-950 text-[8px] font-black uppercase tracking-widest px-10 py-1 rotate-45 shadow-lg">
                    {t('recommended_label').split(' ')[0]}
                </div>
            )}

            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                        isHourly ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                        {isHourly ? <Clock size={20} /> : <Tag size={20} />}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onEdit} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={onDelete} className="p-2 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-500 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 leading-none">{plan.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 line-clamp-2 min-h-[30px]">{plan.description || t('no_description')}</p>

                <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-3xl font-black text-white">€{plan.price_cents / 100}</span>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        {isHourly ? t('session_suffix') : t('monthly_suffix')}
                    </span>
                </div>

                <div className="space-y-4 mb-8 min-h-[120px]">
                    {(plan.features || []).map((feature: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                            <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            {feature}
                        </div>
                    ))}
                    {(!plan.features || plan.features.length === 0) && (
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-tight italic">
                            {t('details_included')}
                        </div>
                    )}
                </div>

                <div className={cn(
                    "w-full py-4 text-center rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border",
                    plan.is_active ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-900 border-slate-800 text-slate-700"
                )}>
                    {plan.is_active ? t('active_offering') : t('inactive_offering')}
                </div>
            </div>
        </Card>
    );
}
