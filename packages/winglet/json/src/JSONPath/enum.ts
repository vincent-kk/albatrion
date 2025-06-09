/**
 * Special character constants used in JSONPath expressions
 * @see https://goessner.net/articles/JsonPath
 */
export const JSONPath = {
  /**
   * Root node of the data (`$`)
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Root: '$',
  /**
   * Currently processing node (`@`)
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Current: '@',
  /**
   * Child node access operator (`.`)
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Child: '.',
  /**
   * Filter condition operator (`#`)
   * @see https://goessner.net/articles/JsonPath/index.html#e2
   */
  Filter: '#',
} as const;

export type JSONPath = (typeof JSONPath)[keyof typeof JSONPath];
