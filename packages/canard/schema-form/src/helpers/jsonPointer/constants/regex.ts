/** Matches the escaped slash `~1` of a pointer segment; `replace`-only because of the `g` flag. */
export const ESCAPED_SLASH_REGEX = /~1/g;

/** Matches the escaped tilde `~0` of a pointer segment; `replace`-only because of the `g` flag. */
export const ESCAPED_TILDE_REGEX = /~0/g;

/** Matches a raw tilde in a pointer segment; `replace`-only because of the `g` flag. */
export const TILDE_REGEX = /~/g;

/** Matches a raw slash in a pointer segment; `replace`-only because of the `g` flag. */
export const SLASH_REGEX = /\//g;
