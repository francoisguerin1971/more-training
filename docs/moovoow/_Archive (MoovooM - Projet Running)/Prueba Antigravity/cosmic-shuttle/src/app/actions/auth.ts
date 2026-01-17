'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from "@/lib/db";
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['RUNNER', 'PRO', 'ORGANIZER']),
});

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(prevState: any, formData: FormData) {
    const validation = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validation.success) {
        return { message: "Données invalides. Vérifiez les champs." };
    }

    const { name, email, password, role } = validation.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { message: "Cet email est déjà utilisé." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                avatar: `https://ui-avatars.com/api/?name=${name}`
            }
        });

    } catch (e) {
        console.error(e);
        return { message: "Erreur lors de l'inscription." };
    }

    // On success, try to sign in directly? 
    // Or redirect to login page. Let's redirect to login for simplicity or just return success
    // Return success message for UI to redirect or show link
    return { message: "success" };
}
