
import fs from 'fs';

const usedKeys = new Set(fs.readFileSync('all_used_keys.txt', 'utf8').split('\n').map(k => k.trim()).filter(k => k.length > 0));
const translationsContent = fs.readFileSync('/home/fg/Documents/Applications Professionnelles/more-training/src/core/services/translations.ts', 'utf8');

const langs = ['es', 'en', 'ca', 'fr', 'it', 'de'];
const report = {};

langs.forEach(lang => {
    const startRegex = new RegExp(`^    ${lang}: \\{`, 'm');
    const startIndex = translationsContent.search(startRegex);
    if (startIndex === -1) return;

    let openBraces = 0;
    let braceFound = false;
    let endIndex = -1;

    for (let i = startIndex; i < translationsContent.length; i++) {
        if (translationsContent[i] === '{') {
            openBraces++;
            braceFound = true;
        } else if (translationsContent[i] === '}') {
            openBraces--;
            if (braceFound && openBraces === 0) {
                endIndex = i;
                break;
            }
        }
    }

    if (endIndex !== -1) {
        const section = translationsContent.substring(startIndex, endIndex + 1);
        const lines = section.split('\n');
        const keys = new Set(lines
            .map(line => line.trim())
            .filter(line => line.includes(':') && !line.startsWith('//'))
            .map(line => line.split(':')[0].trim())
            .filter(key => key.length > 0 && !langs.includes(key)));

        const missing = [...usedKeys].filter(k => !keys.has(k));
        report[lang] = missing;
    }
});

console.log(JSON.stringify(report, null, 2));
