import React, { lazy, Suspense } from 'react';

import BrowserOnly from '@docusaurus/BrowserOnly';

type Loader = () => Promise<{ default: React.ComponentType }>;

const lazyCache = new Map<Loader, React.LazyExoticComponent<React.ComponentType>>();

function getLazy(load: Loader) {
  let component = lazyCache.get(load);
  if (!component) {
    component = lazy(load);
    lazyCache.set(load, component);
  }
  return component;
}

const skeleton = (
  <div
    style={{
      border: '1px solid var(--ifm-color-emphasis-300)',
      borderRadius: 8,
      padding: 24,
      background: 'var(--ifm-background-surface-color)',
      minHeight: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          height: 14,
          width: '40%',
          borderRadius: 4,
          background: 'var(--ifm-color-emphasis-200)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: 36,
          width: '100%',
          borderRadius: 6,
          background: 'var(--ifm-color-emphasis-200)',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: '0.2s',
        }}
      />
      <div
        style={{
          height: 14,
          width: '60%',
          borderRadius: 4,
          background: 'var(--ifm-color-emphasis-200)',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: '0.4s',
        }}
      />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  </div>
);

interface LazyDemoProps {
  load: Loader;
  fallback?: React.ReactNode;
}

export default function LazyDemo({ load, fallback }: LazyDemoProps) {
  const fb = fallback ?? skeleton;
  return (
    <BrowserOnly fallback={fb}>
      {() => {
        const Component = getLazy(load);
        return (
          <Suspense fallback={fb}>
            <Component />
          </Suspense>
        );
      }}
    </BrowserOnly>
  );
}
