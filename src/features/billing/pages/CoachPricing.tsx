import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Tag, Plus, Check, Edit2, Trash2, CreditCard, Clock, Star, AlertCircle, X } from 'lucide-react';
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
        const data = await getCoachOfferings(currentUser.id);
        setOfferings(data);
        setLoading(false);
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
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.id) return;

        // Check limits
        if (!editingOffering) {
            if (formData.type === 'PACKAGE' && packages.length >= 10) {
                toast.error('Vous avez atteint la limite de 10 forfaits.');
                return;
            }
            if (formData.type === 'HOURLY' && hourlyRates.length >= 3) {
                toast.error('Vous avez atteint la limite de 3 tarifs horaires.');
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
            toast.error('Erreur lors de l\'enregistrement de l\'offre.');
        } else {
            toast.success('Offre enregistrée avec succès.');
            setShowModal(false);
            loadOfferings();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
        const { error } = await deleteCoachOffering(id);
        if (error) {
            toast.error('Erreur lors de la suppression.');
        } else {
            toast.success('Offre supprimée.');
            loadOfferings();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Mes <span className="text-emerald-400">Offres</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
                        Gérez vos forfaits et tarifs horaires pour vos athlètes
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleOpenModal()}
                        disabled={packages.length >= 10 && hourlyRates.length >= 3}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/10"
                    >
                        <Plus size={16} /> Nouvelle Offre
                    </button>
                </div>
            </div>

            {/* Subscriptions / Packages */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Tag className="text-emerald-400" size={20} /> Forfaits Mensuels
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
                        <Clock className="text-indigo-400" size={20} /> Tarifs Horaires (Sessions)
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
                            <h4 className="text-white font-black uppercase text-sm tracking-widest mb-1">Financial Sovereignty</h4>
                            <p className="text-slate-500 text-[10px] font-bold leading-relaxed max-w-md">
                                All payments are processed directly from athlete to your Stripe account. More Training takes 0% commission on your subscriptions.
                            </p>
                        </div>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20">
                        Configure Stripe Payouts
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
                                    {editingOffering ? 'Modifier l\'offre' : 'Nouvelle Offre'}
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
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type d'offre</label>
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
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prix (€)</label>
                                    <input
                                        type="number"
                                        value={formData.price_cents / 100}
                                        onChange={(e) => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value) * 100) })}
                                        placeholder="49"
                                        required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom du service</label>
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
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description (Optionnelle)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Décrivez ce que contient cette offre..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-bold h-24"
                                />
                            </div>

                            {formData.type === 'PACKAGE' && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Options & Badge</label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_recommended}
                                                onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
                                                className="hidden"
                                            />
                                            <div className={cn(
                                                "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                                formData.is_recommended ? "bg-emerald-500 border-emerald-500" : "border-slate-700"
                                            )}>
                                                {formData.is_recommended && <Check size={12} className="text-slate-950" strokeWidth={4} />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white transition-colors">Recommandé (Badge)</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                Enregistrer <Check size={16} />
                            </button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

function PricingCard({ plan, isHourly, onEdit, onDelete }: { plan: any, isHourly?: boolean, onEdit: () => void, onDelete: () => void }) {
    return (
        <Card
            className={cn(
                "relative overflow-hidden group transition-all duration-500 bg-slate-900 border-slate-800",
                !plan.is_active && "opacity-60 grayscale",
                plan.is_recommended && "border-emerald-500/50 shadow-2xl shadow-emerald-500/5"
            )}
        >
            {plan.is_recommended && plan.type === 'PACKAGE' && (
                <div className="absolute top-4 right-[-35px] bg-emerald-500 text-slate-950 text-[8px] font-black uppercase tracking-widest px-10 py-1 rotate-45 shadow-lg">
                    Recommandé
                </div>
            )}

            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
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
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 line-clamp-1">{plan.description || "Aucune description"}</p>

                <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-3xl font-black text-white">€{plan.price_cents / 100}</span>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        {isHourly ? '/session' : '/mois'}
                    </span>
                </div>

                <div className="space-y-4 mb-8 min-h-[100px]">
                    {(plan.features || []).map((feature: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                            <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            {feature}
                        </div>
                    ))}
                    {(!plan.features || plan.features.length === 0) && (
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-tight italic">
                            Détails inclus
                        </div>
                    )}
                </div>

                <div className={cn(
                    "w-full py-4 text-center rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border",
                    plan.is_active ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-900 border-slate-800 text-slate-700"
                )}>
                    {plan.is_active ? 'Offre Active' : 'Offre Désactivée'}
                </div>
            </div>
        </Card>
    );
}
