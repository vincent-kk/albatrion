import type { FieldRendererProps } from '../../../index';

/** A plugin authored as a module of named exports, registered through `import * as plugin`. */
export const FieldRenderer = ({ Input }: FieldRendererProps) => (
  <div data-owner="module-plugin">
    <Input />
  </div>
);
