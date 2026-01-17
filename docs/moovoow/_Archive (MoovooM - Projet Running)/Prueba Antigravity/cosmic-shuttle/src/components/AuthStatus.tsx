import { auth, signOut } from "@/auth";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";

export async function AuthStatus() {
    const session = await auth();

    if (session?.user) {
        return (
            <div className="flex items-center gap-4">
                <Link href="/organizer/dashboard" className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
                    {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full border border-white/30" />
                    ) : (
                        <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="font-bold text-sm text-white">{session.user.name?.[0]?.toUpperCase()}</span>
                        </div>
                    )}
                    <span className="text-sm font-medium hidden sm:block">{session.user.name}</span>
                </Link>
                <Link href="/profile" className="text-sm font-semibold hover:text-blue-200 transition-colors hidden md:block">
                    Mes Voyages
                </Link>
                <form
                    action={async () => {
                        'use server';
                        await signOut();
                    }}
                >
                    <button className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors" title="Se déconnecter">
                        <LogOut size={18} />
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold hover:text-blue-200 transition-colors">
                Connexion
            </Link>
            <Link href="/register" className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 rounded-full text-sm font-bold transition-colors shadow-sm">
                S'inscrire
            </Link>
        </div>
    );
}
