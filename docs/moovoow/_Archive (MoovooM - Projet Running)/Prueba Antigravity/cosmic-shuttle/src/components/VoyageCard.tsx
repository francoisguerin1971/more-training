import Link from "next/link";
import { Calendar, MapPin, Clock, Users, ArrowUpRight } from "lucide-react";
import { Voyage } from "@prisma/client";
import { FadeIn } from "./FadeIn";

interface VoyageCardProps {
    voyage: Voyage;
}

export function VoyageCard({ voyage }: VoyageCardProps) {
    const isFree = voyage.price === 0;

    return (
        <FadeIn>
            <Link href={`/voyage/${voyage.id}`} className="group block h-full">
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full flex flex-col relative">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 transition-colors duration-500 z-0"></div>

                    {/* Image Container */}
                    <div className="relative h-72 overflow-hidden z-10">
                        <img
                            src={voyage.imageUrl}
                            alt={voyage.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md rounded-lg text-xs font-bold tracking-wider uppercase text-white border border-blue-400/20">
                                {voyage.type.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Price Tag with Glassmorphism */}
                        <div className="absolute bottom-4 right-4 animate-nav-load">
                            <span className={`px-4 py-2 rounded-2xl font-bold text-sm shadow-lg backdrop-blur-md border transform transition-transform group-hover:scale-105 ${isFree ? 'bg-blue-500/90 text-white border-blue-400/20' : 'bg-white/95 text-slate-900 border-white/20'}`}>
                                {isFree ? 'Gratuit' : `${voyage.price}€`}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1 relative z-10">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
                            <Calendar size={12} />
                            <span>{new Date(voyage.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
                            <Clock size={12} />
                            <span>{voyage.duration}</span>
                        </div>

                        <div className="flex justify-between items-start mb-2 group-hover:text-blue-600 transition-colors duration-300">
                            <h3 className="font-display text-2xl font-bold text-slate-900 leading-tight">
                                {voyage.title}
                            </h3>
                            <ArrowUpRight className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-blue-500" />
                        </div>

                        <p className="text-slate-600 line-clamp-2 mb-6 flex-1 text-sm leading-relaxed">
                            {voyage.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-slate-700 group-hover:text-blue-700 transition-colors">
                                <MapPin size={16} className="text-blue-500" />
                                <span className="text-sm font-medium">{voyage.location}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 group-hover:border-blue-200 transition-colors">
                                <Users size={14} />
                                <span className="text-sm font-semibold">{voyage.spotsFilled}/{voyage.spotsTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </FadeIn>
    );
}
