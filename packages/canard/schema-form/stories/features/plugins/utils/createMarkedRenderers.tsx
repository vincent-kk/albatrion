import type { ComponentType } from 'react';

import type { FieldRendererProps, LabelRendererProps, ErrorMessageRendererProps } from '../../../../src';

/** Consumer renderers keyed by slot; each draws data-renderer="<source>-<slot>". */
export interface MarkedRenderers {
  /** Group renderer retains the bound input. */
  group: ComponentType<FieldRendererProps>;
  /** Label renderer owns its root. */
  label: ComponentType<LabelRendererProps>;
  /** Error renderer displays the supplied message. */
  error: ComponentType<ErrorMessageRendererProps>;
}

/**
 * Build consumer renderers that mark which source drew them.
 * @param source - Marker prefix, such as "form" or "provider".
 * @returns The group, label, and error renderers; the group still draws the field's Input.
 */
export const createMarkedRenderers = (source: string): MarkedRenderers => ({
  group: ({ Input, path, name }) => <div data-renderer={`${source}-group`} data-field={path}><span>{name}</span><Input /></div>,
  label: ({ children, htmlFor, id }) => <label data-renderer={`${source}-label`} htmlFor={htmlFor} id={id}>{children}</label>,
  error: ({ children }) => <em data-renderer={`${source}-error`}>{children}</em>,
});
