
import fs from 'fs';

const content = fs.readFileSync('/home/fg/Documents/Applications Professionnelles/more-training/src/core/services/translations.ts', 'utf8');

const extractTranslations = (content) => {
    const translations = {};
    const langs = ['es', 'en', 'ca', 'fr', 'it', 'de'];

    langs.forEach(lang => {
        const startRegex = new RegExp(`^    ${lang}: \\{`, 'm');
        const startIndex = content.search(startRegex);
        if (startIndex === -1) {
            console.log(`Could not find start for ${lang}`);
            return;
        }

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
                .filter(line => line.includes(':') && !line.startsWith('//') &&
                    !line.startsWith('es:') && !line.startsWith('en:') &&
                    !line.startsWith('ca:') && !line.startsWith('fr:') &&
                    !line.startsWith('it:') && !line.startsWith('de:'))
                .map(line => line.split(':')[0].trim())
                .filter(key => key.length > 0);
            translations[lang] = keys;
            console.log(`${lang} keys count: ${keys.length}`);
        }
    });

    return translations;
};

const translations = extractTranslations(content);

if (translations.es) {
    console.log("Searching for 'record_run_5k' in es keys...");
    console.log(translations.es.includes('record_run_5k') ? "FOUND" : "NOT FOUND");

    // Check for weird characters
    const similar = translations.es.filter(k => k.includes('record_run'));
    console.log("Similar keys in es:", similar);
}
