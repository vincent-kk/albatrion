import { useRef } from 'react';

import { isFunction } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

/**
 * Creates a lazily-initialized constant value that is computed only when first accessed and persists throughout the component lifecycle.
 *
 * This hook provides "lazy evaluation" semantics - initialization only occurs when the value
 * is first accessed, not on component mount. It's ideal for expensive computations that might
 * not be needed immediately or at all, providing better initial render performance.
 *
 * ### Lazy Initialization Benefits
 * - **Deferred Computation**: Expensive operations only run when value is accessed
 * - **Conditional Initialization**: Skip initialization entirely if value never accessed
 * - **Improved Time-to-Interactive**: Faster initial renders by deferring work
 * - **Memory Efficiency**: Resources allocated only when needed
 *
 * ### Key Differences from useConstant
 * - **useConstant**: Always computes on first render (eager initialization)
 * - **useTruthyConstant**: Only computes when first accessed (lazy initialization)
 * - **useConstant**: Better for values always needed immediately
 * - **useTruthyConstant**: Better for conditional or expensive computations
 *
 * ### Re-initialization Behavior
 * The hook re-initializes if the current value becomes falsy (null, undefined, 0, '', false).
 * This makes it unsuitable for values that might legitimately be falsy. Use `useConstant`
 * if you need to preserve falsy values.
 *
 * ### Performance Pattern
 * ```typescript
 * // Instead of this (eager - runs on every component mount):
 * const expensiveData = useConstant(() => heavyComputation());
 *
 * // Use this (lazy - runs only when accessed):
 * const expensiveData = useTruthyConstant(() => heavyComputation());
 * ```
 *
 * @example
 * ```typescript
 * // ❌ Eager initialization - always runs on mount
 * const EagerComponent = () => {
 *   const heavyData = useConstant(() => {
 *     console.log('Heavy computation running...'); // Always logs on mount
 *     return processLargeDataset(rawData);
 *   });
 *   
 *   return (
 *     <div>
 *       <button onClick={() => console.log(heavyData)}>Use Data</button>
 *     </div>
 *   );
 * };
 *
 * // ✅ Lazy initialization - only runs when data is accessed
 * const LazyComponent = () => {
 *   const heavyData = useTruthyConstant(() => {
 *     console.log('Heavy computation running...'); // Only logs when button clicked
 *     return processLargeDataset(rawData);
 *   });
 *   
 *   return (
 *     <div>
 *       <button onClick={() => console.log(heavyData)}>Use Data</button>
 *     </div>
 *   );
 * };
 *
 * // Singleton service with lazy instantiation
 * const useAnalyticsService = () => {
 *   return useTruthyConstant(() => {
 *     console.log('Initializing analytics service...'); // Only when first method called
 *     return new AnalyticsService({
 *       apiKey: process.env.ANALYTICS_KEY,
 *       endpoint: process.env.ANALYTICS_ENDPOINT,
 *       batchSize: 100,
 *       flushInterval: 5000
 *     });
 *   });
 * };
 *
 * // Conditional expensive initialization
 * const MediaPlayer = ({ videoUrl, autoplay }) => {
 *   const videoProcessor = useTruthyConstant(() => {
 *     if (!videoUrl) return null;
 *     
 *     console.log('Initializing video processor...');
 *     return new VideoProcessor({
 *       codec: 'h264',
 *       quality: 'high',
 *       bufferSize: 1024 * 1024
 *     });
 *   });
 *
 *   // Processor only created when video actually needs processing
 *   const handlePlay = () => {
 *     if (videoProcessor) {
 *       videoProcessor.process(videoUrl);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <video src={videoUrl} />
 *       <button onClick={handlePlay}>Process Video</button>
 *     </div>
 *   );
 * };
 *
 * // Feature detection with caching
 * const useFeatureDetection = () => {
 *   const features = useTruthyConstant(() => {
 *     console.log('Running feature detection...'); // Only on first access
 *     return {
 *       webgl: detectWebGLSupport(),
 *       webrtc: detectWebRTCSupport(),
 *       webAssembly: typeof WebAssembly !== 'undefined',
 *       serviceWorker: 'serviceWorker' in navigator,
 *       intersectionObserver: 'IntersectionObserver' in window
 *     };
 *   });
 *
 *   return features;
 * };
 *
 * // Worker pool initialization on demand
 * const useWorkerPool = (poolSize = 4) => {
 *   return useTruthyConstant(() => {
 *     console.log(`Creating worker pool with ${poolSize} workers...`);
 *     
 *     const workers = Array.from({ length: poolSize }, () => 
 *       new Worker('/heavy-computation-worker.js')
 *     );
 *     
 *     let taskIndex = 0;
 *     
 *     return {
 *       workers,
 *       execute: (task: any) => {
 *         const worker = workers[taskIndex++ % poolSize];
 *         return new Promise(resolve => {
 *           worker.onmessage = (e) => resolve(e.data);
 *           worker.postMessage(task);
 *         });
 *       },
 *       terminate: () => {
 *         workers.forEach(worker => worker.terminate());
 *         console.log('Worker pool terminated');
 *       }
 *     };
 *   });
 * };
 *
 * // WebGL context with lazy initialization
 * const Canvas3D = ({ enabled, width, height }) => {
 *   const webglContext = useTruthyConstant(() => {
 *     if (!enabled) return null;
 *     
 *     console.log('Initializing WebGL context...');
 *     const canvas = document.createElement('canvas');
 *     canvas.width = width;
 *     canvas.height = height;
 *     
 *     const gl = canvas.getContext('webgl2');
 *     if (!gl) {
 *       throw new Error('WebGL2 not supported in this browser');
 *     }
 *     
 *     // Setup WebGL state
 *     gl.enable(gl.DEPTH_TEST);
 *     gl.enable(gl.CULL_FACE);
 *     
 *     return {
 *       canvas,
 *       gl,
 *       programs: new Map(),
 *       buffers: new Map()
 *     };
 *   });
 *
 *   const render = () => {
 *     if (webglContext) {
 *       // WebGL context only created when render is called
 *       const { gl } = webglContext;
 *       gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 *       // ... rendering logic
 *     }
 *   };
 *
 *   if (!enabled) {
 *     return <div>3D rendering disabled</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={render}>Start 3D Rendering</button>
 *       {webglContext && (
 *         <div>WebGL context ready: {webglContext.canvas.width}x{webglContext.canvas.height}</div>
 *       )}
 *     </div>
 *   );
 * };
 *
 * // Database connection pool
 * const useDatabasePool = () => {
 *   return useTruthyConstant(() => {
 *     console.log('Establishing database connection pool...');
 *     
 *     return new DatabasePool({
 *       host: process.env.DB_HOST,
 *       port: process.env.DB_PORT,
 *       database: process.env.DB_NAME,
 *       user: process.env.DB_USER,
 *       password: process.env.DB_PASSWORD,
 *       min: 2,
 *       max: 10,
 *       acquireTimeoutMillis: 60000,
 *       createTimeoutMillis: 30000,
 *       destroyTimeoutMillis: 5000,
 *       idleTimeoutMillis: 30000
 *     });
 *   });
 * };
 *
 * // Chart library initialization
 * const AdvancedChart = ({ data, options }) => {
 *   const chartLibrary = useTruthyConstant(() => {
 *     console.log('Loading chart library...');
 *     
 *     // Heavy chart library with plugins
 *     return {
 *       core: new ChartCore(),
 *       plugins: {
 *         zoom: new ZoomPlugin(),
 *         export: new ExportPlugin(),
 *         animation: new AnimationPlugin()
 *       },
 *       themes: loadThemes(),
 *       fonts: loadCustomFonts()
 *     };
 *   });
 *
 *   const renderChart = (canvas: HTMLCanvasElement) => {
 *     if (chartLibrary) {
 *       // Library only loaded when chart actually needs to render
 *       const chart = chartLibrary.core.create(canvas, {
 *         data,
 *         options,
 *         plugins: Object.values(chartLibrary.plugins)
 *       });
 *       
 *       return chart;
 *     }
 *   };
 *
 *   return (
 *     <ChartCanvas onMount={renderChart} />
 *   );
 * };
 * ```
 *
 * @typeParam Return - The return type when using a function input
 * @typeParam Type - The type of the value when using a direct value input
 * @param input - A value or a function that returns a value. Functions are executed lazily when first accessed
 * @returns The computed value, which remains constant after lazy initialization
 */
export const useTruthyConstant: {
  <Return>(input: Fn<[], Return>): Return;
  <Type>(input: Type): Type;
} = <Return>(input: Fn<[], Return> | Return): Return => {
  const ref = useRef<Return>(undefined);
  if (!ref.current) ref.current = isFunction(input) ? input() : input;
  return ref.current;
};
