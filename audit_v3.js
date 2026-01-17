
import fs from 'fs';

const TRANSLATIONS_PATH = '/home/fg/Documents/Applications Professionnelles/more-training/src/core/services/translations.ts';
const USED_KEYS_PATH = '/home/fg/Documents/Applications Professionnelles/more-training/all_used_keys_clean.txt';

const content = fs.readFileSync(TRANSLATIONS_PATH, 'utf8');
const usedKeys = fs.readFileSync(USED_KEYS_PATH, 'utf8').split('\n').map(k => k.trim()).filter(k => k.length > 0);

function extractKeys(lang) {
    const startRegex = new RegExp(`^    ${lang}: \\{`, 'm');
    const startIndex = content.search(startRegex);
    if (startIndex === -1) return [];

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

    if (endIndex === -1) return [];
    const section = content.substring(startIndex, endIndex + 1);
    const keyRegex = /^[ ]{8}([a-zA-Z0-9_]+):/gm;
    const keys = [];
    let match;
    while ((match = keyRegex.exec(section)) !== null) {
        keys.push(match[1]);
    }
    return keys;
}

const languages = ['es', 'en', 'ca', 'fr', 'it', 'de'];
const report = {};

languages.forEach(lang => {
    const keys = extractKeys(lang);
    const missing = usedKeys.filter(k => !keys.includes(k));
    const seen = new Set();
    const duplicates = [];
    keys.forEach(k => {
        if (seen.has(k)) duplicates.push(k);
        seen.add(k);
    });

    report[lang] = {
        count: keys.length,
        missing: missing,
        duplicates: duplicates
    };
});

console.log(`Used keys found in code: ${usedKeys.length}\n`);
languages.forEach(lang => {
    console.log(`--- ${lang.toUpperCase()} ---`);
    console.log(`Keys: ${report[lang].count}`);
    console.log(`Missing: ${report[lang].missing.length}`);
    if (report[lang].missing.length > 0) {
        console.log(`Missing keys: ${JSON.stringify(report[lang].missing)}`);
    }
    console.log(`Duplicates: ${report[lang].duplicates.length}`);
    if (report[lang].duplicates.length > 0) {
        console.log(`Duplicate keys: ${JSON.stringify(report[lang].duplicates)}`);
    }
    console.log('');
});
