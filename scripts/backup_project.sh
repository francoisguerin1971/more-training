#!/bin/bash
# Script de Sauvegarde Stratégique - More Training
# Ce script crée un point de restauration daté et une branche de secours

DATE=$(date +%Y-%m-%d_%H-%M)
BRANCH_NAME="backup/snapshot_$DATE"

echo "🚀 Initialisation de la sauvegarde $DATE..."

# S'assurer qu'on est à la racine du projet
cd "$(dirname "$0")/.."

# Créer une branche de sauvegarde
git checkout -b "$BRANCH_NAME"

# Ajouter tous les fichiers et commiter
git add .
git commit -m "backup: point de restauration final du $DATE"

# Retourner sur la branche principale
git checkout -

echo "✅ Sauvegarde terminée. Branche créée : $BRANCH_NAME"
echo "💡 Pour restaurer : git checkout $BRANCH_NAME"
