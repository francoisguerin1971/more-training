
import { StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf' },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 700 }, // Bold
    ]
});

export const pdfStyles = StyleSheet.create({
    page: {
        fontFamily: 'Inter',
        backgroundColor: '#0f172a', // Slate 950
        color: '#f8fafc', // Slate 50
        padding: 40,
        position: 'relative'
    },
    // Header
    header: {
        marginBottom: 40,
        borderBottom: '1px solid #334155',
        paddingBottom: 20
    },
    title: {
        fontSize: 32,
        fontWeight: 700,
        color: '#ffffff',
        textTransform: 'uppercase',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 4
    },
    tag: {
        fontSize: 10,
        padding: '4 8',
        backgroundColor: '#6366f1',
        borderRadius: 4,
        alignSelf: 'flex-start',
        color: 'white',
        marginTop: 10
    },

    // Sections
    section: {
        marginBottom: 30
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#818cf8', // Indigo 400
        marginBottom: 15,
        textTransform: 'uppercase'
    },

    // Grid / Stats
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    statBox: {
        backgroundColor: '#1e293b',
        padding: 15,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: 'center'
    },
    statValue: {
        fontSize: 24,
        fontWeight: 700,
        color: '#ffffff',
        marginBottom: 4
    },
    statLabel: {
        fontSize: 10,
        color: '#94a3b8',
        textTransform: 'uppercase'
    },

    // Table
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 20
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#334155',
        alignItems: 'center',
        height: 30
    },
    tableHeader: {
        backgroundColor: '#1e293b',
        color: '#94a3b8',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase'
    },
    tableCell: {
        flex: 1,
        padding: 5,
        fontSize: 10,
        color: '#cbd5e1'
    },

    // Cards (Recovery/Medical)
    card: {
        backgroundColor: '#1e293b',
        padding: 12,
        borderRadius: 6,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#6366f1'
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: 'white',
        marginBottom: 4
    },
    cardText: {
        fontSize: 10,
        color: '#cbd5e1',
        lineHeight: 1.4
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: '1px solid #334155',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    footerText: {
        fontSize: 8,
        color: '#64748b'
    }
});
