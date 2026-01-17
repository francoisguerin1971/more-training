import { prisma } from "@/lib/db";
import { VoyageCard } from "@/components/VoyageCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// Import legacy type if needed, but Prisma generates its own types.
// We might need to cast or ensure VoyageCard accepts Prisma type.

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
    const voyages = await prisma.voyage.findMany({
        orderBy: { date: 'asc' },
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
            {/* Header */}
            <header className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12 relative">
                <div className="container mx-auto px-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Retour</span>
                    </Link>
                    <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Prochains Départs</h1>
                    <p className="text-blue-100 text-lg max-w-2xl">
                        Rejoignez un groupe, courez sans pression et découvrez de nouveaux horizons.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="mb-8">
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-8 justify-center mb-8 scrollbar-hide">
                    {['Tout', 'Social Run', 'Voyage', 'Thématique'].map((filter, i) => (
                        <button
                            key={filter}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm whitespace-nowrap
                 ${i === 0 ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-200'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {voyages.map((voyage) => (
                        <VoyageCard key={voyage.id} voyage={voyage} />
                    ))}
                </div>
            </main>
        </div>
    );
}
