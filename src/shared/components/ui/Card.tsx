import { cn } from '@/core/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <div className={cn("glass-panel rounded-xl p-6 overflow-visible", className)} {...props}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: string | React.ReactNode;
    subtitle?: string | React.ReactNode;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export function CardHeader({ title, subtitle, icon, action, className }: CardHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-6", className)}>
            <div className="flex items-center gap-3">
                {icon && <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>}
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}
