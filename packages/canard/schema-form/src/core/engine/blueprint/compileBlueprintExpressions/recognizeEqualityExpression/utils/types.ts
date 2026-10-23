import type { EqualityLiteral } from '../../../types/blueprint';

/** Closed token set; raw identifiers and member access never reach the parser. */
export type EqualityToken =
  | { readonly kind: 'reference' }
  | { readonly kind: 'literal'; readonly value: EqualityLiteral }
  | { readonly kind: '===' | '||' | '(' | ')' };

/** Precedence tree before its comparison-only shape has been proven. */
export type EqualityTree =
  | { readonly kind: 'reference' }
  | { readonly kind: 'literal'; readonly value: EqualityLiteral }
  | {
      readonly kind: '===' | '||';
      readonly left: EqualityTree;
      readonly right: EqualityTree;
    };

/** Literal decoding result with an exclusive source cursor. */
export interface EqualityLiteralRead {
  /** Decoded primitive, identical to the JavaScript literal's value. */
  readonly value: EqualityLiteral;
  /** First source position after the entire literal. */
  readonly end: number;
}
