import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "SWA — Where Self Meets Its True Essence | Wellness & Mental Health Healing", 
  description = "Science-backed wellbeing programs for organizations, institutions and communities in Ahmedabad, Gujarat, India, and worldwide. Specializing in mental health healing and holistic wellness.", 
  keywords = "wellness, mental health healing, mental health support, corporate wellbeing, holistic wellness, emotional health, wellbeing programs, Ahmedabad, Gujarat, India, SWA Wellbeing",
  type = "website",
  url = "https://swaspaces.com/"
}) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />

      {/* Twitter tags */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEO;
