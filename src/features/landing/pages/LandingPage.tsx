import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Shield,
    ChevronRight,
    Search,
    Unlock, Video, LineChart
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/core/utils/cn';
import { Card } from '@/shared/components/ui/Card';
import { LanguageDropdown } from '@/shared/components/common/LanguageDropdown';
import { SEO } from '@/shared/components/common/SEO';

export function LandingPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { currentUser } = useAuthStore();

    // Internal Navigation Handlers
    const onLogin = () => navigate('/login');
    const onJoin = () => navigate('/onboarding');
    const onViewPricing = () => navigate('/pricing');

    // Plans data hardcoded in French
    // Plans data using translations
    const coachPlans = [
        {
            name: t('plan_coach_starter'),
            price: '19€',
            features: [t('feature_athletes_5'), t('feature_analytics_basic'), t('feature_support_standard'), t('feature_ai_lite')],
            highlight: false
        },
        {
            name: t('plan_coach_pro'),
            price: '49€',
            features: [t('feature_athletes_25'), t('feature_analytics_adv'), t('feature_support_priority'), t('feature_ai_full'), t('feature_branding')],
            highlight: true
        },
        {
            name: t('plan_coach_elite'),
            price: '99€',
            features: [t('feature_athletes_unlimited'), t('feature_team_mgmt'), t('feature_ecosystem'), t('feature_manager'), t('feature_api')],
            highlight: false
        }
    ];


    return (
        <div className="bg-slate-950 text-white min-h-screen font-sans selection:bg-emerald-500/30">
            <SEO
                titleKey="seo_landing_title"
                descriptionKey="seo_default_description"
                keywords={["elite coaching", "biometric training", "AI sports planner", "More Training", "performance platform"]}
                internalLink="/marketplace"
                canonicalPath="/"
                schemaData={{
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "More Training",
                    "url": "https://more-training.com",
                    "logo": "https://more-training.com/logo.png",
                    "founder": {
                        "@type": "Person",
                        "name": "Oscar Moreno"
                    },
                    "description": t('seo_default_description'),
                    "sameAs": [
                        "https://www.instagram.com/_moretraining_/"
                    ]
                }}
            />
            {/* Nav */}
            <nav className="fixed top-0 w-full z-[100] backdrop-blur-xl border-b border-white/5 bg-slate-950/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo (Left) */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/10">
                            M
                        </div>
                        <span className="text-xl font-bold tracking-tighter">
                            MORE <span className="text-emerald-400">TRAINING</span>
                        </span>
                    </div>

                    {/* Actions (Right) */}
                    <div className="flex items-center gap-4 sm:gap-8">
                        <LanguageDropdown />
                        <div className="flex items-center gap-4 sm:gap-8 border-l border-white/10 pl-4 sm:pl-8">
                            <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-slate-100 hover:text-white transition-all">
                                {t('sign_in')}
                            </button>
                            <button
                                onClick={onJoin}
                                className="bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                            >
                                {t('join_now')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                        <div className="lg:col-span-8 text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">{t('landing_hero_badge')}</span>
                            </div>

                            <h1
                                className="text-4xl sm:text-6xl md:text-7xl lg:text-5xl xl:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100"
                                style={{ textWrap: 'balance' }}
                            >
                                {t('landing_hero_title')}
                            </h1>

                            <p className="max-w-xl text-slate-400 text-lg md:text-xl font-medium mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                                {t('landing_hero_subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                                <div className="group relative w-full sm:w-auto">
                                    <button
                                        onClick={onJoin}
                                        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                                    >
                                        {t('get_started_btn')}
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <p className="absolute -bottom-6 left-0 right-0 text-center sm:text-left text-[9px] font-bold text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        {t('athlete_trial_hero')}
                                    </p>
                                </div>
                                <div className="group relative w-full sm:w-auto">
                                    <button
                                        onClick={onJoin}
                                        className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:bg-slate-800 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                                    >
                                        {t('find_coach_btn')}
                                        <Search size={18} />
                                    </button>
                                    <p className="absolute -bottom-6 left-0 right-0 text-center sm:text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        {t('coach_trial_hero')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 relative animate-in fade-in zoom-in duration-1000 delay-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 blur-[100px] rounded-full"></div>
                            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl group">
                                <img
                                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
                                    alt={t('alt_elite_coaching')}
                                    loading="lazy"
                                    className="w-full h-full object-cover object-top grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                                <div className="absolute bottom-10 left-10 right-10 p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black">M</div>
                                        <div>
                                            <p className="text-xs font-black uppercase text-white">{t('elite_performance_hub')}</p>
                                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{t('active_monitoring')}</p>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[70%] animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coach Subscription Section */}
            {(!currentUser || currentUser.role !== 'athlete') && (
                <section className="py-32 bg-slate-950 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6">
                                    {t('for_coaches_badge')}
                                </div>
                                <h2 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                                    {t('coach_hero_headline_part1')} <span className="text-emerald-400">{t('coach_hero_headline_part2')}</span>
                                </h2>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12 max-w-xl">
                                    {t('coach_hero_desc')}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-emerald-500/30 transition-colors group">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                                            <Zap size={24} />
                                        </div>
                                        <h4 className="text-sm font-black uppercase text-white mb-2">{t('direct_payment_title')}</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{t('direct_payment_desc')}</p>
                                    </div>
                                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-indigo-500/30 transition-colors group">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                            <Shield size={24} />
                                        </div>
                                        <h4 className="text-sm font-black uppercase text-white mb-2">{t('zero_commission_title')}</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{t('zero_commission_desc')}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={onViewPricing}
                                    className="bg-white text-slate-950 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5 flex items-center gap-3"
                                >
                                    {t('btn_see_pro_plans')} <ChevronRight size={18} />
                                </button>
                            </div>

                            <div className="order-1 lg:order-2 relative group">
                                <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-[4rem] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl aspect-[4/5]">
                                    <img
                                        src="https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1974&auto=format&fit=crop"
                                        alt={t('alt_pro_tools')}
                                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                                    <div className="absolute bottom-10 left-10 p-6 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl max-w-xs scale-90 sm:scale-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black">1M</div>
                                            <p className="text-[10px] font-black uppercase text-white tracking-widest">{t('free_trial_badge')}</p>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-medium leading-relaxed">{t('free_trial_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Athlete Experience */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
                                {t('athlete_headline_1')}<br />{t('athlete_headline_2')}<br /><span className="text-indigo-500">{t('athlete_headline_3')}</span>
                            </h2>
                            <div className="space-y-10">
                                <div className="flex gap-6 group hover:translate-x-2 transition-transform duration-300">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                        <Unlock size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black uppercase tracking-tight mb-2 text-white">{t('value_prop_freedom_title')}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">{t('value_prop_freedom_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 group hover:translate-x-2 transition-transform duration-300">
                                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                        <Video size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black uppercase tracking-tight mb-2 text-white">{t('value_prop_connect_title')}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">{t('value_prop_connect_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 group hover:translate-x-2 transition-transform duration-300">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                        <LineChart size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black uppercase tracking-tight mb-2 text-white">{t('value_prop_dashboard_title')}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">{t('value_prop_dashboard_desc')}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onJoin}
                                className="mt-16 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-indigo-900/20 flex items-center gap-3 cursor-pointer group"
                            >
                                {t('btn_explore_marketplace')} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 blur-[100px] rounded-full"></div>
                            <div className="relative rounded-[3rem] overflow-hidden group shadow-3xl border border-white/10">
                                <img
                                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                                    alt={t('alt_athlete_effort')}
                                    className="w-full aspect-square object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute inset-0 border-[20px] border-transparent group-hover:border-emerald-500/20 transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Action Gallery / Social Proof */}
            <section className="py-32 bg-slate-900/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">{t('social_proof_title_prefix')} <span className="text-emerald-400">{t('social_proof_title_highlight')}</span></h2>
                            <p className="text-slate-400 font-medium text-lg italic">"{t('social_proof_quote')}"</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col">
                                <span className="text-2xl font-black text-white">500+</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('stat_active_coaches')}</span>
                            </div>
                            <div className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col">
                                <span className="text-2xl font-black text-emerald-400">10k+</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('stat_goals_reached')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop",
                                title: t('gallery_precision'),
                                sport: "Running & Biometry"
                            },
                            {
                                img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop",
                                title: t('gallery_power'),
                                sport: "Strength & Conditioning"
                            },
                            {
                                img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
                                title: t('gallery_endurance'),
                                sport: "Cycling & Triathlon"
                            }
                        ].map((item, i) => (
                            <div key={i} className="group relative aspect-square rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80"></div>
                                <div className="absolute bottom-8 left-8">
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-1">{item.sport}</p>
                                    <h4 className="text-xl font-black uppercase text-white tracking-widest">{item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-32 pb-20 border-t border-slate-900 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
                <div className="max-w-7xl mx-auto px-6">
                    {/* About the Founder Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-start border-b border-slate-900/50 pb-24">
                        <div className="lg:col-span-4 relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                <img
                                    src="/oscar/portrait_pro.png"
                                    alt={currentUser?.full_name || "Oscar Moreno"}
                                    className="w-full h-full object-cover object-top grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
                                    <h4 className="text-xl font-black uppercase text-white tracking-widest leading-none mb-1">{t('about_founder')}</h4>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">{t('founder_role')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-8 pt-8">
                            <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">
                                {t('about_badge')}
                            </div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                                {t('about_headline_prefix')} <span className="text-emerald-400">{t('about_headline_highlight')}</span>
                            </h3>
                            <div className="max-w-3xl">
                                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12 italic">
                                    "{t('about_text')}"
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-12">
                                    <div className="aspect-video rounded-3xl overflow-hidden border border-white/5 grayscale-[0.4] hover:grayscale-0 transition-all duration-500 shadow-xl">
                                        <img src="/oscar/running_pro.png" alt={t('alt_trail_running')} className="w-full h-full object-cover object-top" />
                                    </div>
                                    <div className="aspect-video rounded-3xl overflow-hidden border border-white/5 grayscale-[0.4] hover:grayscale-0 transition-all duration-500 shadow-xl">
                                        <img src="/oscar/coaching.png" alt={t('alt_coaching_session')} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 opacity-50">
                                    {[
                                        t('sport_running'),
                                        t('sport_trail'),
                                        t('sport_swimming'),
                                        t('sport_cycling'),
                                        t('sport_fitness'),
                                        t('sport_yoga')
                                    ].map((tag, i) => (
                                        <span key={i} className="text-[10px] font-black uppercase tracking-widest border border-slate-700 px-4 py-1.5 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">M</div>
                                <span className="text-lg font-bold tracking-tighter uppercase">More Training</span>
                            </div>
                            <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
                                {t('footer_desc')}
                            </p>
                        </div>
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">{t('footer_platform')}</h5>
                            <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-tight">
                                <li className="hover:text-emerald-400 cursor-pointer transition-colors">{t('footer_marketplace')}</li>
                                <li className="hover:text-emerald-400 cursor-pointer transition-colors">{t('footer_for_coaches_link')}</li>
                                <li className="hover:text-emerald-400 cursor-pointer transition-colors">{t('footer_ai_engine_link')}</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">{t('footer_legal_title')}</h5>
                            <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-tight">
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">{t('footer_privacy')}</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">{t('footer_terms')}</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">{t('footer_cookies')}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-20 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                        <span>{t('footer_copyright')}</span>
                        <div className="flex items-center gap-6">
                            <span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">Instagram @_moretraining_</span>
                            <span>{t('footer_encryption')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
