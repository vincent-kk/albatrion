import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';

interface WingletReactPlaygroundProps {
  /** Initial TSX code for React component */
  code: string;
  /** NPM package dependencies */
  dependencies: Record<string, string>;
  /** Editor/preview height in pixels (default: 400) */
  height?: number;
}

export default function WingletReactPlayground({
  code,
  dependencies,
  height = 400,
}: WingletReactPlaygroundProps) {
  return (
    <SandpackProvider
      template="react-ts"
      theme="auto"
      files={{
        '/App.tsx': { code, active: true },
      }}
      customSetup={{
        dependencies,
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor
          showTabs={false}
          showLineNumbers
          style={{ height }}
        />
        <SandpackPreview
          showOpenInCodeSandbox={false}
          style={{ height }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
