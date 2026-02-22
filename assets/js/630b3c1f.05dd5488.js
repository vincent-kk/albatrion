"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["3832"],{5402(e,n,r){r.r(n),r.d(n,{metadata:()=>t,default:()=>h,frontMatter:()=>i,contentTitle:()=>c,toc:()=>d,assets:()=>l});var t=JSON.parse('{"id":"winglet/react-utils/hook/useVersion","title":"useVersion","description":"Provides a manual re-render trigger with optional side effects and render counting.","source":"@site/docs/winglet/react-utils/hook/useVersion.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useVersion","permalink":"/albatrion/docs/winglet/react-utils/hook/useVersion","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useVersion.mdx","tags":[],"version":"current","frontMatter":{"title":"useVersion","sidebar_label":"useVersion"},"sidebar":"winglet","previous":{"title":"useTruthyConstant","permalink":"/albatrion/docs/winglet/react-utils/hook/useTruthyConstant"},"next":{"title":"useWindowSize","permalink":"/albatrion/docs/winglet/react-utils/hook/useWindowSize"}}'),a=r(62540),s=r(43023),o=r(91297);let i={title:"useVersion",sidebar_label:"useVersion"},c="useVersion",l={},d=[{value:"Primary Use Cases",id:"primary-use-cases",level:3},{value:"When React Doesn&#39;t Know About Changes",id:"when-react-doesnt-know-about-changes",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function u(e){let n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"useversion",children:"useVersion"})}),"\n",(0,a.jsx)(n.p,{children:'Provides a manual re-render trigger with optional side effects and render counting.\nThis hook creates a simple but powerful mechanism for forcing component updates\nby incrementing an internal counter. Each call to the update function increments\nthe counter and triggers a re-render, optionally executing a callback first.\nThe counter value serves as a "render generation" indicator.'}),"\n",(0,a.jsx)(n.h3,{id:"primary-use-cases",children:"Primary Use Cases"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"Force Re-renders"}),": Update component when external data changes outside React's tracking"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"Cache Invalidation"}),": Invalidate memoized values by changing dependency"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"Manual Refresh"}),": Implement refresh buttons, pull-to-refresh, or manual sync"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"External State Sync"}),": Re-render after non-React state changes (global stores, DOM events)"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"Debug Re-renders"}),": Track and count component update cycles"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.strong,{children:"Key Prop Generation"}),": Force remount child components with changing keys"]}),"\n"]}),"\n",(0,a.jsx)(n.h3,{id:"when-react-doesnt-know-about-changes",children:"When React Doesn't Know About Changes"}),"\n",(0,a.jsx)(n.p,{children:"Sometimes you need to force re-renders due to changes React can't automatically detect:"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsx)(n.li,{children:"External library state changes"}),"\n",(0,a.jsx)(n.li,{children:"DOM manipulations outside React"}),"\n",(0,a.jsx)(n.li,{children:"Global variables or window properties"}),"\n",(0,a.jsx)(n.li,{children:"WebSocket/Server-sent events"}),"\n",(0,a.jsx)(n.li,{children:"LocalStorage/SessionStorage changes"}),"\n"]}),"\n",(0,a.jsx)(n.h2,{id:"signature",children:"Signature"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-typescript",children:"const useVersion: (callback?: Fn) => readonly [number, () => void]\n"})}),"\n",(0,a.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n",(0,a.jsxs)(n.table,{children:[(0,a.jsx)(n.thead,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.th,{children:"Name"}),(0,a.jsx)(n.th,{children:"Type"}),(0,a.jsx)(n.th,{children:"Description"})]})}),(0,a.jsx)(n.tbody,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"callback"})}),(0,a.jsx)(n.td,{children:(0,a.jsx)(n.code,{children:"-"})}),(0,a.jsx)(n.td,{children:"Optional function to execute before incrementing the version and triggering re-render"})]})})]}),"\n",(0,a.jsx)(n.h2,{id:"returns",children:"Returns"}),"\n",(0,a.jsx)(n.p,{children:"A tuple of [version, updateVersion]: - version: Current version number (starts at 0, increments with each update) - updateVersion: Function to increment version and trigger re-render"}),"\n",(0,a.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,a.jsx)(n.h3,{id:"example-1",children:"Example 1"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-typescript",children:"// Basic manual refresh functionality\nconst DataList = () => {\n  const [renderCount, refresh] = useVersion();\n  const [data, setData] = useState([]);\n\n  const fetchData = async () => {\n    const response = await api.getData();\n    setData(response);\n  };\n\n  useEffect(() => {\n    fetchData();\n  }, [renderCount]); // Refetch when refresh is triggered\n\n  return (\n    <div>\n      <div>Render #{renderCount}</div>\n      <button onClick={refresh}>Refresh Data</button>\n      <DataDisplay data={data} />\n    </div>\n  );\n};\n\n// Force re-render with side effects\nconst ExternalDataSync = ({ externalStore }) => {\n  const [version, syncData] = useVersion(() => {\n    console.log('Syncing with external data source...');\n    externalStore.refresh();\n    analytics.track('ManualSync', { timestamp: Date.now() });\n  });\n\n  useEffect(() => {\n    // Listen to external store changes\n    const unsubscribe = externalStore.onChange(() => {\n      syncData(); // Force re-render when external data changes\n    });\n    return unsubscribe;\n  }, [syncData]);\n\n  return (\n    <div>\n      <div>Sync version: {version}</div>\n      <div>Data: {externalStore.getCurrentData()}</div>\n      <button onClick={syncData}>Manual Sync</button>\n    </div>\n  );\n};\n\n// Cache invalidation pattern\nconst ExpensiveCalculation = ({ input }) => {\n  const [cacheVersion, invalidateCache] = useVersion();\n\n  const expensiveResult = useMemo(() => {\n    console.log('Recalculating expensive result...');\n    return performExpensiveCalculation(input);\n  }, [input, cacheVersion]); // Cache invalidated when version changes\n\n  return (\n    <div>\n      <div>Result: {expensiveResult}</div>\n      <div>Cache version: {cacheVersion}</div>\n      <button onClick={invalidateCache}>Force Recalculate</button>\n    </div>\n  );\n};\n\n// Child component remounting\nconst FormWithReset = ({ initialData }) => {\n  const [resetKey, resetForm] = useVersion();\n  // Key prop forces complete remount of form\n  return (\n    <div>\n      <ComplexForm key={resetKey} initialData={initialData} />\n      <button onClick={resetForm}>Reset Form</button>\n    </div>\n  );\n};\n\n// External library integration\nconst ThirdPartyChart = ({ data }) => {\n  const [version, forceUpdate] = useVersion();\n  const chartRef = useRef(null);\n  const chartInstanceRef = useRef(null);\n\n  useEffect(() => {\n    if (chartRef.current) {\n      // Initialize third-party chart\n      chartInstanceRef.current = new ExternalChart(chartRef.current, {\n        data,\n        onDataChange: () => forceUpdate() // Force re-render on external changes\n      });\n    }\n\n    return () => {\n      chartInstanceRef.current?.destroy();\n    };\n  }, [data, forceUpdate, version]); // Include version to trigger effect\n\n  return (\n    <div>\n      <div ref={chartRef} />\n      <div>Chart render: {version}</div>\n      <button onClick={forceUpdate}>Refresh Chart</button>\n    </div>\n  );\n};\n\n// Performance monitoring and debugging\nconst PerformanceMonitor = ({ children }) => {\n  const [renderCount, triggerRender] = useVersion();\n  const lastRenderTime = useRef(Date.now());\n  const renderTimes = useRef<number[]>([]);\n\n  useEffect(() => {\n    const now = Date.now();\n    const timeSinceLastRender = now - lastRenderTime.current;\n    renderTimes.current.push(timeSinceLastRender);\n    lastRenderTime.current = now;\n\n    // Keep only last 10 render times\n    if (renderTimes.current.length > 10) {\n      renderTimes.current = renderTimes.current.slice(-10);\n    }\n\n    console.log(`Render #${renderCount}, Time since last: ${timeSinceLastRender}ms`);\n  });\n\n  const averageRenderTime = renderTimes.current.length > 0\n    ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length\n    : 0;\n\n  return (\n    <div>\n      <div className=\"debug-info\">\n        <span>Renders: {renderCount}</span>\n        <span>Avg time: {averageRenderTime.toFixed(1)}ms</span>\n        <button onClick={triggerRender}>Force Render</button>\n      </div>\n      {children}\n    </div>\n  );\n};\n\n// Real-time data with manual refresh\nconst LiveDashboard = () => {\n  const [version, refresh] = useVersion(() => {\n    console.log('Dashboard refresh triggered');\n    // Could trigger analytics, notifications, etc.\n  });\n\n  const [data, setData] = useState(null);\n  const [lastUpdate, setLastUpdate] = useState(null);\n\n  useEffect(() => {\n    const fetchLiveData = async () => {\n      const response = await fetch('/api/live-data');\n      const newData = await response.json();\n      setData(newData);\n      setLastUpdate(new Date().toLocaleString());\n    };\n\n    fetchLiveData();\n\n    // Auto-refresh every 30 seconds\n    const interval = setInterval(fetchLiveData, 30000);\n    return () => clearInterval(interval);\n  }, [version]); // Manual refresh also triggers data fetch\n\n  return (\n    <div>\n      <header>\n        <h1>Live Dashboard (v{version})</h1>\n        <div>Last updated: {lastUpdate}</div>\n        <button onClick={refresh}>Refresh Now</button>\n      </header>\n      <DashboardContent data={data} />\n    </div>\n  );\n};\n\n// Error recovery with version reset\nconst ErrorRecoveryComponent = () => {\n  const [version, resetComponent] = useVersion(() => {\n    console.log('Component reset triggered');\n    // Clear error states, reset caches, etc.\n  });\n\n  const [error, setError] = useState(null);\n\n  const handleError = (error: Error) => {\n    setError(error);\n    console.error('Component error:', error);\n  };\n\n  const handleReset = () => {\n    setError(null);\n    resetComponent(); // Trigger fresh render cycle\n  };\n\n  if (error) {\n    return (\n      <div className=\"error-boundary\">\n        <h2>Something went wrong (Render #{version})</h2>\n        <pre>{error.message}</pre>\n        <button onClick={handleReset}>Reset Component</button>\n      </div>\n    );\n  }\n\n  return (\n    <ErrorBoundary onError={handleError}>\n      <ComplexComponent key={version} />\n    </ErrorBoundary>\n  );\n};\n"})}),"\n",(0,a.jsx)(n.h2,{id:"playground",children:"Playground"}),"\n",(0,a.jsx)(o.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// Basic manual refresh functionality
const DataList = () => {
const [renderCount, refresh] = useVersion();
const [data, setData] = useState([]);

const fetchData = async () => {
  const response = await api.getData();
  setData(response);
};

useEffect(() => {
  fetchData();
}, [renderCount]); // Refetch when refresh is triggered

return (
  <div>
    <div>Render #{renderCount}</div>
    <button onClick={refresh}>Refresh Data</button>
    <DataDisplay data={data} />
  </div>
);
};

// Force re-render with side effects
const ExternalDataSync = ({ externalStore }) => {
const [version, syncData] = useVersion(() => {
  console.log('Syncing with external data source...');
  externalStore.refresh();
  analytics.track('ManualSync', { timestamp: Date.now() });
});

useEffect(() => {
  // Listen to external store changes
  const unsubscribe = externalStore.onChange(() => {
    syncData(); // Force re-render when external data changes
  });
  return unsubscribe;
}, [syncData]);

return (
  <div>
    <div>Sync version: {version}</div>
    <div>Data: {externalStore.getCurrentData()}</div>
    <button onClick={syncData}>Manual Sync</button>
  </div>
);
};

// Cache invalidation pattern
const ExpensiveCalculation = ({ input }) => {
const [cacheVersion, invalidateCache] = useVersion();

const expensiveResult = useMemo(() => {
  console.log('Recalculating expensive result...');
  return performExpensiveCalculation(input);
}, [input, cacheVersion]); // Cache invalidated when version changes

return (
  <div>
    <div>Result: {expensiveResult}</div>
    <div>Cache version: {cacheVersion}</div>
    <button onClick={invalidateCache}>Force Recalculate</button>
  </div>
);
};

// Child component remounting
const FormWithReset = ({ initialData }) => {
const [resetKey, resetForm] = useVersion();
// Key prop forces complete remount of form
return (
  <div>
    <ComplexForm key={resetKey} initialData={initialData} />
    <button onClick={resetForm}>Reset Form</button>
  </div>
);
};

// External library integration
const ThirdPartyChart = ({ data }) => {
const [version, forceUpdate] = useVersion();
const chartRef = useRef(null);
const chartInstanceRef = useRef(null);

useEffect(() => {
  if (chartRef.current) {
    // Initialize third-party chart
    chartInstanceRef.current = new ExternalChart(chartRef.current, {
      data,
      onDataChange: () => forceUpdate() // Force re-render on external changes
    });
  }

  return () => {
    chartInstanceRef.current?.destroy();
  };
}, [data, forceUpdate, version]); // Include version to trigger effect

return (
  <div>
    <div ref={chartRef} />
    <div>Chart render: {version}</div>
    <button onClick={forceUpdate}>Refresh Chart</button>
  </div>
);
};

// Performance monitoring and debugging
const PerformanceMonitor = ({ children }) => {
const [renderCount, triggerRender] = useVersion();
const lastRenderTime = useRef(Date.now());
const renderTimes = useRef<number[]>([]);

useEffect(() => {
  const now = Date.now();
  const timeSinceLastRender = now - lastRenderTime.current;
  renderTimes.current.push(timeSinceLastRender);
  lastRenderTime.current = now;

  // Keep only last 10 render times
  if (renderTimes.current.length > 10) {
    renderTimes.current = renderTimes.current.slice(-10);
  }

  console.log(\`Render #\${renderCount}, Time since last: \${timeSinceLastRender}ms\`);
});

const averageRenderTime = renderTimes.current.length > 0
  ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
  : 0;

return (
  <div>
    <div className="debug-info">
      <span>Renders: {renderCount}</span>
      <span>Avg time: {averageRenderTime.toFixed(1)}ms</span>
      <button onClick={triggerRender}>Force Render</button>
    </div>
    {children}
  </div>
);
};

// Real-time data with manual refresh
const LiveDashboard = () => {
const [version, refresh] = useVersion(() => {
  console.log('Dashboard refresh triggered');
  // Could trigger analytics, notifications, etc.
});

const [data, setData] = useState(null);
const [lastUpdate, setLastUpdate] = useState(null);

useEffect(() => {
  const fetchLiveData = async () => {
    const response = await fetch('/api/live-data');
    const newData = await response.json();
    setData(newData);
    setLastUpdate(new Date().toLocaleString());
  };

  fetchLiveData();

  // Auto-refresh every 30 seconds
  const interval = setInterval(fetchLiveData, 30000);
  return () => clearInterval(interval);
}, [version]); // Manual refresh also triggers data fetch

return (
  <div>
    <header>
      <h1>Live Dashboard (v{version})</h1>
      <div>Last updated: {lastUpdate}</div>
      <button onClick={refresh}>Refresh Now</button>
    </header>
    <DashboardContent data={data} />
  </div>
);
};

// Error recovery with version reset
const ErrorRecoveryComponent = () => {
const [version, resetComponent] = useVersion(() => {
  console.log('Component reset triggered');
  // Clear error states, reset caches, etc.
});

const [error, setError] = useState(null);

const handleError = (error: Error) => {
  setError(error);
  console.error('Component error:', error);
};

const handleReset = () => {
  setError(null);
  resetComponent(); // Trigger fresh render cycle
};

if (error) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong (Render #{version})</h2>
      <pre>{error.message}</pre>
      <button onClick={handleReset}>Reset Component</button>
    </div>
  );
}

return (
  <ErrorBoundary onError={handleError}>
    <ComplexComponent key={version} />
  </ErrorBoundary>
);
};`})]})}function h(e={}){let{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(u,{...e})}):u(e)}}}]);