#!/usr/bin/env node
/**
 * I18n Audit Script
 * Finds missing translation keys across languages
 * 
 * Usage: node scripts/i18n-audit.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read translations file
const translationsPath = path.join(__dirname, '../src/core/services/translations.ts');
const content = fs.readFileSync(translationsPath, 'utf8');

// Extract language blocks
const languageBlocks = {};
const langRegex = /(\w+):\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/gm;

// Simple extraction - find all key-value pairs per language
const languages = ['en', 'fr', 'es', 'de', 'it', 'ca'];
const allKeys = new Set();
const keysByLang = {};

languages.forEach(lang => {
    keysByLang[lang] = new Set();

    // Find the language block
    const langBlockRegex = new RegExp(`${lang}:\\s*\\{[\\s\\S]*?\\n\\s*\\}(?=,?\\s*\\n\\s*(?:${languages.join('|')}|\\}))`);
    const match = content.match(langBlockRegex);

    if (match) {
        // Extract keys from this block
        const keyRegex = /^\s*(\w+):/gm;
        let keyMatch;
        while ((keyMatch = keyRegex.exec(match[0])) !== null) {
            const key = keyMatch[1];
            if (key !== lang) {
                keysByLang[lang].add(key);
                allKeys.add(key);
            }
        }
    }
});

console.log('\n📊 I18N AUDIT REPORT\n');
console.log('='.repeat(60));

// Find missing keys per language
let totalMissing = 0;
const missingByLang = {};

languages.forEach(lang => {
    const missing = [];
    allKeys.forEach(key => {
        if (!keysByLang[lang].has(key)) {
            missing.push(key);
        }
    });

    missingByLang[lang] = missing;
    totalMissing += missing.length;

    console.log(`\n${lang.toUpperCase()}: ${keysByLang[lang].size} keys, ${missing.length} missing`);

    if (missing.length > 0 && missing.length <= 10) {
        missing.forEach(k => console.log(`  ❌ ${k}`));
    } else if (missing.length > 10) {
        missing.slice(0, 5).forEach(k => console.log(`  ❌ ${k}`));
        console.log(`  ... and ${missing.length - 5} more`);
    }
});

console.log('\n' + '='.repeat(60));
console.log(`\n✅ Total keys: ${allKeys.size}`);
console.log(`⚠️  Total missing: ${totalMissing}`);

// Write detailed report
const reportPath = path.join(__dirname, '../i18n-audit-report.json');
const report = {
    generated: new Date().toISOString(),
    totalKeys: allKeys.size,
    totalMissing,
    languages: {}
};

languages.forEach(lang => {
    report.languages[lang] = {
        keyCount: keysByLang[lang].size,
        missingCount: missingByLang[lang].length,
        missingKeys: missingByLang[lang]
    };
});

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Detailed report saved to: i18n-audit-report.json\n`);
