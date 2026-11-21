/** Primitive JSON schema kind of a literal. Other inputs follow the caller's inference policy. */
export type LiteralPrimitiveKind<Value, Other> = Value extends string
  ? 'string'
  : Value extends number
    ? 'number'
    : Value extends boolean
      ? 'boolean'
      : Value extends null
        ? 'null'
        : Other;
