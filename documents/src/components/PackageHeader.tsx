interface PackageHeaderProps {
  name: string;
  description?: string;
  npm?: boolean;
}

export default function PackageHeader({
  name,
  description,
  npm = true,
}: PackageHeaderProps) {
  return (
    <div className="package-header">
      {description && <p>{description}</p>}
      <div className="package-header__badges">
        {npm && (
          <>
            <a
              href={`https://www.npmjs.com/package/${name}`}
              target="_blank"
              rel="noopener noreferrer">
              <img
                src={`https://img.shields.io/npm/v/${name}?style=flat-square`}
                alt={`${name} npm version`}
              />
            </a>
            <img
              src={`https://img.shields.io/npm/l/${name}?style=flat-square`}
              alt="license"
            />
          </>
        )}
      </div>
      <pre className="package-header__install">
        <code>yarn add {name}</code>
      </pre>
    </div>
  );
}
