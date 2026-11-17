import type { CSSProperties, ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

/** Shared field metadata for registered presentation parts. */
interface PartRendererBaseProps {
  /** Source node owned by the binding. */
  node: FieldNode;
  /** Current canonical field address. */
  path: FieldNode['path'];
  /** Field key or array index. */
  name: FieldNode['name'];
  /** Current field schema. */
  jsonSchema: FieldNode['jsonSchema'];
  /** Display requirement, independent of validation. */
  required: boolean;
  /** Styles applied by the renderer to its root. */
  style?: CSSProperties;
  /** Class applied by the renderer to its root. */
  className?: string;
  /** Explicit caller-owned presentation props. */
  [alt: string]: any;
}

/** A registered label owns its root and applies the supplied accessibility addresses. */
export interface LabelRendererProps extends PartRendererBaseProps {
  /** Input address; undefined deliberately omits the association. */
  htmlFor?: string;
  /** Title address used by inputs with aria-labelledby. */
  id?: string;
  /** Explicit label content, defaulting to the field key or array index. */
  children: ReactNode;
}

/** A registered error root displays only the explicitly supplied message. */
export interface ErrorMessageRendererProps extends PartRendererBaseProps {
  /** Formatted content; absence does not imply a default message. */
  children?: ReactNode;
}

/**
 * Render children exactly once, unconditionally in the same commit.
 * Changing the element or component path to children replaces the input with the node's current value,
 * losing focus and any composition in progress.
 */
export interface InputRendererProps extends PartRendererBaseProps {
  /** Effective read-only state of the real input. */
  readOnly: boolean;
  /** Effective disabled state of the real input. */
  disabled: boolean;
  /** The real input's application context. */
  context: Dictionary;
  /** Bound real input whose ancestor path determines its mounted lifetime. */
  children: ReactNode;
}
