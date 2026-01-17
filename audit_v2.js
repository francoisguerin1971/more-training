
import fs from 'fs';
import path from 'path';

const TRANSLATIONS_PATH = '/home/fg/Documents/Applications Professionnelles/more-training/src/core/services/translations.ts';

function extractKeysFromTranslations() {
    const content = fs.readFileSync(TRANSLATIONS_PATH, 'utf8');
    const langs = ['es', 'en', 'ca', 'fr', 'it', 'de'];
    const translations = {};

    langs.forEach(lang => {
        const startRegex = new RegExp(`^    ${lang}: \\{`, 'm');
        const startIndex = content.search(startRegex);
        if (startIndex === -1) return;

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
            // Match keys at start of line with indentation
            // Format:         key_name: "value",
            const keyRegex = /^[ ]{8}([a-zA-Z0-9_]+):/gm;
            const keys = [];
            let match;
            while ((match = keyRegex.exec(section)) !== null) {
                keys.push(match[1]);
            }
            translations[lang] = keys;
        }
    });

    return translations;
}

function extractUsedKeysFromCode() {
    const searchDirs = ['src'];
    const usedKeys = new Set();
    const tRegex = /\bt\(\s*['"`]([a-zA-Z0-9_]+)['"`](?:\s*,\s*\{[^}]*\})?\s*\)/g;

    function walk(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file !== 'node_modules' && file !== '.git') {
                    walk(fullPath);
                }
            } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                let match;
                while ((match = tRegex.exec(content)) !== null) {
                    usedKeys.add(match[1]);
                }
            }
        });
    }

    searchDirs.forEach(dir => walk(path.join('/home/fg/Documents/Applications Professionnelles/more-training', dir)));
    return usedKeys;
}

const translations = extractKeysFromTranslations();
const usedKeys = extractUsedKeysFromCode();

const allKeysInTranslations = new Set();
Object.values(translations).forEach(keys => keys.forEach(k => allKeysInTranslations.add(k)));

console.log(`Total unique keys in translations.ts: ${allKeysInTranslations.size}`);
console.log(`Total unique keys used in code: ${usedKeys.size}`);

const report = {};
const langs = ['es', 'en', 'ca', 'fr', 'it', 'de'];

langs.forEach(lang => {
    const langKeys = translations[lang] || [];
    const missingFromTranslations = [...usedKeys].filter(k => !langKeys.includes(k));
    const extraInTranslations = langKeys.filter(k => !usedKeys.has(k));
    const langKeysDuplicate = langKeys.filter((item, index) => langKeys.indexOf(item) !== index);

    report[lang] = {
        count: langKeys.length,
        missing: missingFromTranslations,
        extra: extraInTranslations,
        duplicates: langKeysDuplicate
    };
});

langs.forEach(lang => {
    console.log(`\n--- ${lang.toUpperCase()} ---`);
    console.log(`Keys: ${report[lang].count}`);
    console.log(`Missing (used in code but not in ${lang}): ${report[lang].missing.length}`);
    if (report[lang].missing.length > 0) {
        console.log(`  Keys: ${report[lang].missing.slice(0, 20).join(', ')}${report[lang].missing.length > 20 ? '...' : ''}`);
    }
    console.log(`Duplicate keys in ${lang}: ${report[lang].duplicates.length}`);
    if (report[lang].duplicates.length > 0) {
        console.log(`  Keys: ${report[lang].duplicates.join(', ')}`);
    }
});

// Calculate keys missing compared to EN (parity check)
const enKeys = translations['en'] || [];
console.log('\n--- Parity Audit (compared to EN) ---');
langs.forEach(lang => {
    if (lang === 'en') return;
    const langKeys = translations[lang] || [];
    const missingCompareToEn = enKeys.filter(k => !langKeys.includes(k));
    console.log(`${lang.toUpperCase()}: ${missingCompareToEn.length} keys missing compared to EN`);
    if (missingCompareToEn.length > 0) {
        console.log(`  Keys: ${missingCompareToEn.slice(0, 20).join(', ')}${missingCompareToEn.length > 20 ? '...' : ''}`);
    }
});
