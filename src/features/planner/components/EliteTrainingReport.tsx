import React, { useState } from 'react';
import {
    Calendar, Dumbbell, TrendingUp,
    ChevronRight, ChevronDown, Zap, Clock, Download, Share2, Printer,
    Trophy, Sparkles, Edit2, Trash2
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';
import { SessionDetailProps, SessionDetailCard } from './SessionDetailCard';
import { SessionBuilderModal } from './SessionBuilderModal';
import { PlanExportModal } from './PlanExportModal';
import { ExerciseSketchService } from '@/shared/services/ExerciseSketchService';
import { PlanValidationWorkflow, PlanStatus } from './PlanValidationWorkflow';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { EliteProPDF } from './pdf/EliteProPDF';

// Import extracted sub-components
import { MacrocycleChart, type MacrocycleData, type TrainingWeek } from './report/MacrocycleChart';
import { NutriSection, type NutriRecommendation } from './report/NutriSection';
import { RecoverySection, type RecoveryProtocol } from './report/RecoverySection';
import { MedicalSection, type MedicalAlert } from './report/MedicalSection';

// Re-export types for external usage
export type { TrainingWeek, MacrocycleData, NutriRecommendation, MedicalAlert, RecoveryProtocol };

export interface EliteTrainingReportData {
    athleteName: string;
    athletePhoto?: string;
    eventName: string;
    eventDate: string;
    generatedDate: string;
    coachStyle: string;
    planSummary: {
        totalWeeks: number;
        hoursPerWeek: number;
        sessionsPerWeek: number;
        keyWorkouts: string[];
    };
    macrocycle: MacrocycleData;
    nutriRecommendations: NutriRecommendation[];
    medicalAlerts: MedicalAlert[];
    recoveryProtocols: RecoveryProtocol[];
    weeklySchedule: Record<string, { activity: string; duration: number }>;
    detailedSessions?: SessionDetailProps[];
}

interface EliteTrainingReportProps {
    data: EliteTrainingReportData;
    onBack?: () => void;
    onExport?: () => void;
    onApplyPlan?: () => void;
}

// Main Report Component

export function EliteTrainingReport({ data, onBack, onExport, onApplyPlan }: EliteTrainingReportProps) {
    const { t } = useLanguage();
    const [reportData, setReportData] = useState<EliteTrainingReportData>(data); // Local state for edits
    const [activeTab, setActiveTab] = useState<'overview' | 'macrocycle' | 'details'>('overview');
    const [selectedSession, setSelectedSession] = useState<SessionDetailProps | null>(null);
    const [showSessionModal, setShowSessionModal] = useState(false);

    // Edit Mode State
    const [editingSession, setEditingSession] = useState<any>(null); // Format for Builder
    const [showEditModal, setShowEditModal] = useState(false);
    const [originalSessionId, setOriginalSessionId] = useState<string | null>(null);

    const [planStatus, setPlanStatus] = useState<PlanStatus>('draft');
    const [showExportModal, setShowExportModal] = useState(false);

    // --- Helpers for Format Conversion ---

    const aiToBuilder = (aiSession: SessionDetailProps) => {
        // Flatten exercises from all blocks for the builder
        const flattenExercises = [
            ...(aiSession.warmup?.exercises || []),
            ...(aiSession.mainSet?.flatMap(b => b.exercises || []) || []),
            ...(aiSession.cooldown?.exercises || [])
        ].map(ex => ({
            id: crypto.randomUUID(),
            name: ex.name,
            description: ex.notes || '',
            default_sets: 1, // Default assumption
            default_reps: ex.duration || '10 min',
            default_rest: '0',
            sketch_url: ex.sketchUrl
        }));

        return {
            title: aiSession.title,
            intensity: aiSession.intensity,
            details: {
                warmup: aiSession.warmup?.description || '',
                main: aiSession.mainSet?.map(b => b.description).join('\n') || '',
                cooldown: aiSession.cooldown?.description || '',
                tech_focus: ''
            },
            exercises: flattenExercises
        };
    };

    const builderToAi = (builderSession: any, original: SessionDetailProps): SessionDetailProps => {
        // Reconstruct AI format
        // This is a simplification: we put all builder exercises into Main Set for now, 
        // because we can't easily auto-sort them back into warmup/cool without logic.
        // OR we can keep the original warmup/cooldown text descriptions and just update the main set exercises.

        // Better approach for "Modify":
        // 1. Keep original Warmup/Cooldown blocks (text).
        // 2. Replace Main Set exercises with the new list from Builder.
        // 3. Update sketches.

        const newExercises = builderSession.exercises.map((ex: any) => ({
            name: ex.name,
            duration: ex.default_reps, // Mapping reps to duration string
            notes: ex.description,
            sketchUrl: ExerciseSketchService.getSketchForExercise(ex.name) // Refresh sketch
        }));

        return {
            ...original,
            title: builderSession.title,
            intensity: builderSession.intensity || original.intensity,
            warmup: {
                ...original.warmup,
                description: builderSession.details?.warmup || original.warmup.description
            },
            cooldown: {
                ...original.cooldown,
                description: builderSession.details?.cooldown || original.cooldown.description
            },
            mainSet: [
                {
                    type: 'main',
                    duration: original.mainSet[0]?.duration || 40,
                    description: builderSession.details?.main || original.mainSet[0]?.description || '',
                    exercises: newExercises,
                    intensity: 'high'
                }
            ]
        };
    };

    // --- Handlers ---

    const handleEditSession = (session: SessionDetailProps) => {
        const builderFormat = aiToBuilder(session);
        setEditingSession(builderFormat);
        setOriginalSessionId(session.id!);
        setShowEditModal(true);
    };

    const handleDeleteSession = (sessionId: string) => {
        if (confirm(t('confirm_delete_session') || 'Supprimer cette séance ?')) {
            setReportData(prev => ({
                ...prev,
                detailedSessions: prev.detailedSessions?.filter(s => s.id !== sessionId)
            }));
        }
    };

    const handleSaveSession = (updatedBuilderSession: any) => {
        setReportData(prev => {
            const original = prev.detailedSessions?.find(s => s.id === originalSessionId);
            if (!original) return prev;

            const updatedAiSession = builderToAi(updatedBuilderSession, original);

            return {
                ...prev,
                detailedSessions: prev.detailedSessions?.map(s =>
                    s.id === originalSessionId ? updatedAiSession : s
                )
            };
        });
        setShowEditModal(false);
    };


    // Ensure we close the detail modal when editing starts
    const handleEditWithClose = (session: SessionDetailProps) => {
        setShowSessionModal(false);
        handleEditSession(session);
    };

    const handleDeleteWithClose = (sessionId: string) => {
        handleDeleteSession(sessionId);
        setShowSessionModal(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            {/* Premium Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 rounded-[32px] border border-slate-800/50 p-8 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {data.athletePhoto ? (
                                <img src={data.athletePhoto} alt={data.athleteName} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-3xl font-black text-white">
                                    {reportData.athleteName.charAt(0)}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <Sparkles className="text-amber-400" size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                                        {t('elite_training_plan') || 'Plan d\'Entraînement Élite'}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
                                    {reportData.athleteName}
                                </h1>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Trophy size={14} className="text-amber-400" />
                                    <span className="text-sm font-medium">{reportData.eventName}</span>
                                    <span className="text-slate-600">•</span>
                                    <Calendar size={14} />
                                    <span className="text-sm">{reportData.eventDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                                <Share2 size={18} />
                            </button>
                            <button className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                                <Printer size={18} />
                            </button>
                            <PDFDownloadLink
                                document={<EliteProPDF data={reportData} />}
                                fileName={`Plan_Elite_${reportData.athleteName.replace(/\s+/g, '_')}.pdf`}
                            >
                                {({ loading }) => (
                                    <button className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center">
                                        {loading ? <span className="text-[10px] font-bold">...</span> : <Download size={18} />}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-4 gap-4 mt-8">
                        {[
                            { icon: Calendar, label: t('total_weeks') || 'Semaines', value: reportData.planSummary.totalWeeks, color: 'emerald' },
                            { icon: Clock, label: t('hours_per_week') || 'Heures/Sem', value: reportData.planSummary.hoursPerWeek, color: 'sky' },
                            { icon: Activity, label: t('sessions_per_week') || 'Séances/Sem', value: reportData.planSummary.sessionsPerWeek, color: 'amber' },
                            { icon: Brain, label: t('coach_style_short') || 'Style Coach', value: reportData.coachStyle.split(' ')[0], color: 'violet' }
                        ].map((stat, idx) => (
                            <div key={idx} className={cn("bg-slate-950/50 border border-slate-800 rounded-2xl p-4")}>
                                <stat.icon className={`text-${stat.color}-400 mb-2`} size={20} />
                                <div className="text-2xl font-black text-white">{stat.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/50">
                {[
                    { id: 'overview', icon: Target, label: t('overview') || 'Vue d\'ensemble' },
                    { id: 'macrocycle', icon: BarChart3, label: t('macrocycle') || 'Macrocycle' },
                    { id: 'details', icon: Dumbbell, label: t('details') || 'Détails' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'overview' | 'macrocycle' | 'details')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                            activeTab === tab.id
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-500 hover:text-white"
                        )}
                    >
                        <tab.icon size={16} />
                        <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Key Workouts */}
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <Zap className="text-amber-400" size={20} />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                {t('key_workouts') || 'Séances Clés du Programme'}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {reportData.planSummary.keyWorkouts.map((workout, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors">
                                    <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={16} />
                                    <span className="text-sm text-slate-300 font-medium">{workout}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nutri + Recovery + Medical Sections */}
                    <NutriSection recommendations={reportData.nutriRecommendations} />
                    {reportData.recoveryProtocols && reportData.recoveryProtocols.length > 0 && (
                        <RecoverySection protocols={reportData.recoveryProtocols} />
                    )}
                    <MedicalSection alerts={reportData.medicalAlerts} />
                </div>
            )}

            {activeTab === 'macrocycle' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 className="text-indigo-400" size={20} />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                {t('macrocycle_view') || 'Planification Macrocycle'}
                            </h3>
                        </div>
                        <MacrocycleChart macrocycle={reportData.macrocycle} />
                    </div>
                </div>
            )}

            {activeTab === 'details' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportData.detailedSessions?.map((session, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setSelectedSession(session); setShowSessionModal(true); }}
                                className="group relative bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                            >
                                {/* Quick Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditSession(session); }}
                                        className="p-1.5 bg-slate-800 hover:bg-indigo-500 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-indigo-500"
                                        title={t('edit') || "Modifier"}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(t('confirmDelete') || "Supprimer cette séance ?")) {
                                                setReportData(prev => ({
                                                    ...prev,
                                                    detailedSessions: prev.detailedSessions?.filter(s => s.id !== session.id)
                                                }));
                                            }
                                        }}
                                        className="p-1.5 bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-rose-500"
                                        title={t('delete') || "Supprimer"}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={cn(
                                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                                        session.intensity === 'very-high' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                                            session.intensity === 'high' ? 'text-orange-400 border-orange-500/20 bg-orange-500/10' :
                                                session.intensity === 'moderate' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                                                    'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                                    )}>
                                        {session.type}
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-400 transition-colors">
                                        TSS {session.tss}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                                    {session.title}
                                </h3>

                                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-300">
                                        <Calendar size={14} className="text-emerald-400" />
                                        {session.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-indigo-400" />
                                        {session.duration} min
                                    </div>
                                    {session.coachNotes && (
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Info size={14} />
                                            Note du coach
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={16} className="text-indigo-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showSessionModal && selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSessionModal(false)}>
                    <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl">
                        <SessionDetailCard
                            {...selectedSession}
                            onClose={() => setShowSessionModal(false)}
                            onEdit={() => handleEditWithClose(selectedSession)}
                            onDelete={() => handleDeleteWithClose(selectedSession.id!)}
                        />
                    </div>
                </div>
            )}

            {/* Validation Workflow Footer */}
            <div className="mt-8">
                {onBack && planStatus === 'draft' && (
                    <div className="mb-4 flex justify-start">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800"
                        >
                            <ChevronRight size={16} className="rotate-180" />
                            {t('back') || 'Retour'}
                        </button>
                    </div>
                )}

                <PlanValidationWorkflow
                    status={planStatus}
                    onStatusChange={setPlanStatus}
                    onApply={() => setShowExportModal(true)}
                />
            </div>

            <SessionBuilderModal
                isOpen={showEditModal}
                initialSession={editingSession}
                onClose={() => setShowEditModal(false)}
                onSave={handleSaveSession}
            />

            {showExportModal && (
                <PlanExportModal
                    onClose={() => setShowExportModal(false)}
                    totalWeeks={reportData.planSummary.totalWeeks}
                    onExport={(scope, format) => {
                        // In a real app, this would trigger backend logic or PDF generation
                        if (onApplyPlan) onApplyPlan();
                        alert(`Plan exporté (${scope} / ${format}) avec succès !`);
                        setShowExportModal(false);
                    }}
                />
            )}
        </div>
    );
}

// Export mock data for testing
export const mockReportData: EliteTrainingReportData = {
    athleteName: 'Jean Dupont',
    eventName: 'Marathon de Paris',
    eventDate: '6 Avril 2026',
    generatedDate: new Date().toISOString(),
    coachStyle: 'Directif et Scientifique',
    planSummary: {
        totalWeeks: 16,
        hoursPerWeek: 8,
        sessionsPerWeek: 5,
        keyWorkouts: [
            'Sortie longue progressive (2h30)',
            'Tempo Run Zone 3 (45min)',
            'Intervalles 6x1000m',
            'Récupération active (45min)',
            'Séance spécifique allure marathon'
        ]
    },
    macrocycle: {
        totalWeeks: 16,
        phases: [
            { name: 'Base', duration: 4, color: 'bg-sky-500', description: 'Construction aérobie' },
            { name: 'Build', duration: 6, color: 'bg-amber-500', description: 'Montée en charge' },
            { name: 'Peak', duration: 4, color: 'bg-rose-500', description: 'Affûtage' },
            { name: 'Race', duration: 2, color: 'bg-emerald-500', description: 'Compétition' }
        ],
        weeks: [
            // Base Phase
            { weekNumber: 1, phase: 'base', weekType: 'normal', volumeHours: 5, intensity: 'low', focusSession: 'Endurance fondamentale', tssTarget: 250 },
            { weekNumber: 2, phase: 'base', weekType: 'normal', volumeHours: 6, intensity: 'low', focusSession: 'Sortie longue', tssTarget: 300 },
            { weekNumber: 3, phase: 'base', weekType: 'overload', volumeHours: 7, intensity: 'moderate', focusSession: 'Fartlek', tssTarget: 380 },
            { weekNumber: 4, phase: 'base', weekType: 'recovery', volumeHours: 4, intensity: 'low', focusSession: 'Récupération', tssTarget: 200 },
            // Build Phase
            { weekNumber: 5, phase: 'build', weekType: 'normal', volumeHours: 7, intensity: 'moderate', focusSession: 'Tempo', tssTarget: 400 },
            { weekNumber: 6, phase: 'build', weekType: 'normal', volumeHours: 8, intensity: 'moderate', focusSession: 'Intervalles', tssTarget: 450 },
            { weekNumber: 7, phase: 'build', weekType: 'overload', volumeHours: 9, intensity: 'high', focusSession: 'Sortie longue allure marathon', tssTarget: 520 },
            { weekNumber: 8, phase: 'build', weekType: 'recovery', volumeHours: 5, intensity: 'low', focusSession: 'Régénération', tssTarget: 280 },
            { weekNumber: 9, phase: 'build', weekType: 'overload', volumeHours: 10, intensity: 'high', focusSession: '20km allure cible', tssTarget: 580 },
            { weekNumber: 10, phase: 'build', weekType: 'recovery', volumeHours: 6, intensity: 'moderate', focusSession: 'Récupération active', tssTarget: 320 },
            // Peak Phase
            { weekNumber: 11, phase: 'peak', weekType: 'normal', volumeHours: 9, intensity: 'very-high', focusSession: 'Seuil + allure marathon', tssTarget: 500 },
            { weekNumber: 12, phase: 'peak', weekType: 'overload', volumeHours: 8, intensity: 'very-high', focusSession: 'Simulation semi', tssTarget: 480 },
            { weekNumber: 13, phase: 'peak', weekType: 'normal', volumeHours: 6, intensity: 'high', focusSession: 'Affûtage', tssTarget: 350 },
            { weekNumber: 14, phase: 'peak', weekType: 'recovery', volumeHours: 4, intensity: 'low', focusSession: 'Taper', tssTarget: 200 },
            // Race Phase
            { weekNumber: 15, phase: 'race', weekType: 'recovery', volumeHours: 3, intensity: 'low', focusSession: 'Activation pré-course', tssTarget: 150 },
            { weekNumber: 16, phase: 'race', weekType: 'normal', volumeHours: 4, intensity: 'moderate', focusSession: '🏁 MARATHON', tssTarget: 300 }
        ]
    },
    nutriRecommendations: [
        { type: 'pre', timing: '3h avant entraînement', recommendation: 'Petit-déjeuner riche en glucides complexes avec protéines légères', products: ['Flocons avoine', 'Banane', 'Œufs'], priority: 'essential' },
        { type: 'during', timing: 'Pendant > 90min', recommendation: 'Apport glucidique de 60-90g/h sous forme liquide ou gel', products: ['Gel énergétique', 'Boisson isotonique'], priority: 'essential' },
        { type: 'post', timing: '30min après', recommendation: 'Fenêtre anabolique - ratio 3:1 glucides/protéines', products: ['Shake protéiné', 'Fruits'], priority: 'recommended' },
        { type: 'daily', timing: 'Quotidien', recommendation: 'Hydratation 40ml/kg + électrolytes si forte transpiration', priority: 'essential' }
    ],
    medicalAlerts: [
        { severity: 'warning', category: 'Prévention', message: 'Surveiller les signes de surentraînement lors des semaines de surcharge (S3, S7, S9, S12)', action: 'Réduire de 20% si fatigue persistante > 3 jours', triageLevel: 'orange' },
        { severity: 'info', category: 'Récupération', message: 'Privilégier 8h de sommeil minimum pendant les phases Build et Peak', action: undefined, triageLevel: 'green' },
        { severity: 'critical', category: 'Alerte', message: 'Antécédent tendinite achilléenne signalé - progression volume prudente', action: 'Échauffement prolongé + étirements excentiques quotidiens', triageLevel: 'red' }
    ],
    recoveryProtocols: [
        // Sleep - Daily
        { type: 'sleep', timing: 'Coucher: 22h30 - Réveil: 6h30', duration: 480, priority: 'essential', phase: 'daily', description: 'Maintenir un rythme circadien régulier. Chambre à 18°C, pas d\'écran 1h avant.', targetHours: 8 },
        // Post-Intensity Recovery
        { type: 'ice_bath', timing: 'Dans les 30min post-entraînement intensif', duration: 10, priority: 'recommended', phase: 'post-intensity', description: 'Immersion eau froide (10-15°C) pour réduire l\'inflammation musculaire.' },
        { type: 'stretching', timing: '2h après la séance', duration: 15, priority: 'essential', phase: 'post-intensity', description: 'Étirements statiques des membres inférieurs (30s par groupe musculaire).' },
        { type: 'compression', timing: 'Soir après séance longue', duration: 30, priority: 'recommended', phase: 'post-intensity', description: 'Port de manchons de compression pour favoriser le retour veineux.' },
        // Rest Day Protocols
        { type: 'massage', timing: 'Jour de repos (S4, S8, S10, S14)', duration: 45, priority: 'recommended', phase: 'rest-day', description: 'Massage sportif pour dénouer les tensions et améliorer la récupération.' },
        { type: 'stretching', timing: 'Matin jour de repos', duration: 20, priority: 'optional', phase: 'rest-day', description: 'Routine yoga légère ou stretching dynamique pour maintenir la mobilité.' },
        // Pre-Competition
        { type: 'massage', timing: 'J-3 avant course', duration: 30, priority: 'essential', phase: 'pre-competition', description: 'Massage léger (effleurage) pour détendre sans fatiguer les muscles.' },
        { type: 'hydration', timing: 'J-2 à J-1', duration: 0, priority: 'essential', phase: 'pre-competition', description: 'Hyperhydratation progressive (3L/jour) avec électrolytes.' }
    ],
    weeklySchedule: {
        'Lun': { activity: 'Repos', duration: 0 },
        'Mar': { activity: 'Tempo', duration: 50 },
        'Mer': { activity: 'Récup', duration: 40 },
        'Jeu': { activity: 'Intervalles', duration: 55 },
        'Ven': { activity: 'Renfo', duration: 30 },
        'Sam': { activity: 'Sortie Longue', duration: 120 },
        'Dim': { activity: 'Actif/Off', duration: 30 }
    }
};
