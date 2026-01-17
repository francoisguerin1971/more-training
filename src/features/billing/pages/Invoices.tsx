import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    FileText, Download, CheckCircle,
    Clock, AlertCircle, CreditCard,
    TrendingUp, Calendar
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/shared/lib/utils';
import { jsPDF } from 'jspdf';
import { supabase } from '@/core/services/supabase';
import { format } from 'date-fns';

export function Invoices() {
    const { t } = useLanguage();
    const { currentUser } = useAuthStore();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    plan: currentUser.current_plan === 'pro' ? 'Coach Pro' : currentUser.current_plan,
                    amount: (inv.amount_cents / 100).toFixed(2),
                    status: inv.status
                })));
            }
            setLoading(false);
        };

        fetchInvoices();
    }, [currentUser]);

    const downloadPDF = async (invoice) => {
        const doc = new jsPDF();

        // Determine Seller (Platform or Coach)
        let seller = {
            name: 'Òscar Moreno Fontanillas (More Training)',
            details: ['Barcelona, Spain'],
            vat: 'ESXXXXXXXX'
        };

        // If invoice has a specific seller (e.g. Coach), fetch their details
        if (invoice.seller_id && invoice.seller_id !== 'platform') {
            const { data: sellerProfile } = await supabase
                .from('profiles')
                .select('profile_data')
                .eq('id', invoice.seller_id)
                .single();

            if (sellerProfile?.profile_data?.fiscal) {
                const fiscal = sellerProfile.profile_data.fiscal;
                seller = {
                    name: fiscal.legalName || 'Coach Professional',
                    details: [
                        fiscal.address,
                        `${fiscal.zip} ${fiscal.city}`,
                        fiscal.country
                    ].filter(Boolean),
                    vat: fiscal.taxId || 'N/A'
                };
            }
        }

        // Settings & Colors
        const primaryColor = [16, 185, 129]; // Emerald 500
        const secondaryColor = [30, 41, 59]; // Slate 800

        // Header
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('MORE TRAINING', 20, 25);

        doc.setFontSize(10);
        doc.text(t('invoice_professional'), 140, 25);

        // Seller Info (EU Standards)
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('seller')}:`, 20, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(seller.name, 20, 62);

        let yPos = 67;
        seller.details.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 5;
        });
        doc.text(`VAT ID: ${seller.vat}`, 20, yPos);

        // Buyer Info
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('buyer')}:`, 120, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(currentUser.name || 'Professional Coach', 120, 62);
        doc.text(currentUser.email, 120, 67);

        // Invoice Details
        doc.setFontSize(9);
        doc.text(`${t('invoice_no')}: ${invoice.id}`, 20, 90);
        doc.text(`${t('issued_at')}: ${invoice.date}`, 20, 95);
        doc.text(`${t('status')}: ${invoice.status}`, 20, 100);

        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 110, 170, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(t('description'), 25, 117);
        doc.text(t('amount_ht'), 100, 117);
        doc.text(t('vat_21'), 135, 117);
        doc.text(t('total_ttc'), 165, 117);

        // Table Content
        const amountHT = (parseFloat(invoice.amount) / 1.21).toFixed(2);
        const vatAmount = (parseFloat(invoice.amount) - amountHT).toFixed(2);

        doc.setFont('helvetica', 'normal');
        doc.text(`${t('subscription')} ${invoice.plan}`, 25, 130);
        doc.text(`${amountHT} €`, 100, 130);
        doc.text(`${vatAmount} €`, 135, 130);
        doc.text(`${invoice.amount} €`, 165, 130);

        // Line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 140, 190, 140);

        // Final Totals
        doc.setFont('helvetica', 'bold');
        doc.text(t('total_final'), 135, 155);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(14);
        doc.text(`${invoice.amount} €`, 165, 155);

        // Legal Note
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(t('invoice_legal_note'), 20, 280);
        doc.text(t('invoice_thank_you'), 20, 285);

        // Save
        doc.save(`${t('invoice_filename_prefix')}${invoice.id}.pdf`);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'FAILED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        {t('my_invoices').split(' ')[0]} <span className="text-emerald-400">{t('my_invoices').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">{t('subscription_management')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                        <CreditCard size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-white">VISA •••• 4242</span>
                        <button className="text-[9px] font-black uppercase text-emerald-400 hover:text-white transition-colors">{t('modify')}</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-950 border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-wrap">{t('current_plan')}</p>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Coach Pro</h3>
                        </div>
                    </div>
                </Card>
                <Card className="bg-slate-950 border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('renewal')}</p>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">01 Fév. 2026</h3>
                        </div>
                    </div>
                </Card>
                <Card className="bg-slate-950 border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('last_amount')}</p>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                {invoices.length > 0 ? `${invoices[0].amount} €` : '--'}
                            </h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="bg-slate-950 border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} className="text-emerald-400" />
                        {t('transaction_history')}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-800">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('invoice_no')} #</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('date')}</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('plan')}</th>
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
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-900/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-white">{invoice.id}</span>
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
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
