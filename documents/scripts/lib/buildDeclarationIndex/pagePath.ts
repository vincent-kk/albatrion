/** `<category>/<name>`, or `<name>` for a page directly under the package directory. */
export function pagePath(category: string, name: string): string {
  return category ? `${category}/${name}` : name;
}
