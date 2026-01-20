import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/context/LanguageContext';
import { Activity, Award, ChevronRight, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { LanguageDropdown } from '@/shared/components/common/LanguageDropdown';

export function PortalSelection() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { currentUser, updateProfile, logout } = useAuthStore();

    const handleSelectRole = async (role: 'pro' | 'athlete') => {
        // In a real app, this might fetch the specific profile for that role
        // For now, we locally update the state to switch the view
        if (currentUser) {
            // We optimize optimistically
            useAuthStore.setState(state => ({
                currentUser: state.currentUser ? { ...state.currentUser, role } : null
            }));

            // Navigate to the dashboard
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none" />

            {/* Header */}
            <div className="absolute top-10 right-10 z-20 flex items-center gap-4">
                <LanguageDropdown />
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
                >
                    <LogOut size={14} /> {t('logout', 'Déconnexion')}
                </button>
            </div>

            <div className="relative z-10 w-full max-w-4xl">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                        Qui êtes-vous <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">aujourd'hui ?</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl mx-auto">
                        Votre compte vous donne accès à deux univers. Sélectionnez l'espace auquel vous souhaitez accéder pour cette session.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Athlete Card */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectRole('athlete')}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-900/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-[#0A0D14] border border-white/5 hover:border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300 shadow-2xl shadow-emerald-900/20">
                                <Activity size={32} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Espace Athlète</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 px-4">
                                Accédez à votre planification, suivez vos progrès et communiquez avec votre coach.
                            </p>

                            <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:text-emerald-400">
                                Accéder au Dashboard <ChevronRight size={14} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Coach Card */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectRole('pro')}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-indigo-900/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-[#0A0D14] border border-white/5 hover:border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-2xl shadow-indigo-900/20">
                                <Award size={32} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Portail Coach</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 px-4">
                                Gérez vos athlètes, créez des programmes d'entraînement et analysez les performances.
                            </p>

                            <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 group-hover:text-indigo-400">
                                Entrer dans le Portail <ChevronRight size={14} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Shield size={12} /> Compte Unifié Sécurisé
                    </div>
                </div>
            </div>
        </div>
    );
}
