/**
 * Special character constants used in JSONPath expressions
 * @see https://goessner.net/articles/JsonPath
 */
export enum JSONPath {
  /**
   * Root node of the data (`$`)
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Root = '$',
  /**
   * Parent node of the current node (`_`)
   * @note This is not a official JSONPath syntax, but it is used in some implementations.
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Parent = '_',
  /**
   * Currently processing node (`@`)
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Current = '@',
  /**
   * Child node access operator (`.`)
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Child = '.',
  /**
   * Filter condition operator (`#`)
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Filter = '#',
}
