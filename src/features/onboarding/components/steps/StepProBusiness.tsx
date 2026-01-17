import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { Building2, FileText, MapPin, Hash } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface StepProBusinessProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: any;
}

export function StepProBusiness({ formData, setFormData, errors }: StepProBusinessProps) {
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('legal_name_label')}
                </label>
                <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        name="legalName"
                        value={formData.legalName}
                        onChange={handleChange}
                        placeholder="John Doe Coaching LLC"
                        className={cn(
                            "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                            errors.legalName ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
                        )}
                    />
                </div>
                {errors.legalName && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.legalName}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('tax_id_label')}
                </label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleChange}
                        placeholder="VAT / Tax Identification Number"
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('address_label')}
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Business Street"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('zip_label')}
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            placeholder="75000"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
