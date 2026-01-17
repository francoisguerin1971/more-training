'use client';

import { createVoyage } from "@/app/actions/createVoyage";
import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-blue-600/20"
        >
            {pending ? (
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
                "Publier le Voyage"
            )}
        </button>
    );
}

const initialState = {
    message: '',
}

export default function CreateVoyagePage() {
    const [state, formAction] = useFormState(createVoyage, initialState);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Créer un événement</h1>
                <p className="text-neutral-500">Remplissez les détails pour ajouter un nouveau voyage à l'écosystème.</p>
            </div>

            <form action={formAction} className="space-y-6 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">

                {state?.message && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                        {state.message}
                    </div>
                )}

                {/* Titre & Description */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Titre du voyage</label>
                        <input
                            name="title"
                            type="text"
                            required
                            placeholder="Ex: Traversée Nocturne de Paris"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            placeholder="Décrivez l'ambiance, le parcours..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        ></textarea>
                    </div>
                </div>

                {/* Détails Techniques */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
                        <input
                            name="date"
                            type="datetime-local"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Lieu</label>
                        <input
                            name="location"
                            type="text"
                            required
                            placeholder="Ex: Bordeaux, France"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                        <select
                            name="type"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                            <option value="SOCIAL_RUN">Social Run</option>
                            <option value="THEMATIC">Thématique</option>
                            <option value="TRIP_MULTI_DAY">Voyage (Multi-jours)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Durée</label>
                        <input
                            name="duration"
                            type="text"
                            placeholder="Ex: 2h00"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Prix & Image */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Prix (€)</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue="0"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Image URL</label>
                        <input
                            name="imageUrl"
                            type="url"
                            placeholder="https://..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <SubmitButton />
                </div>

            </form>
        </div>
    );
}
