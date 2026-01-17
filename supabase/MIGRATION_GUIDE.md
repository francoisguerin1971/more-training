# Guide d'Exécution de la Migration Supabase

## Fichier Créé
📄 [`supabase/migrations/20260116_add_name_fields.sql`](file:///home/fg/Documents/Applications%20Professionnelles/more-training/supabase/migrations/20260116_add_name_fields.sql)
📄 [`supabase/migrations/20260116_init_extended_schema.sql`](file:///home/fg/Documents/Applications%20Professionnelles/more-training/supabase/migrations/20260116_init_extended_schema.sql)

## Option 1: Via Supabase Dashboard (Recommandé)

### Étapes:
1. **Ouvrir Supabase Dashboard**
   - Aller sur https://app.supabase.com
   - Sélectionner votre projet

2. **Accéder à l'Éditeur SQL**
   - Menu latéral → "SQL Editor"
   - Cliquer sur "New Query"

3. **Copier-Coller le SQL**
   - **IMPORTANT** : Exécutez d'abord `20260116_init_extended_schema.sql` (crée les tables manquantes).
   - Ensuite, exécutez `20260116_add_name_fields.sql` (ajoute les colonnes de profil).

4. **Exécuter**
   - Cliquer sur "Run" (ou Ctrl+Enter)
   - Vérifier qu'il n'y a pas d'erreurs

5. **Vérifier**
   ```sql
   -- Vérifier que les colonnes existent
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name IN ('first_name', 'last_name', 'pseudo');
   
   -- Vérifier les données migrées
   SELECT id, first_name, last_name, pseudo, full_name 
   FROM profiles 
   LIMIT 5;
   ```

## Option 2: Via Supabase CLI

### Prérequis:
```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase
```

### Étapes:
```bash
# 1. Se connecter à Supabase
supabase login

# 2. Lier le projet local
supabase link --project-ref VOTRE_PROJECT_REF

# 3. Appliquer la migration
supabase db push

# Ou exécuter directement le fichier
supabase db execute -f supabase/migrations/20260116_add_name_fields.sql
```

## Ce que fait la Migration

1. ✅ Ajoute 4 colonnes: `first_name`, `last_name`, `pseudo`, `avatar_url`
2. ✅ Crée des index sur `pseudo` et `avatar_url` pour les recherches rapides
3. ✅ Migre les données existantes depuis `profile_data` JSONB
4. ✅ Met à jour `full_name` si vide (à partir de first + last)
5. ✅ Conserve les données dans `profile_data` (compatibilité)

## Après la Migration

### L'application continuera à fonctionner sans changement
- Les lectures depuis `profile_data.pseudo` fonctionneront
- Les écritures dans `profile_data` fonctionneront
- Les nouvelles colonnes seront automatiquement remplies

### État Actuel (Refactoring Terminé)

L'application a été entièrement mise à jour pour utiliser les colonnes dédiées:
- `authStore.ts` récupère et met à jour ces colonnes.
- `AthleteDashboard.tsx`, `Sidebar.tsx` et `AccountSettings.tsx` lisent ces colonnes en priorité.
- `Onboarding.tsx` écrit directement dans ces colonnes pour les nouveaux utilisateurs.

### Synchronisation des données (Crucial)
Si vous avez déjà des utilisateurs, vous **DEVEZ** exécuter [`supabase/migrations/20260116_sync_identity_columns.sql`](file:///home/fg/Documents/Applications%20Professionnelles/more-training/supabase/migrations/20260116_sync_identity_columns.sql) pour copier les anciens pseudos/noms vers les nouvelles colonnes.

## Rollback (si nécessaire)

Si vous voulez annuler la migration:
```sql
-- Supprimer les colonnes
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name,
DROP COLUMN IF EXISTS pseudo,
DROP COLUMN IF EXISTS avatar_url;

-- Supprimer les index
DROP INDEX IF EXISTS idx_profiles_pseudo;
DROP INDEX IF EXISTS idx_profiles_avatar_url;
```

Les données restent sauves dans `profile_data` JSONB.

## Support

Si vous rencontrez des erreurs, vérifiez:
- ✅ Permissions sur la table `profiles`
- ✅ Connexion à la bonne base de données
- ✅ Pas de conflit avec des colonnes existantes
