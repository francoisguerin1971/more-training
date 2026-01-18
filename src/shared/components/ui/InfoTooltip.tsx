import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface InfoTooltipProps {
    title?: string;
    content: string;
    className?: string;
    children?: React.ReactNode;
}

export function InfoTooltip({ title, content, className, children }: InfoTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Handle click outside for click-mode (when no children)
    useEffect(() => {
        if (children) return; // Don't attach click listener if using hover mode

        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [tooltipRef, children]);

    if (children) {
        return (
            <div
                className={cn("relative inline-flex items-center justify-center", className)}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                {children}
                <div className={cn(
                    "absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl shadow-black/50 transition-all duration-200 pointer-events-none",
                    isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
                )}>
                    {title && (
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                            {title}
                        </h4>
                    )}
                    <p className="text-[10px] text-slate-300 font-medium leading-relaxed text-center">
                        {content}
                    </p>
                    <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative inline-flex items-center", className)} ref={tooltipRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "rounded-full p-1 transition-all duration-200 hover:bg-slate-800",
                    isOpen ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 hover:text-emerald-400"
                )}
                aria-label="Information"
            >
                <Info size={14} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start mb-2">
                        {title && (
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                {title}
                            </h4>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="text-slate-500 hover:text-white"
                        >
                            <X size={12} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        {content}
                    </p>
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                </div>
            )}
        </div>
    );
}
