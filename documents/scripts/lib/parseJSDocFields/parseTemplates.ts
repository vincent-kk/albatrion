import type { TemplateInfo } from '../types';

/** Parse @template tags from JSDoc. */
export function parseTemplates(jsdoc: string): TemplateInfo[] {
  const templates: TemplateInfo[] = [];
  const templateRegex = /@template\s+(\w+)\s*-?\s*([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/|\n\s*\*\s*\n)/g;

  let match;
  while ((match = templateRegex.exec(jsdoc)) !== null) {
    const name = match[1].trim();
    const description = match[2].trim()
      .split('\n')
      .map(l => l.replace(/^\s*\*\s?/, '').trim())
      .join(' ')
      .trim();
    templates.push({ name, description });
  }

  return templates;
}
