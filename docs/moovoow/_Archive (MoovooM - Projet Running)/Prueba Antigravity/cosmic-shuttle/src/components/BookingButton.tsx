'use client';

import { bookVoyage } from "@/app/actions/bookVoyage";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation"; // To refresh router cache if needed manually, though revalidatePath handles it

interface BookingButtonProps {
    voyageId: string;
    isLoggedIn: boolean;
    isFull: boolean;
    hasBooked: boolean;
}

export default function BookingButton({ voyageId, isLoggedIn, isFull, hasBooked }: BookingButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    const handleBook = () => {
        if (!isLoggedIn) {
            // Let Link handle redirection or show message
            return;
        }

        startTransition(async () => {
            const result = await bookVoyage(voyageId);
            setMessage(result.message);
        });
    };

    if (hasBooked) {
        return (
            <div className="w-full py-4 bg-blue-100 text-blue-800 text-center font-bold rounded-xl border border-blue-200">
                ✅ Vous y participez !
            </div>
        );
    }

    if (isFull) {
        return (
            <div className="w-full py-4 bg-neutral-100 text-neutral-500 text-center font-bold rounded-xl">
                ❌ Complet
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <a href="/login" className="block w-full py-4 bg-neutral-900 text-white text-center font-bold rounded-xl hover:bg-neutral-800 transition-colors">
                Se connecter pour participer
            </a>
        );
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleBook}
                disabled={isPending}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Inscription en cours..." : "Je m'inscris !"}
            </button>
            {message && (
                <p className={`text-center text-sm font-medium ${message.includes('confirmée') ? 'text-blue-600' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
