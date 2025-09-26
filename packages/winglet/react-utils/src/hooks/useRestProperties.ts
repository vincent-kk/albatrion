import { useMemo, useRef } from 'react';

import type { Dictionary } from '@aileron/declare';

/**
 * Maintains referential stability for object props by returning the same reference when contents are identical.
 *
 * This hook performs shallow equality comparison and returns the previous object reference
 * if all properties and values remain the same. It's essential for preventing unnecessary
 * re-renders in memoized components when object props are created inline or computed dynamically.
 *
 * ### Performance Problem it Solves
 * React creates new object references on every render for:
 * - Inline object literals: `<Component config={{ theme: 'dark' }} />`
 * - Spread operations: `<Component {...restProps} />`
 * - Computed objects: `<Component data={{ ...state, computed: value }} />`
 *
 * Even when contents are identical, new references break memoization and cause re-renders.
 *
 * ### Use Cases
 * - **Rest Props Optimization**: Stabilize `{...restProps}` in component APIs
 * - **Context Value Stability**: Prevent context consumer re-renders
 * - **Dynamic Prop Objects**: Maintain stable references for computed configurations
 * - **HOC Prop Forwarding**: Optimize prop forwarding in higher-order components
 * - **Form Field Props**: Stabilize field configurations in form libraries
 *
 * ### Shallow Comparison Algorithm
 * 1. **Reference Check**: Return immediately if object reference unchanged
 * 2. **Nullish Check**: Handle null/undefined consistently
 * 3. **Key Count Comparison**: Fast path for different property counts
 * 4. **Value Comparison**: Shallow comparison of all property values
 * 5. **Reference Preservation**: Return previous reference if contents identical
 *
 * ### Performance Characteristics
 * - **Best Case**: O(1) for unchanged references
 * - **Typical Case**: O(n) where n = number of properties
 * - **Memory**: Stores one previous reference per hook instance
 *
 * @example
 * ```typescript
 * // ❌ Problem: New object on every render
 * const ExpensiveChild = React.memo(({ config }) => {
 *   return <div>Renders on every parent update</div>;
 * });
 *
 * const Parent = ({ theme, user }) => {
 *   return (
 *     <ExpensiveChild
 *       config={{ theme, userId: user.id }} // New object every time!
 *     />
 *   );
 * };
 *
 * // ✅ Solution: Stabilize object reference
 * const Parent = ({ theme, user }) => {
 *   const stableConfig = useRestProperties({
 *     theme,
 *     userId: user.id
 *   });
 *
 *   return <ExpensiveChild config={stableConfig} />; // Only re-renders when content changes
 * };
 *
 * // Rest props in reusable components
 * const Button = ({ variant, size, children, ...restProps }) => {
 *   const stableRestProps = useRestProperties(restProps);
 *
 *   return (
 *     <MemoizedButton
 *       variant={variant}
 *       size={size}
 *       {...stableRestProps} // Stable reference prevents re-renders
 *     >
 *       {children}
 *     </MemoizedButton>
 *   );
 * };
 *
 * // Context provider optimization
 * const AuthProvider = ({ children }) => {
 *   const [user, setUser] = useState(null);
 *   const [permissions, setPermissions] = useState([]);
 *
 *   const contextValue = useRestProperties({
 *     user,
 *     permissions,
 *     isAuthenticated: !!user,
 *     hasPermission: (perm) => permissions.includes(perm),
 *     login: setUser,
 *     logout: () => setUser(null)
 *   });
 *
 *   // Consumers only re-render when auth state actually changes
 *   return (
 *     <AuthContext.Provider value={contextValue}>
 *       {children}
 *     </AuthContext.Provider>
 *   );
 * };
 *
 * // Form field configuration
 * const FormField = ({ name, label, validation, ...fieldProps }) => {
 *   const stableFieldConfig = useRestProperties({
 *     name,
 *     required: validation?.required ?? false,
 *     pattern: validation?.pattern,
 *     ...fieldProps
 *   });
 *
 *   return <MemoizedInput config={stableFieldConfig} label={label} />;
 * };
 *
 * // Table/List component props
 * const DataTable = ({ data, sortBy, filterBy, pageSize }) => {
 *   const processedData = useMemo(() =>
 *     applyFiltersAndSort(data, filterBy, sortBy), [data, filterBy, sortBy]
 *   );
 *
 *   const tableConfig = useRestProperties({
 *     items: processedData,
 *     totalCount: data.length,
 *     isEmpty: processedData.length === 0,
 *     pageSize,
 *     sortBy,
 *     filterBy
 *   });
 *
 *   return <VirtualizedTable config={tableConfig} />;
 * };
 *
 * // HOC with stable prop forwarding
 * const withErrorBoundary = (Component) => {
 *   return React.memo((props) => {
 *     const stableProps = useRestProperties(props);
 *     const [hasError, setHasError] = useState(false);
 *
 *     if (hasError) {
 *       return <ErrorFallback onRetry={() => setHasError(false)} />;
 *     }
 *
 *     return (
 *       <ErrorBoundary onError={() => setHasError(true)}>
 *         <Component {...stableProps} />
 *       </ErrorBoundary>
 *     );
 *   });
 * };
 * ```
 *
 * @typeParam T - The type of the properties object (must extend Dictionary)
 * @param props - The properties object to stabilize via shallow comparison
 * @returns The same object reference if contents are unchanged, otherwise the new object
 */
export const useRestProperties = <T extends Dictionary>(props: T): T => {
  const propsRef = useRef<T>(props);
  const keysRef = useRef<string[]>(props ? Object.keys(props) : []);
  return useMemo(() => {
    // If props is not changed, return the same props
    // Or, if props is nullish, skip the rest of the logic
    if (!props || props === propsRef.current) return props;

    // If props's keys are not same as the previous props's keys, set the props and keys
    const keys = Object.keys(props);
    const length = keys.length;
    if (length !== keysRef.current.length) {
      propsRef.current = props;
      keysRef.current = keys;
      return props;
    }

    // If props's keys are same as the previous props's keys, return the previous props
    // If this case is true, previous props is empty object also.
    if (length === 0) return propsRef.current;

    // If props's values are not same as the previous props's values, set the props and keys
    for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
      if (props[k] !== propsRef.current[k]) {
        propsRef.current = props;
        keysRef.current = keys;
        return props;
      }
    }
    // If props's values are same as the previous props's values, return the previous props
    return propsRef.current;
  }, [props]);
};
