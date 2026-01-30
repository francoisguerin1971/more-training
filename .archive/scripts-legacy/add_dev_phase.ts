
import fs from 'fs';

const filePath = 'src/core/services/translations.ts';
let content = fs.readFileSync(filePath, 'utf8');

const keys = {
    es: '        development_phase: "Fase de Desarrollo",',
    en: '        development_phase: "Development Phase",',
    ca: '        development_phase: "Fase de Desenvolupament",',
    fr: '        development_phase: "Phase de Développement",',
    it: '        development_phase: "Fase di Sviluppo",',
    de: '        development_phase: "Entwicklungsphase",'
};

// Insert for each language
// Assuming we can just find 'allowWorkouts' and append after it, as we did before.
// Or just replace "allowWorkouts: ..." with "allowWorkouts: ...\n" + key

// Helper to replace for a lang
const addKey = (lang, newKeyLine) => {
    // Regex matches proper indentation for allowWorkouts
    const regex = new RegExp(`(allowWorkouts: "[^"]+",)`, 'g');
    // We need to be careful not to replace globally if allowWorkouts is same across langs (it isn't, translated strings differ)
    // Actually, values differ.
    // ES: "Permitir entrenamientos"
    // EN: "Allow Workouts"
    // CA: "Permetre entrenaments"
    // FR: "Autoriser entraînements"
    // IT: "Consenti allenamenti"
    // DE: "Workouts zulassen"

    // We can assume first match for each unique string is correct block (mostly).

    const map = {
        es: 'Permitir entrenamientos',
        en: 'Allow Workouts',
        ca: 'Permetre entrenaments',
        fr: 'Autoriser entraînements',
        it: 'Consenti allenamenti',
        de: 'Workouts zulassen'
    };

    const searchString = `allowWorkouts: "${map[lang]}",`;
    content = content.replace(searchString, `${searchString}\n${newKeyLine}`);
};

Object.keys(keys).forEach(lang => addKey(lang, keys[lang]));

fs.writeFileSync(filePath, content);
console.log('Inserted development_phase keys');
