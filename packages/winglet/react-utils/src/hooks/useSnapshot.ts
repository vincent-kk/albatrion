import { useSnapshotReference } from './useSnapshotReference';

/**
 * Creates a stable object reference that only changes when the object's contents actually change through deep comparison.
 *
 * This hook performs deep equality comparison to detect genuine content changes versus
 * reference changes, returning the same object reference when contents are identical.
 * It's essential for breaking the "new object every render" pattern that breaks memoization.
 *
 * ### Core Problem it Solves
 * React components often create new objects on every render:
 * ```typescript
 * // These create new references even with identical content:
 * const config = { theme: 'dark', size: 'large' };
 * const user = { ...userData, isOnline: checkOnlineStatus() };
 * const settings = processSettings(rawSettings);
 * ```
 * Even identical contents break `useMemo`, `useCallback`, and `React.memo` optimizations.
 *
 * ### When to Use vs useRestProperties
 * - **useSnapshot**: Deep comparison for nested objects, complex data structures
 * - **useRestProperties**: Shallow comparison for flat objects, better performance
 *
 * ### Deep Comparison Features
 * - **Nested Object Support**: Compares deeply nested properties
 * - **Array Handling**: Compares array contents and nested objects within arrays
 * - **Property Exclusion**: Skip volatile properties from comparison
 * - **Null/Undefined Safety**: Handles edge cases gracefully
 * - **Type Preservation**: Maintains TypeScript types perfectly
 *
 * ### Performance Considerations
 * - **Time Complexity**: O(n) where n = total properties in object tree
 * - **Memory**: Stores one previous reference per hook instance
 * - **Best for**: Complex nested objects, API responses, configuration objects
 * - **Avoid for**: Large arrays, frequently changing data
 *
 * @example
 * ```typescript
 * // ❌ Problem: Effect runs on every render despite identical content
 * const MyComponent = ({ userData }) => {
 *   const config = { theme: userData.theme, locale: userData.locale };
 *
 *   useEffect(() => {
 *     initializeWidget(config); // Runs every render!
 *   }, [config]);
 * };
 *
 * // ✅ Solution: Stable reference for identical content
 * const MyComponent = ({ userData }) => {
 *   const stableConfig = useSnapshot({
 *     theme: userData.theme,
 *     locale: userData.locale
 *   });
 *
 *   useEffect(() => {
 *     initializeWidget(stableConfig); // Only runs when content changes
 *   }, [stableConfig]);
 * };
 *
 * // Complex nested data stabilization
 * const UserProfile = ({ user, preferences, metadata }) => {
 *   const stableUserData = useSnapshot({
 *     personal: {
 *       id: user.id,
 *       name: user.name,
 *       email: user.email
 *     },
 *     settings: {
 *       theme: preferences.theme,
 *       language: preferences.language,
 *       notifications: {
 *         email: preferences.notifications.email,
 *         push: preferences.notifications.push
 *       }
 *     },
 *     meta: {
 *       lastLogin: metadata.lastLogin,
 *       accountType: metadata.accountType
 *     }
 *   });
 *
 *   // Only recomputes when actual user data changes
 *   const displayName = useMemo(() =>
 *     formatUserName(stableUserData.personal), [stableUserData.personal]
 *   );
 *
 *   return <ProfileDisplay data={stableUserData} name={displayName} />;
 * };
 *
 * // API response caching with exclusions
 * const DataFetcher = ({ endpoint, params }) => {
 *   const [response, setResponse] = useState(null);
 *
 *   // Exclude timestamp from comparison to prevent unnecessary requests
 *   const stableResponse = useSnapshot(response, ['timestamp', 'requestId']);
 *
 *   const processedData = useMemo(() => {
 *     if (!stableResponse) return null;
 *     return expensiveTransform(stableResponse.data);
 *   }, [stableResponse]);
 *
 *   return <DataDisplay data={processedData} />;
 * };
 *
 * // Form state comparison for "dirty" detection
 * const FormEditor = ({ initialData }) => {
 *   const [formData, setFormData] = useState(initialData);
 *
 *   const stableInitialData = useSnapshot(initialData);
 *   const stableCurrentData = useSnapshot(formData);
 *
 *   // Accurate dirty detection based on content, not references
 *   const isDirty = stableCurrentData !== stableInitialData;
 *   const hasChanges = !equals(stableCurrentData, stableInitialData);
 *
 *   return (
 *     <form>
 *       <button disabled={!isDirty}>Save Changes</button>
 *     </form>
 *   );
 * };
 *
 * // Context optimization with deep comparison
 * const AppStateProvider = ({ children }) => {
 *   const [user, setUser] = useState(null);
 *   const [settings, setSettings] = useState({});
 *   const [permissions, setPermissions] = useState([]);
 *
 *   const contextValue = useSnapshot({
 *     user: {
 *       ...user,
 *       isAuthenticated: !!user,
 *       fullName: user ? `${user.firstName} ${user.lastName}` : ''
 *     },
 *     settings: {
 *       ...settings,
 *       isDarkMode: settings.theme === 'dark'
 *     },
 *     permissions,
 *     actions: {
 *       login: setUser,
 *       updateSettings: setSettings,
 *       updatePermissions: setPermissions
 *     }
 *   });
 *
 *   // Only re-renders when state actually changes
 *   return (
 *     <AppContext.Provider value={contextValue}>
 *       {children}
 *     </AppContext.Provider>
 *   );
 * };
 *
 * // Comparing arrays with nested objects
 * const TodoList = ({ todos, filters }) => {
 *   const stableFilteredTodos = useSnapshot(
 *     todos
 *       .filter(todo => matchesFilters(todo, filters))
 *       .map(todo => ({
 *         ...todo,
 *         isOverdue: new Date(todo.dueDate) < new Date()
 *       }))
 *   );
 *
 *   return (
 *     <VirtualizedList
 *       items={stableFilteredTodos} // Stable reference prevents scroll position reset
 *       renderItem={({ item }) => <TodoItem todo={item} />}
 *     />
 *   );
 * };
 * ```
 *
 * @typeParam Input - The type of the object to snapshot (can be undefined)
 * @param input - The object to create a deep-compared snapshot of
 * @param omit - Properties to exclude from deep comparison (as Set or Array)
 * @returns A stable reference that only changes when object contents actually change
 *
 * @see useSnapshotReference - When you need the ref object instead of direct value access
 * @see useRestProperties - For shallow comparison of flat objects (better performance)
 */
export const useSnapshot = <Input extends object | undefined>(
  input: Input,
  omit?: Set<keyof Input> | Array<keyof Input>,
) => {
  const snapshotRef = useSnapshotReference(input, omit);
  return snapshotRef.current;
};
