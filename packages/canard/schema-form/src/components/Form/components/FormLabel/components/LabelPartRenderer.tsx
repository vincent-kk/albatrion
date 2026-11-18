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
  id,
}: FieldRendererProps) => {
  const resolvedPath =
    typeof htmlFor === 'string' &&
    htmlFor !== node.path &&
    node.rootNode.findNodes(htmlFor).length === 1
      ? node.path
      : htmlFor;
  return (
    <Label
      context={context}
      style={style}
      className={className}
      children={children}
      htmlFor={resolvedPath}
      id={resolvedPath === htmlFor ? id : 'label:' + resolvedPath}
    />
  );
};
