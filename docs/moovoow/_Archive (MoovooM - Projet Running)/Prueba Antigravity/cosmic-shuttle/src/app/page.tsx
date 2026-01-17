import { Heart, Map, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { AuthStatus } from "@/components/AuthStatus";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-700/50"></div>

        {/* Navbar Overlay */}
        <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <div className="font-display font-bold text-xl">Cosmic Run</div>
          <AuthStatus />
        </nav>

        <div className="relative container mx-auto px-6 text-center">
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-8">
            Courir pour soi,<br />
            <span className="text-blue-200">pas pour les stats.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-50 max-w-2xl mx-auto mb-12 font-light">
            Découvrez Cosmic Run, l'écosystème où la vitesse ne compte pas.
            Planifiez, voyagez, et partagez vos courses sans pression de performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/explore"
              className="px-8 py-4 bg-white hover:bg-blue-50 text-blue-700 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-900/20"
            >
              Explorer les Sorties
            </Link>
            <Link
              href="/manifesto"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold text-lg backdrop-blur-sm transition-all border border-white/20"
            >
              Notre Philosophie
            </Link>
          </div>
        </div>
      </header>


      {/* Philosophy / Features */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="font-display text-4xl font-bold mb-6 text-neutral-800">
                L'Anti-Performance
              </h2>
              <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
                Nous avons supprimé les chronomètres (ou presque). Ici, on célèbre la régularité, la découverte et les rencontres.
              </p>
            </div>
          </FadeIn>

          <FadeInStagger className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <FadeIn className="bg-white p-8 rounded-3xl hover:shadow-xl transition-shadow border border-slate-200">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Map size={32} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 text-slate-900">Social Trip Running</h3>
              <p className="text-slate-600 leading-relaxed">
                Des voyages de course structurés pour découvrir le monde ou votre région. Hébergement, parcours et bonne ambiance inclus.
              </p>
            </FadeIn>

            {/* Feature 2 */}
            <FadeIn className="bg-white p-8 rounded-3xl hover:shadow-xl transition-shadow border border-slate-200">
              <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mb-6 text-sky-600">
                <Calendar size={32} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 text-slate-900">Agenda Centralisé</h3>
              <p className="text-slate-600 leading-relaxed">
                Fini les groupes WhatsApp. Retrouvez tous vos entraînements, courses officielles et sorties sociales au même endroit.
              </p>
            </FadeIn>

            {/* Feature 3 */}
            <FadeIn className="bg-white p-8 rounded-3xl hover:shadow-xl transition-shadow border border-slate-200">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <Heart size={32} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 text-slate-900">Coach Bienveillant</h3>
              <p className="text-slate-600 leading-relaxed">
                Des plans d'entraînement qui s'adaptent à votre vie, pas l'inverse. Objectif : se sentir bien, pas battre un record.
              </p>
            </FadeIn>
          </FadeInStagger>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-neutral-900 text-white text-center">
        <FadeIn className="container mx-auto">
          <h2 className="font-display text-5xl font-bold mb-8">
            Rejoignez le mouvement
          </h2>
          <p className="text-neutral-400 text-xl max-w-2xl mx-auto mb-12">
            L'application est en cours de construction. Inscrivez-vous pour accéder à la bêta privée et aux premiers voyages.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-6 py-4 rounded-full bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-emerald-500 text-white"
            />
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-600/30">
              M'inscrire
            </button>
          </form>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-950 text-neutral-500 text-center border-t border-neutral-900">
        <p>© 2025 Cosmic Run. Tous droits réservés. L'écosystème global du coureur.</p>
      </footer>
    </div>
  );
}
