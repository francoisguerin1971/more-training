import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { User, Calendar, MapPin, Building2, Ruler, Weight, Globe } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface StepPersonalProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: any;
}

export function StepPersonal({ formData, setFormData, errors }: StepPersonalProps) {
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center">
                        {t('pseudo_label')}
                        <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            name="pseudo"
                            value={formData.pseudo}
                            onChange={handleChange}
                            placeholder="JohnMoover"
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                                errors.pseudo ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                            )}
                        />
                    </div>
                    {errors.pseudo && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.pseudo}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center">
                        {t('dob_label')}
                        <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                                errors.dob ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center">
                        {t('city_label')}
                        <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Paris"
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                                errors.city ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                            )}
                        />
                    </div>
                    {errors.city && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center">
                        {t('country_label')}
                        <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="France"
                            className={cn(
                                "w-full bg-slate-950/50 border rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none transition-all font-medium",
                                errors.country ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                            )}
                        />
                    </div>
                    {errors.country && <p className="text-[10px] text-rose-500 font-bold uppercase ml-2">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        {t('club_label')}
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            name="club"
                            value={formData.club}
                            onChange={handleChange}
                            placeholder="Optional"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/50">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">{t('gender')}</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest focus:border-emerald-500 transition-all"
                    >
                        <option value="">{t('select')}</option>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                        <option value="non-binary">{t('non_binary')}</option>
                        <option value="other">{t('prefer_not_to_say')}</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">{t('height')} (cm)</label>
                    <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input
                            type="number" name="height" value={formData.height} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white text-xs font-bold focus:border-emerald-500"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">{t('weight')} (kg)</label>
                    <div className="relative">
                        <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input
                            type="number" name="weight" value={formData.weight} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white text-xs font-bold focus:border-emerald-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
