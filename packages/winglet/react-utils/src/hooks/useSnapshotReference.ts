import { useMemo, useRef } from 'react';

import { isObject } from '@winglet/common-utils/filter';
import { getTypeTag } from '@winglet/common-utils/lib';
import { equals } from '@winglet/common-utils/object';

/**
 * Creates a ref containing a deep-compared snapshot that only updates when object contents actually change.
 *
 * This hook performs deep equality comparison and returns a stable ref object whose
 * `current` value only changes when the object's contents genuinely change. Unlike
 * `useSnapshot`, this provides a ref for imperative access, callback stability,
 * and integration with external APIs that expect refs.
 *
 * ### When to Use vs useSnapshot
 * - **useSnapshotReference**: Need ref object, imperative access, external API integration
 * - **useSnapshot**: Direct value access, simpler syntax, most common use case
 *
 * ### Key Benefits of Ref-Based Approach
 * - **Callback Stability**: Ref reference never changes, perfect for stable callbacks
 * - **Imperative Access**: Access current value in timers, event handlers, cleanup
 * - **External Library Integration**: Pass stable refs to non-React code
 * - **Performance Monitoring**: Track actual changes separate from re-renders
 * - **Cleanup Functions**: Access latest state in cleanup without dependencies
 *
 * ### Deep Comparison Algorithm
 * 1. **Type & Emptiness Check**: Fast path for unchanged object types
 * 2. **Deep Equality Comparison**: Recursive comparison with exclusion support
 * 3. **Reference Preservation**: Returns same ref when contents identical
 * 4. **Optimized Updates**: Only updates ref.current when necessary
 *
 * @example
 * ```typescript
 * // ❌ Problem: Callback recreated on every render
 * const DataProcessor = ({ complexData, onProcess }) => {
 *   const processData = useCallback(() => {
 *     // This callback recreates whenever complexData changes
 *     const result = expensiveComputation(complexData);
 *     onProcess(result);
 *   }, [complexData, onProcess]);
 *
 *   return <Worker onMessage={processData} />;
 * };
 *
 * // ✅ Solution: Stable callback with current data access
 * const DataProcessor = ({ complexData, onProcess }) => {
 *   const dataRef = useSnapshotReference(complexData);
 *   const onProcessRef = useReference(onProcess);
 *
 *   const processData = useCallback(() => {
 *     // Callback reference never changes, but accesses current data
 *     const result = expensiveComputation(dataRef.current);
 *     onProcessRef.current(result);
 *   }, [dataRef]); // dataRef reference never changes
 *
 *   return <Worker onMessage={processData} />;
 * };
 *
 * // Performance monitoring: separate renders from content changes
 * const PerformanceTracker = ({ data }) => {
 *   const dataRef = useSnapshotReference(data);
 *   const renderCount = useRef(0);
 *   const changeCount = useRef(0);
 *   const lastChangeTime = useRef(Date.now());
 *
 *   // Count every render
 *   useEffect(() => {
 *     renderCount.current++;
 *   });
 *
 *   // Count only actual data changes
 *   useEffect(() => {
 *     changeCount.current++;
 *     const now = Date.now();
 *     const timeSinceLastChange = now - lastChangeTime.current;
 *     lastChangeTime.current = now;
 *
 *     console.log(`Data change #${changeCount.current} after ${timeSinceLastChange}ms`);
 *     console.log(`Efficiency: ${changeCount.current}/${renderCount.current} renders had actual changes`);
 *   }, [dataRef]);
 *
 *   return <div>Monitoring data changes...</div>;
 * };
 *
 * // External library integration with stable config
 * const ChartComponent = ({ data, options }) => {
 *   const canvasRef = useRef<HTMLCanvasElement>(null);
 *   const chartInstanceRef = useRef<Chart>();
 *   const configRef = useSnapshotReference({
 *     data,
 *     options,
 *     responsive: true,
 *     maintainAspectRatio: false
 *   });
 *
 *   useEffect(() => {
 *     if (canvasRef.current) {
 *       // Create chart with stable config reference
 *       chartInstanceRef.current = new Chart(canvasRef.current, configRef.current);
 *     }
 *
 *     return () => {
 *       // Access current config in cleanup
 *       const currentConfig = configRef.current;
 *       if (currentConfig.options.saveOnDestroy) {
 *         chartInstanceRef.current?.toBase64Image();
 *       }
 *       chartInstanceRef.current?.destroy();
 *     };
 *   }, [configRef]); // Only recreates when config content changes
 *
 *   return <canvas ref={canvasRef} />;
 * };
 *
 * // WebSocket message handling with content-based processing
 * const MessageProcessor = ({ websocketMessage }) => {
 *   // Exclude volatile fields from comparison
 *   const messageRef = useSnapshotReference(websocketMessage, [
 *     'timestamp',
 *     'sequenceNumber',
 *     'receivedAt'
 *   ]);
 *
 *   const processedDataRef = useRef(null);
 *
 *   useEffect(() => {
 *     const message = messageRef.current;
 *     if (!message) return;
 *
 *     // Only reprocess when message content actually changes
 *     console.log('Processing new message content:', message.type);
 *     processedDataRef.current = processMessage(message);
 *
 *     // Trigger side effects
 *     updateUI(processedDataRef.current);
 *     logMessage(message.type, message.data);
 *   }, [messageRef]);
 *
 *   return <MessageDisplay data={processedDataRef.current} />;
 * };
 *
 * // State transition tracking
 * const StateTransitionLogger = ({ appState }) => {
 *   const currentStateRef = useSnapshotReference(appState);
 *   const previousStateRef = useRef(currentStateRef.current);
 *
 *   useEffect(() => {
 *     const current = currentStateRef.current;
 *     const previous = previousStateRef.current;
 *
 *     if (previous && current !== previous) {
 *       const changes = detectChanges(previous, current);
 *       logStateTransition({
 *         from: previous,
 *         to: current,
 *         changes,
 *         timestamp: Date.now()
 *       });
 *     }
 *
 *     previousStateRef.current = current;
 *   }, [currentStateRef]);
 *
 *   return null; // This is a logging-only component
 * };
 *
 * // Imperative handle with stable data access
 * const DataEditor = React.forwardRef(({ initialData, validation }, ref) => {
 *   const [currentData, setCurrentData] = useState(initialData);
 *   const dataRef = useSnapshotReference(currentData);
 *   const validationRef = useSnapshotReference(validation);
 *
 *   useImperativeHandle(ref, () => ({
 *     getData: () => dataRef.current,
 *     validate: () => validateData(dataRef.current, validationRef.current),
 *     isDirty: () => dataRef.current !== initialData,
 *     reset: () => setCurrentData(initialData),
 *     getChanges: () => diffData(initialData, dataRef.current)
 *   }), [dataRef, validationRef, initialData]);
 *
 *   return (
 *     <div>
 *       <DataForm data={currentData} onChange={setCurrentData} />
 *     </div>
 *   );
 * });
 *
 * // Timer/interval with current state access
 * const AutoSaver = ({ formData, onSave }) => {
 *   const formDataRef = useSnapshotReference(formData);
 *   const onSaveRef = useReference(onSave);
 *
 *   useEffect(() => {
 *     const interval = setInterval(() => {
 *       // Access current form data without recreating interval
 *       const currentData = formDataRef.current;
 *       if (currentData && currentData.isDirty) {
 *         onSaveRef.current(currentData);
 *       }
 *     }, 30000); // Auto-save every 30 seconds
 *
 *     return () => clearInterval(interval);
 *   }, [formDataRef]); // Interval only recreates when form structure changes
 *
 *   return null;
 * };
 * ```
 *
 * @typeParam Input - The type of the object to create a snapshot reference of (can be undefined)
 * @param input - The object to track with deep comparison
 * @param omit - Properties to exclude from deep comparison (as Set or Array)
 * @returns A ref whose current value updates only when object contents actually change
 *
 * @see useSnapshot - For direct value access without ref wrapper (most common use case)
 * @see useReference - For always-current refs without comparison (different use case)
 */
export const useSnapshotReference = <Input extends object | undefined>(
  input: Input,
  omit?: Set<keyof Input> | Array<keyof Input>,
) => {
  const snapshotRef = useRef(input);
  const typeRef = useRef(getTypeTag(input));
  const omitRef = useRef(omit && (omit instanceof Set ? omit : new Set(omit)));
  return useMemo(() => {
    if (
      (typeRef.current === getTypeTag(input) && isEmpty(input)) ||
      equals(snapshotRef.current, input, omitRef.current)
    )
      return snapshotRef;
    snapshotRef.current = input;
    return snapshotRef;
  }, [input]);
};

const isEmpty = (value: unknown): boolean => {
  if (!value) return true;
  else if (isObject(value)) {
    for (const _ in value) return false;
    return true;
  } else return false;
};
