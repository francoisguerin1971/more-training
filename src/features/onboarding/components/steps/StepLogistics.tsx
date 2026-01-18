import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { Watch, Package, Clock, Activity } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface StepLogisticsProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: any;
}

const EQUIPMENT = ['Dumbbells', 'Kettlebells', 'Resistance Bands', 'Pull-up Bar', 'Bench', 'Treadmill', 'Stationary Bike'];
const DEVICES = ['Garmin', 'Apple Watch', 'Polar', 'Suunto', 'Whoop', 'Oura'];

export function StepLogistics({ formData, setFormData, errors }: StepLogisticsProps) {
    const { t } = useLanguage();

    const toggleItem = (field: string, item: string) => {
        const current = formData[field] || [];
        const next = current.includes(item)
            ? current.filter((i: string) => i !== item)
            : [...current, item];
        setFormData((prev: any) => ({ ...prev, [field]: next }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Equipment Section */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('available_equipment_label')}
                </label>
                <div className="flex flex-wrap gap-2">
                    {EQUIPMENT.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => toggleItem('equipment', item)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                formData.equipment?.includes(item)
                                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10"
                                    : "bg-slate-950/50 border border-slate-800 text-slate-500 hover:text-white"
                            )}
                        >
                            <Package size={14} className="inline mr-2" />
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Devices Section */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {t('connected_devices_label')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEVICES.map((device) => (
                        <button
                            key={device}
                            type="button"
                            onClick={() => toggleItem('devices', device)}
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                                formData.devices?.includes(device)
                                    ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/5"
                                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            <Watch size={18} className={formData.devices?.includes(device) ? "text-indigo-400" : "text-slate-500"} />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", formData.devices?.includes(device) ? "text-white" : "text-slate-500")}>
                                {device}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Availability & Location Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('weekly_availability_label')} (mins)
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="number"
                            name="availability"
                            value={formData.availability}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, availability: parseInt(e.target.value) }))}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('training_location_label')}
                    </label>
                    <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
                        {['indoor', 'outdoor', 'both'].map((loc) => (
                            <button
                                key={loc}
                                type="button"
                                onClick={() => setFormData((prev: any) => ({ ...prev, location: loc }))}
                                className={cn(
                                    "flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    formData.location === loc
                                        ? "bg-emerald-500 text-slate-950 shadow-lg"
                                        : "text-slate-500 hover:text-white"
                                )}
                            >
                                {t(loc)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Health & Biometrics Section */}
            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                        <Activity size={20} />
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('step_health')}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('resting_heart_rate_label')}</label>
                        <input
                            type="number"
                            placeholder="60"
                            value={formData.restingHR || ''}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, restingHR: parseInt(e.target.value) }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-rose-500/50 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('max_heart_rate_label')}</label>
                        <input
                            type="number"
                            placeholder="190"
                            value={formData.maxHR || ''}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, maxHR: parseInt(e.target.value) }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-rose-500/50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('medical_constraints_label')}</label>
                    <textarea
                        placeholder={t('medical_placeholder')}
                        value={formData.medicalConstraints || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, medicalConstraints: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white text-xs font-medium h-24 resize-none focus:border-rose-500/50 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
