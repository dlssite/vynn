import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ title, description, image, url, type = 'website' }) => {
    const siteTitle = 'Vynn';
    const defaultDescription = 'The all-in-one platform for your digital identity. Create bio pages, short links, and more.';
    const defaultImage = 'https://vynn.io/logo.png'; // Replace with actual default image URL
    const defaultUrl = 'https://vynn.io'; // Replace with actual domain

    const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;
    const metaUrl = url || defaultUrl;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={metaUrl} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string,
};

export default SEO;
