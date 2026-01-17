import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { BadgeEuro, Check, Info, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { supabase } from '@/core/services/supabase';
import { logger } from '@/core/utils/security';
import { cn } from '@/shared/lib/utils';
import { Plan, UserProfile } from '@/shared/types';

interface PlanSelectorProps {
    coach: UserProfile | null;
    onSelect: (plan: Plan) => void;
    onCancel: () => void;
}

export function PlanSelector({ coach, onSelect, onCancel }: PlanSelectorProps) {
    const { t } = useLanguage();

    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const loadCoachOfferings = async () => {
            if (!coach?.id) {
                // Fallback to mock data if no coach ID
                setPlans([
                    {
                        id: 'p1',
                        name: 'Suivi Performance',
                        price_cents: 12000,
                        billing_interval: 'MONTH',
                        features: ['Plan sur mesure', 'Chat illimité', 'Analyse data'],
                    },
                    {
                        id: 'p2',
                        name: 'Consultation Unique',
                        price_cents: 6000,
                        billing_interval: 'ONE_TIME',
                        features: ['Visio 1h', 'Audit complet'],
                    }
                ]);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('coach_offerings')
                    .select('*')
                    .eq('coach_id', coach.id)
                    .eq('is_active', true)
                    .order('price_cents', { ascending: true });

                if (error) {
                    logger.error('Error loading offerings:', error);
                    setPlans([]);
                } else {
                    setPlans(data || []);
                }
            } catch (err) {
                logger.error('Exception loading offerings:', err);
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

        loadCoachOfferings();
    }, [coach]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                        {t('plan_selection_title') || 'Choisir une offre'}
                    </h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        Chargement des offres...
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="p-6 rounded-[2.5rem] bg-slate-950 border-2 border-slate-800 animate-pulse">
                            <div className="h-20 bg-slate-800 rounded mb-4"></div>
                            <div className="h-12 bg-slate-800 rounded mb-6"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-800 rounded"></div>
                                <div className="h-4 bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="space-y-6 text-center py-12">
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Info size={32} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    Aucune offre disponible
                </h3>
                <p className="text-slate-500 text-sm">
                    Ce coach n'a pas encore configuré ses offres.
                </p>
                <button
                    onClick={onCancel}
                    className="px-8 py-4 rounded-2xl border border-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white hover:bg-slate-900 transition-all"
                >
                    Retour
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {t('plan_selection_title') || 'Choisir une offre'}
                </h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    Sélectionnez votre mode d'accompagnement avec {coach?.full_name || coach?.name}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map(plan => {
                    const price = (plan.price_cents || (plan.price || 0) * 100) / 100;
                    const platformFee = Math.round(price * 0.05); // 5% platform fee
                    const interval = plan.billing_interval || plan.interval || 'ONE_TIME';
                    const features = Array.isArray(plan.features) ? plan.features : JSON.parse((plan.features as any) || '[]');
                    const isMonthly = interval === 'MONTH' || (interval as string) === 'month';

                    return (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedId(plan.id)}
                            className={cn(
                                "text-left p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group",
                                selectedId === plan.id
                                    ? "bg-emerald-500/10 border-emerald-500 ring-4 ring-emerald-500/10"
                                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            {selectedId === plan.id && (
                                <div className="absolute top-4 right-6 text-emerald-500">
                                    <ShieldCheck size={24} />
                                </div>
                            )}

                            <div className="mb-4">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    {isMonthly ? 'Abonnement' : 'Session unique'}
                                </span>
                                <h4 className="text-lg font-black text-white uppercase mt-1">{plan.name}</h4>
                            </div>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-black text-white tracking-tighter">{price}€</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    / {isMonthly ? 'mois' : 'séance'}
                                </span>
                            </div>

                            <ul className="space-y-2 mb-6">
                                {features.map((feat: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <Check size={12} className="text-emerald-500" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-600 uppercase">Frais de plateforme</span>
                                    <span className="text-[10px] font-bold text-slate-400">+{platformFee}€</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-black text-slate-600 uppercase">Total</span>
                                    <span className="text-sm font-black text-white">{price + platformFee}€</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-4 mt-8">
                <button
                    onClick={onCancel}
                    className="flex-1 py-4 rounded-2xl border border-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white hover:bg-slate-900 transition-all"
                >
                    {t('cancel') || 'Annuler'}
                </button>
                <button
                    disabled={!selectedId}
                    onClick={() => {
                        const plan = plans.find(p => p.id === selectedId);
                        if (plan) onSelect(plan);
                    }}
                    className={cn(
                        "flex-[2] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl",
                        selectedId
                            ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-900/20"
                            : "bg-slate-800 text-slate-600 cursor-not-allowed"
                    )}
                >
                    {t('select_plan_btn') || 'Confirmer la sélection'}
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
