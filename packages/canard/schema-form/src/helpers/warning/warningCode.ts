export const SCHEMA_FORM_WARNING = 'SCHEMA_FORM_WARNING';

// Warning codes are exported already namespaced under SCHEMA_FORM_WARNING so
// call sites pass the constant directly — mirroring how the error classes fix
// their prefix in the constructor instead of composing it at each call site.
export const ALL_OF_KEYWORD_IGNORED_FOR_FORM =
  `${SCHEMA_FORM_WARNING}.ALL_OF_KEYWORD_IGNORED_FOR_FORM` as const;
export const NESTED_COMPOSITION_IGNORED_FOR_FORM =
  `${SCHEMA_FORM_WARNING}.NESTED_COMPOSITION_IGNORED_FOR_FORM` as const;
export const NULLABLE_ONE_OF_NULL_UNREACHABLE =
  `${SCHEMA_FORM_WARNING}.NULLABLE_ONE_OF_NULL_UNREACHABLE` as const;
export const NULL_BRANCH_IGNORED_FOR_FORM =
  `${SCHEMA_FORM_WARNING}.NULL_BRANCH_IGNORED_FOR_FORM` as const;
export const VIRTUALIZATION_DISABLED_FOR_FORM =
  `${SCHEMA_FORM_WARNING}.VIRTUALIZATION_DISABLED_FOR_FORM` as const;
