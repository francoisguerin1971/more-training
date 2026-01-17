import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "Cosmic Run - L'Écosystème Global du Coureur",
    description: "Planification, Logistique et Communauté. L'anti-performance pour le pur plaisir de courir.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body
                className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
