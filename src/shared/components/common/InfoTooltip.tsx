import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface InfoTooltipProps {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export function InfoTooltip({ content, position = 'top', className }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div className={cn("relative inline-block", className)}>
            <button
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                className="text-slate-500 hover:text-emerald-400 transition-colors focus:outline-none"
            >
                <Info size={14} />
            </button>

            {isVisible && (
                <div
                    className={cn(
                        "absolute z-50 w-48 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200",
                        positions[position]
                    )}
                >
                    <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                        {content}
                    </p>
                    {/* Arrow */}
                    <div
                        className={cn(
                            "absolute w-2 h-2 bg-slate-900 border-slate-700 rotate-45",
                            position === 'top' && "bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b",
                            position === 'bottom' && "top-[-5px] left-1/2 -translate-x-1/2 border-l border-t",
                            position === 'left' && "right-[-5px] top-1/2 -translate-y-1/2 border-r border-t",
                            position === 'right' && "left-[-5px] top-1/2 -translate-y-1/2 border-l border-b"
                        )}
                    />
                </div>
            )}
        </div>
    );
}
