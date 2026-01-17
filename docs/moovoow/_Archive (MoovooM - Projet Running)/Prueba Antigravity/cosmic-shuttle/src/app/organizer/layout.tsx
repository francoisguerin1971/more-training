import Link from "next/link";
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react";

export default function OrganizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-neutral-200">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/" className="font-display font-bold text-xl text-slate-900">
                        Cosmic <span className="text-blue-600">Pro</span>
                    </Link>
                </div>

                <nav className="p-4 space-y-1">
                    <Link
                        href="/organizer/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Tableau de bord</span>
                    </Link>
                    <Link
                        href="/organizer/create"
                        className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                    >
                        <PlusCircle size={20} />
                        <span>Créer un Voyage</span>
                    </Link>
                </nav>

                <div className="mt-auto p-4 border-t border-neutral-100 md:fixed md:bottom-0 md:w-64">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Quitter l'espace Pro</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
