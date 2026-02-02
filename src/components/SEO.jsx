import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ title, description, image, url, type = 'website', keywords = [], jsonLd = null }) => {
    const siteTitle = 'Vynn';
    const defaultDescription = 'Your identity, beautifully connected. The comprehensive platform to consolidate your links, showcase your gaming stats, and grow your community.';
    const defaultImage = 'https://vynn.me/og-main.png';
    const defaultUrl = 'https://vynn.me';

    // Merge keywords with defaults
    const defaultKeywords = ['Link in bio', 'Discord Server List', 'Digital Identity', 'Profile Page', 'Game Servers', 'Community Finder'];
    const allKeywords = [...new Set([...defaultKeywords, ...keywords])].join(', ');

    const metaTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Your identity, beautifully connected.`;
    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;
    const metaUrl = url || defaultUrl;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={allKeywords} />
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={metaUrl} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {/* JSON-LD Structured Data for AI/Search */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string,
    keywords: PropTypes.arrayOf(PropTypes.string),
    jsonLd: PropTypes.object
};

export default SEO;
