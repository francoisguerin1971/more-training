
export interface ExerciseDefinition {
    id: string;
    name: string;
    description: string;
    sketch_url: string;
    category: 'running' | 'swimming' | 'cycling' | 'strength' | 'recovery' | 'trail' | 'walking';
    default_reps?: string;
    default_sets?: number;
    default_rest?: string;
    default_notes?: string;
    default_tempo?: string;
    default_intensity?: string;
}

export const UNIVERSAL_EXERCISE_LIBRARY: Record<string, ExerciseDefinition> = {
    // RUNNING
    'run_vma_short': {
        id: 'run_vma_short',
        name: 'VMA Courte (30/30)',
        description: 'Fractionné court pour développer la vitesse maximale aérobie.',
        sketch_url: '/images/sketches/sprint.png',
        category: 'running',
        default_sets: 2,
        default_reps: '10 x 30s/30s',
        default_rest: '3 min entre blocs',
        default_intensity: '100-105% VMA',
        default_notes: 'Focus sur une foulée dynamique et le relâchement.'
    },
    'run_tempo': {
        id: 'run_tempo',
        name: 'Seuil / Tempo',
        description: 'Maintien d\'une allure soutenue pour améliorer l\'endurance anaérobie.',
        sketch_url: '/images/sketches/sprint.png',
        category: 'running',
        default_sets: 3,
        default_reps: '10 min',
        default_rest: '2 min',
        default_intensity: '85-90% FC Max',
        default_notes: 'Cherchez un rythme régulier et contrôlé.'
    },
    'run_base': {
        id: 'run_base',
        name: 'Endurance Fondamentale',
        description: 'Course lente en aisance respiratoire totale.',
        sketch_url: '/images/sketches/running/endurance.png',
        category: 'running',
        default_sets: 1,
        default_reps: '45-60 min',
        default_intensity: '70-75% FC Max',
        default_notes: 'Vous devez pouvoir parler sans être essoufflé.'
    },
    'run_drills_knees': {
        id: 'run_drills_knees',
        name: 'Montées de Genoux',
        description: 'Éducatif pour améliorer la phase de poussée et la posture.',
        sketch_url: '/images/sketches/running/drills_knees.png',
        category: 'running',
        default_sets: 3,
        default_reps: '30m',
        default_rest: 'Retour marché',
        default_notes: 'Gardez le buste droit et les bras actifs.'
    },
    // SWIMMING
    'swim_crawl_tech': {
        id: 'swim_crawl_tech',
        name: 'Crawl Technique',
        description: 'Focus sur l\'allongement et le roulis du corps.',
        sketch_url: '/images/sketches/swim_crawl.png',
        category: 'swimming',
        default_sets: 8,
        default_reps: '50m',
        default_rest: '20s',
        default_notes: 'Gardez la tête bien alignée lors de la respiration.'
    },
    'swim_paddles': {
        id: 'swim_paddles',
        name: 'Nage avec Plaquettes',
        description: 'Travail de force spécifique et amélioration de l\'appui.',
        sketch_url: '/images/sketches/swimming/paddles.png',
        category: 'swimming',
        default_sets: 4,
        default_reps: '200m',
        default_rest: '45s',
        default_notes: 'Focus sur la prise d\'appui précoce.'
    },
    'swim_kick_drills': {
        id: 'swim_kick_drills',
        name: 'Éducatifs Jambes',
        description: 'Travail de propulsion spécifique avec planche.',
        sketch_url: '/images/sketches/swim_drills.png',
        category: 'swimming',
        default_sets: 4,
        default_reps: '100m',
        default_rest: '30s',
        default_notes: 'Poussée fluide venant des hanches.'
    },
    // CYCLING
    'bike_intervals': {
        id: 'bike_intervals',
        name: 'Intervalles Puissance',
        description: 'Séries de haute intensité pour développer la PMA.',
        sketch_url: '/images/sketches/bike_tech.png',
        category: 'cycling',
        default_sets: 6,
        default_reps: '5 min',
        default_rest: '2 min',
        default_intensity: '85% FTP',
        default_notes: 'Cadence entre 85 et 95 RPM.'
    },
    'bike_climb': {
        id: 'bike_climb',
        name: 'Montée en Danseuse',
        description: 'Travail de force et de relance en côte.',
        sketch_url: '/images/sketches/cycling/climb.png',
        category: 'cycling',
        default_sets: 5,
        default_reps: '2 min',
        default_rest: 'Descente souple',
        default_notes: 'Relancez en haut de la côte.'
    },
    'bike_base': {
        id: 'bike_base',
        name: 'Vélo Endurance',
        description: 'Sortie longue pour l\'adaptation lipidique.',
        sketch_url: '/images/sketches/bike_trainer.png',
        category: 'cycling',
        default_sets: 1,
        default_reps: '90-120 min',
        default_intensity: 'Zone 2',
        default_notes: 'Idéal sur home trainer ou parcours plat.'
    },
    // STRENGTH
    'strength_pushup': {
        id: 'strength_pushup',
        name: 'Pompes Classiques',
        description: 'Renforcement de la chaîne antérieure.',
        sketch_url: '/images/sketches/strength/pushup.png',
        category: 'strength',
        default_sets: 3,
        default_reps: '15',
        default_rest: '60s',
        default_notes: 'Gardez le corps bien aligné (gainage).'
    },
    'strength_squat': {
        id: 'strength_squat',
        name: 'Squat Gobelet',
        description: 'Engagement du centre du corps et posture verticale.',
        sketch_url: '/images/sketches/squat.png',
        category: 'strength',
        default_sets: 4,
        default_reps: '12',
        default_rest: '90s',
        default_tempo: '3-1-1',
        default_notes: 'Poussez les genoux vers l\'extérieur.'
    },
    'strength_lunge': {
        id: 'strength_lunge',
        name: 'Fente Bulgare',
        description: 'Travail unilatéral pour la stabilité et la force.',
        sketch_url: '/images/sketches/lunge.png',
        category: 'strength',
        default_sets: 3,
        default_reps: '10/côté',
        default_rest: '60s',
        default_tempo: '2-1-2',
        default_notes: 'Contrôlez la descente.'
    },
    'strength_plank': {
        id: 'strength_plank',
        name: 'Planche Dynamique',
        description: 'Gainage actif pour le muscle transverse.',
        sketch_url: '/images/sketches/plank.png',
        category: 'strength',
        default_sets: 4,
        default_reps: '45s',
        default_rest: '30s',
        default_notes: 'Maintenez une ligne droite.'
    },
    // RECOVERY
    'yoga_warrior': {
        id: 'yoga_warrior',
        name: 'Yoga Warrior Flow',
        description: 'Enchaînement de postures pour la mobilité.',
        sketch_url: '/images/sketches/yoga.png',
        category: 'recovery',
        default_sets: 1,
        default_reps: '45 min',
        default_notes: 'Respiration nasale lente.'
    },
    'mobility_cat_cow': {
        id: 'mobility_cat_cow',
        name: 'Chat-Vache (Mobilité)',
        description: 'Mobilisation de la colonne vertébrale.',
        sketch_url: '/images/sketches/mobility/cat_cow.png',
        category: 'recovery',
        default_sets: 2,
        default_reps: '10 cycles',
        default_notes: 'Synchronisez le mouvement avec la respiration.'
    },
    'mobility_base': {
        id: 'mobility_base',
        name: 'Mobilité & Étirements',
        description: 'Protocole pour les muscles clés de l\'athlète.',
        sketch_url: '/images/sketches/mobility.png',
        category: 'recovery',
        default_sets: 1,
        default_reps: '15 min',
        default_notes: 'Ne jamais forcer jusqu\'à la douleur.'
    },
    // TRAIL
    'trail_ascent': {
        id: 'trail_ascent',
        name: 'Montée Technique',
        description: 'Force et économie en montée.',
        sketch_url: '/images/sketches/trail.png',
        category: 'trail',
        default_sets: 5,
        default_reps: '3 min',
        default_rest: 'Descente souple',
        default_notes: 'Buste droit, bras actifs.'
    }
};

export class ExerciseSketchService {
    /**
     * Gets or generates a sketch for an exercise.
     * In a real version, this could call an AI API.
     */
    static getSketchForExercise(exerciseName: string, category: string = 'running'): string {
        const key = Object.keys(UNIVERSAL_EXERCISE_LIBRARY).find(k =>
            UNIVERSAL_EXERCISE_LIBRARY[k].name.toLowerCase() === exerciseName.toLowerCase() ||
            k.includes(exerciseName.toLowerCase().replace(/\s+/g, '_'))
        );

        if (key) {
            return UNIVERSAL_EXERCISE_LIBRARY[key].sketch_url;
        }

        // Fallback sketches based on category
        switch (category.toLowerCase()) {
            case 'swimming': return '/images/sketches/swim_crawl.png';
            case 'cycling': return '/images/sketches/bike_tech.png';
            case 'strength': return '/images/sketches/squat.png';
            case 'recovery': return '/images/sketches/yoga.png';
            case 'trail': return '/images/sketches/trail.png';
            case 'walking': return '/images/sketches/walking.png';
            default: return '/images/sketches/mobility.png';
        }
    }

    static getDefinition(id: string): ExerciseDefinition | undefined {
        return UNIVERSAL_EXERCISE_LIBRARY[id];
    }

    static getAllByCategory(category: string): ExerciseDefinition[] {
        return Object.values(UNIVERSAL_EXERCISE_LIBRARY).filter(ex => ex.category === category);
    }
}
