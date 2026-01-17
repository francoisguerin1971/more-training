import React from 'react';
import { Info, Lightbulb } from 'lucide-react';

interface InfoTooltipProps {
    text: string;
    action?: string;
}

export const InfoTooltip = ({ text, action }: InfoTooltipProps) => {
    return (
        <span className="group relative inline-flex items-center ml-2 cursor-help">
            <Info size={14} className="text-slate-500 hover:text-emerald-400 transition-colors" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-64 opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 pointer-events-none z-[100]">
                <div className="space-y-3">
                    <p className="text-[12px] text-slate-200 leading-relaxed font-medium">
                        {text}
                    </p>
                    {action && (
                        <div className="pt-3 border-t border-slate-800 flex items-start gap-2">
                            <Lightbulb size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                                {action}
                            </p>
                        </div>
                    )}
                </div>
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-700"></span>
            </span>
        </span>
    );
};
