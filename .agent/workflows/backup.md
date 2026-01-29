---
description: Protocole de Sauvegarde Quotidien et Post-Dev
---

# Protocole de Sauvegarde Élite

Ce protocole doit être exécuté :
1. **Au début** de chaque session de travail importante.
2. **À la fin** de chaque session.
3. **Avant** toute opération de "restauration" ou de changement structurel majeur.

## Étapes à suivre

1. **Vérification de l'état Git** :
   ```bash
   git status
   ```

2. **Exécuter le script de Snapshot** :
   // turbo
   ```bash
   ./scripts/backup_project.sh
   ```

3. **Validation** :
   Vérifier que le commit est bien présent et que la branche de secours `backup/snapshot_...` a bien été créée.

## Consigne de sécurité
NE JAMAIS supprimer une branche de backup sans l'accord explicite de l'utilisateur. Toute perte de données suite au non-respect de ce protocole est une faute grave.
