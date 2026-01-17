
import { translations } from './src/core/services/translations';

const results = {};

for (const lang in translations) {
    const keys = Object.keys(translations[lang]);
    const seen = new Set();
    const duplicates = [];
    for (const key of keys) {
        if (seen.has(key)) {
            duplicates.push(key);
        }
        seen.add(key);
    }
    if (duplicates.length > 0) {
        results[lang] = duplicates;
    }
}

console.log(JSON.stringify(results, null, 2));
