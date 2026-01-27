# Rapport d'Audit Stratégique : More-Training
**Par : Elite Performance Architect**

## 1. État des Lieux : Forces & Fondations
L'application possède une base scientifique sérieuse. Le `TrainingScienceService` implémente des algorithmes de référence (Banister, Foster, Gabbett) qui sont la norme dans le sport de haut niveau.

*   **ACWR (Acute:Chronic Workload Ratio)** : Présent et bien modélisé pour prévenir les blessures.
*   **Readiness Engine** : Basé sur la VFC et le sommeil, ce qui est l'état de l'art.
*   **Duo RPE/Data** : La structure permet de croiser le ressenti subjectif avec la charge externe.

---

## 2. Points Critiques & "Bloquants" (Dette Technique & UX)

### A. Le Dashboard "Simulateur" (Critique)
> [!WARNING]
> Le composant `AthleteDashboard.tsx` (70KB) est un monolithe qui mélange logique métier, appels API et **données simulées**.
*   **Le problème** : La courbe de charge macro-cycle et les records personnels sont actuellement "fakes" ou codés en dur. Cela crée une déconnexion entre la réalité de l'athlète et l'interface.
*   **Impact** : L'athlète perd confiance si ses progrès réels ne sont pas reflétés immédiatement.

### B. Le "Dark Start" de l'ACWR (Sportif)
> [!IMPORTANT]
> L'onboarding ne capture pas le volume d'entraînement des 4 dernières semaines.
*   **Le problème** : Sans historique, l'algorithme ACWR commence à zéro. Toute charge initiale apparaîtra comme une "Danger Zone", provoquant des alertes anxiogènes inutiles.
*   **Impact** : Mauvaise première expérience utilisateur.

### C. Fragmentation des Données (Architecture)
*   **Le problème** : Les types `Workout` et `Exercise` partagent le champ `rpe`. Il n'y a pas de distinction claire entre le RPE de la séance globale (Charge Interne) et le RPE d'un exercice spécifique (Intensité).

---

## 3. Opportunités & Astuces "Elite"

### I. La Boucle de Feedback Réactive
L'app conseille l'athlète via le `Readiness Score`, mais ne **propose pas** de modifier dynamiquement la séance prévue.
*   **Astuce** : Si le score est "Red", l'IA devrait proposer un bouton : *"Adapter ma séance : Recup' Active"* qui remplace automatiquement les exercices de haute intensité par de la mobilité.

### II. Visualisation de la Monotonie
La monotonie est calculée mais invisible.
*   **Conseil** : Ajouter un indicateur de "Risque d'Overtraining" discret si la monotonie dépasse 2.0 pendant 7 jours consécutifs.

### III. Micro-UX Performance
*   **Commentaire** : Dans `PortalSelection.tsx`, nous pourrions ajouter une métrique "Readiness" rapide dès le choix du portail pour mettre l'athlète dans le "mood" performance immédiatement.

---

## 4. Recommandations de Priorisation
1.  **Refactoring** : Extraire la logique de calcul de `AthleteDashboard` vers des hooks spécialisés (`usePerformanceData`).
2.  **Historical Onboarding** : Ajouter une étape demandant le volume moyen hebdomadaire du mois dernier pour calibrer la charge chronique.
3.  **Lien Direct** : Connecter le `TrainingScienceService` aux graphiques du Dashboard.
