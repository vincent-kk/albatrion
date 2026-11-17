import type { FieldRendererProps } from '@/schema-form/types';

/** Forward only the standalone label's explicit override channel and its own context. */
export const LabelPartRenderer = ({
  Label,
  context,
  style,
  className,
  children,
  htmlFor,
  id,
}: FieldRendererProps) => (
  <Label
    context={context}
    style={style}
    className={className}
    children={children}
    htmlFor={htmlFor}
    id={id}
  />
);
