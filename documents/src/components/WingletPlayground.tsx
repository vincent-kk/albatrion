import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';

/**
 * Bootstrap code that patches console.log to render output into the DOM,
 * then dynamically imports the user's playground code.
 */
const CONSOLE_BOOTSTRAP = `
const app = document.getElementById('app')!;
app.innerHTML = '';
Object.assign(app.style, {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '13.5px',
  padding: '12px 16px',
  lineHeight: '1.7',
  color: '#e0e0e0',
  backgroundColor: '#1e1e1e',
  height: '100vh',
  margin: '0',
  overflow: 'auto',
  boxSizing: 'border-box',
});
document.body.style.margin = '0';

const originalLog = console.log;
console.log = (...args: any[]) => {
  originalLog(...args);
  const formatted = args.map(arg => {
    if (arg === undefined) return 'undefined';
    if (arg === null) return 'null';
    if (typeof arg === 'object') {
      try { return JSON.stringify(arg, null, 2); } catch { return String(arg); }
    }
    return String(arg);
  }).join(' ');

  const line = document.createElement('div');
  Object.assign(line.style, {
    padding: '3px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  });
  line.textContent = formatted;
  app.appendChild(line);
};

import('./playground').catch(err => {
  const errDiv = document.createElement('div');
  errDiv.style.color = '#f44336';
  errDiv.textContent = 'Error: ' + String(err);
  app.appendChild(errDiv);
});
`.trim();

interface WingletPlaygroundProps {
  /** Initial TypeScript code with imports and console.log calls */
  code: string;
  /** NPM package dependencies, e.g. { "@winglet/common-utils": "0.10.0" } */
  dependencies: Record<string, string>;
  /** Editor height in pixels (default: 300) */
  height?: number;
}

export default function WingletPlayground({
  code,
  dependencies,
  height = 300,
}: WingletPlaygroundProps) {
  return (
    <SandpackProvider
      template="vanilla-ts"
      theme="auto"
      files={{
        '/index.ts': { code: CONSOLE_BOOTSTRAP, hidden: true },
        '/playground.ts': { code, active: true },
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
          showRefreshButton={false}
          style={{ height }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
