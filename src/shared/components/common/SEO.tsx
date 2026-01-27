import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/shared/context/LanguageContext';

interface SEOProps {
    titleKey?: string;
    descriptionKey?: string;
    title?: string;
    description?: string;
    jsonLd?: object;
    type?: 'website' | 'article' | 'profile';
}

export function SEO({
    titleKey,
    descriptionKey,
    title,
    description,
    jsonLd,
    type = 'website'
}: SEOProps) {
    const { t } = useLanguage();

    const pageTitle = title || (titleKey ? t(titleKey) : t('brand'));
    const pageDescription = description || (descriptionKey ? t(descriptionKey) : t('seo_default_description'));

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />

            {/* Structured Data (JSON-LD) */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
}
