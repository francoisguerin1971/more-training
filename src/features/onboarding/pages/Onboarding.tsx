import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Activity, Target,
    ChevronRight, ChevronLeft,
    ShieldCheck, Smartphone
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/core/utils/cn';
import { logger } from '@/core/utils/security';
import { Card } from '@/shared/components/ui/Card';
import { LanguageDropdown } from '@/shared/components/common/LanguageDropdown';
import { SEO } from '@/shared/components/common/SEO';
import { EmailVerification } from '@/features/onboarding/components/EmailVerification';

// Refactored Steps
import { StepAccount } from '@/features/onboarding/components/steps/StepAccount';
import { StepPersonal } from '@/features/onboarding/components/steps/StepPersonal';
import { StepAthletic } from '@/features/onboarding/components/steps/StepAthletic';
import { StepLogistics } from '@/features/onboarding/components/steps/StepLogistics';
import { StepProExpertise } from '@/features/onboarding/components/steps/StepProExpertise';
import { StepProBusiness } from '@/features/onboarding/components/steps/StepProBusiness';

export function Onboarding() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { currentUser, updateProfile, register, getInvitation } = useAuthStore();
    const [step, setStep] = useState(1);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isInvited, setIsInvited] = useState(false);
    const [invitationData, setInvitationData] = useState<any>(null);

    const [formData, setFormData] = useState({
        // Step 1: Account
        email: currentUser?.email || '',
        password: '',
        confirmPassword: '',
        phone: '',
        language: 'fr',
        role: 'athlete', // 'athlete' (Moover), 'pro', 'orga'

        // Step 2: Personal (Simplified)
        pseudo: '',
        dob: '',
        gender: '',
        height: '',
        weight: '',
        city: '',
        club: '',
        avatar: null,

        // Step 3: Athletic/Pro Expertise
        primarySport: 'running', // athlete
        customSport: '',
        level: 'beginner',
        goal: 'fitness',
        goalDetail: '',
        specialties: [], // pro
        coachingLanguages: '', // pro
        bio: '', // pro
        certifications: [], // pro

        // Step 4: Logistics/Pro Business
        equipment: [], // athlete
        availability: 60,
        preferredTime: 'flexible',
        location: 'both',
        style: 'both',
        devices: [],
        availabilityDays: [],
        timePerDay: {},
        legalName: '', // pro
        taxId: '', // pro
        address: '', // pro
        zip: '', // pro
    });

    React.useEffect(() => {
        const checkInvitation = async () => {
            const params = new URLSearchParams(window.location.search);
            const inviteId = params.get('invite');

            if (inviteId) {
                const { data, error } = await getInvitation(inviteId);
                if (data) {
                    setIsInvited(true);
                    setInvitationData(data);
                    setFormData(prev => ({
                        ...prev,
                        email: data.email,
                        role: 'athlete', // Most invitations are for athletes
                        primarySport: data.sport?.toLowerCase() || prev.primarySport,
                        goalDetail: data.objective || prev.goalDetail,
                        // Suggested Plan could be stored in metadata or profile_data later
                    }));
                }
            }
        };
        checkInvitation();
    }, [getInvitation]);

    const [errors, setErrors] = useState({});

    const steps = React.useMemo(() => {
        const athleteSteps = [
            { id: 1, label: t('step_account'), icon: <Smartphone size={18} /> },
            { id: 2, label: t('step_personal'), icon: <User size={18} /> },
            { id: 3, label: t('step_athletic'), icon: <Activity size={18} /> },
            { id: 4, label: t('step_logistics'), icon: <Target size={18} /> }
        ];

        const proSteps = [
            { id: 1, label: t('step_account'), icon: <Smartphone size={18} /> },
            { id: 2, label: t('step_personal'), icon: <User size={18} /> },
            { id: 3, label: t('step_pro_expertise'), icon: <Activity size={18} /> },
            { id: 4, label: t('step_pro_business'), icon: <Target size={18} /> }
        ];

        return formData.role === 'pro' ? proSteps : athleteSteps;
    }, [t, formData.role]);

    const validateStep = (s: number) => {
        const newErrors: Record<string, string> = {};
        const isPro = formData.role === 'pro';

        if (s === 1) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!formData.email) newErrors.email = t('field_required');
            else if (!emailRegex.test(formData.email)) newErrors.email = t('email_invalid');

            if (!formData.password) newErrors.password = t('field_required');
            else if (!passRegex.test(formData.password)) newErrors.password = t('password_weak');

            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('passwords_dont_match');
            if (!formData.phone) newErrors.phone = t('field_required');
        }
        if (s === 2) {
            if (!formData.pseudo) newErrors.pseudo = t('field_required');
            else if (formData.pseudo.length < 3) newErrors.pseudo = t('pseudo_too_short');
            if (!formData.dob) newErrors.dob = t('field_required');
        }
        if (s === 3) {
            if (isPro) {
                if (!formData.specialties || formData.specialties.length === 0) newErrors.specialties = t('field_required');
                if (!formData.bio) newErrors.bio = t('field_required');
            } else {
                if (!formData.primarySport) newErrors.primarySport = t('field_required');
            }
        }
        if (s === 4) {
            if (isPro) {
                if (!formData.legalName) newErrors.legalName = t('field_required');
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (validateStep(step)) {
            if (step === 1) {
                // Real Auth Registration on Step 1 with More Training Role
                const { error } = await register(formData.email, formData.password, {
                    full_name: formData.pseudo || '',
                    role: formData.role
                });
                if (error) {
                    setErrors({ ...errors, auth: error.message });
                    return;
                }
            }
            if (step < steps.length) setStep(step + 1);
            else setIsVerifyingEmail(true);
        }
    };

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleFinalComplete = async () => {
        try {
            const isPro = formData.role === 'pro';

            const profileData = isPro ? {
                fiscal: {
                    legalName: formData.legalName,
                    taxId: formData.taxId,
                    address: formData.address,
                    zip: formData.zip,
                    stripeConnected: false
                },
                bio: formData.bio,
                specialties: formData.specialties,
                coachingLanguages: formData.coachingLanguages,
                certifications: formData.certifications
            } : {
                athletic: {
                    primarySport: formData.primarySport,
                    level: formData.level,
                    goal: formData.goal,
                    goalDetail: formData.goalDetail
                },
                logistics: {
                    equipment: formData.equipment,
                    availability: formData.availability,
                    preferredTime: formData.preferredTime,
                    location: formData.location
                }
            };

            const { error } = await updateProfile({
                first_name: formData.pseudo || '',
                pseudo: formData.pseudo,
                full_name: formData.pseudo || currentUser?.full_name || '',
                profile_data: profileData,
                onboarded: true,
            });

            if (error) {
                logger.error('Profile update error:', error);
                setErrors({ submit: 'Erreur lors de la finalisation du profil.' });
                return;
            }

            // Navigate to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            logger.error('Onboarding completion exception:', err);
            setErrors({ submit: 'Une erreur inattendue s\'est produite.' });
        }
    };

    if (isVerifyingEmail) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 pt-20 overflow-hidden">
                <EmailVerification
                    email={formData.email}
                    onVerify={handleFinalComplete}
                    onBack={() => setIsVerifyingEmail(false)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20 pt-10 px-4">
            <SEO
                titleKey="seo_onboarding_title"
                descriptionKey="seo_default_description"
                keywords={["onboarding", "setup profile", "athlete start"]}
                preventIndexing={true}
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                            {t('onboarding_title_welcome')}
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                            {t('onboarding_subtitle_welcome')}
                        </p>
                    </div>
                    <LanguageDropdown />
                </div>

                {/* Progress */}
                <div className="flex justify-between items-center mb-12 relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 transition-all duration-700 -z-10"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                    {steps.map((s) => (
                        <div key={s.id} className="flex flex-col items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl",
                                step === s.id
                                    ? "bg-emerald-500 text-slate-950 scale-110 rotate-3"
                                    : step > s.id
                                        ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/20"
                                        : "bg-slate-900 text-slate-500 border-2 border-slate-800"
                            )}>
                                {step > s.id ? <ShieldCheck size={20} /> : s.icon}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-colors",
                                step === s.id ? "text-white" : "text-slate-500"
                            )}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <Card className="p-8 md:p-12 bg-slate-900/30 border-slate-800/50 backdrop-blur-xl rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10 group-hover:bg-emerald-500/10 transition-colors duration-1000" />

                    {React.useMemo(() => (
                        <>
                            {step === 1 && (
                                <StepAccount
                                    formData={formData}
                                    setFormData={setFormData}
                                    errors={errors}
                                    isInvited={isInvited}
                                    invitationData={invitationData}
                                />
                            )}
                            {step === 2 && <StepPersonal formData={formData} setFormData={setFormData} errors={errors} />}
                            {step === 3 && (
                                formData.role === 'pro'
                                    ? <StepProExpertise formData={formData} setFormData={setFormData} errors={errors} />
                                    : <StepAthletic formData={formData} setFormData={setFormData} errors={errors} />
                            )}
                            {step === 4 && (
                                formData.role === 'pro'
                                    ? <StepProBusiness formData={formData} setFormData={setFormData} errors={errors} />
                                    : <StepLogistics formData={formData} setFormData={setFormData} errors={errors} />
                            )}
                        </>
                    ), [step, formData, errors])}

                    {/* Navigation */}
                    <div className="mt-12 flex items-center justify-between border-t border-slate-800 pt-8">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            aria-label={t('back')}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]",
                                step === 1 ? "opacity-0 invisible" : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <ChevronLeft size={16} />
                            {t('back')}
                        </button>
                        <button
                            onClick={handleNext}
                            aria-label={step === steps.length ? t('btn_complete_profile') : t('next')}
                            className="bg-emerald-500 text-slate-950 px-10 py-5 rounded-3xl font-black uppercase tracking-widest transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/20 flex items-center gap-3 text-[12px]"
                        >
                            {step === steps.length ? t('btn_complete_profile') : t('next')}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
