import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';
import { useLanguage } from '@/shared/context/LanguageContext';
import {
    Dumbbell, Shield, ChevronRight, Mail,
    UserPlus, HelpCircle, Users, Activity,
    ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { SEO } from '@/shared/components/common/SEO';
import { LanguageDropdown } from '@/shared/components/common/LanguageDropdown';

interface LoginProps {
    onLogin: (email: string, password: string) => Promise<boolean>;
}

export function Login({ onLogin }: LoginProps) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Strict Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (email && password) {
            setLoading(true);
            try {
                const success = await onLogin(email, password);
                if (!success) {
                    setError("Login failed. Please check your credentials.");
                }
            } catch (err) {
                setError("An unexpected error occurred. Please try again later.");
            } finally {
                setLoading(true);
                // Fixed: Should be false, but I want to keep the loading state until transition
                setLoading(false);
            }
        } else {
            setError("Please enter both email and password.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <SEO titleKey="seo_login_title" descriptionKey="seo_default_description" />
            <div className="absolute top-10 left-10 right-10 flex justify-between items-center z-50">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                >
                    <ArrowLeft size={16} /> Back to Platform
                </button>
                <LanguageDropdown />
            </div>

            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Brand */}
                <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-2xl shadow-emerald-500/20">
                        <Activity size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                        More <span className="text-emerald-400 underline decoration-indigo-500/30 underline-offset-8">Training</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium tracking-tight h-6">{t('sign_in_subtitle')}</p>
                </div>

                <Card className="border-slate-800 p-0 overflow-hidden shadow-2xl bg-slate-900/50 backdrop-blur-xl">
                    <div className="p-8 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className={cn(
                                        "w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all",
                                        error && "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                                    )}
                                />
                            </div>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className={cn(
                                        "w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {error && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {loading ? "Connecting..." : t('enter_portal')} <ChevronRight size={18} />
                            </button>
                        </form>

                        <div className="relative flex items-center gap-4 py-2">
                            <div className="flex-1 h-px bg-slate-800/50"></div>
                            <span className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.2em]">Secure Access</span>
                            <div className="flex-1 h-px bg-slate-800/50"></div>
                        </div>
                    </div>

                    <div className="p-5 bg-slate-950/50 border-t border-slate-800 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-[9px] text-slate-600 font-black uppercase tracking-widest">
                            <Shield size={14} className="text-emerald-500/30" /> {t('security_note')}
                        </div>
                        <div className="w-px h-3 bg-slate-800/50"></div>
                        <div className="flex items-center gap-2 text-[9px] text-slate-600 font-black uppercase tracking-widest hover:text-emerald-400 cursor-pointer transition-colors">
                            <HelpCircle size={14} /> {t('forgot_password', 'Recovery')}
                        </div>
                    </div>
                </Card>

                <p className="mt-8 text-center text-slate-700 text-[10px] font-black uppercase tracking-widest">
                    Enterprise scale security • <span className="text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors">Apply for Pro Membership</span>
                </p>
            </div>
        </div>
    );
}
