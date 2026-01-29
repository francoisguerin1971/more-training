
import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { EliteTrainingReportData } from '../EliteTrainingReport';
import { pdfStyles as styles } from './PDFStyles';

interface EliteProPDFProps {
    data: EliteTrainingReportData;
}

export const EliteProPDF = ({ data }: EliteProPDFProps) => {
    // Helper to format date
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <Document>
            {/* PAGE 1: OVERVIEW */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.subtitle}>Plan d'Entraînement Élite</Text>
                    <Text style={styles.title}>{data.athleteName}</Text>
                    <Text style={styles.subtitle}>Objectif: {data.eventName} • {data.eventDate}</Text>
                    <View style={styles.tag}>
                        <Text>{data.coachStyle}</Text>
                    </View>
                </View>

                {/* Key Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{data.planSummary.totalWeeks}</Text>
                        <Text style={styles.statLabel}>Semaines</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{data.planSummary.hoursPerWeek}h</Text>
                        <Text style={styles.statLabel}>Volume / Sem</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{data.planSummary.sessionsPerWeek}</Text>
                        <Text style={styles.statLabel}>Séances / Sem</Text>
                    </View>
                </View>

                {/* Macrocycle Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Structure du Macrocycle</Text>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.tableHeader]}>Phase</Text>
                            <Text style={[styles.tableCell, styles.tableHeader]}>Semaine</Text>
                            <Text style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>Focus</Text>
                            <Text style={[styles.tableCell, styles.tableHeader]}>Vol (h)</Text>
                        </View>
                        {data.macrocycle.weeks.slice(0, 15).map((week, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{week.phase}</Text>
                                <Text style={styles.tableCell}>{week.weekNumber}</Text>
                                <Text style={[styles.tableCell, { flex: 2 }]}>{week.focusSession}</Text>
                                <Text style={styles.tableCell}>{week.volumeHours}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Medical Alerts (High Priority) */}
                {data.medicalAlerts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Vigilance Médicale</Text>
                        {data.medicalAlerts.map((alert, idx) => (
                            <View key={idx} style={[styles.card, { borderLeftColor: alert.triageLevel === 'red' ? '#ef4444' : alert.triageLevel === 'orange' ? '#f97316' : '#22c55e' }]}>
                                <Text style={styles.cardTitle}>{alert.category}</Text>
                                <Text style={styles.cardText}>{alert.message}</Text>
                                {alert.action && <Text style={[styles.cardText, { marginTop: 4, fontStyle: 'italic', color: '#94a3b8' }]}>Action: {alert.action}</Text>}
                            </View>
                        ))}
                    </View>
                )}
            </Page>

            {/* PAGE 2: RECOVERY & NUTRITION */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Récupération & Nutrition</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Protocoles de Récupération</Text>
                    {data.recoveryProtocols?.map((proto, idx) => (
                        <View key={idx} style={styles.card}>
                            <Text style={styles.cardTitle}>{proto.type.toUpperCase()} • {proto.priority}</Text>
                            <Text style={styles.cardText}>{proto.description}</Text>
                            <Text style={[styles.cardText, { marginTop: 4, color: '#94a3b8' }]}>Timing: {proto.timing}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stratégie Nutritionnelle</Text>
                    {data.nutriRecommendations.map((rec, idx) => (
                        <View key={idx} style={[styles.card, { borderLeftColor: '#f59e0b' }]}>
                            <Text style={styles.cardTitle}>{rec.type.toUpperCase()}</Text>
                            <Text style={styles.cardText}>{rec.recommendation}</Text>
                            <Text style={[styles.cardText, { marginTop: 4, color: '#94a3b8' }]}>{rec.products?.join(', ')}</Text>
                        </View>
                    ))}
                </View>
            </Page>

            {/* PAGES 3+: DETAILED SESSIONS */}
            {data.detailedSessions?.map((session, index) => (
                <Page key={index} size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.subtitle}>Séance {index + 1}</Text>
                        <Text style={styles.title}>{session.title}</Text>
                        <View style={[styles.tag, { backgroundColor: session.intensity === 'very-high' ? '#ef4444' : session.intensity === 'high' ? '#f59e0b' : '#10b981' }]}>
                            <Text>{session.type} • {session.duration} min • TSS {session.tss}</Text>
                        </View>
                    </View>

                    {/* Warmup */}
                    {session.warmup && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Échauffement ({session.warmup.duration} min)</Text>
                            <Text style={[styles.cardText, { marginBottom: 10 }]}>{session.warmup.description}</Text>

                            {/* Exercises Grid */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {session.warmup.exercises?.map((ex, i) => (
                                    <View key={i} style={{ width: '48%', backgroundColor: '#1e293b', padding: 8, borderRadius: 4 }}>
                                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{ex.name}</Text>
                                        <Text style={{ color: '#94a3b8', fontSize: 8 }}>{ex.duration}</Text>
                                        {/* Sketch */}
                                        {ex.sketchUrl && (
                                            <Image
                                                src={ex.sketchUrl}
                                                style={{ width: '100%', height: 60, objectFit: 'contain', marginTop: 5, backgroundColor: 'white', borderRadius: 4 }}
                                            />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Main Set */}
                    {session.mainSet && session.mainSet.map((block, bIdx) => (
                        <View key={bIdx} style={styles.section}>
                            <Text style={styles.sectionTitle}>Corps de Séance ({block.duration} min)</Text>
                            <View style={[styles.card, { borderLeftColor: '#f97316' }]}>
                                <Text style={styles.cardText}>{block.description}</Text>

                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                                    {block.exercises?.map((ex, i) => (
                                        <View key={i} style={{ width: '48%', backgroundColor: '#0f172a', padding: 8, borderRadius: 4 }}>
                                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{ex.name}</Text>
                                            <Text style={{ color: '#94a3b8', fontSize: 8 }}>{ex.duration}</Text>
                                            {ex.sketchUrl && (
                                                <Image
                                                    src={ex.sketchUrl}
                                                    style={{ width: '100%', height: 80, objectFit: 'contain', marginTop: 5, backgroundColor: 'white', borderRadius: 4 }}
                                                />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Cooldown */}
                    {session.cooldown && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Retour au Calme ({session.cooldown.duration} min)</Text>
                            <Text style={[styles.cardText, { marginBottom: 10 }]}>{session.cooldown.description}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {session.cooldown.exercises?.map((ex, i) => (
                                    <View key={i} style={{ width: '48%', backgroundColor: '#1e293b', padding: 8, borderRadius: 4 }}>
                                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{ex.name}</Text>
                                        {ex.sketchUrl && (
                                            <Image
                                                src={ex.sketchUrl}
                                                style={{ width: '100%', height: 60, objectFit: 'contain', marginTop: 5, backgroundColor: 'white', borderRadius: 4 }}
                                            />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Coach Notes */}
                    {session.coachNotes && (
                        <View style={[styles.card, { backgroundColor: '#312e81', marginTop: 20 }]}>
                            <Text style={[styles.cardTitle, { color: '#a5b4fc' }]}>NOTE DU COACH</Text>
                            <Text style={{ color: '#e0e7ff', fontSize: 10, fontStyle: 'italic' }}>"{session.coachNotes}"</Text>
                        </View>
                    )}
                </Page>
            ))}
        </Document>
    );
};
