'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/actions/auth';
import Link from 'next/link';

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20" aria-disabled={pending}>
            {pending ? "Connexion..." : "Se connecter"}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center px-6">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg shadow-neutral-200/50 border border-neutral-100">
                <div className="text-center mb-8">
                    <h1 className="font-display text-2xl font-bold mb-2">Bon retour !</h1>
                    <p className="text-neutral-500 text-sm">Connectez-vous pour accéder à votre espace.</p>
                </div>

                <form action={dispatch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="email"
                            type="email"
                            name="email"
                            placeholder="votre@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">
                                Se souvenir de moi
                            </label>
                        </div>
                    </div>

                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                    </div>
                    <LoginButton />
                </form>

                <p className="mt-8 text-center text-sm text-neutral-500">
                    Pas encore de compte ?{' '}
                    <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                        S'inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
}
