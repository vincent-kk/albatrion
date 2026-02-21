import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

const namespaces = [
  {
    ns: '@canard',
    description: 'JSON Schema-based form generation ecosystem for React',
    link: '/docs/canard/',
    count: 8,
  },
  {
    ns: '@lerx',
    description: 'React UI utility libraries',
    link: '/docs/lerx/',
    count: 1,
  },
  {
    ns: '@winglet',
    description: 'TypeScript utility libraries for common operations',
    link: '/docs/winglet/',
    count: 6,
  },
  {
    ns: '@slats',
    description: 'Developer tooling for Claude Code integration',
    link: '/docs/slats/',
    count: 1,
  },
];

export default function Home(): React.ReactElement {
  return (
    <Layout title="Home" description="Albatrion package documentation">
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>
            Albatrion
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              opacity: 0.7,
              margin: '0.75rem 0 0',
            }}
          >
            Technical documentation for the Albatrion monorepo packages.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {namespaces.map((pkg) => (
            <Link
              key={pkg.ns}
              to={pkg.link}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '1.5rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--ifm-font-family-monospace)',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  {pkg.ns}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    opacity: 0.5,
                  }}
                >
                  {pkg.count} {pkg.count === 1 ? 'package' : 'packages'}
                </span>
              </div>
              <p style={{ margin: 0, opacity: 0.75, fontSize: '0.9rem' }}>
                {pkg.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
