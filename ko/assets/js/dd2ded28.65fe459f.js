"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["4273"],{29449(e,n,t){t.r(n),t.d(n,{metadata:()=>o,default:()=>h,frontMatter:()=>s,contentTitle:()=>l,toc:()=>u,assets:()=>c});var o=JSON.parse('{"id":"winglet/react-utils/hook/useTruthyConstant","title":"useTruthyConstant","description":"Creates a lazily-initialized constant value that is computed only when first accessed and persists throughout the component lifecycle.","source":"@site/docs/winglet/react-utils/hook/useTruthyConstant.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useTruthyConstant","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useTruthyConstant","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useTruthyConstant.mdx","tags":[],"version":"current","frontMatter":{"title":"useTruthyConstant","sidebar_label":"useTruthyConstant"},"sidebar":"winglet","previous":{"title":"useTimeout","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useTimeout"},"next":{"title":"useVersion","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useVersion"}}'),r=t(62540),i=t(43023),a=t(91297);let s={title:"useTruthyConstant",sidebar_label:"useTruthyConstant"},l="useTruthyConstant",c={},u=[{value:"Lazy Initialization Benefits",id:"lazy-initialization-benefits",level:3},{value:"Key Differences from useConstant",id:"key-differences-from-useconstant",level:3},{value:"Re-initialization Behavior",id:"re-initialization-behavior",level:3},{value:"Performance Pattern",id:"performance-pattern",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function d(e){let n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"usetruthyconstant",children:"useTruthyConstant"})}),"\n",(0,r.jsx)(n.p,{children:'Creates a lazily-initialized constant value that is computed only when first accessed and persists throughout the component lifecycle.\nThis hook provides "lazy evaluation" semantics - initialization only occurs when the value\nis first accessed, not on component mount. It\'s ideal for expensive computations that might\nnot be needed immediately or at all, providing better initial render performance.'}),"\n",(0,r.jsx)(n.h3,{id:"lazy-initialization-benefits",children:"Lazy Initialization Benefits"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Deferred Computation"}),": Expensive operations only run when value is accessed"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Conditional Initialization"}),": Skip initialization entirely if value never accessed"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Improved Time-to-Interactive"}),": Faster initial renders by deferring work"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Memory Efficiency"}),": Resources allocated only when needed"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"key-differences-from-useconstant",children:"Key Differences from useConstant"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"useConstant"}),": Always computes on first render (eager initialization)"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"useTruthyConstant"}),": Only computes when first accessed (lazy initialization)"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"useConstant"}),": Better for values always needed immediately"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"useTruthyConstant"}),": Better for conditional or expensive computations"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"re-initialization-behavior",children:"Re-initialization Behavior"}),"\n",(0,r.jsxs)(n.p,{children:["The hook re-initializes if the current value becomes falsy (null, undefined, 0, '', false).\nThis makes it unsuitable for values that might legitimately be falsy. Use ",(0,r.jsx)(n.code,{children:"useConstant"}),"\nif you need to preserve falsy values."]}),"\n",(0,r.jsx)(n.h3,{id:"performance-pattern",children:"Performance Pattern"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"// Instead of this (eager - runs on every component mount):\nconst expensiveData = useConstant(() => heavyComputation());\n// Use this (lazy - runs only when accessed):\nconst expensiveData = useTruthyConstant(() => heavyComputation());\n"})}),"\n",(0,r.jsx)(n.h2,{id:"signature",children:"Signature"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"const useTruthyConstant: {\n    <Return>(input: Fn<[], Return>): Return;\n    <Type>(input: Type): Type;\n}\n"})}),"\n",(0,r.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Name"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"input"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"-"})}),(0,r.jsx)(n.td,{children:"A value or a function that returns a value. Functions are executed lazily when first accessed"})]})})]}),"\n",(0,r.jsx)(n.h2,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:"The computed value, which remains constant after lazy initialization"}),"\n",(0,r.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,r.jsx)(n.h3,{id:"example-1",children:"Example 1"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"// \u274C Eager initialization - always runs on mount\nconst EagerComponent = () => {\n  const heavyData = useConstant(() => {\n    console.log('Heavy computation running...'); // Always logs on mount\n    return processLargeDataset(rawData);\n  });\n\n  return (\n    <div>\n      <button onClick={() => console.log(heavyData)}>Use Data</button>\n    </div>\n  );\n};\n\n// \u2705 Lazy initialization - only runs when data is accessed\nconst LazyComponent = () => {\n  const heavyData = useTruthyConstant(() => {\n    console.log('Heavy computation running...'); // Only logs when button clicked\n    return processLargeDataset(rawData);\n  });\n\n  return (\n    <div>\n      <button onClick={() => console.log(heavyData)}>Use Data</button>\n    </div>\n  );\n};\n\n// Singleton service with lazy instantiation\nconst useAnalyticsService = () => {\n  return useTruthyConstant(() => {\n    console.log('Initializing analytics service...'); // Only when first method called\n    return new AnalyticsService({\n      apiKey: process.env.ANALYTICS_KEY,\n      endpoint: process.env.ANALYTICS_ENDPOINT,\n      batchSize: 100,\n      flushInterval: 5000\n    });\n  });\n};\n\n// Conditional expensive initialization\nconst MediaPlayer = ({ videoUrl, autoplay }) => {\n  const videoProcessor = useTruthyConstant(() => {\n    if (!videoUrl) return null;\n\n    console.log('Initializing video processor...');\n    return new VideoProcessor({\n      codec: 'h264',\n      quality: 'high',\n      bufferSize: 1024 * 1024\n    });\n  });\n\n  // Processor only created when video actually needs processing\n  const handlePlay = () => {\n    if (videoProcessor) {\n      videoProcessor.process(videoUrl);\n    }\n  };\n\n  return (\n    <div>\n      <video src={videoUrl} />\n      <button onClick={handlePlay}>Process Video</button>\n    </div>\n  );\n};\n\n// Feature detection with caching\nconst useFeatureDetection = () => {\n  const features = useTruthyConstant(() => {\n    console.log('Running feature detection...'); // Only on first access\n    return {\n      webgl: detectWebGLSupport(),\n      webrtc: detectWebRTCSupport(),\n      webAssembly: typeof WebAssembly !== 'undefined',\n      serviceWorker: 'serviceWorker' in navigator,\n      intersectionObserver: 'IntersectionObserver' in window\n    };\n  });\n\n  return features;\n};\n\n// Worker pool initialization on demand\nconst useWorkerPool = (poolSize = 4) => {\n  return useTruthyConstant(() => {\n    console.log(`Creating worker pool with ${poolSize} workers...`);\n\n    const workers = Array.from({ length: poolSize }, () =>\n      new Worker('/heavy-computation-worker.js')\n    );\n\n    let taskIndex = 0;\n\n    return {\n      workers,\n      execute: (task: any) => {\n        const worker = workers[taskIndex++ % poolSize];\n        return new Promise(resolve => {\n          worker.onmessage = (e) => resolve(e.data);\n          worker.postMessage(task);\n        });\n      },\n      terminate: () => {\n        workers.forEach(worker => worker.terminate());\n        console.log('Worker pool terminated');\n      }\n    };\n  });\n};\n\n// WebGL context with lazy initialization\nconst Canvas3D = ({ enabled, width, height }) => {\n  const webglContext = useTruthyConstant(() => {\n    if (!enabled) return null;\n\n    console.log('Initializing WebGL context...');\n    const canvas = document.createElement('canvas');\n    canvas.width = width;\n    canvas.height = height;\n\n    const gl = canvas.getContext('webgl2');\n    if (!gl) {\n      throw new Error('WebGL2 not supported in this browser');\n    }\n\n    // Setup WebGL state\n    gl.enable(gl.DEPTH_TEST);\n    gl.enable(gl.CULL_FACE);\n\n    return {\n      canvas,\n      gl,\n      programs: new Map(),\n      buffers: new Map()\n    };\n  });\n\n  const render = () => {\n    if (webglContext) {\n      // WebGL context only created when render is called\n      const { gl } = webglContext;\n      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\n      // ... rendering logic\n    }\n  };\n\n  if (!enabled) {\n    return <div>3D rendering disabled</div>;\n  }\n\n  return (\n    <div>\n      <button onClick={render}>Start 3D Rendering</button>\n      {webglContext && (\n        <div>WebGL context ready: {webglContext.canvas.width}x{webglContext.canvas.height}</div>\n      )}\n    </div>\n  );\n};\n\n// Database connection pool\nconst useDatabasePool = () => {\n  return useTruthyConstant(() => {\n    console.log('Establishing database connection pool...');\n\n    return new DatabasePool({\n      host: process.env.DB_HOST,\n      port: process.env.DB_PORT,\n      database: process.env.DB_NAME,\n      user: process.env.DB_USER,\n      password: process.env.DB_PASSWORD,\n      min: 2,\n      max: 10,\n      acquireTimeoutMillis: 60000,\n      createTimeoutMillis: 30000,\n      destroyTimeoutMillis: 5000,\n      idleTimeoutMillis: 30000\n    });\n  });\n};\n\n// Chart library initialization\nconst AdvancedChart = ({ data, options }) => {\n  const chartLibrary = useTruthyConstant(() => {\n    console.log('Loading chart library...');\n\n    // Heavy chart library with plugins\n    return {\n      core: new ChartCore(),\n      plugins: {\n        zoom: new ZoomPlugin(),\n        export: new ExportPlugin(),\n        animation: new AnimationPlugin()\n      },\n      themes: loadThemes(),\n      fonts: loadCustomFonts()\n    };\n  });\n\n  const renderChart = (canvas: HTMLCanvasElement) => {\n    if (chartLibrary) {\n      // Library only loaded when chart actually needs to render\n      const chart = chartLibrary.core.create(canvas, {\n        data,\n        options,\n        plugins: Object.values(chartLibrary.plugins)\n      });\n\n      return chart;\n    }\n  };\n\n  return (\n    <ChartCanvas onMount={renderChart} />\n  );\n};\n"})}),"\n",(0,r.jsx)(n.h2,{id:"playground",children:"Playground"}),"\n",(0,r.jsx)(a.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// \u{274C} Eager initialization - always runs on mount
const EagerComponent = () => {
const heavyData = useConstant(() => {
  console.log('Heavy computation running...'); // Always logs on mount
  return processLargeDataset(rawData);
});

return (
  <div>
    <button onClick={() => console.log(heavyData)}>Use Data</button>
  </div>
);
};

// \u{2705} Lazy initialization - only runs when data is accessed
const LazyComponent = () => {
const heavyData = useTruthyConstant(() => {
  console.log('Heavy computation running...'); // Only logs when button clicked
  return processLargeDataset(rawData);
});

return (
  <div>
    <button onClick={() => console.log(heavyData)}>Use Data</button>
  </div>
);
};

// Singleton service with lazy instantiation
const useAnalyticsService = () => {
return useTruthyConstant(() => {
  console.log('Initializing analytics service...'); // Only when first method called
  return new AnalyticsService({
    apiKey: process.env.ANALYTICS_KEY,
    endpoint: process.env.ANALYTICS_ENDPOINT,
    batchSize: 100,
    flushInterval: 5000
  });
});
};

// Conditional expensive initialization
const MediaPlayer = ({ videoUrl, autoplay }) => {
const videoProcessor = useTruthyConstant(() => {
  if (!videoUrl) return null;

  console.log('Initializing video processor...');
  return new VideoProcessor({
    codec: 'h264',
    quality: 'high',
    bufferSize: 1024 * 1024
  });
});

// Processor only created when video actually needs processing
const handlePlay = () => {
  if (videoProcessor) {
    videoProcessor.process(videoUrl);
  }
};

return (
  <div>
    <video src={videoUrl} />
    <button onClick={handlePlay}>Process Video</button>
  </div>
);
};

// Feature detection with caching
const useFeatureDetection = () => {
const features = useTruthyConstant(() => {
  console.log('Running feature detection...'); // Only on first access
  return {
    webgl: detectWebGLSupport(),
    webrtc: detectWebRTCSupport(),
    webAssembly: typeof WebAssembly !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
    intersectionObserver: 'IntersectionObserver' in window
  };
});

return features;
};

// Worker pool initialization on demand
const useWorkerPool = (poolSize = 4) => {
return useTruthyConstant(() => {
  console.log(\`Creating worker pool with \${poolSize} workers...\`);

  const workers = Array.from({ length: poolSize }, () =>
    new Worker('/heavy-computation-worker.js')
  );

  let taskIndex = 0;

  return {
    workers,
    execute: (task: any) => {
      const worker = workers[taskIndex++ % poolSize];
      return new Promise(resolve => {
        worker.onmessage = (e) => resolve(e.data);
        worker.postMessage(task);
      });
    },
    terminate: () => {
      workers.forEach(worker => worker.terminate());
      console.log('Worker pool terminated');
    }
  };
});
};

// WebGL context with lazy initialization
const Canvas3D = ({ enabled, width, height }) => {
const webglContext = useTruthyConstant(() => {
  if (!enabled) return null;

  console.log('Initializing WebGL context...');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('WebGL2 not supported in this browser');
  }

  // Setup WebGL state
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  return {
    canvas,
    gl,
    programs: new Map(),
    buffers: new Map()
  };
});

const render = () => {
  if (webglContext) {
    // WebGL context only created when render is called
    const { gl } = webglContext;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // ... rendering logic
  }
};

if (!enabled) {
  return <div>3D rendering disabled</div>;
}

return (
  <div>
    <button onClick={render}>Start 3D Rendering</button>
    {webglContext && (
      <div>WebGL context ready: {webglContext.canvas.width}x{webglContext.canvas.height}</div>
    )}
  </div>
);
};

// Database connection pool
const useDatabasePool = () => {
return useTruthyConstant(() => {
  console.log('Establishing database connection pool...');

  return new DatabasePool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
  });
});
};

// Chart library initialization
const AdvancedChart = ({ data, options }) => {
const chartLibrary = useTruthyConstant(() => {
  console.log('Loading chart library...');

  // Heavy chart library with plugins
  return {
    core: new ChartCore(),
    plugins: {
      zoom: new ZoomPlugin(),
      export: new ExportPlugin(),
      animation: new AnimationPlugin()
    },
    themes: loadThemes(),
    fonts: loadCustomFonts()
  };
});

const renderChart = (canvas: HTMLCanvasElement) => {
  if (chartLibrary) {
    // Library only loaded when chart actually needs to render
    const chart = chartLibrary.core.create(canvas, {
      data,
      options,
      plugins: Object.values(chartLibrary.plugins)
    });

    return chart;
  }
};

return (
  <ChartCanvas onMount={renderChart} />
);
};`})]})}function h(e={}){let{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}}}]);