const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Create Users
    const u1 = await prisma.user.create({
        data: { id: 'u1', name: 'Cosmic Team', email: 'team@cosmic.run', role: 'ORGANIZER', avatar: 'https://i.pravatar.cc/150?u=u1' },
    })
    const u2 = await prisma.user.create({
        data: { id: 'u2', name: 'Run & Wine', email: 'wine@cosmic.run', role: 'PRO', avatar: 'https://i.pravatar.cc/150?u=u2' },
    })
    const u3 = await prisma.user.create({
        data: { id: 'u3', name: 'Breizh Runners', email: 'breizh@cosmic.run', role: 'ORGANIZER', avatar: 'https://i.pravatar.cc/150?u=u3' },
    })
    const u4 = await prisma.user.create({
        data: { id: 'u4', name: 'Zen Runner', email: 'zen@cosmic.run', role: 'PRO', avatar: 'https://i.pravatar.cc/150?u=u4' },
    })

    // Create Voyages
    await prisma.voyage.create({
        data: {
            id: "1",
            title: "Traversée Nocturne de Paris",
            description: "Une redécouverte de la ville lumière à la frontale.",
            type: "SOCIAL_RUN",
            date: new Date("2025-06-12T20:00:00Z"),
            location: "Paris, France",
            duration: "2h00",
            distanceKm: 12,
            price: 0,
            imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000",
            spotsTotal: 50,
            spotsFilled: 42,
            organizerId: u1.id
        }
    })

    await prisma.voyage.create({
        data: {
            id: "2",
            title: "Vignobles de Bordeaux & Dégustation",
            description: "Sortie longue au milieu des vignes de Saint-Émilion.",
            type: "THEMATIC",
            date: new Date("2025-09-20T09:00:00Z"),
            location: "Saint-Émilion, France",
            duration: "1 Journée",
            distanceKm: 18,
            price: 45,
            imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=1000",
            spotsTotal: 20,
            spotsFilled: 15,
            organizerId: u2.id
        }
    })

    await prisma.voyage.create({
        data: {
            id: "3",
            title: "Le Sentier des Douaniers (GR34)",
            description: "Week-end choc en Bretagne.",
            type: "TRIP_MULTI_DAY",
            date: new Date("2025-07-04T08:00:00Z"),
            location: "Ploumanac'h, Bretagne",
            duration: "3 Jours",
            distanceKm: 45,
            price: 290,
            imageUrl: "https://images.unsplash.com/photo-1505832018823-50331d70d237?auto=format&fit=crop&q=80&w=1000",
            spotsTotal: 12,
            spotsFilled: 8,
            organizerId: u3.id
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
