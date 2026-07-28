export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Always Further",
    url: "https://nolabs.ai",
    logo: "https://nono.sh/logo.png",
    sameAs: [
      "https://github.com/nolabs-ai",
      "https://x.com/nolabs_ai",
      "https://bsky.app/profile/nolabs.ai",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
