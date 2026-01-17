import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Box, Play } from 'lucide-react';

interface ExerciseSketchProps {
    prompt: string;
    className?: string;
}

export function ExerciseSketch({ prompt, className }: ExerciseSketchProps) {
    return (
        <div className={cn(
            "relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center group cursor-pointer",
            className
        )}>
            {/* Background Grid/Matrix effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }} />

            <div className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20">
                    <Box size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">Visual Logic Engine</h4>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
                    {prompt || "No visualization prompt provided"}
                </p>

                <div className="mt-6 flex items-center gap-3">
                    <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        3D Schematic
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl shadow-white/10 group-hover:bg-emerald-400 transition-colors">
                        <Play size={12} fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Corner deco */}
            <div className="absolute top-4 left-4 w-2 h-2 border-l border-t border-emerald-500/30" />
            <div className="absolute bottom-4 right-4 w-2 h-2 border-r border-b border-emerald-500/30" />
        </div>
    );
}
