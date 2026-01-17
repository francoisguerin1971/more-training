import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    FileText, Download, CheckCircle,
    Clock, AlertCircle, CreditCard,
    TrendingUp, Calendar, Zap, Video, MapPin
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/core/utils/cn';
import { jsPDF } from 'jspdf';
import { supabase } from '@/core/services/supabase';
import { format, addMonths } from 'date-fns';

export function AthleteBilling() {
    const { t } = useLanguage();
    const { currentUser } = useAuthStore();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Active Plans Data (plural)
    const activePlans = [
        {
            id: 1,
            name: currentUser?.profile_data?.activePlan?.name || "Coaching Premium",
            price: "120.00 €",
            renewalDate: format(addMonths(new Date(), 1), 'dd MMM yyyy'),
            status: 'ACTIVE',
            coach: "Coach Alex",
            paymentMethod: "VISA •••• 4242"
        }
        // Add more plans here to test the list view
    ];

    const credits = {
        video: 2,
        presencial: 0
    };

    useEffect(() => {
        const fetchInvoices = async () => {
            if (!currentUser) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('profile_id', currentUser.id)
                .order('issued_at', { ascending: false });

            if (!error && data) {
                setInvoices(data.map(inv => ({
                    id: inv.id,
                    date: format(new Date(inv.issued_at), 'dd MMM yyyy'),
                    plan: inv.details?.description || activePlans[0].name,
                    amount: (inv.amount_cents / 100).toFixed(2),
                    status: inv.status
                })));
            }
            setLoading(false);
        };

        fetchInvoices();
    }, [currentUser]);

    const downloadPDF = async (invoice: any) => {
        // ... (PDF generation logic kept same)
        const doc = new jsPDF();
        let seller = {
            name: 'More Training Platform',
            details: ['Barcelona, Spain'],
            vat: 'ESXXXXXXXX'
        };
        const primaryColor = [16, 185, 129];
        const secondaryColor = [30, 41, 59];

        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('MORE TRAINING', 20, 25);
        doc.setFontSize(10);
        doc.text(t('invoice_professional'), 140, 25);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('seller')}:`, 20, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(seller.name, 20, 62);
        seller.details.forEach((line, i) => doc.text(line, 20, 67 + (i * 5)));

        doc.setFont('helvetica', 'bold');
        doc.text(`${t('buyer')}:`, 120, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(currentUser?.name || currentUser?.full_name || 'Athlete', 120, 62);
        doc.text(currentUser?.email || '', 120, 67);

        doc.setFontSize(9);
        doc.text(`${t('invoice_no')}: ${invoice.id}`, 20, 90);
        doc.text(`${t('issued_at')}: ${invoice.date}`, 20, 95);

        doc.setFillColor(240, 240, 240);
        doc.rect(20, 110, 170, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(t('description'), 25, 117);
        doc.text(t('amount'), 165, 117);

        doc.setFont('helvetica', 'normal');
        doc.text(invoice.plan, 25, 130);
        doc.text(`${invoice.amount} €`, 165, 130);

        doc.save(`Invoice_${invoice.id}.pdf`);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'FAILED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                    {t('my_subscription')}
                </h1>
                <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
                    {t('subscription_management')}
                </p>
            </div>

            {/* MAIN GRID: PLANS + CREDITS (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* LEFT: ACTIVE PLANS LIST */}
                <div className="md:col-span-2 space-y-6">
                    {activePlans.map((plan) => (
                        <Card key={plan.id} className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-2xl relative overflow-hidden group transition-all hover:border-emerald-500/30">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                            <CardHeader
                                title={t('sub_active_plan')}
                                subtitle={plan.name}
                                icon={<Zap className="text-emerald-400" size={20} />}
                            />

                            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <TrendingUp size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{plan.coach}</h3>
                                        <p className="text-emerald-400 font-bold text-sm flex items-center gap-2 mt-1">
                                            <CheckCircle size={14} /> {plan.status}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-3xl font-black text-white">{plan.price}</span>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">/ {t('month')}</span>
                                </div>
                            </div>

                            <div className="px-8 pb-8 pt-0 flex flex-col md:flex-row items-center justify-between border-t border-slate-800/50 mt-4 pt-6 gap-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Clock size={14} />
                                    <span>{t('sub_next_renewal')}: <strong className="text-white">{plan.renewalDate}</strong></span>
                                </div>

                                {/* Secure Payment Badge - No Card Details */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                                    <div className="flex -space-x-2">
                                        <div className="w-4 h-4 rounded-full bg-[#635BFF] flex items-center justify-center text-[6px] font-bold text-white z-10">S</div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t('secured_by_stripe')}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* RIGHT: ONE-OFF CREDITS (Restored side-by-side) */}
                <Card className="md:col-span-1 bg-slate-900 border-slate-800 shadow-xl flex flex-col">
                    <CardHeader
                        title={t('sub_consultations')}
                        subtitle="Séances à la carte"
                        icon={<Video className="text-indigo-400" size={20} />}
                    />
                    <div className="p-6 flex-1 flex flex-col justify-center space-y-4">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                    <Video size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">Vidéo</p>
                                    <p className="text-[9px] text-slate-500 font-black uppercase">{t('sub_credits_remaining')}</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white">{credits.video}</span>
                        </div>

                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">{t('physical')}</p>
                                    <p className="text-[9px] text-slate-500 font-black uppercase">{t('sub_credits_remaining')}</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-slate-600">{credits.presencial}</span>
                        </div>

                        <button className="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            {t('sub_buy_more')}
                        </button>
                    </div>
                </Card>
            </div>

            {/* DISCLAIMER CARD - Moved below the grid */}
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-start gap-4">
                <AlertCircle className="text-slate-500 shrink-0 mt-0.5" size={18} />
                <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('payment_disclaimer_title')}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-4xl">
                        {t('payment_disclaimer_text')}
                    </p>
                </div>
            </div>

            {/* SECTION 3: INVOICE HISTORY */}
            <Card className="bg-slate-950 border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} className="text-emerald-400" />
                        {t('sub_invoice_history')}
                    </h2>
                </div>
                {/* Table content remains same */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-800">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('invoice_no')} #</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('date')}</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('description')}</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('amount')}</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('status')}</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8 h-4 bg-slate-900/20"></td>
                                    </tr>
                                ))
                            ) : invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-900/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-white">{invoice.id.slice(0, 8)}...</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400 font-bold">{invoice.date}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400 font-bold uppercase tracking-tight">{invoice.plan}</td>
                                        <td className="px-6 py-4 text-xs text-white font-black">{invoice.amount} €</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest",
                                                getStatusStyles(invoice.status)
                                            )}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => downloadPDF(invoice)}
                                                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase">
                                        {t('sub_no_invoices')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
