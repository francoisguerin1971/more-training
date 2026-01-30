
import fs from 'fs';

const content = fs.readFileSync('/home/fg/Documents/Applications Professionnelles/more-training/src/core/services/translations.ts', 'utf8');

// Basic extraction of translation objects
const extractTranslations = (content) => {
    const translations = {};
    const langs = ['es', 'en', 'ca', 'fr', 'it', 'de'];

    langs.forEach(lang => {
        const startRegex = new RegExp(`^    ${lang}: \\{`, 'm');
        const startIndex = content.search(startRegex);
        if (startIndex === -1) return;

        // Find the matching closing brace
        // This is a naive implementation assuming no nested braces in strings
        let openBraces = 0;
        let braceFound = false;
        let endIndex = -1;

        for (let i = startIndex; i < content.length; i++) {
            if (content[i] === '{') {
                openBraces++;
                braceFound = true;
            } else if (content[i] === '}') {
                openBraces--;
                if (braceFound && openBraces === 0) {
                    endIndex = i;
                    break;
                }
            }
        }

        if (endIndex !== -1) {
            const section = content.substring(startIndex, endIndex + 1);
            const lines = section.split('\n');
            const keys = lines
                .map(line => line.trim())
                .filter(line => line.includes(':') && !line.startsWith('//') && !line.startsWith('es:') && !line.startsWith('en:') && !line.startsWith('ca:') && !line.startsWith('fr:') && !line.startsWith('it:') && !line.startsWith('de:'))
                .map(line => line.split(':')[0].trim())
                .filter(key => key.length > 0);
            translations[lang] = keys;
        }
    });

    return translations;
};

const translations = extractTranslations(content);
const allKeys = new Set();
Object.values(translations).forEach(keys => keys.forEach(k => allKeys.add(k)));

console.log(`Total unique keys: ${allKeys.size}`);

const report = {};
Object.keys(translations).forEach(lang => {
    const missing = [...allKeys].filter(k => !translations[lang].includes(k));
    report[lang] = {
        count: translations[lang].length,
        missing: missing
    };
});

Object.keys(report).forEach(lang => {
    console.log(`\nLanguage: ${lang}`);
    console.log(`Keys: ${report[lang].count}`);
    console.log(`Missing: ${report[lang].missing.length}`);
    if (report[lang].missing.length > 0 && report[lang].missing.length < 100) {
        console.log(`Missing keys: ${report[lang].missing.join(', ')}`);
    } else if (report[lang].missing.length >= 50) {
        console.log(`Missing keys: ${report[lang].missing.slice(0, 10).join(', ')} ... and ${report[lang].missing.length - 10} more`);
    }
});
