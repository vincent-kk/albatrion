import type { FieldRendererProps } from '@/schema-form/types';

/** Forward only the standalone label's explicit override channel and its own context. */
export const LabelPartRenderer = ({
  Label,
  node,
  context,
  style,
  className,
  children,
  htmlFor,
  labelId,
}: FieldRendererProps) => {
  const resolvedPath =
    typeof htmlFor === 'string' && node.rootNode.findNodes(htmlFor).length === 1
      ? labelId.slice('label:'.length)
      : htmlFor;
  return (
    <Label
      context={context}
      style={style}
      className={className}
      children={children}
      htmlFor={resolvedPath}
      id={htmlFor === undefined ? undefined : labelId}
    />
  );
};
