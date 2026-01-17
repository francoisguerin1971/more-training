'use server'

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVoyage(prevState: any, formData: FormData) {
    // Check auth
    const session = await auth();
    if (!session?.user?.email) {
        return { message: "Vous devez être connecté." };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'PRO')) {
        return { message: "Compte organisateur requis." };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const dateStr = formData.get("date") as string;
    const type = formData.get("type") as string;
    const duration = formData.get("duration") as string;
    const price = parseFloat(formData.get("price") as string || "0");
    const spotsTotal = parseInt(formData.get("spotsTotal") as string || "10", 10);
    const imageUrl = formData.get("imageUrl") as string;

    // Basic validation
    if (!title || !description || !location || !dateStr) {
        return { message: "Veuillez remplir les champs obligatoires." };
    }

    try {
        const newVoyage = await prisma.voyage.create({
            data: {
                title,
                description,
                location,
                date: new Date(dateStr),
                type,
                duration,
                price,
                spotsTotal,
                distanceKm: 0, // Default for now
                imageUrl: imageUrl || "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1000",
                organizerId: user.id,
            },
        });

        revalidatePath("/explore");
    } catch (e) {
        console.error(e);
        return { message: "Erreur lors de la création." };
    }

    redirect("/explore");
}
