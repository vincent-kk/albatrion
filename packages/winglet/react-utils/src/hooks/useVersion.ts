import { useRef, useState } from 'react';

import type { Fn } from '@aileron/declare';

import { useReference } from './useReference';

/**
 * Provides a manual re-render trigger with optional side effects and render counting.
 *
 * This hook creates a simple but powerful mechanism for forcing component updates
 * by incrementing an internal counter. Each call to the update function increments
 * the counter and triggers a re-render, optionally executing a callback first.
 * The counter value serves as a "render generation" indicator.
 *
 * ### Primary Use Cases
 * - **Force Re-renders**: Update component when external data changes outside React's tracking
 * - **Cache Invalidation**: Invalidate memoized values by changing dependency
 * - **Manual Refresh**: Implement refresh buttons, pull-to-refresh, or manual sync
 * - **External State Sync**: Re-render after non-React state changes (global stores, DOM events)
 * - **Debug Re-renders**: Track and count component update cycles
 * - **Key Prop Generation**: Force remount child components with changing keys
 *
 * ### When React Doesn't Know About Changes
 * Sometimes you need to force re-renders due to changes React can't automatically detect:
 * - External library state changes
 * - DOM manipulations outside React
 * - Global variables or window properties
 * - WebSocket/Server-sent events
 * - LocalStorage/SessionStorage changes
 *
 * @example
 * ```typescript
 * // Basic manual refresh functionality
 * const DataList = () => {
 *   const [renderCount, refresh] = useVersion();
 *   const [data, setData] = useState([]);
 *
 *   const fetchData = async () => {
 *     const response = await api.getData();
 *     setData(response);
 *   };
 *
 *   useEffect(() => {
 *     fetchData();
 *   }, [renderCount]); // Refetch when refresh is triggered
 *
 *   return (
 *     <div>
 *       <div>Render #{renderCount}</div>
 *       <button onClick={refresh}>Refresh Data</button>
 *       <DataDisplay data={data} />
 *     </div>
 *   );
 * };
 *
 * // Force re-render with side effects
 * const ExternalDataSync = ({ externalStore }) => {
 *   const [version, syncData] = useVersion(() => {
 *     console.log('Syncing with external data source...');
 *     externalStore.refresh();
 *     analytics.track('ManualSync', { timestamp: Date.now() });
 *   });
 *
 *   useEffect(() => {
 *     // Listen to external store changes
 *     const unsubscribe = externalStore.onChange(() => {
 *       syncData(); // Force re-render when external data changes
 *     });
 *     return unsubscribe;
 *   }, [syncData]);
 *
 *   return (
 *     <div>
 *       <div>Sync version: {version}</div>
 *       <div>Data: {externalStore.getCurrentData()}</div>
 *       <button onClick={syncData}>Manual Sync</button>
 *     </div>
 *   );
 * };
 *
 * // Cache invalidation pattern
 * const ExpensiveCalculation = ({ input }) => {
 *   const [cacheVersion, invalidateCache] = useVersion();
 *
 *   const expensiveResult = useMemo(() => {
 *     console.log('Recalculating expensive result...');
 *     return performExpensiveCalculation(input);
 *   }, [input, cacheVersion]); // Cache invalidated when version changes
 *
 *   return (
 *     <div>
 *       <div>Result: {expensiveResult}</div>
 *       <div>Cache version: {cacheVersion}</div>
 *       <button onClick={invalidateCache}>Force Recalculate</button>
 *     </div>
 *   );
 * };
 *
 * // Child component remounting
 * const FormWithReset = ({ initialData }) => {
 *   const [resetKey, resetForm] = useVersion();
 *   // Key prop forces complete remount of form
 *   return (
 *     <div>
 *       <ComplexForm key={resetKey} initialData={initialData} />
 *       <button onClick={resetForm}>Reset Form</button>
 *     </div>
 *   );
 * };
 *
 * // External library integration
 * const ThirdPartyChart = ({ data }) => {
 *   const [version, forceUpdate] = useVersion();
 *   const chartRef = useRef(null);
 *   const chartInstanceRef = useRef(null);
 *
 *   useEffect(() => {
 *     if (chartRef.current) {
 *       // Initialize third-party chart
 *       chartInstanceRef.current = new ExternalChart(chartRef.current, {
 *         data,
 *         onDataChange: () => forceUpdate() // Force re-render on external changes
 *       });
 *     }
 *
 *     return () => {
 *       chartInstanceRef.current?.destroy();
 *     };
 *   }, [data, forceUpdate, version]); // Include version to trigger effect
 *
 *   return (
 *     <div>
 *       <div ref={chartRef} />
 *       <div>Chart render: {version}</div>
 *       <button onClick={forceUpdate}>Refresh Chart</button>
 *     </div>
 *   );
 * };
 *
 * // Performance monitoring and debugging
 * const PerformanceMonitor = ({ children }) => {
 *   const [renderCount, triggerRender] = useVersion();
 *   const lastRenderTime = useRef(Date.now());
 *   const renderTimes = useRef<number[]>([]);
 *
 *   useEffect(() => {
 *     const now = Date.now();
 *     const timeSinceLastRender = now - lastRenderTime.current;
 *     renderTimes.current.push(timeSinceLastRender);
 *     lastRenderTime.current = now;
 *
 *     // Keep only last 10 render times
 *     if (renderTimes.current.length > 10) {
 *       renderTimes.current = renderTimes.current.slice(-10);
 *     }
 *
 *     console.log(`Render #${renderCount}, Time since last: ${timeSinceLastRender}ms`);
 *   });
 *
 *   const averageRenderTime = renderTimes.current.length > 0
 *     ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
 *     : 0;
 *
 *   return (
 *     <div>
 *       <div className="debug-info">
 *         <span>Renders: {renderCount}</span>
 *         <span>Avg time: {averageRenderTime.toFixed(1)}ms</span>
 *         <button onClick={triggerRender}>Force Render</button>
 *       </div>
 *       {children}
 *     </div>
 *   );
 * };
 *
 * // Real-time data with manual refresh
 * const LiveDashboard = () => {
 *   const [version, refresh] = useVersion(() => {
 *     console.log('Dashboard refresh triggered');
 *     // Could trigger analytics, notifications, etc.
 *   });
 *
 *   const [data, setData] = useState(null);
 *   const [lastUpdate, setLastUpdate] = useState(null);
 *
 *   useEffect(() => {
 *     const fetchLiveData = async () => {
 *       const response = await fetch('/api/live-data');
 *       const newData = await response.json();
 *       setData(newData);
 *       setLastUpdate(new Date().toLocaleString());
 *     };
 *
 *     fetchLiveData();
 *
 *     // Auto-refresh every 30 seconds
 *     const interval = setInterval(fetchLiveData, 30000);
 *     return () => clearInterval(interval);
 *   }, [version]); // Manual refresh also triggers data fetch
 *
 *   return (
 *     <div>
 *       <header>
 *         <h1>Live Dashboard (v{version})</h1>
 *         <div>Last updated: {lastUpdate}</div>
 *         <button onClick={refresh}>Refresh Now</button>
 *       </header>
 *       <DashboardContent data={data} />
 *     </div>
 *   );
 * };
 *
 * // Error recovery with version reset
 * const ErrorRecoveryComponent = () => {
 *   const [version, resetComponent] = useVersion(() => {
 *     console.log('Component reset triggered');
 *     // Clear error states, reset caches, etc.
 *   });
 *
 *   const [error, setError] = useState(null);
 *
 *   const handleError = (error: Error) => {
 *     setError(error);
 *     console.error('Component error:', error);
 *   };
 *
 *   const handleReset = () => {
 *     setError(null);
 *     resetComponent(); // Trigger fresh render cycle
 *   };
 *
 *   if (error) {
 *     return (
 *       <div className="error-boundary">
 *         <h2>Something went wrong (Render #{version})</h2>
 *         <pre>{error.message}</pre>
 *         <button onClick={handleReset}>Reset Component</button>
 *       </div>
 *     );
 *   }
 *
 *   return (
 *     <ErrorBoundary onError={handleError}>
 *       <ComplexComponent key={version} />
 *     </ErrorBoundary>
 *   );
 * };
 * ```
 *
 * @param callback - Optional function to execute before incrementing the version and triggering re-render
 * @returns A tuple of [version, updateVersion]:
 *   - version: Current version number (starts at 0, increments with each update)
 *   - updateVersion: Function to increment version and trigger re-render
 */
export const useVersion = (callback?: Fn) => {
  const [version, setVersion] = useState(0);
  const callbackRef = useReference(callback);
  const update = useRef(() => {
    callbackRef.current?.();
    setVersion((prev) => prev + 1);
  });
  return [version, update.current] as const;
};
