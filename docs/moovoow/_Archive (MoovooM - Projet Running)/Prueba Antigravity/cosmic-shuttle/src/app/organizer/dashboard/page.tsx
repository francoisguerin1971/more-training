import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Users, Calendar, MapPin, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            organizedVoyages: {
                orderBy: { date: 'desc' },
                include: { _count: { select: { bookings: true } } } // Or use spotsFilled
            }
        }
    });

    if (!user) return <div>Erreur de chargement.</div>;

    const voyages = user.organizedVoyages;

    return (
        <div>
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-neutral-900 mb-1">Tableau de bord</h1>
                    <p className="text-neutral-500">Gérez vos événements et suivez les inscriptions.</p>
                </div>
                <Link
                    href="/organizer/create"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} />
                    <span>Nouveau Voyage</span>
                </Link>
            </header>

            {/* Stats Overview (Fake for MVP) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                    <p className="text-neutral-500 text-sm font-medium mb-1">Total Inscrits</p>
                    <p className="text-3xl font-bold text-neutral-900">
                        {voyages.reduce((acc, v) => acc + v.spotsFilled, 0)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                    <p className="text-neutral-500 text-sm font-medium mb-1">Voyages Actifs</p>
                    <p className="text-3xl font-bold text-neutral-900">
                        {voyages.filter(v => new Date(v.date) > new Date()).length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-slate-600 text-sm font-medium mb-1">Revenus (Est.)</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {voyages.reduce((acc, v) => acc + (v.price * v.spotsFilled), 0)}€
                    </p>
                </div>
            </div>

            <h2 className="font-display text-xl font-bold text-neutral-900 mb-6">Mes Voyages</h2>

            {voyages.length === 0 ? (
                <div className="bg-neutral-50 rounded-3xl p-12 text-center border-2 border-dashed border-neutral-200">
                    <p className="text-neutral-500 text-lg mb-4">Vous n'avez pas encore créé de voyage.</p>
                    <Link href="/organizer/create" className="text-blue-600 font-bold hover:underline">
                        Lancez-vous !
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {voyages.map((voyage) => (
                        <Link
                            key={voyage.id}
                            href={`/voyage/${voyage.id}`}
                            className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row gap-6 items-center"
                        >
                            <img
                                src={voyage.imageUrl}
                                alt=""
                                className="w-full md:w-32 h-32 md:h-24 object-cover rounded-xl"
                            />

                            <div className="flex-1 min-w-0">
                                <h3 className="font-display font-bold text-xl text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                                    {voyage.title}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} />
                                        <span>{new Date(voyage.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} />
                                        <span>{voyage.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 font-bold text-slate-900">
                                        <Users size={18} className="text-blue-500" />
                                        <span>{voyage.spotsFilled} / {voyage.spotsTotal}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">participants</span>
                                </div>
                                <ArrowRight className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
