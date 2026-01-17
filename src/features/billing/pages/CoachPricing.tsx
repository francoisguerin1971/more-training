import React from 'react';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import { Tag, Plus, Check, Edit2, Trash2, CreditCard } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';

export function CoachPricing() {
    const { t } = useLanguage();

    const plans = [
        {
            id: 1,
            name: 'Basic Coaching',
            price: '49',
            period: '/month',
            features: ['Training Plan', 'Auto-sync Garmin/Strava', 'Monthly Review'],
            active: true
        },
        {
            id: 2,
            name: 'Premium Performance',
            price: '99',
            period: '/month',
            features: ['Everything in Basic', 'Weekly Video Call', 'Personalized Biofeedback', 'Daily Chat Support'],
            active: true,
            recommended: true
        },
        {
            id: 3,
            name: 'Elite Architect',
            price: '249',
            period: '/month',
            features: ['Everything in Premium', 'Unlimited Support', 'On-site Assessment', 'Advanced Lab Analysis'],
            active: false
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        My <span className="text-emerald-400">Offerings</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
                        Define your subscription tiers and manage athlete billing
                    </p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/10">
                    <Plus size={16} /> Create New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={cn(
                            "relative overflow-hidden group transition-all duration-500",
                            plan.active ? "bg-slate-900 border-slate-800" : "bg-slate-900/40 border-slate-900/50 opacity-60 grayscale",
                            plan.recommended && "border-emerald-500/50 shadow-2xl shadow-emerald-500/5"
                        )}
                    >
                        {plan.recommended && (
                            <div className="absolute top-4 right-[-35px] bg-emerald-500 text-slate-950 text-[8px] font-black uppercase tracking-widest px-10 py-1 rotate-45 shadow-lg">
                                Popular
                            </div>
                        )}

                        <div className="p-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                                    plan.recommended ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                                )}>
                                    <Tag size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button className="p-2 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-3xl font-black text-white">€{plan.price}</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{plan.period}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                                        <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button className={cn(
                                "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                                plan.active
                                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                                    : "bg-slate-900 text-slate-700 border border-slate-800"
                            )}>
                                {plan.active ? 'Plan Active' : 'Draft Mode'}
                            </button>
                        </div>
                    </Card>
                ))}
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
        </div>
    );
}
