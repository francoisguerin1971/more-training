import React, { useState } from 'react';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    Watch, Share2, RefreshCw, Smartphone,
    CheckCircle2, AlertCircle, ExternalLink,
    Activity, Cloud, Send, Zap
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLanguage } from '@/shared/context/LanguageContext';

export function Integrations() {
    const { t } = useLanguage();
    const [connections, setConnections] = useState({
        garmin: { status: 'disconnected', lastSync: null },
        strava: { status: 'connected', lastSync: '2h ago' },
        polar: { status: 'disconnected', lastSync: null },
        coros: { status: 'disconnected', lastSync: null },
        apple: { status: 'disconnected', lastSync: null }
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const connectService = (service) => {
        setIsSyncing(true);
        setTimeout(() => {
            setConnections(prev => ({
                ...prev,
                [service]: { status: 'connected', lastSync: 'Just now' }
            }));
            setIsSyncing(false);
        }, 2000);
    };

    const handlePushToWatch = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const providers = [
        {
            id: 'garmin',
            name: 'Garmin Connect',
            logo: Watch,
            color: 'bg-indigo-600',
            desc: 'Fenix, Forerunner, Edge...'
        },
        {
            id: 'strava',
            name: 'Strava',
            logo: Activity,
            color: 'bg-orange-600',
            desc: 'Mobile App, Wear OS, WatchOS'
        },
        {
            id: 'coros',
            name: 'COROS',
            logo: Zap,
            color: 'bg-slate-700',
            desc: 'Pace, Apex, Vertix'
        },
        {
            id: 'polar',
            name: 'Polar Flow',
            logo: RefreshCw,
            color: 'bg-rose-600',
            desc: 'Vantage, Grit X, Pacer'
        },
        {
            id: 'apple',
            name: 'Apple Health',
            logo: Smartphone,
            color: 'bg-rose-500',
            desc: 'Apple Watch Series & Ultra'
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{t('ecosystem_sync_title')}</h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">{t('cloud_infra_integration')}</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <Cloud size={14} /> {t('global_sync_online')}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {providers.map(p => (
                    <Card key={p.id} className="relative overflow-hidden group bg-slate-900 shadow-2xl">
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 opacity-10 blur-[80px] rounded-full transform translate-x-10 -translate-y-10",
                            p.color
                        )}></div>

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-14 h-14 rounded-2xl text-white shadow-2xl flex items-center justify-center border border-white/10", p.color)}>
                                    <p.logo size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-white text-md uppercase tracking-tight">{p.name}</h3>
                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-0.5">{p.desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            {connections[p.id].status === 'connected' ? (
                                <div className="flex flex-col">
                                    <span className="flex items-center gap-1.5 text-emerald-400 text-[9px] font-black uppercase bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 w-fit">
                                        <CheckCircle2 size={10} /> {t('active')}
                                    </span>
                                    <span className="text-[8px] text-slate-600 mt-2 uppercase font-black tracking-widest">{t('latency_label') || 'Latency'}: 24ms</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => connectService(p.id)}
                                    disabled={isSyncing}
                                    className="text-[9px] font-black text-white bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-xl border border-slate-700 transition-all uppercase tracking-widest"
                                >
                                    {isSyncing ? t('connecting_label') : t('connect_label')}
                                </button>
                            )}
                            <div className="text-right">
                                <p className="text-[8px] text-slate-600 font-bold uppercase">{t('sync_data_label')}</p>
                                <p className="text-[10px] text-white font-black">{connections[p.id].lastSync || t('none')}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                disabled={connections[p.id].status !== 'connected'}
                                onClick={handlePushToWatch}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all disabled:opacity-10 active:scale-95 shadow-inner"
                            >
                                <Send size={14} className="text-emerald-400" /> {t('push_meta_label')}
                            </button>
                            <button
                                className="p-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-600 hover:text-white transition-all shadow-inner"
                            >
                                <ExternalLink size={16} />
                            </button>
                        </div>
                    </Card>
                ))}

                <Card className="border-dashed border-2 border-slate-800 bg-transparent flex flex-col items-center justify-center py-10 group hover:border-emerald-500/30 transition-all cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center mb-4 border border-slate-800 text-slate-700 group-hover:text-emerald-400 transition-colors shadow-inner">
                        <Share2 size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white">{t('external_api_label')}</p>
                    <p className="text-[8px] text-slate-700 uppercase font-black mt-1">V2.0 Core Endpoint</p>
                </Card>
            </div>

            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-emerald-500/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start gap-6 relative z-10 p-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl text-emerald-400 shadow-xl">
                        <RefreshCw size={28} className={isSyncing ? "animate-spin" : ""} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-white text-xl uppercase tracking-tighter">{t('how_it_works_title')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div>
                                <h4 className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-2">{t('receive_workouts_step')}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    {t('receive_workouts_desc')}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-2">{t('sync_results_step')}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    {t('sync_results_desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {showToast && (
                <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10">
                    <div className="bg-emerald-600 text-slate-950 px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 border-t-4 border-emerald-400">
                        <Watch className="animate-bounce" size={24} />
                        <div>
                            <p className="font-black uppercase tracking-tighter text-lg">{t('broadcasted_label')}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-900 tracking-widest">{t('target_device_received')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
