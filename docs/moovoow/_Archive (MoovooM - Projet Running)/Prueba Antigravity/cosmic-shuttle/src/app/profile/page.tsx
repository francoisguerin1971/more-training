import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { VoyageCard } from "@/components/VoyageCard";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import Link from "next/link";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            participations: {
                include: {
                    voyage: true
                },
                orderBy: {
                    voyage: {
                        date: 'asc'
                    }
                }
            }
        }
    });

    if (!user) {
        return <div>Erreur de chargement du profil.</div>;
    }

    const futureBookings = user.participations.filter(b => new Date(b.voyage.date) >= new Date());
    const pastBookings = user.participations.filter(b => new Date(b.voyage.date) < new Date());

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="bg-gradient-to-br from-blue-600 to-blue-700 text-white pt-32 pb-16 px-6">
                <FadeIn className="container mx-auto">
                    <h1 className="font-display text-4xl font-bold mb-4">
                        Bonjour {user.name?.split(' ')[0] || 'Runner'},
                    </h1>
                    <p className="text-blue-100 text-lg">
                        Prêt pour votre prochaine sortie ?
                    </p>
                </FadeIn>
            </header>

            <main className="container mx-auto px-6 -mt-8 relative z-10">
                <FadeInStagger>
                    {futureBookings.length > 0 ? (
                        <div className="space-y-12">
                            <section>
                                <h2 className="font-display text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    🗓️ Vos prochaines aventures
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {futureBookings.map((booking) => (
                                        <VoyageCard key={booking.id} voyage={booking.voyage} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <FadeIn className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
                            <div className="max-w-md mx-auto">
                                <h3 className="font-display text-2xl font-bold text-slate-900 mb-4">
                                    Pas encore de course prévue ?
                                </h3>
                                <p className="text-slate-600 mb-8">
                                    Votre agenda est vide, mais le monde est grand. Trouvez votre prochaine "Social Run" dès maintenant.
                                </p>
                                <Link
                                    href="/explore"
                                    className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Explorer les voyages
                                </Link>
                            </div>
                        </FadeIn>
                    )}

                    {pastBookings.length > 0 && (
                        <section className="mt-16 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="border-t border-slate-200 pt-12">
                                <h2 className="font-display text-xl font-bold text-slate-600 mb-6 uppercase tracking-wider">
                                    Souvenirs (Passés)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grayscale hover:grayscale-0 transition-all duration-500">
                                    {pastBookings.map((booking) => (
                                        <VoyageCard key={booking.id} voyage={booking.voyage} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </FadeInStagger>
            </main>
        </div>
    );
}
