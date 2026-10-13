import { useChildNodeErrors, type FieldInputProps } from '../../../../src';

/**
 * An object input that draws its children through ChildNodeComponents and reports useChildNodeErrors as data attributes.
 * @param props - FieldInput props of an object node.
 * @returns The child components with the field order, showErrors, and per-child issue counts readable by a play.
 */
export function CardInput({ path, node, ChildNodeComponents }: FieldInputProps) {
  const { showErrors, errorMatrix } = useChildNodeErrors(node);
  return <div id={path} data-card-fields={ChildNodeComponents.map((Child) => Child.field).join(',')}
    data-show-errors={JSON.stringify(showErrors)} data-error-counts={JSON.stringify(errorMatrix.map((errors) => errors.length))}>
    {ChildNodeComponents.map((Child) => <Child key={Child.field} />)}
  </div>;
}
