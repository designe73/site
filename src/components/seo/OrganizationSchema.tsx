import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const OrganizationSchema = () => {
  const { settings } = useSiteSettings();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": settings?.site_name || "Senpieces",
    "url": "https://senpieces.sn",
    "logo": settings?.logo_url || "https://senpieces.sn/og-image.png",
    "description": settings?.seo_description || "Pièces détachées auto neuves et occasion au Sénégal",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dakar",
      "addressCountry": "SN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings?.contact_phone || "",
      "email": settings?.contact_email || "",
      "contactType": "customer service",
      "availableLanguage": ["French"]
    },
    "sameAs": []
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default OrganizationSchema;
