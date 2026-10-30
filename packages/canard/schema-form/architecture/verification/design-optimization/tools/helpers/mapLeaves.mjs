/** Map all scalar leaves of an object tree while retaining its shape; used to prebuild bulk payloads. */
export function mapLeaves(value, transform) {
  return value && typeof value === 'object'
    ? Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          mapLeaves(child, transform),
        ]),
      )
    : transform(value);
}
