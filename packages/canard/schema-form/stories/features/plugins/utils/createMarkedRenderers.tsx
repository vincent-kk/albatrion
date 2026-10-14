import type { RendererSlot } from '@aileron/schema-form-scenarios';
import type { ComponentType } from 'react';

import type { FieldRendererProps } from '../../../../src';

/** Consumer renderers keyed by slot; each draws data-renderer="<source>-<slot>". */
export type MarkedRenderers = Record<RendererSlot, ComponentType<FieldRendererProps>>;

/**
 * Build consumer renderers that mark which source drew them.
 * @param source - Marker prefix, such as "form" or "provider".
 * @returns The group, label, and error renderers; the group still draws the field's Input.
 */
export const createMarkedRenderers = (source: string): MarkedRenderers => ({
  group: ({ Input, path, name }) => <div data-renderer={`${source}-group`} data-field={path}><span>{name}</span><Input /></div>,
  label: ({ name, path }) => <label data-renderer={`${source}-label`} htmlFor={path}>{name}</label>,
  error: ({ errorVisible, errors }) =>
    errorVisible && errors?.length ? <em data-renderer={`${source}-error`}>{errors.map((issue) => issue.keyword).join(',')}</em> : null,
});
