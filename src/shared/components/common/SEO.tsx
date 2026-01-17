import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/shared/context/LanguageContext';

interface SEOProps {
    titleKey?: string;
    descriptionKey?: string;
    keywords?: string[];
    internalLink?: string | null;
    preventIndexing?: boolean;
    schemaData?: any;
    canonicalPath?: string;
}

export function SEO({
    titleKey,
    descriptionKey,
    keywords = [],
    internalLink = null,
    preventIndexing = false,
    schemaData = null,
    canonicalPath = undefined
}: SEOProps) {
    const { t, language } = useLanguage();

    const siteName = "More Training";
    const title = titleKey ? `${t(titleKey)} | ${siteName}` : siteName;
    const description = descriptionKey ? t(descriptionKey) : t('seo_default_description');

    const baseUrl = "https://more-training.com"; // Placeholder, adjusted in production
    const canonicalUrl = canonicalPath ? `${baseUrl}${canonicalPath}` : undefined;

    // Compact keywords for maximum efficiency
    const baseKeywords = ["fitness", "training", "performance", "athlete", "coaching"];
    const combinedKeywords = [...new Set([...baseKeywords, ...keywords])].join(', ');

    const supportedLanguages = ['fr', 'en', 'es', 'it', 'de', 'ca'];

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={combinedKeywords} />

            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Multilingual SEO: hreflang */}
            {supportedLanguages.map(lang => (
                <link
                    key={lang}
                    rel="alternate"
                    hrefLang={lang}
                    href={`${baseUrl}/${lang}${canonicalPath || ''}`}
                />
            ))}
            <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${canonicalPath || ''}`} />

            {/* OpenGraph & Twitter cards */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl || baseUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            {/* AI Readiness: JSON-LD */}
            {schemaData && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            )}

            {/* Internal Link Injection (Link Juice / Semantic) */}
            {internalLink && (
                <link rel="related" href={internalLink} />
            )}

            {preventIndexing && (
                <meta name="robots" content="noindex, nofollow" />
            )}
        </Helmet>
    );
}
