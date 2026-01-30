import React, { useState } from 'react';
import { ChevronDown, Utensils } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';

export interface NutriRecommendation {
    type: 'pre' | 'during' | 'post' | 'daily';
    timing: string;
    recommendation: string;
    products?: string[];
    priority: 'essential' | 'recommended' | 'optional';
}

interface NutriSectionProps {
    recommendations: NutriRecommendation[];
}

export function NutriSection({ recommendations }: NutriSectionProps) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(true);

    const priorityColors = {
        essential: { icon: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
        recommended: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        optional: { icon: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' }
    };

    const typeIcons = {
        pre: '🥤',
        during: '🍌',
        post: '🥛',
        daily: '🍽️'
    };

    return (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-900/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Utensils size={24} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            {t('nutri_recommendations') || 'Recommandations Nutritionnelles'}
                        </h4>
                        <p className="text-[10px] text-slate-500">{recommendations.length} {t('recommendations') || 'recommandations'}</p>
                    </div>
                </div>
                <ChevronDown className={cn("transition-transform text-slate-500", expanded && "rotate-180")} size={20} />
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {recommendations.map((rec, idx) => {
                        const colors = priorityColors[rec.priority];
                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "p-4 rounded-xl border",
                                    colors.bg, colors.border
                                )}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg">{typeIcons[rec.type]}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {rec.timing}
                                    </span>
                                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", colors.bg, colors.icon)}>
                                        {rec.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 font-medium">{rec.recommendation}</p>
                                {rec.products && rec.products.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {rec.products.map((product, pIdx) => (
                                            <span key={pIdx} className="text-[10px] px-3 py-1 bg-slate-800 rounded-full text-slate-400">
                                                {product}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
