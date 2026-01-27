import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/context/LanguageContext';

export function SandboxBanner({ status }) {
    const { currentUser } = useAuthStore();
    const { t } = useLanguage();

    // Hide for athletes or if status is ACTIVE
    if (status === 'ACTIVE' || currentUser?.role === 'athlete') return null;

    return (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-6 animate-in slide-in-from-top duration-500">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">
                            {t('sandbox_title')}
                        </p>
                        <p className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter">
                            {t('sandbox_subtitle')}
                        </p>
                    </div>
                </div>
                <button className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 transition-colors">
                    {t('verify_account_btn')}
                </button>
            </div>
        </div>
    );
}
