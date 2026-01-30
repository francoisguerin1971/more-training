
import fs from 'fs';

const filePath = 'src/core/services/translations.ts';
let content = fs.readFileSync(filePath, 'utf8');

const newKeys = `        recovery_protocols_title: "Recovery Protocols",
        preferences_prefix: "Preferences",
        plan_after_intensive: "Plan after intensive sessions",
        active_recovery_deload: "Active Recovery (Deload)",
        recovery_favorite: "Favorite Recovery",
        exercise_sprint_vma: "Sprint VMA",
        exercise_threshold: "Anaerobic Threshold",
        exercise_squat: "Goblet Squat",
        exercise_lunge: "Bulgarian Split Squat",
        exercise_plank: "Dynamic Plank",
        exercise_stretching: "Active Stretching",`;

const newKeysCA = `        recovery_protocols_title: "Protocols de Recuperació",
        preferences_prefix: "Preferències",
        plan_after_intensive: "Planificar després de sessions intensives",
        active_recovery_deload: "Recuperació Activa (Descàrrega)",
        recovery_favorite: "Recuperació Preferida",
        exercise_sprint_vma: "Sprint VMA",
        exercise_threshold: "Llindar Anaeròbic",
        exercise_squat: "Sentadilla Copa",
        exercise_lunge: "Gambada Búlgara",
        exercise_plank: "Planxa Dinàmica",
        exercise_stretching: "Estiraments Actius",`;

// Insert for EN (before ca: {)
// Find the closing brace of EN block. 
// It is before "    ca: {"
content = content.replace(/(\n[ ]+ca: \{)/, `\n${newKeys}$1`);

// Insert for CA (before fr: {)
content = content.replace(/(\n[ ]+fr: \{)/, `\n${newKeysCA}$1`);

fs.writeFileSync(filePath, content);
console.log('Inserted keys for EN and CA');
