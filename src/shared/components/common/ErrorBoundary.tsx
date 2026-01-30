import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to error reporting service in production
        if (import.meta.env.PROD) {
            // TODO: Send to Sentry, LogRocket, etc.
        }
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="p-4 bg-rose-500/10 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-rose-400" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">
                        Oops! Something went wrong
                    </h2>

                    <p className="text-slate-400 text-sm text-center max-w-md mb-6">
                        We encountered an unexpected error. Please try refreshing or contact support if the problem persists.
                    </p>

                    {import.meta.env.DEV && this.state.error && (
                        <pre className="mb-6 p-4 bg-slate-950 rounded-lg text-xs text-rose-400 max-w-full overflow-auto">
                            {this.state.error.message}
                        </pre>
                    )}

                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
