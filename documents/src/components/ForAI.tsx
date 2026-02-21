import type { ReactNode } from 'react';

interface ForAIProps {
  children: ReactNode;
}

/**
 * AI Agent Reference section.
 * - Human readers: rendered as a collapsed <details> block.
 * - AI agents: docusaurus-plugin-llms includes <details> content in llms.txt.
 */
export default function ForAI({ children }: ForAIProps) {
  return (
    <details className="for-ai-section">
      <summary>
        <strong>AI Agent Reference</strong>
      </summary>
      <div className="for-ai-content">{children}</div>
    </details>
  );
}
