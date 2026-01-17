'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { register } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function RegisterButton() {
    const { pending } = useFormStatus();

    return (
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20" aria-disabled={pending}>
            {pending ? "Création du compte..." : "S'inscrire"}
        </button>
    );
}

const initialState = {
    message: '',
}

export default function RegisterPage() {
    const [state, dispatch] = useFormState(register, initialState);
    const router = useRouter();

    // Redirect to login if registration success
    // Note: ideally "state" would have a "success" boolean field
    useEffect(() => {
        if (state?.message === 'success') {
            router.push('/login');
        }
    }, [state, router]);

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center px-6">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg shadow-neutral-200/50 border border-neutral-100">
                <div className="text-center mb-8">
                    <h1 className="font-display text-2xl font-bold mb-2">Rejoindre la communauté</h1>
                    <p className="text-neutral-500 text-sm">Créez votre compte pour organiser ou participer.</p>
                </div>

                <form action={dispatch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="name">
                            Nom complet
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Jean Dupont"
                            required
                            minLength={2}
                        />
                    </div>
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

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Je suis...</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700 transition-all">
                                <input type="radio" name="role" value="RUNNER" defaultChecked className="hidden" />
                                <span className="font-medium">Coureur</span>
                            </label>
                            <label className="border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700 transition-all">
                                <input type="radio" name="role" value="ORGANIZER" className="hidden" />
                                <span className="font-medium">Organisateur</span>
                            </label>
                        </div>
                    </div>

                    <div
                        className="flex min-h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state?.message && state.message !== 'success' && (
                            <p className="text-sm text-red-500">{state.message}</p>
                        )}
                    </div>
                    <RegisterButton />
                </form>

                <p className="mt-8 text-center text-sm text-neutral-500">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
