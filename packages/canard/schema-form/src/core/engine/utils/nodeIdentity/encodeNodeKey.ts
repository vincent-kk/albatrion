/** Encode the path/kind pair without a general-purpose JSON serialization pass. */
export const encodeNodeKey = (path: string, kind: string): string => {
  const escaped = path.replace(
    // eslint-disable-next-line no-control-regex -- JSON strings must escape every control code point.
    /[\uD800-\uDBFF][\uDC00-\uDFFF]|["\\\u0000-\u001f\uD800-\uDFFF]/g,
    (part) => {
      if (part.length === 2) return part;
      switch (part) {
        case '"':
          return '\\"';
        case '\\':
          return '\\\\';
        case '\b':
          return '\\b';
        case '\f':
          return '\\f';
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '\t':
          return '\\t';
        default:
          return '\\u' + part.charCodeAt(0).toString(16).padStart(4, '0');
      }
    },
  );
  return '["' + escaped + '","' + kind + '"]';
};
