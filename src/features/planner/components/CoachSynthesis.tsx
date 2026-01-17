import React from 'react';
import { Card } from '@/shared/components/ui/Card';
import { BrainCircuit, Lightbulb, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Recommendation {
    type: 'warning' | 'health' | 'training' | 'info';
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    action: string;
}

interface CoachSynthesisProps {
    synthesis: {
        athlete: string;
        objectives: string;
        availability: string;
        constraints: string;
        rationale: string;
    } | null;
    recommendations: Recommendation[] | null;
    coachStyle: string;
    reportType: string;
}

export function CoachSynthesis({ synthesis, recommendations, coachStyle, reportType }: CoachSynthesisProps) {
    if (!synthesis) return null;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Rationale & Profile Synthesis */}
                <Card className="bg-slate-900 border-emerald-500/20 shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BrainCircuit size={120} className="text-emerald-500" />
                    </div>
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <BrainCircuit size={20} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Synthèse de l'Architecte</h3>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Athlète Cible</p>
                                    <p className="text-xs font-bold text-white uppercase">{synthesis.athlete}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Objectif Principal</p>
                                    <p className="text-xs font-bold text-emerald-400 uppercase">{synthesis.objectives}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Raisonnement Stratégique ({reportType === 'coach-style' ? 'Élite' : 'Analytique'})</p>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium italic border-l-2 border-emerald-500/30 pl-4 py-1">
                                    "{synthesis.rationale}"
                                </p>
                            </div>

                            {coachStyle && (
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Style de Coaching Appliqué</p>
                                    <p className="text-xs text-slate-400 font-medium italic">{coachStyle}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Performance Recommendations */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                            <Lightbulb size={20} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Recommandations Élite</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {recommendations?.map((rec, i) => (
                            <div key={i} className={cn(
                                "p-5 rounded-[24px] border transition-all hover:scale-[1.02]",
                                rec.priority === 'high' ? "bg-rose-500/5 border-rose-500/20" :
                                    rec.priority === 'medium' ? "bg-yellow-500/5 border-yellow-500/20" :
                                        "bg-indigo-500/5 border-indigo-500/20"
                            )}>
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center",
                                        rec.type === 'warning' ? "bg-rose-500/10 text-rose-500" :
                                            rec.type === 'health' ? "bg-orange-500/10 text-orange-500" :
                                                rec.type === 'training' ? "bg-indigo-500/10 text-indigo-500" :
                                                    "bg-emerald-500/10 text-emerald-500"
                                    )}>
                                        {rec.type === 'warning' ? <AlertCircle size={20} /> :
                                            rec.type === 'health' ? <AlertCircle size={20} /> :
                                                rec.type === 'training' ? <CheckCircle2 size={20} /> :
                                                    <Info size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{rec.title}</h4>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                rec.priority === 'high' ? "bg-rose-500 text-white" :
                                                    rec.priority === 'medium' ? "bg-yellow-500 text-slate-950" :
                                                        "bg-indigo-500 text-white"
                                            )}>
                                                {rec.priority}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium mb-3">{rec.message}</p>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 self-start px-3 py-1.5 rounded-lg border border-emerald-500/10">
                                            <CheckCircle2 size={12} /> ACTION: {rec.action}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
