import React, { useState, useEffect, useRef } from 'react';
import {
    UserPlus, X, PlusCircle, Trash2, AtSign, Tag, Check, ChevronLeft,
    ChevronRight, Download, FileSpreadsheet, Users, CreditCard,
    Shield, Activity, ChevronDown, CheckCircle2, Info
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/core/utils/cn';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { LanguageDropdown } from '@/shared/components/common/LanguageDropdown';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';

export function GlobalInviteModal() {
    const { t } = useLanguage();
    const { currentUser, inviteAthlete, showInviteModal, setShowInviteModal, getCoachOfferings } = useAuthStore();

    const [inviteStep, setInviteStep] = useState(1);
    const [invitees, setInvitees] = useState<any[]>([
        { id: '1', first_name: '', last_name: '', email: '', sport: 'Running', customSport: '', role: 'athlete' }
    ]);
    const [globalSuggestedPlan, setGlobalSuggestedPlan] = useState<string>('none');
    const [offerings, setOfferings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSimulation = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';
    const isPro = currentUser?.role === 'pro';

    useEffect(() => {
        if (showInviteModal && currentUser?.id && isPro) {
            getCoachOfferings(currentUser.id).then(setOfferings);
        }
    }, [showInviteModal, currentUser, getCoachOfferings, isPro]);

    // Reset step and plan when modal closes
    useEffect(() => {
        if (!showInviteModal) {
            setInviteStep(1);
            setGlobalSuggestedPlan('none');
        }
    }, [showInviteModal]);

    if (!showInviteModal) return null;

    const addInviteeRow = () => {
        setInvitees(prev => [...prev, {
            id: Date.now().toString(),
            first_name: '',
            last_name: '',
            email: '',
            sport: 'Running',
            customSport: '',
            role: 'athlete'
        }]);
    };

    const removeInviteeRow = (id: string) => {
        if (invitees.length <= 1) return;
        setInvitees(prev => prev.filter(inv => inv.id !== id));
    };

    const updateInvitee = (id: string, updates: any) => {
        setInvitees(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
    };

    const handleInviteSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!currentUser?.id) return;

        setLoading(true);
        let successCount = 0;

        try {
            for (const invitee of invitees) {
                if (!invitee.email) continue;
                const { error } = await inviteAthlete({
                    email: invitee.email,
                    first_name: invitee.first_name,
                    last_name: invitee.last_name,
                    sport: invitee.sport === 'Other' ? invitee.customSport : invitee.sport,
                    role: invitee.role,
                    suggestedPlan: isPro ? globalSuggestedPlan : 'none'
                });
                if (!error) successCount++;
            }

            if (successCount > 0) {
                toast.success(t('invite_success_bulk'));
                setShowInviteModal(false);
            } else {
                toast.error(t('error_generic'));
            }
        } catch (err) {
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Invitations');
        worksheet.columns = [
            { header: 'Email', key: 'email', width: 30 },
            { header: 'First Name', key: 'first_name', width: 15 },
            { header: 'Last Name', key: 'last_name', width: 15 },
            { header: 'Sport', key: 'sport', width: 15 },
            { header: 'Role', key: 'role', width: 10 }
        ];
        worksheet.addRow({ email: 'john.doe@example.com', first_name: 'John', last_name: 'Doe', sport: 'Running', role: 'athlete' });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_invitations.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await file.arrayBuffer());
            const worksheet = workbook.worksheets[0];

            if (!worksheet) {
                toast.error('Fichier invalide');
                return;
            }

            const rows: any[] = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header
                const values = row.values as any[];
                rows.push({
                    email: values[1] || '',
                    first_name: values[2] || '',
                    last_name: values[3] || '',
                    sport: values[4] || 'Running',
                    role: values[5] || 'athlete'
                });
            });

            const newInvitees = rows.map((row, idx) => ({
                id: `import-${idx}`,
                email: row.email,
                first_name: row.first_name,
                last_name: row.last_name,
                sport: row.sport,
                customSport: '',
                role: (row.role || 'athlete').toLowerCase() === 'coach' && isPro ? 'coach' : 'athlete'
            })).filter(inv => inv.email);

            if (newInvitees.length > 0) {
                setInvitees(newInvitees);
                toast.success(`${newInvitees.length} participants importés.`);
            }
        } catch (err) {
            console.error('Excel import error:', err);
            toast.error('Erreur lors de l\'import du fichier');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
            <Card className="w-full max-w-5xl border-white/5 shadow-2xl animate-in zoom-in-95 duration-500 bg-[#07090D] p-0 overflow-hidden flex flex-col max-h-[90vh] rounded-[2rem] relative" onClick={(e) => e.stopPropagation()}>

                {/* Header with Language Dropdown */}
                <div className="px-8 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">
                                {isPro ? t('invite_athlete') : t('invite_partners')}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {inviteStep === 1 ? (isPro ? t('invite_config_recipients') : t('invite_friends')) : t('invite_suggested_offer')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageDropdown />
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <form onSubmit={handleInviteSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-8 md:px-10 pt-10 pb-8 scrollbar-hide">

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                                <div className="lg:col-span-3 space-y-8">
                                    {inviteStep === 1 ? (
                                        <>
                                            {/* Excel Instructions Block */}
                                            <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex items-start gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                                    <FileSpreadsheet size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{t('invite_mass_import')}</p>
                                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                                        {t('invite_excel_purpose')} {t('invite_mass_import_desc')}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={downloadTemplate}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            <Download size={14} /> {t('invite_excel_template')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-500/20"
                                                        >
                                                            <FileSpreadsheet size={14} /> {t('import_excel')}
                                                        </button>
                                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2">
                                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Users size={16} className="text-emerald-500" />
                                                    {isPro ? t('participants_tab') : t('invite_partners_label')}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={addInviteeRow}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10"
                                                >
                                                    <PlusCircle size={14} /> {t('invite_add_contact')}
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {invitees.map((invitee) => (
                                                    <div key={invitee.id} className="grid grid-cols-12 gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl group hover:border-emerald-500/20 transition-all relative">
                                                        <div className="col-span-2 space-y-1">
                                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">{t('last_name')}</label>
                                                            <input
                                                                type="text"
                                                                placeholder="NOM"
                                                                value={invitee.last_name}
                                                                onChange={e => updateInvitee(invitee.id, { last_name: e.target.value })}
                                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-bold outline-none focus:border-emerald-500/50"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 space-y-1">
                                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">{t('first_name')}</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Prénom"
                                                                value={invitee.first_name}
                                                                onChange={e => updateInvitee(invitee.id, { first_name: e.target.value })}
                                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-bold outline-none focus:border-emerald-500/50"
                                                            />
                                                        </div>
                                                        <div className="col-span-3 space-y-1">
                                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Email *</label>
                                                            <div className="relative">
                                                                <AtSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
                                                                <input
                                                                    type="email"
                                                                    required
                                                                    placeholder="email@domaine.com"
                                                                    value={invitee.email}
                                                                    onChange={e => updateInvitee(invitee.id, { email: e.target.value })}
                                                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-xs font-bold outline-none focus:border-emerald-500/50"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3 space-y-1">
                                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">{t('ai_sport')}</label>
                                                            <div className="flex gap-2">
                                                                <div className={cn("relative", invitee.sport === 'Other' ? "w-1/3" : "w-full")}>
                                                                    <select
                                                                        value={invitee.sport}
                                                                        onChange={e => updateInvitee(invitee.id, { sport: e.target.value })}
                                                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-white text-[10px] font-black uppercase outline-none focus:border-emerald-500/50 appearance-none pr-6 truncate"
                                                                    >
                                                                        <option value="Running" className="bg-slate-900 text-white">Running</option>
                                                                        <option value="Cycling" className="bg-slate-900 text-white">Cycling</option>
                                                                        <option value="Swimming" className="bg-slate-900 text-white">Swimming</option>
                                                                        <option value="Triathlon" className="bg-slate-900 text-white">Triathlon</option>
                                                                        <option value="Trail" className="bg-slate-900 text-white">Trail</option>
                                                                        <option value="CrossFit" className="bg-slate-900 text-white">CrossFit</option>
                                                                        <option value="Other" className="bg-slate-900 text-white">{t('other') || 'Autre'}</option>
                                                                    </select>
                                                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                                                </div>
                                                                {invitee.sport === 'Other' && (
                                                                    <input
                                                                        type="text"
                                                                        placeholder={t('specify_sport') || "Préciser"}
                                                                        value={invitee.customSport}
                                                                        onChange={e => updateInvitee(invitee.id, { customSport: e.target.value })}
                                                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-[10px] font-bold outline-none focus:border-emerald-500/50 animate-in fade-in slide-in-from-left-2"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 space-y-1">
                                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">{t('role_label')}</label>
                                                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 h-9">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateInvitee(invitee.id, { role: 'athlete' })}
                                                                    className={cn(
                                                                        "flex-1 rounded flex items-center justify-center gap-1.5 text-[8px] font-black transition-all",
                                                                        invitee.role === 'athlete' ? "bg-emerald-500 text-slate-950 shadow-lg" : "text-slate-600 hover:text-slate-400"
                                                                    )}
                                                                >
                                                                    ATHLÈTE
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateInvitee(invitee.id, { role: 'coach' })}
                                                                    className={cn(
                                                                        "flex-1 rounded flex items-center justify-center gap-1.5 text-[8px] font-black transition-all",
                                                                        invitee.role === 'coach' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-600 hover:text-slate-400"
                                                                    )}
                                                                >
                                                                    COACH
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeInviteeRow(invitee.id)}
                                                            className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-800 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center gap-4 py-2 border-b border-white/5">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                    <Tag size={20} />
                                                </div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('suggested_plan')}</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {/* No Plan Option */}
                                                <button
                                                    type="button"
                                                    onClick={() => setGlobalSuggestedPlan('none')}
                                                    className={cn(
                                                        "flex items-center justify-between p-5 w-full transition-all border rounded-2xl group",
                                                        globalSuggestedPlan === 'none' ? "bg-slate-500/10 border-slate-500/40 shadow-xl" : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", globalSuggestedPlan === 'none' ? "bg-slate-500 text-white shadow-lg" : "bg-white/5 text-slate-700")}>
                                                            {globalSuggestedPlan === 'none' ? <Check size={24} strokeWidth={4} /> : <X size={20} />}
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="text-sm font-black text-white uppercase tracking-tight">{t('invite_no_plan')}</div>
                                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t('invite_free_access')}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-black text-slate-700 italic uppercase">{t('invite_free_label')}</div>
                                                    </div>
                                                </button>

                                                {offerings.filter(o => o.type === 'PACKAGE').map(plan => (
                                                    <button
                                                        key={plan.id}
                                                        type="button"
                                                        onClick={() => setGlobalSuggestedPlan(plan.id)}
                                                        className={cn(
                                                            "flex items-center justify-between p-5 w-full transition-all border rounded-2xl group",
                                                            globalSuggestedPlan === plan.id ? "bg-emerald-500/5 border-emerald-500/40" : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", globalSuggestedPlan === plan.id ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-slate-700")}>
                                                                {globalSuggestedPlan === plan.id ? <Check size={24} strokeWidth={4} /> : <CreditCard size={20} />}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="text-sm font-black text-white uppercase tracking-tight">{plan.name}</div>
                                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t('invite_recommended_package')}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-black text-emerald-400">€{plan.price_cents / 100}</div>
                                                            <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{t('per_month')}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Area */}
                                <div className="lg:col-span-1 border-l border-white/5 pl-8 space-y-8">
                                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4 shadow-xl">
                                        <div className="flex items-center gap-3">
                                            <Shield size={16} className="text-emerald-500" />
                                            <h4 className="text-[9px] font-black text-white uppercase tracking-widest">{t('privacy_policy')}</h4>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic">
                                            {t('invite_privacy_info')}
                                        </p>
                                    </div>

                                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-6">
                                        <div>
                                            <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3 mb-4">
                                                <Activity size={14} className="text-indigo-400" />
                                                {t('invite_summary')}
                                            </h4>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-white leading-none">{invitees.length}</span>
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{t('invite_invitees')}</span>
                                            </div>
                                        </div>

                                        {isPro && (
                                            <div className="space-y-3 border-t border-white/5 pt-6">
                                                <div className="flex justify-between items-center text-[8px] font-black text-slate-700 uppercase tracking-widest">
                                                    <span>{t('invite_progression')}</span>
                                                    <span>{inviteStep}/2</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(inviteStep / 2) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-10 py-8 border-t border-white/5 bg-[#0A0D14]/80 backdrop-blur-xl flex justify-between items-center z-20">
                            <div>
                                {inviteStep === 2 && isPro && (
                                    <button
                                        type="button"
                                        onClick={() => setInviteStep(1)}
                                        className="flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl hover:bg-white/5"
                                    >
                                        <ChevronLeft size={16} /> {t('modify')}
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="px-6 py-3 text-[10px] font-black text-slate-500 hover:text-slate-200 uppercase tracking-widest">
                                    {t('cancel')}
                                </button>

                                {inviteStep === 1 ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (isPro) {
                                                setInviteStep(2);
                                            } else {
                                                handleInviteSubmit();
                                            }
                                        }}
                                        disabled={invitees.every(i => !i.email)}
                                        className="px-10 py-3 bg-white hover:bg-slate-100 text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-20 shadow-xl shadow-white/5"
                                    >
                                        {loading ? <Activity className="animate-spin" size={18} /> : (
                                            isPro ? <>{t('btn_continue') || 'Suivant'} <ChevronRight size={18} /></>
                                                : <>{t('btn_confirm_invite') || "Inviter mes amis"} <Check size={20} strokeWidth={4} /></>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-12 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? <Activity className="animate-spin" size={18} /> : <>{t('btn_confirm_invite') || "Lancer"} <Check size={20} strokeWidth={4} /></>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
