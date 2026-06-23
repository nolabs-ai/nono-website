export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Always Further",
    url: "https://alwaysfurther.ai",
    logo: "https://nono.sh/logo.png",
    sameAs: [
      "https://github.com/nolabs-ai",
      "https://x.com/alwaysfurtherAI",
      "https://bsky.app/profile/alwaysfurther.ai",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
