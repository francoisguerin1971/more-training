
/**
 * TRAINING SCIENCE SERVICE (CORE PULSE ENGINE)
 * --------------------------------------------
 * This service implements elite sports science algorithms used by Olympic federations.
 * It provides the mathematical foundation for the AI Planner's adaptive logic.
 * 
 * Sources:
 * - Banister (1975): Systems Model of Training
 * - Foster (1998): Session RPE
 * - Gabbett (2016): The Acute:Chronic Workload Ratio (ACWR)
 * - Seiler (2010): Polarized Training distribution
 */

export interface DailyLoad {
    date: Date;
    load: number; // Arbitrary Units (AU)
}

export interface ReadinessInputs {
    sleepScore: number; // 0-100
    hrv: number; // rMSSD in ms
    hrvBaseline: number; // 7-day rolling average
    soreness: number; // 1-10 (10 = pain)
    stress: number; // 1-10 (10 = high stress)
}

export type ZoneModel = '3-zone' | '5-zone' | '7-zone';

export const TrainingScienceService = {

    /**
     * 1. LOAD QUANTIFICATION ENGINE
     * -----------------------------
     * Calculates the internal physiological load of a session.
     */

    // Method A: Foster's RPE (Subjective but scientifically validated)
    calculateRPELoad(durationMinutes: number, rpe: number): number {
        // RPE Scale 1-10 * Duration
        return durationMinutes * rpe;
    },

    // Method B: TRIMP (Edwards) - Heart Rate based
    // Requires time in zones. More precise for cardio.
    calculateEdwardsTRIMP(zoneTimes: number[]): number {
        // zoneTimes = [Z1_mins, Z2_mins, Z3_mins, Z4_mins, Z5_mins]
        // Formula: Sum(Duration_Zone_i * i)
        if (zoneTimes.length !== 5) return 0;
        return (
            (zoneTimes[0] * 1) +
            (zoneTimes[1] * 2) +
            (zoneTimes[2] * 3) +
            (zoneTimes[3] * 4) +
            (zoneTimes[4] * 5)
        );
    },

    /**
     * 2. INJURY PREVENTION ENGINE (ACWR)
     * ----------------------------------
     * The "Sweet Spot" algorithm.
     * Compares short-term fatigue (Acute) vs long-term fitness (Chronic).
     */
    calculateACWR(
        history: DailyLoad[],
        referenceDate: Date = new Date()
    ): { acwr: number; acute: number; chronic: number; risk: 'low' | 'optimal' | 'high' | 'danger' } {
        // 1. Sort history by date desc
        const sortedHistory = [...history].sort((a, b) => b.date.getTime() - a.date.getTime());

        // 2. Identify Acute Load (Last 7 days)
        // Using Exponentially Weighted Moving Average (EWMA) is better according to recent studies,
        // but for simplicity/transparency we start with Rolling Average (RA).
        const acuteLoad = this.getAverageLoad(sortedHistory, 7);

        // 3. Identify Chronic Load (Last 28 days)
        const chronicLoad = this.getAverageLoad(sortedHistory, 28);

        // 4. Calculate Ratio
        // Prevent division by zero for new athletes
        const safeChronic = chronicLoad === 0 ? 1 : chronicLoad;
        const acwr = Number((acuteLoad / safeChronic).toFixed(2));

        // 5. Determine Risk Level (Gabbett's Model)
        let risk: 'low' | 'optimal' | 'high' | 'danger' = 'optimal';

        if (acwr < 0.8) risk = 'low';          // Detraining risk
        else if (acwr <= 1.3) risk = 'optimal'; // Sweet spot
        else if (acwr <= 1.5) risk = 'high';    // Caution zone
        else risk = 'danger';                   // "Danger Zone" (> 1.5)

        return { acwr, acute: Math.round(acuteLoad), chronic: Math.round(chronicLoad), risk };
    },

    /**
     * 3. OVERTRAINING DETECTION (Monotony & Strain)
     * ---------------------------------------------
     * Detects lack of variability which causes stagnation and burnout.
     */
    calculateMonotonyAndStrain(history: DailyLoad[]): { monotony: number; strain: number; warning: boolean } {
        const last7Days = history.slice(0, 7); // Assume sorted desc
        if (last7Days.length < 7) return { monotony: 0, strain: 0, warning: false };

        const loads = last7Days.map(d => d.load);
        const avg = loads.reduce((a, b) => a + b, 0) / loads.length;

        // Standard Deviation
        const squareDiffs = loads.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        const stdDev = Math.sqrt(avgSquareDiff);

        // Prevent div by zero
        const safeStdDev = stdDev === 0 ? 1 : stdDev;

        // Monotony = Avg Daily Load / StdDev
        // Ideal < 1.5. > 2.0 is dangerous.
        const monotony = Number((avg / safeStdDev).toFixed(2));

        // Strain = Total Weekly Load * Monotony
        const totalLoad = loads.reduce((a, b) => a + b, 0);
        const strain = Math.round(totalLoad * monotony);

        return {
            monotony,
            strain,
            warning: monotony > 2.0
        };
    },

    /**
     * 4. READINESS ENGINE (The "Brain")
     * ---------------------------------
     * Calculates a daily 'Readiness Score' (0-100) to adjust the planned session.
     */
    calculateDailyReadiness(inputs: ReadinessInputs): { score: number; zone: 'green' | 'amber' | 'red'; advice: string } {
        let score = 50; // Neutral start

        // A. HRV Analysis (Weight: 40%)
        // If HRV is within 3% of baseline => Normal. >3% lower => Stress.
        // We normalize the deviation.
        const hrvDev = ((inputs.hrv - inputs.hrvBaseline) / inputs.hrvBaseline) * 100;

        if (hrvDev >= -3) score += 20; // Good HRV
        else if (hrvDev >= -10) score += 0; // Moderate drop
        else score -= 20; // Significant drop (Parasympathetic withdrawal or Saturation)

        // B. Sleep Analysis (Weight: 30%)
        if (inputs.sleepScore >= 85) score += 15;
        else if (inputs.sleepScore >= 70) score += 5;
        else if (inputs.sleepScore >= 50) score -= 5;
        else score -= 15;

        // C. Subjective Feedback (Weight: 30%)
        // Stress & Soreness (lower is better for readiness)
        const subjectiveStress = (inputs.stress + inputs.soreness); // Max 20
        if (subjectiveStress <= 6) score += 15;
        else if (subjectiveStress <= 12) score += 0;
        else score -= 15;

        // Clamp 0-100
        score = Math.min(100, Math.max(0, score));

        // Interpretation
        let zone: 'green' | 'amber' | 'red' = 'green';
        let advice = "Système nerveux équilibré. Feu vert pour l'intensité.";

        if (score < 40) {
            zone = 'red';
            advice = "État de fatigue prononcé ou stress élevé. Privilégier la récupération active ou le repos complet.";
        } else if (score < 70) {
            zone = 'amber';
            advice = "État moyen. Réduire le volume ou l'intensité des séances clés (pas de VMA aujourd'hui).";
        }

        return { score, zone, advice };
    },

    // --- Helpers ---

    getAverageLoad(history: DailyLoad[], days: number): number {
        // Filter logic would go here to strictly select 'days' window.
        // Here assuming history is the relevant window for simplicity of the snippet.
        // In full implementation, we filter by Date.
        const window = history.slice(0, days);
        const sum = window.reduce((acc, val) => acc + val.load, 0);
        return window.length > 0 ? sum / window.length : 0;
    }
};
