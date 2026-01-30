
import fs from 'fs';

const filePath = 'src/core/services/translations.ts';
let content = fs.readFileSync(filePath, 'utf8');

function cleanBlock(lang, newContent) {
    const regex = new RegExp(`    ${lang}: \\{[\\s\\S]*?\\},`, 'g');
    content = content.replace(regex, `    ${lang}: {${newContent}\n    },`);
}

// I need the FULL content for these blocks to avoid losing anything.
// Instead of trying to provide the full content here (it's too long), 
// I'll write a script that deduplicates and adds missing keys programmatically.

const lines = content.split('\n');
let currentLang = null;
let newLines = [];
let langKeys = new Set();
const missingKeys = {
    ca: ["account_type", "address_label", "allowCompetitions", "allowRDV", "allowWorkouts", "optimal", "record_cycling_5min"],
    it: ["account_type", "address_label", "allowCompetitions", "allowRDV", "allowWorkouts"],
    de: ["account_type", "address_label", "allowCompetitions", "allowRDV", "allowWorkouts"]
};

const translations = {
    account_type: { ca: "Tipus de compte", it: "Tipo di account", de: "Kontotyp" },
    address_label: { ca: "Adreça", it: "Indirizzo", de: "Adresse" },
    allowCompetitions: { ca: "Permetre competicions", it: "Consenti competizioni", de: "Wettbewerbe zulassen" },
    allowRDV: { ca: "Permetre cites", it: "Consenti appuntamenti", de: "Termine zulassen" },
    allowWorkouts: { ca: "Permetre entrenaments", it: "Consenti allenamenti", de: "Workouts zulassen" },
    optimal: { ca: "òptima", it: "ottimale", de: "optimal" },
    record_cycling_5min: { ca: "Potència 5 min", it: "Potenza 5 min", de: "5 min Leistung" }
};

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const langMatch = line.match(/^    (es|en|ca|fr|it|de): \{/);

    if (langMatch) {
        currentLang = langMatch[1];
        langKeys = new Set();
        newLines.push(line);
        continue;
    }

    if (currentLang && line.trim() === '},') {
        // Before closing, add missing keys for this language
        if (missingKeys[currentLang]) {
            missingKeys[currentLang].forEach(k => {
                if (!langKeys.has(k)) {
                    newLines.push(`        ${k}: "${translations[k][currentLang]}",`);
                }
            });
        }
        newLines.push(line);
        currentLang = null;
        continue;
    }

    if (currentLang) {
        const keyMatch = line.match(/^[ ]+([a-zA-Z0-9_]+):/);
        if (keyMatch) {
            const key = keyMatch[1];
            if (langKeys.has(key)) {
                // Duplicate! Skip this line
                continue;
            }
            langKeys.add(key);
        }
    }

    newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Deduplicated and added missing keys for all languages');
