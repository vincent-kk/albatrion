import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

/**
 * Creates a shallow copy of the given value.
 *
 * Performs shallow cloning of arrays and plain objects by creating new instances
 * with copied references to their elements/properties. Primitive values, functions,
 * and special objects (Date, Map, etc.) are returned as-is without copying.
 *
 * @template Type - Type of the value to be cloned
 * @param value - The value to create a shallow copy of
 * @returns A shallow copy of arrays and plain objects, or the original value for other types
 *
 * @example
 * Basic shallow cloning of objects:
 * ```typescript
 * import { shallowClone } from '@winglet/common-utils';
 *
 * // Simple object cloning
 * const original = {
 *   id: 1,
 *   name: 'John',
 *   email: 'john@example.com'
 * };
 *
 * const cloned = shallowClone(original);
 * console.log(cloned); // { id: 1, name: 'John', email: 'john@example.com' }
 * console.log(cloned !== original); // true (different reference)
 * console.log(cloned.name === original.name); // true (same primitive value)
 *
 * // Nested objects share references (shallow copy)
 * const withNested = {
 *   id: 1,
 *   profile: { name: 'John' }
 * };
 *
 * const clonedNested = shallowClone(withNested);
 * console.log(clonedNested !== withNested); // true (new object)
 * console.log(clonedNested.profile === withNested.profile); // true (same nested reference)
 *
 * // Modifying nested objects affects both
 * clonedNested.profile.name = 'Jane';
 * console.log(withNested.profile.name); // 'Jane' (shared reference)
 * ```
 *
 * @example
 * Array shallow cloning:
 * ```typescript
 * // Simple array cloning
 * const numbers = [1, 2, 3, 4, 5];
 * const clonedNumbers = shallowClone(numbers);
 * console.log(clonedNumbers); // [1, 2, 3, 4, 5]
 * console.log(clonedNumbers !== numbers); // true (different array)
 *
 * // Array modifications are independent
 * clonedNumbers.push(6);
 * console.log(numbers); // [1, 2, 3, 4, 5] (unchanged)
 * console.log(clonedNumbers); // [1, 2, 3, 4, 5, 6]
 *
 * // Array with object elements (shallow copy)
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' }
 * ];
 *
 * const clonedUsers = shallowClone(users);
 * console.log(clonedUsers !== users); // true (new array)
 * console.log(clonedUsers[0] === users[0]); // true (same object reference)
 *
 * // Modifying elements affects both arrays
 * clonedUsers[0].name = 'Alicia';
 * console.log(users[0].name); // 'Alicia' (shared reference)
 * ```
 *
 * @example
 * Primitive values and special types:
 * ```typescript
 * // Primitives are returned as-is
 * console.log(shallowClone(42)); // 42
 * console.log(shallowClone('hello')); // 'hello'
 * console.log(shallowClone(true)); // true
 * console.log(shallowClone(null)); // null
 * console.log(shallowClone(undefined)); // undefined
 * console.log(shallowClone(Symbol('test'))); // Symbol(test)
 * console.log(shallowClone(BigInt(123))); // 123n
 *
 * // Functions are returned as-is
 * const myFunc = () => 'test';
 * console.log(shallowClone(myFunc) === myFunc); // true
 *
 * // Special objects are returned as-is (not cloned)
 * const date = new Date();
 * console.log(shallowClone(date) === date); // true (same reference)
 *
 * const map = new Map([['key', 'value']]);
 * console.log(shallowClone(map) === map); // true (same reference)
 *
 * const regex = /pattern/gi;
 * console.log(shallowClone(regex) === regex); // true (same reference)
 * ```
 *
 * @example
 * State management and immutability:
 * ```typescript
 * // Redux-style state update
 * interface AppState {
 *   user: {
 *     id: number;
 *     name: string;
 *   };
 *   settings: {
 *     theme: string;
 *     notifications: boolean;
 *   };
 * }
 *
 * const currentState: AppState = {
 *   user: { id: 1, name: 'John' },
 *   settings: { theme: 'dark', notifications: true }
 * };
 *
 * // Create new state with updated user
 * const newState = {
 *   ...shallowClone(currentState),
 *   user: { ...currentState.user, name: 'Jane' }
 * };
 *
 * console.log(currentState !== newState); // true
 * console.log(currentState.settings === newState.settings); // true (shared)
 * ```
 *
 * @example
 * Form data handling:
 * ```typescript
 * // Clone form data before modification
 * const formData = {
 *   personalInfo: {
 *     firstName: 'John',
 *     lastName: 'Doe'
 *   },
 *   contactInfo: {
 *     email: 'john@example.com',
 *     phone: '+1234567890'
 *   }
 * };
 *
 * // Clone for editing without affecting original
 * const editableData = shallowClone(formData);
 * editableData.personalInfo = {
 *   ...editableData.personalInfo,
 *   firstName: 'Jane'
 * };
 *
 * console.log(formData.personalInfo.firstName); // 'John' (unchanged)
 * console.log(editableData.personalInfo.firstName); // 'Jane'
 * ```
 *
 * @example
 * Component props handling:
 * ```typescript
 * // React component props shallow cloning
 * interface ButtonProps {
 *   label: string;
 *   onClick: () => void;
 *   style?: React.CSSProperties;
 *   disabled?: boolean;
 * }
 *
 * const defaultProps: ButtonProps = {
 *   label: 'Click me',
 *   onClick: () => console.log('clicked'),
 *   disabled: false
 * };
 *
 * // Clone props for customization
 * const primaryButton = shallowClone(defaultProps);
 * primaryButton.label = 'Primary Action';
 *
 * const dangerButton = shallowClone(defaultProps);
 * dangerButton.label = 'Delete';
 * dangerButton.style = { color: 'red' };
 *
 * console.log(defaultProps.label); // 'Click me' (unchanged)
 * ```
 *
 * @example
 * API response processing:
 * ```typescript
 * // Clone API response for safe mutation
 * const apiResponse = {
 *   data: [
 *     { id: 1, name: 'Item 1', metadata: { views: 100 } },
 *     { id: 2, name: 'Item 2', metadata: { views: 200 } }
 *   ],
 *   pagination: {
 *     page: 1,
 *     total: 50
 *   }
 * };
 *
 * // Clone for local manipulation
 * const processedResponse = shallowClone(apiResponse);
 * processedResponse.data = processedResponse.data.map(item => ({
 *   ...item,
 *   name: item.name.toUpperCase()
 * }));
 *
 * console.log(apiResponse.data[0].name); // 'Item 1' (unchanged)
 * console.log(processedResponse.data[0].name); // 'ITEM 1'
 * console.log(apiResponse.pagination === processedResponse.pagination); // true
 * ```
 *
 * @remarks
 * **Cloning Strategy:**
 * - **Arrays**: Creates new array with spread operator `[...value]`
 * - **Plain Objects**: Creates new object with spread operator `{...value}`
 * - **Primitives**: Returns the value unchanged
 * - **Functions**: Returns the function reference unchanged
 * - **Special Objects**: Returns the object reference unchanged (Date, Map, Set, RegExp, etc.)
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(n) for arrays/objects where n is number of direct properties
 * - **Space Complexity**: O(n) for new array/object creation
 * - **Optimization**: Uses spread operator for efficient shallow copying
 * - **Fast Path**: Primitives and special objects have O(1) performance
 *
 * **Shallow vs Deep Copy:**
 * - Shallow copy creates new top-level structure only
 * - Nested objects/arrays maintain same references
 * - Modifications to nested structures affect both copies
 * - For deep cloning nested structures, use `clone` from `@winglet/common-utils`
 * - Suitable for immutable update patterns with selective deep copying
 *
 * **Type Safety:**
 * - Preserves TypeScript type information
 * - Generic type parameter maintains input/output type consistency
 * - Type assertions used for array cloning compatibility
 *
 * **Use Cases:**
 * - Creating defensive copies for mutation safety
 * - Implementing immutable update patterns
 * - Preparing objects for modification
 * - State management in frameworks (Redux, Zustand)
 * - Component prop handling
 * - API response processing
 *
 * **Comparison with Alternatives:**
 * - `Object.assign({}, obj)`: Similar but more verbose
 * - `{...obj}`: Direct spread - same behavior for objects
 * - `[...arr]`: Direct spread - same behavior for arrays
 * - `Array.slice()`: Alternative for arrays
 * - `clone()` from `@winglet/common-utils`: Deep clone (different purpose)
 * - Lodash `_.clone()`: Similar but handles more special cases
 *
 * **Limitations:**
 * - Does not clone nested structures (shallow only)
 * - Special objects (Date, Map, etc.) are not cloned
 * - Class instances are returned as references
 * - Does not handle circular references (not applicable for shallow copy)
 * - Only processes enumerable own properties
 * - Does not preserve property descriptors
 *
 * **When to Use:**
 * - Need to create independent top-level copy
 * - Implementing immutable update patterns
 * - Preparing object for safe mutation
 * - Performance-critical scenarios where deep cloning is unnecessary
 *
 * **When Not to Use:**
 * - Need to clone nested structures independently (use `clone` from `@winglet/common-utils`)
 * - Need to clone special objects like Date, Map (use specific cloning)
 * - Working with class instances requiring deep cloning
 * - Need to preserve all object metadata and descriptors
 */
export const shallowClone = <Type>(value: Type): Type => {
  if (isArray(value)) return [...value] as Type;
  if (isPlainObject(value)) return { ...value };
  return value;
};
