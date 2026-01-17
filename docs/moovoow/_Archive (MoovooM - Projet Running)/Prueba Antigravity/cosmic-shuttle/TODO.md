# TODO - Améliorations Futures

Ce document liste les améliorations et optimisations recommandées qui n'ont pas encore été implémentées.

## 🟡 Priorité 3 - Améliorations (Avant Production)

### 1. Typage TypeScript Strict

**Fichiers concernés**: 
- `/src/app/actions/auth.ts`
- `/src/app/actions/createVoyage.ts`

**Problème**: Utilisation de `any` pour `prevState`

**Solution**:
```typescript
// Créer un fichier lib/types.ts
export interface FormState {
    message: string;
}

// Dans auth.ts et createVoyage.ts
export async function register(
    prevState: FormState | undefined, 
    formData: FormData
): Promise<FormState>
```

---

### 2. Amélioration des Messages d'Erreur

**Fichiers concernés**:
- `/src/app/actions/bookVoyage.ts`
- `/src/app/actions/createVoyage.ts`
- `/src/app/actions/auth.ts`

**Problème**: Messages d'erreur génériques

**Solution**:
```typescript
catch (error) {
    console.error("Booking error:", error);
    
    // Meilleure gestion selon le type d'erreur
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return { success: false, message: "Vous êtes déjà inscrit à ce voyage." };
        }
    }
    
    return { success: false, message: "Une erreur est survenue lors de l'inscription." };
}
```

---

### 3. Commentaires Mock UI

**Fichiers concernés**:
- `/src/app/explore/page.tsx` (ligne 43)
- `/src/app/page.tsx` (ligne 107)

**Problème**: Fonctionnalités non implémentées sans indication

**Solution**:
```tsx
{/* Mock UI - Fonctionnalité à implémenter */}
<div className="flex gap-3 overflow-x-auto pb-8 justify-center mb-8 scrollbar-hide">
```

---

## 🔵 Priorité 4 - Optimisations (Performance & UX)

### 1. Optimisation des Images

**Problème**: Utilisation de `<img>` au lieu de Next.js Image

**Fichiers à modifier**:
- `/src/components/AuthStatus.tsx`
- `/src/components/VoyageCard.tsx`
- `/src/app/voyage/[id]/page.tsx`
- `/src/app/organizer/dashboard/page.tsx`

**Solution**:
```tsx
import Image from 'next/image';

// Au lieu de:
<img src={voyage.imageUrl} alt={voyage.title} className="..." />

// Utiliser:
<Image 
    src={voyage.imageUrl} 
    alt={voyage.title} 
    width={400} 
    height={300}
    className="..." 
/>
```

**Note**: Nécessite de configurer les domaines autorisés dans `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
        ],
    },
};

export default nextConfig;
```

---

### 2. ISR au lieu de Force Dynamic

**Problème**: Toutes les pages utilisent `export const dynamic = 'force-dynamic'`

**Fichiers concernés**:
- `/src/app/explore/page.tsx`
- `/src/app/voyage/[id]/page.tsx`
- `/src/app/organizer/dashboard/page.tsx`
- `/src/app/profile/page.tsx`

**Solution**:
```typescript
// Pour les pages qui peuvent être mises en cache
export const revalidate = 60; // Revalider toutes les 60 secondes

// Ou pour des revalidations on-demand via revalidatePath()
// Garder force-dynamic seulement pour profile et dashboard
```

---

### 3. Implémenter la Fonctionnalité de Partage

**Fichier**: `/src/app/voyage/[id]/page.tsx`

**Solution**:
```tsx
'use client'; // Nécessaire pour le hook

const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: voyage.title,
                text: voyage.description,
                url: window.location.href,
            });
        } catch (err) {
            console.log('Erreur lors du partage:', err);
        }
    } else {
        // Fallback: copier le lien
        navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papier !');
    }
};

<button 
    onClick={handleShare}
    aria-label="Partager ce voyage" 
    className="..."
>
    <Share2 size={20} />
</button>
```

---

### 4. Implémenter le Formulaire Newsletter

**Fichier**: `/src/app/page.tsx` (ligne 107)

**Options**:

a) **Désactiver temporairement**:
```tsx
<form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
    <input
        type="email"
        placeholder="votre@email.com"
        className="..."
        disabled
    />
    <button 
        className="... opacity-50 cursor-not-allowed" 
        disabled
    >
        Bientôt disponible
    </button>
</form>
```

b) **Implémenter avec une Server Action**:
```tsx
// Créer /src/app/actions/newsletter.ts
'use server';

export async function subscribeNewsletter(formData: FormData) {
    const email = formData.get('email') as string;
    
    // Stocker dans la DB ou utiliser un service comme Mailchimp
    await prisma.newsletter.create({
        data: { email }
    });
    
    return { success: true };
}
```

---

### 5. Gestion des Dates avec Timezone

**Problème**: Comparaison de dates avec `new Date()` peut causer des incohérences

**Fichiers concernés**:
- `/src/app/profile/page.tsx`
- `/src/app/organizer/dashboard/page.tsx`

**Solution**:
```bash
npm install date-fns date-fns-tz
```

```typescript
import { isAfter, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

// Au lieu de:
const futureBookings = user.participations.filter(
    b => new Date(b.voyage.date) >= new Date()
);

// Utiliser:
const now = new Date();
const futureBookings = user.participations.filter(
    b => isAfter(new Date(b.voyage.date), now)
);
```

---

### 6. Corriger l'Animation CSS Manquante

**Fichier**: `/src/components/VoyageCard.tsx` (ligne 36)

**Problème**: `animate-nav-load` n'est pas défini

**Solution 1 - Définir dans globals.css**:
```css
@keyframes nav-load {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-nav-load {
  animation: nav-load 0.3s ease-out;
}
```

**Solution 2 - Utiliser Tailwind**:
```tsx
// Remplacer animate-nav-load par:
className="animate-fade-in"
```

Et ajouter dans `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
};
```

---

### 7. Implémenter les Filtres de la Page Explore

**Fichier**: `/src/app/explore/page.tsx`

**Solution**:
```tsx
'use client';

import { useState } from 'react';

export default function ExplorePage({ initialVoyages }) {
    const [filter, setFilter] = useState('Tout');
    
    const filteredVoyages = filter === 'Tout' 
        ? initialVoyages
        : initialVoyages.filter(v => {
            if (filter === 'Social Run') return v.type === 'SOCIAL_RUN';
            if (filter === 'Voyage') return v.type === 'TRIP_MULTI_DAY';
            if (filter === 'Thématique') return v.type === 'THEMATIC';
            return true;
        });

    return (
        <div>
            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-8 justify-center mb-8">
                {['Tout', 'Social Run', 'Voyage', 'Thématique'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors
                            ${filter === f ? 'bg-emerald-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            
            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVoyages.map((voyage) => (
                    <VoyageCard key={voyage.id} voyage={voyage} />
                ))}
            </div>
        </div>
    );
}
```

---

## 🔧 Infrastructure & DevOps

### 1. Tests Automatisés

**À implémenter**:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Créer**: `/src/__tests__/components/VoyageCard.test.tsx`

---

### 2. Variables d'Environnement

**Créer**: `/.env.example`
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Optional: Production DB
# DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

---

### 3. Centraliser la Validation Zod

**Créer**: `/src/lib/schemas.ts`
```typescript
import { z } from 'zod';

export const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['RUNNER', 'PRO', 'ORGANIZER']),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const VoyageSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    location: z.string().min(2),
    date: z.string().datetime(),
    type: z.enum(['SOCIAL_RUN', 'THEMATIC', 'TRIP_MULTI_DAY']),
    duration: z.string(),
    price: z.number().nonnegative(),
    spotsTotal: z.number().positive(),
    imageUrl: z.string().url().optional(),
});
```

Puis utiliser dans les actions:
```typescript
import { RegisterSchema } from '@/lib/schemas';

const validation = RegisterSchema.safeParse(data);
```

---

### 4. Monitoring & Logging

**Recommandations**:
- Sentry pour le tracking d'erreurs
- Vercel Analytics pour les métriques
- Winston ou Pino pour le logging structuré

---

### 5. SEO Dynamique

**Améliorer**: `/src/app/voyage/[id]/page.tsx`

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const voyage = await prisma.voyage.findUnique({
        where: { id: params.id },
    });

    if (!voyage) return {};

    return {
        title: `${voyage.title} - Cosmic Run`,
        description: voyage.description,
        openGraph: {
            title: voyage.title,
            description: voyage.description,
            images: [voyage.imageUrl],
        },
    };
}
```

---

## 📝 Documentation

### À créer:
- [ ] API Documentation (si APIs publiques)
- [ ] Guide de contribution (CONTRIBUTING.md)
- [ ] Guide de déploiement (DEPLOYMENT.md)
- [ ] Changelog (CHANGELOG.md)

---

## 🎯 Checklist Finale

Avant de considérer le projet comme "production-ready":

- [ ] Tous les TODO de Priorité 3 traités
- [ ] Au moins 50% des TODO de Priorité 4 traités
- [ ] Tests automatisés en place (couverture > 70%)
- [ ] Variables d'environnement documentées
- [ ] Monitoring configuré (Sentry + Analytics)
- [ ] Performance auditée (Lighthouse score > 90)
- [ ] SEO optimisé (méta-tags, sitemap, robots.txt)
- [ ] Accessibilité validée (a11y audit)
- [ ] Politique de confidentialité et CGU ajoutées
- [ ] Rate limiting implémenté sur les Server Actions

---

**Dernière mise à jour**: 2025-12-05
