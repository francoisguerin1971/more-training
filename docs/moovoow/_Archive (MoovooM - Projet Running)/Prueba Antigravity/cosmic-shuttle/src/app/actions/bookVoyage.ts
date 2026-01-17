'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function bookVoyage(voyageId: string) {
    // 1. Check Auth
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, message: "Vous devez être connecté pour vous inscrire." };
    }

    try {
        // 2. Get User ID
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return { success: false, message: "Utilisateur introuvable." };

        // 3. Check Voyage availability
        const voyage = await prisma.voyage.findUnique({ where: { id: voyageId } });
        if (!voyage) return { success: false, message: "Voyage introuvable." };

        if (voyage.spotsFilled >= voyage.spotsTotal) {
            return { success: false, message: "Désolé, ce voyage est complet !" };
        }

        // 4. Check if already booked
        const existingBooking = await prisma.booking.findFirst({
            where: {
                userId: user.id,
                voyageId: voyage.id,
            }
        });

        if (existingBooking) {
            return { success: false, message: "Vous êtes déjà inscrit à ce voyage." };
        }

        // 5. Create Booking & Update Count
        await prisma.$transaction([
            prisma.booking.create({
                data: {
                    userId: user.id,
                    voyageId: voyage.id,
                    status: 'CONFIRMED'
                }
            }),
            prisma.voyage.update({
                where: { id: voyage.id },
                data: { spotsFilled: { increment: 1 } }
            })
        ]);

        revalidatePath(`/voyage/${voyageId}`);
        revalidatePath(`/explore`);
        return { success: true, message: "Inscription confirmée ! Préparez vos baskets." };

    } catch (error) {
        console.error("Booking error:", error);
        return { success: false, message: "Une erreur est survenue lors de l'inscription." };
    }
}
