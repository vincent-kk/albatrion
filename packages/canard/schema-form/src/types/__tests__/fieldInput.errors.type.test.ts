import { expectTypeOf, it } from 'vitest';

import type {
  ChildFieldProps,
  FieldInputProps,
  FieldInputPropsWithNode,
  FieldInputPropsWithSchema,
  InferFieldInputProps,
  OverridableFieldInputProps,
  UnknownFieldInputProps,
} from '../field/fieldInput';

/** Derived schema input receiving only binding-owned values. */
type SchemaProps = Partial<FieldInputPropsWithSchema<string>>;
/** Derived node input receiving only binding-owned values. */
type NodeProps = Partial<FieldInputPropsWithNode<string>>;

it('forbids error values on every direct input and override surface', () => {
  expectTypeOf<FieldInputProps['errors']>().toEqualTypeOf<undefined>();
  expectTypeOf<FieldInputProps['errorVisible']>().toEqualTypeOf<undefined>();
  expectTypeOf<UnknownFieldInputProps['errors']>().toEqualTypeOf<undefined>();
  expectTypeOf<
    UnknownFieldInputProps['errorVisible']
  >().toEqualTypeOf<undefined>();
  // @ts-expect-error errors belong to the error hook, including child overrides.
  expectTypeOf<{ errors: [] }>().toExtend<ChildFieldProps>();
  // @ts-expect-error visibility cannot be passed through the override channel.
  expectTypeOf<{ errorVisible: true }>().toExtend<OverridableFieldInputProps>();
});

it('retains the prohibition through derived input props', () => {
  // @ts-expect-error raw error entries are available only from the hook.
  expectTypeOf<FieldInputPropsWithSchema<string>['errors'][number]>();
  expectTypeOf<
    FieldInputPropsWithSchema<string>['errors']
  >().toEqualTypeOf<undefined>();
  expectTypeOf<
    FieldInputPropsWithNode<string>['errorVisible']
  >().toEqualTypeOf<undefined>();
  expectTypeOf<
    InferFieldInputProps<string>['errors']
  >().toEqualTypeOf<undefined>();
  expectTypeOf<
    InferFieldInputProps<unknown>['errors']
  >().toEqualTypeOf<undefined>();
  // @ts-expect-error derived props cannot carry errors either.
  expectTypeOf<{ errors: [] }>().toExtend<SchemaProps>();
  // @ts-expect-error derived props cannot carry visibility either.
  expectTypeOf<{ errorVisible: true }>().toExtend<NodeProps>();
});
