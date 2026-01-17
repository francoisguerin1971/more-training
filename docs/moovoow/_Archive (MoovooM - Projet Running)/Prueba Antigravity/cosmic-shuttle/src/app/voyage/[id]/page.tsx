import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Clock, Users, ShieldCheck, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import BookingButton from "@/components/BookingButton";
import { auth } from "@/auth";

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateStaticParams() {
    const voyages = await prisma.voyage.findMany({ select: { id: true } });
    return voyages.map((voyage) => ({
        id: voyage.id,
    }));
}

export const dynamic = 'force-dynamic';

export default async function VoyageDetailsPage({ params }: PageProps) {
    const session = await auth();

    const voyage = await prisma.voyage.findUnique({
        where: { id: params.id },
        include: { organizer: true }
    });

    if (!voyage) {
        notFound();
    }

    // Check if user has already booked
    let hasBooked = false;
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
            const booking = await prisma.booking.findFirst({
                where: {
                    userId: user.id,
                    voyageId: voyage.id
                }
            });
            hasBooked = !!booking;
        }
    }

    const isFree = voyage.price === 0;
    const isFull = voyage.spotsFilled >= voyage.spotsTotal;

    return (
        <div className="min-h-screen bg-white text-neutral-900 font-sans pb-24">
            {/* Sticky Header */}
            <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-xl border-b border-neutral-100 z-50 h-16 flex items-center justify-between px-4 sm:px-6">
                <Link href="/explore" className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-neutral-600" />
                </Link>
                <span className="font-semibold text-sm sm:block hidden truncate max-w-xs">{voyage.title}</span>
                <button aria-label="Partager ce voyage" className="p-2 -mr-2 hover:bg-neutral-100 rounded-full text-neutral-600 transition-colors">
                    <Share2 size={20} />
                </button>
            </header>

            {/* Hero Image */}
            <div className="relative h-[50vh] w-full">
                <img
                    src={voyage.imageUrl}
                    alt={voyage.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="inline-block px-3 py-1 bg-blue-600/90 backdrop-blur-md rounded-lg text-xs font-bold tracking-wider uppercase mb-3 text-white border border-blue-400/20">
                        {voyage.type.replace('_', ' ')}
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight shadow-sm">
                        {voyage.title}
                    </h1>
                </div>
            </div>

            <main className="container mx-auto px-6 -mt-8 relative z-10">
                <div className="grid lg:grid-cols-[1fr_350px] gap-12">

                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Stats Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-neutral-200/50 flex flex-wrap gap-y-4 justify-between items-center border border-neutral-100">
                            <div className="flex items-center gap-3 w-1/2 sm:w-auto">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Date</p>
                                    <p className="font-semibold">{new Date(voyage.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-1/2 sm:w-auto">
                                <div className="p-3 bg-sky-100 text-sky-600 rounded-2xl">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Lieu</p>
                                    <p className="font-semibold">{voyage.location.split(',')[0]}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-1/2 sm:w-auto">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Durée</p>
                                    <p className="font-semibold">{voyage.duration}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-1/2 sm:w-auto">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Niveau</p>
                                    <p className="font-semibold">Tous niveaux</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <section>
                            <h2 className="font-display text-2xl font-bold mb-4">À propos</h2>
                            <p className="text-neutral-600 leading-relaxed text-lg whitespace-pre-line">
                                {voyage.description}
                                {'\n\n'}
                                Rejoignez-nous pour cette expérience unique. Pas de chrono, pas de performance, juste le plaisir de courir ensemble et de découvrir.
                            </p>
                        </section>

                        {/* Organizer */}
                        <section className="bg-neutral-50 rounded-3xl p-6 flex items-center gap-4">
                            <img
                                src={voyage.organizer.avatar || `https://ui-avatars.com/api/?name=${voyage.organizer.name}`}
                                alt={voyage.organizer.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div>
                                <p className="text-sm text-neutral-500 font-medium">Organisé par</p>
                                <p className="font-display text-xl font-bold">{voyage.organizer.name}</p>
                                <span className="text-xs bg-neutral-200 px-2 py-0.5 rounded text-neutral-600 font-medium uppercase">{voyage.organizer.role}</span>
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Sticky CTA) */}
                    <div className="lg:block">
                        <div className="sticky top-24 bg-white border border-neutral-100 rounded-3xl p-6 shadow-xl shadow-neutral-200/50">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Prix par personne</p>
                                    <p className="font-display text-4xl font-bold text-blue-700">
                                        {isFree ? 'Gratuit' : `${voyage.price}€`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-slate-700">
                                    <Users size={16} />
                                    <span className="font-semibold text-sm">{voyage.spotsFilled}/{voyage.spotsTotal}</span>
                                </div>
                            </div>

                            <BookingButton
                                voyageId={voyage.id}
                                isLoggedIn={!!session?.user}
                                isFull={isFull}
                                hasBooked={hasBooked}
                            />
                            <p className="text-center text-xs text-neutral-400 mt-4">
                                Annulation gratuite jusqu'à 24h avant.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

