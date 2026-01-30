import React, { useState, useRef } from 'react';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    User, Mail, Globe, MapPin,
    Shield, Trash2, Moon, Sun,
    Camera, CheckCircle2, AlertCircle, Save,
    Power, Download, Lock, Bell, Eye, EyeOff,
    Languages, Palette, Ruler, Link2, X,
    Briefcase, Building, Activity
} from 'lucide-react';
import { supabase } from '@/core/services/supabase';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';
import { ImageCropModal } from '../components/ImageCropModal';
import { PasswordStrengthIndicator } from '@/shared/components/form/PasswordStrengthIndicator';

export function AccountSettings() {
    const { t, language, setLanguage } = useLanguage();
    const { currentUser, updateProfile, deleteAccount, logout, uploadAvatar } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New States
    const [vacations, setVacations] = useState<{ start: string, end: string }[]>([]);
    const [newVacation, setNewVacation] = useState({ start: '', end: '' });
    const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
    const [compact, setCompact] = useState(false);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // MFA States
    const { listMFAFactors, enrollMFA, verifyMFA, unenrollMFA } = useAuthStore();
    const [mfaFactors, setMfaFactors] = useState<any[]>([]);
    const [isLoadingMFA, setIsLoadingMFA] = useState(false);
    const [showMFAModal, setShowMFAModal] = useState(false);
    const [mfaEnrollData, setMfaEnrollData] = useState<any>(null);
    const [mfaCode, setMfaCode] = useState('');
    const [isVerifyingMFA, setIsVerifyingMFA] = useState(false);
    const [mfaError, setMfaError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: currentUser?.first_name || '',
        lastName: currentUser?.last_name || '',
        pseudo: currentUser?.pseudo || '',
        email: currentUser?.email || '',
        status: currentUser?.status || 'active',
        // Fiscal Data (Pro only)
        legalName: currentUser?.profile_data?.fiscal?.legalName || '',
        taxId: currentUser?.profile_data?.fiscal?.taxId || '',
        address: currentUser?.profile_data?.fiscal?.address || '',
        city: currentUser?.profile_data?.fiscal?.city || '',
        zip: currentUser?.profile_data?.fiscal?.zip || '',
        country: currentUser?.profile_data?.fiscal?.country || ''
    });

    // Update form data ONLY when currentUser loads initially OR if we're not currently editing
    React.useEffect(() => {
        if (currentUser && !isDirty && !isSaving && !isUploading) {
            setFormData(prev => ({
                ...prev,
                firstName: currentUser.first_name || '',
                lastName: currentUser.last_name || '',
                pseudo: currentUser.pseudo || '',
                email: currentUser.email || '',
                status: currentUser.status || 'active',
                legalName: currentUser.profile_data?.fiscal?.legalName || '',
                taxId: currentUser.profile_data?.fiscal?.taxId || '',
                address: currentUser.profile_data?.fiscal?.address || '',
                city: currentUser.profile_data?.fiscal?.city || '',
                zip: currentUser.profile_data?.fiscal?.zip || '',
                country: currentUser.profile_data?.fiscal?.country || ''
            }));

            if (currentUser.profile_data?.theme) setTheme(currentUser.profile_data.theme);
            if (currentUser.profile_data?.compactMode !== undefined) setCompact(currentUser.profile_data.compactMode);
            if (currentUser.profile_data?.vacations) setVacations(currentUser.profile_data.vacations);
        }
    }, [currentUser, isDirty, isSaving, isUploading]);

    // Check MFA status on mount
    React.useEffect(() => {
        const checkMFA = async () => {
            const { data, error } = await listMFAFactors();
            if (data?.all) {
                setMfaFactors(data.all);
            }
        };
        checkMFA();
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Safety timeout: reset state after 15 seconds no matter what
        const timeout = setTimeout(() => {
            console.warn('Save timed out after 15s - forcing state reset');
            setIsSaving(false);
        }, 15000);

        try {
            const updates: any = {
                // Now sync the new columns directly
                first_name: formData.firstName,
                last_name: formData.lastName,
                pseudo: formData.pseudo,
                full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                status: formData.status,
                profile_data: {
                    ...currentUser?.profile_data,
                    theme: theme,
                    compactMode: compact,
                    vacations: vacations,
                    fiscal: {
                        legalName: formData.legalName,
                        taxId: formData.taxId,
                        address: formData.address,
                        city: formData.city,
                        zip: formData.zip,
                        country: formData.country,
                        stripeConnected: currentUser?.profile_data?.fiscal?.stripeConnected || false
                    }
                }
            };


            const result = await updateProfile(updates);

            if (result?.error) {
                console.error("Save error:", result.error);
                alert(`Erreur de sauvegarde: ${result.error.message || 'Erreur inconnue'}`);
            } else {
                setIsDirty(false);
            }
        } catch (e: any) {
            console.error("Save exception in handleSave:", e);
            alert(`Erreur: ${e.message || 'Sauvegarde échouée'}`);
        } finally {
            clearTimeout(timeout);
            setIsSaving(false);
        }
    };

    const handleToggleSleep = () => {
        // Map 'sleeping' to 'inactive' for type safety, or just toggle active/inactive
        const newStatus = formData.status === 'active' ? 'inactive' : 'active';
        if (!currentUser) return;
        setFormData(p => ({ ...p, status: newStatus }));
        updateProfile({ status: newStatus });
    };

    const handleDelete = async () => {
        if (!currentUser) return;
        if (deleteAccount) {
            await deleteAccount(currentUser.id);
        } else {
            await logout(); // Fallback
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show crop modal instead of uploading directly
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedFile: File) => {
        setCropModalOpen(false);
        setIsUploading(true);

        // Safety timeout for upload
        const timeout = setTimeout(() => {
            if (isUploading) {
                console.warn('Avatar upload timed out after 30s');
                setIsUploading(false);
            }
        }, 30000);

        try {

            if (uploadAvatar) {
                const result = await uploadAvatar(croppedFile);

                if (result.error) {
                    console.error("Avatar upload error:", result.error);
                    alert(`Échec de l'upload: ${result.error.message || 'Erreur inconnue'}`);
                } else {
                }
            } else {
                // Fallback if not available yet in store
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const result = reader.result as string;
                    await updateProfile({ avatar: result });
                };
                reader.readAsDataURL(croppedFile);
            }
        } catch (e: any) {
            console.error("Avatar upload exception:", e);
            alert(`Erreur: ${e.message || 'Upload échoué'}`);
        } finally {
            clearTimeout(timeout);
            setIsUploading(false);
            setSelectedImage(null);
        }
    };

    const handleAddVacation = () => {
        if (newVacation.start && newVacation.end) {
            setVacations([...vacations, newVacation]);
            setNewVacation({ start: '', end: '' });
        }
    };

    const handleRemoveVacation = (index: number) => {
        const newVacs = [...vacations];
        newVacs.splice(index, 1);
        setVacations(newVacs);
    };

    const handlePasswordUpdate = async () => {
        if (isUpdatingPassword) return;


        if (!passwordData.new || !passwordData.confirm) {
            alert("Veuillez remplir les champs du nouveau mot de passe.");
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            alert(t('passwords_dont_match'));
            return;
        }

        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passRegex.test(passwordData.new)) {
            alert(t('password_weak'));
            return;
        }

        setIsUpdatingPassword(true);

        // Safety timeout for the whole operation
        const updateTimeout = setTimeout(() => {
            console.warn('Password update timed out after 10s');
            setIsUpdatingPassword(false);
            alert("La mise à jour a pris trop de temps (timeout). Veuillez vérifier votre connexion et réessayer.");
        }, 10000);

        try {
            // Robust check for Demo Account
            // - Hardcoded demo IDs
            // - Specific test email
            // - Numeric IDs (likely from local seeds/mocks, not standard Supabase UUIDs)
            const isDemo =
                currentUser?.id === 'demo-pro-id' ||
                currentUser?.email === 'test@moretraining.com' ||
                !isNaN(Number(currentUser?.id)) ||
                currentUser?.id === '1';

            if (isDemo) {
                console.info('Demo account detected (ID: ' + currentUser?.id + '): Simulating success.');
                await new Promise(resolve => setTimeout(resolve, 1500));

                // For demo mode, we clear values to show something happened
                setPasswordData({ current: '', new: '', confirm: '' });
                setIsUpdatingPassword(false);
                alert("Mode Démo : Le mot de passe a été mis à jour avec succès (simulation) !");
                return;
            }

            const { data, error } = await supabase.auth.updateUser({
                password: passwordData.new
            });

            if (error) {
                console.error('Supabase password update error:', error);
                setIsUpdatingPassword(false);
                alert(`Erreur de mise à jour: ${error.message}`);
            } else {
                setShowConfirmPassword(false);
            }
        } catch (err: any) {
            console.error('Unexpected password update exception:', err);
            setIsUpdatingPassword(false);
            alert(`Erreur inattendue: ${err.message || 'Échec de la mise à jour'}`);
        } finally {
            clearTimeout(updateTimeout);
            setIsUpdatingPassword(false);
        }
    };

    const handleDataExport = () => {
        try {
            const exportData = {
                user: {
                    id: currentUser?.id,
                    email: currentUser?.email,
                    first_name: currentUser?.first_name || formData.firstName,
                    last_name: currentUser?.last_name || formData.lastName,
                    pseudo: currentUser?.pseudo || formData.pseudo,
                    role: currentUser?.role,
                    status: currentUser?.status,
                    created_at: currentUser?.created_at,
                },
                profile_data: currentUser?.profile_data,
                preferences: {
                    theme,
                    compactMode: compact,
                    vacations
                },
                exported_at: new Date().toISOString(),
                app: "More Training",
                version: "1.0"
            };

            const dataStr = JSON.stringify(exportData, null, 4);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const fileName = `more_training_export_${currentUser?.pseudo || 'user'}_${new Date().toISOString().split('T')[0]}.json`;

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting data:', error);
            alert("Une erreur est survenue lors de l'exportation de vos données.");
        }
    };

    // MFA Handlers
    const handleStartMFAEnroll = async () => {
        setIsLoadingMFA(true);
        setMfaError(null);
        try {
            const { data, error } = await enrollMFA();
            if (error) {
                setMfaError(error.message);
                return;
            }
            setMfaEnrollData(data);
            setShowMFAModal(true);
        } catch (err: any) {
            setMfaError(err.message);
        } finally {
            setIsLoadingMFA(false);
        }
    };

    const handleVerifyMFA = async () => {
        if (!mfaEnrollData || !mfaCode) return;
        setIsVerifyingMFA(true);
        setMfaError(null);
        try {
            // 1. Challenge
            const { data: challengeData, error: challengeError } = await useAuthStore.getState().challengeMFA(mfaEnrollData.id);
            if (challengeError) {
                setMfaError(challengeError.message);
                return;
            }

            // 2. Verify
            const { error: verifyError } = await verifyMFA(mfaEnrollData.id, challengeData.id, mfaCode);
            if (verifyError) {
                setMfaError(verifyError.message);
                return;
            }

            // Success
            setShowMFAModal(false);
            setMfaCode('');
            setMfaEnrollData(null);

            // Refresh factors
            const { data: factors } = await listMFAFactors();
            if (factors?.all) setMfaFactors(factors.all);

            alert(t('mfa_enable_success'));
        } catch (err: any) {
            setMfaError(err.message);
        } finally {
            setIsVerifyingMFA(false);
        }
    };

    const handleUnenrollMFA = async (factorId: string) => {
        if (!confirm(t('mfa_disable_confirm'))) return;
        setIsLoadingMFA(true);
        try {
            const { error } = await unenrollMFA(factorId);
            if (error) {
                alert(`Erreur: ${error.message}`);
                return;
            }

            // Refresh factors
            const { data: factors } = await listMFAFactors();
            setMfaFactors(factors?.all || []);
            alert(t('mfa_disabled_success'));
        } catch (err: any) {
            alert(`Erreur: ${err.message}`);
        } finally {
            setIsLoadingMFA(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        {t('profile_settings')}
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
                        {t('account_security')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-50"
                    >
                        {isSaving ? 'Processing...' : <><Save size={16} /> {t('save_changes')}</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <Card className="lg:col-span-1 bg-slate-950 border-slate-800 flex flex-col items-center p-8">
                    <div className="relative group">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-4xl font-black text-white shadow-2xl transition-all group-hover:border-emerald-500 overflow-hidden">
                            {(currentUser?.profile_data?.avatar || currentUser?.avatar_url || currentUser?.avatar) ? (
                                <img
                                    src={currentUser?.profile_data?.avatar || currentUser?.avatar_url || currentUser?.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                (currentUser?.full_name?.[0] || currentUser?.name?.[0] || formData.firstName?.[0] || 'A')
                            )}
                        </div>
                        <button
                            onClick={handlePhotoClick}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg hover:scale-110 transition-transform"
                        >
                            <Camera size={20} />
                        </button>
                    </div>
                    <h3 className="text-xl font-black text-white mt-6 uppercase tracking-tight">{formData.firstName} {formData.lastName}</h3>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-1">{currentUser?.role}</p>

                    <div className="w-full mt-10 pt-8 border-t border-slate-900 space-y-4">
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <span className="text-[9px] font-black text-slate-500 uppercase">{t('account_integrity')}</span>
                            <span className="text-[9px] text-emerald-400 font-black uppercase">{t('verified')}</span>
                        </div>
                        <button
                            onClick={handleToggleSleep}
                            className={cn(
                                "w-full py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all",
                                formData.status === 'inactive'
                                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                            )}
                        >
                            <Moon size={16} /> {formData.status === 'inactive' ? t('wake_up_account') : t('sleep_account')}
                        </button>
                    </div>
                </Card>

                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('general_info')} icon={<User className="text-emerald-400" size={20} />} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">{t('first_name')}<span className="text-rose-500 ml-1">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleFormChange}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-black text-xs h-14"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">{t('last_name')}<span className="text-rose-500 ml-1">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleFormChange}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-black text-xs h-14"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">{t('pseudo')}<span className="text-rose-500 ml-1">*</span></label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                    <input
                                        type="text"
                                        name="pseudo"
                                        value={formData.pseudo}
                                        onChange={handleFormChange}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-black text-xs h-14"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">{t('email_label')}<span className="text-rose-500 ml-1">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-black text-xs h-14"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {currentUser?.role === 'pro' && (
                        <Card className="bg-slate-950 border-slate-800 border-l-4 border-l-emerald-500">
                            <CardHeader title={t('fiscal_identity')} icon={<Briefcase className="text-emerald-400" size={20} />} />
                            <div className="space-y-6 pt-6">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                    {t('fiscal_desc')}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">{t('legal_name')}<span className="text-rose-500 ml-1">*</span></label>
                                        <div className="relative">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                            <input
                                                type="text"
                                                value={formData.legalName}
                                                onChange={e => setFormData(p => ({ ...p, legalName: e.target.value }))}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-black text-xs h-14 placeholder:text-slate-700"
                                                placeholder="e.g. Acme Corp LLC"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('tax_id')}</label>
                                        <input
                                            type="text"
                                            value={formData.taxId}
                                            onChange={e => setFormData(p => ({ ...p, taxId: e.target.value }))}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-white font-black text-xs h-14 placeholder:text-slate-700"
                                            placeholder="e.g. ES12345678"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('billing_address')}</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-white font-black text-xs h-14 mb-2"
                                            placeholder="Street Address"
                                        />
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                value={formData.zip}
                                                onChange={e => setFormData(p => ({ ...p, zip: e.target.value }))}
                                                className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white font-black text-xs"
                                                placeholder="ZIP Code"
                                            />
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                                                className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white font-black text-xs"
                                                placeholder="City"
                                            />
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                                                className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white font-black text-xs"
                                                placeholder="Country"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <span className="font-black text-lg">S</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight">Stripe Connect</p>
                                            <p className="text-slate-600 text-[9px] font-bold uppercase">
                                                {currentUser?.profile_data?.fiscal?.stripeConnected ? t('stripe_connected_desc') : t('stripe_connect_desc')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        disabled={currentUser?.profile_data?.fiscal?.stripeConnected}
                                        className={cn(
                                            "px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                            currentUser?.profile_data?.fiscal?.stripeConnected
                                                ? "bg-emerald-500/10 text-emerald-500 cursor-default"
                                                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                                        )}
                                    >
                                        {currentUser?.profile_data?.fiscal?.stripeConnected ? t('stripe_connected') : t('stripe_connect_btn')}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('account_security')} icon={<Shield className="text-indigo-400" size={20} />} />
                        <div className="space-y-4 pt-6">
                            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('change_password')}</p>
                                        <p className="text-slate-600 text-[9px] font-bold uppercase">{t('update_password_desc')}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('current_password')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="Enter current password"
                                                value={passwordData.current}
                                                onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-12 py-3 text-white text-xs font-black placeholder:text-slate-700"
                                            />
                                            <button
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('new_password')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={passwordData.new}
                                                onChange={e => setPasswordData(p => ({ ...p, new: e.target.value }))}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-12 py-3 text-white text-xs font-black placeholder:text-slate-700"
                                            />
                                            <button
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

                                        {passwordData.new && (
                                            <PasswordStrengthIndicator password={passwordData.new} />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('confirm_new_password')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm new password"
                                                value={passwordData.confirm}
                                                onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-12 py-3 text-white text-xs font-black placeholder:text-slate-700"
                                            />
                                            <button
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePasswordUpdate}
                                        disabled={isUpdatingPassword}
                                        className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                                    >
                                        {isUpdatingPassword ? 'Updating...' : t('update_password_btn')}
                                    </button>
                                    <p className="text-[8px] text-slate-600 font-bold uppercase text-center mt-2 tracking-tight">
                                        {t('password_direct_update_note')}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        mfaFactors.length > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                                    )}>
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('two_factor_auth')}</p>
                                        <p className="text-slate-500 text-[8px] font-medium leading-relaxed mt-1 mb-2 max-w-[280px]">
                                            {t('two_factor_auth_desc')}
                                        </p>
                                        {mfaFactors.length > 0 ? (
                                            <div className="space-y-1">
                                                {mfaFactors.map(f => (
                                                    <p key={f.id} className="text-emerald-500/80 text-[9px] font-bold uppercase flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                                                        {f.friendly_name || 'App d\'authentification'} ({f.status})
                                                    </p>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-[9px] font-bold uppercase flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                                {t('disabled')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {mfaFactors.length > 0 ? (
                                    <button
                                        onClick={() => handleUnenrollMFA(mfaFactors[0].id)}
                                        disabled={isLoadingMFA}
                                        className="text-rose-400 font-black text-[9px] uppercase tracking-widest hover:underline disabled:opacity-50"
                                    >
                                        {t('disable')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStartMFAEnroll}
                                        disabled={isLoadingMFA}
                                        className="text-indigo-400 font-black text-[9px] uppercase tracking-widest hover:underline disabled:opacity-50"
                                    >
                                        {isLoadingMFA ? 'Loading...' : t('enable')}
                                    </button>
                                )}
                            </div>
                            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                        <Download size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('export_data_registry')}</p>
                                        <p className="text-slate-500 text-[8px] font-medium leading-relaxed mt-1 mb-2 max-w-[280px]">
                                            {t('export_data_registry_desc')}
                                        </p>
                                        <p className="text-slate-600 text-[9px] font-bold uppercase italic">{t('last_export_never')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDataExport}
                                    className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    {t('request_json')}
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('vacations')} icon={<Sun className="text-amber-400" size={20} />} />
                        <div className="space-y-6 pt-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                {t('vacations_desc')}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-[9px]">{t('start_date')}</label>
                                    <input
                                        type="date"
                                        value={newVacation.start}
                                        onChange={e => setNewVacation(p => ({ ...p, start: e.target.value }))}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-[9px]">{t('end_date')}</label>
                                    <input
                                        type="date"
                                        value={newVacation.end}
                                        onChange={e => setNewVacation(p => ({ ...p, end: e.target.value }))}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddVacation}
                                        className="w-full py-3.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-400/50 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all"
                                    >
                                        {t('add_period')}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t('active_future_absences')}</p>
                                {vacations.map((vac, index) => (
                                    <div key={index} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <Sun size={20} />
                                            </div>
                                            <div>
                                                <p className="text-white font-black uppercase text-[10px] tracking-tight">Time Off</p>
                                                <p className="text-slate-600 text-[9px] font-bold uppercase">{vac.start} - {vac.end}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveVacation(index)}
                                            className="text-slate-700 hover:text-rose-500 transition-colors p-2"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('notifications_title')} icon={<Bell className="text-blue-400" size={20} />} />
                        <div className="space-y-4 pt-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                {t('notifications_desc')}
                            </p>

                            <div className="space-y-3">
                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('email_notifications')}</p>
                                            <p className="text-slate-600 text-[9px] font-bold uppercase">{t('email_notifications_desc')}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                            <Bell size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('push_notifications')}</p>
                                            <p className="text-slate-600 text-[9px] font-bold uppercase">{t('push_notifications_desc')}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('sms_notifications')}</p>
                                            <p className="text-slate-600 text-[9px] font-bold uppercase">{t('sms_notifications_desc')}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('privacy_settings')} icon={<Eye className="text-violet-400" size={20} />} />
                        <div className="space-y-4 pt-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                {t('privacy_settings_desc')}
                            </p>

                            <div className="space-y-3">
                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('profile_visibility')}</p>
                                    </div>
                                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase">
                                        <option>{t('privacy_visibility_public')}</option>
                                        <option>{t('privacy_visibility_private')}</option>
                                        <option>{t('privacy_visibility_hidden')}</option>
                                    </select>
                                </div>

                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('show_training_stats')}</p>
                                        <p className="text-slate-600 text-[9px] font-bold uppercase">{t('show_training_stats_desc')}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                    </label>
                                </div>

                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('activity_feed')}</p>
                                        <p className="text-slate-600 text-[9px] font-bold uppercase">{t('activity_feed_desc')}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('languages_label')} icon={<Languages className="text-cyan-400" size={20} />} />
                        <div className="space-y-4 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('languages_label')}</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-black text-xs h-14"
                                        >
                                            <option value="fr">FR - Français</option>
                                            <option value="en">EN - English</option>
                                            <option value="es">ES - Español</option>
                                            <option value="ca">CA - Català</option>
                                            <option value="it">IT - Italiano</option>
                                            <option value="de">DE - Deutsch</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('timezone')}</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                        <select className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-black text-xs h-14">
                                            <option>Europe/Paris (GMT+1)</option>
                                            <option>Europe/London (GMT+0)</option>
                                            <option>America/New_York (GMT-5)</option>
                                            <option>America/Los_Angeles (GMT-8)</option>
                                            <option>Asia/Tokyo (GMT+9)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('date_format')}</label>
                                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase">
                                        <option>DD/MM/YYYY</option>
                                        <option>MM/DD/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('time_format')}</label>
                                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase">
                                        <option>24 hours</option>
                                        <option>12 hours (AM/PM)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Performance Zones (Elite Feature) */}
                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('performance_zones')} icon={<Activity className="text-rose-500" size={20} />} />
                        <div className="space-y-6 pt-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                {t('performance_zones_desc')}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white cursor-help" title={t('hr_max_tooltip')}>{t('hr_max')}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-[10px] font-black text-rose-500">BPM</span>
                                        </div>
                                        <input type="number" placeholder="200" className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-black" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white cursor-help" title={t('hr_rest_tooltip')}>{t('hr_rest')}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-[10px] font-black text-emerald-500">BPM</span>
                                        </div>
                                        <input type="number" placeholder="50" className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-black" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white cursor-help" title={t('lt_hr_tooltip')}>{t('lt_hr')}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-[10px] font-black text-amber-500">THR</span>
                                        </div>
                                        <input type="number" placeholder="175" className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-black" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white cursor-help" title={t('ftp_tooltip')}>{t('ftp_label')}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-[10px] font-black text-indigo-500">W</span>
                                        </div>
                                        <input type="number" placeholder="250" className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-black" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('appearance_title')} icon={<Palette className="text-pink-400" size={20} />} />
                        <div className="space-y-4 pt-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                {t('appearance_desc')}
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "p-6 border-2 rounded-2xl transition-all group",
                                        theme === 'dark' ? "bg-slate-900 border-emerald-500" : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-950 mx-auto mb-3 flex items-center justify-center">
                                        <Moon className={theme === 'dark' ? "text-emerald-400" : "text-slate-400"} size={24} />
                                    </div>
                                    <p className={cn("font-black uppercase text-[9px] tracking-tight", theme === 'dark' ? "text-white" : "text-slate-400")}>{t('theme_dark')}</p>
                                    <p className={cn("text-[8px] font-bold uppercase mt-1", theme === 'dark' ? "text-emerald-400" : "text-slate-600")}>{theme === 'dark' ? t('active') : t('disabled')}</p>
                                </button>

                                <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "p-6 border-2 rounded-2xl transition-all group",
                                        theme === 'light' ? "bg-slate-100 border-emerald-500" : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white mx-auto mb-3 flex items-center justify-center">
                                        <Sun className={theme === 'light' ? "text-emerald-600" : "text-slate-900"} size={24} />
                                    </div>
                                    <p className={cn("font-black uppercase text-[9px] tracking-tight", theme === 'light' ? "text-slate-900" : "text-slate-400")}>{t('theme_light')}</p>
                                    <p className={cn("text-[8px] font-bold uppercase mt-1", theme === 'light' ? "text-emerald-600" : "text-slate-600")}>{theme === 'light' ? t('active') : t('disabled')}</p>
                                </button>

                                <button
                                    onClick={() => setTheme('auto')}
                                    className={cn(
                                        "p-6 border-2 rounded-2xl transition-all group",
                                        theme === 'auto' ? "bg-slate-900 border-emerald-500" : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-white mx-auto mb-3 flex items-center justify-center">
                                        <Palette className={theme === 'auto' ? "text-emerald-400" : "text-slate-400"} size={24} />
                                    </div>
                                    <p className={cn("font-black uppercase text-[9px] tracking-tight", theme === 'auto' ? "text-white" : "text-slate-400")}>Auto</p>
                                    <p className={cn("text-[8px] font-bold uppercase mt-1", theme === 'auto' ? "text-emerald-400" : "text-slate-600")}>{theme === 'auto' ? t('active') : t('disabled')}</p>
                                </button>
                            </div>

                            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                <div>
                                    <p className="text-white font-black uppercase text-[10px] tracking-tight">{t('compact_mode')}</p>
                                    <p className="text-slate-600 text-[9px] font-bold uppercase">{t('compact_mode_desc')}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={compact}
                                        onChange={(e) => setCompact(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                                </label>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('units_measurements')} icon={<Ruler className="text-orange-400" size={20} />} />
                        <div className="space-y-4 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('distance_label')}</label>
                                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase">
                                        <option>Kilometers (km)</option>
                                        <option>Miles (mi)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('weight_label')}</label>
                                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase">
                                        <option>Kilograms (kg)</option>
                                        <option>Pounds (lbs)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('height_label')}</label>
                                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase">
                                        <option>Centimeters (cm)</option>
                                        <option>Feet & Inches (ft/in)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('temperature_label')}</label>
                                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-black uppercase">
                                        <option>Celsius (°C)</option>
                                        <option>Fahrenheit (°F)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-950 border-slate-800">
                        <CardHeader title={t('connected_apps_title')} icon={<Link2 className="text-teal-400" size={20} />} />
                        <div className="space-y-4 pt-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                {t('connected_apps_desc')}
                            </p>

                            <div className="space-y-3">
                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                            <span className="text-orange-500 font-black text-lg">S</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight">Strava</p>
                                            <p className="text-emerald-400 text-[9px] font-bold uppercase">{t('stripe_connected')}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-rose-400">Disconnect</button>
                                </div>

                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <span className="text-blue-500 font-black text-lg">G</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight">Garmin Connect</p>
                                            <p className="text-slate-600 text-[9px] font-bold uppercase">Not Connected</p>
                                        </div>
                                    </div>
                                    <button className="text-teal-400 font-black text-[9px] uppercase tracking-widest hover:underline">Connect</button>
                                </div>

                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                            <span className="text-red-500 font-black text-lg">P</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight">Polar Flow</p>
                                            <p className="text-slate-600 text-[9px] font-bold uppercase">{t('no_device_connected')}</p>
                                        </div>
                                    </div>
                                    <button className="text-teal-400 font-black text-[9px] uppercase tracking-widest hover:underline">Connect</button>
                                </div>

                                <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <span className="text-purple-500 font-black text-lg">W</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight">Whoop</p>
                                            <p className="text-slate-600 text-[9px] font-bold uppercase">{t('no_device_connected')}</p>
                                        </div>
                                    </div>
                                    <button className="text-teal-400 font-black text-[9px] uppercase tracking-widest hover:underline">Connect</button>
                                </div>
                            </div>
                        </div>
                    </Card>


                    <Card className="bg-rose-500/5 border-rose-500/20">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-center md:text-left">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                    <Trash2 size={24} />
                                </div>
                                <div>
                                    <h4 className="text-rose-500 font-black uppercase text-xs tracking-widest">{t('danger_zone_title')}</h4>
                                    <p className="text-slate-600 text-[10px] font-bold uppercase mt-1">{t('hazard_zone_desc')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-rose-900/20"
                            >
                                {t('delete_account')}
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Account Deletion Confirmation Modal */}
            {
                showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                        <Card className="w-full max-w-md border-rose-500/50 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950">
                            <div className="space-y-6 p-4">
                                <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-6">
                                    <AlertCircle size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-center">{t('final_termination')}</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed text-center">
                                    {t('purge_warning')}
                                </p>
                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-4 text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-900/40 transition-all"
                                    >
                                        {t('confirm_purge')}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* Image Crop Modal */}
            {cropModalOpen && selectedImage && (
                <ImageCropModal
                    imageUrl={selectedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setCropModalOpen(false);
                        setSelectedImage(null);
                    }}
                />
            )}

            {/* MFA Enrollment Modal */}
            {showMFAModal && mfaEnrollData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black uppercase text-[12px] tracking-tight">{t('mfa_setup_title')}</h3>
                                        <p className="text-slate-500 text-[9px] font-bold uppercase">{t('mfa_setup_subtitle')}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowMFAModal(false)} className="p-2 hover:bg-slate-900 rounded-full transition-colors text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-4 rounded-3xl inline-block mx-auto flex justify-center">
                                    <img
                                        src={mfaEnrollData.totp.qr_code}
                                        alt="MFA QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed text-center">
                                        {t('mfa_scan_instr')}
                                    </p>

                                    <input
                                        type="text"
                                        placeholder="000000"
                                        value={mfaCode}
                                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 text-center text-2xl font-black text-white tracking-[0.5em] placeholder:text-slate-800 focus:border-indigo-500 transition-colors outline-none"
                                    />

                                    {mfaError && (
                                        <p className="text-rose-500 text-[9px] font-bold uppercase text-center flex items-center justify-center gap-2">
                                            <AlertCircle size={14} />
                                            {mfaError}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleVerifyMFA}
                                    disabled={isVerifyingMFA || mfaCode.length < 6}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl shadow-indigo-900/40"
                                >
                                    {isVerifyingMFA ? t('mfa_verifying') : t('mfa_verify_activate_btn')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
