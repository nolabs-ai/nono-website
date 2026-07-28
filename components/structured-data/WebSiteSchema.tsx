export default function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'nono',
    url: 'https://nono.sh',
    description:
      'OS-enforced capability sandbox for running untrusted AI agents. No escape hatch. Works with any AI agent.',
    publisher: {
      '@type': 'Organization',
      name: 'Always Further',
      url: 'https://nolabs.ai',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
