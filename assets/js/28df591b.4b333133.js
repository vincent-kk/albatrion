"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["229"],{93353(e,n,t){t.r(n),t.d(n,{metadata:()=>a,default:()=>d,frontMatter:()=>o,contentTitle:()=>i,toc:()=>u,assets:()=>l});var a=JSON.parse('{"id":"winglet/react-utils/hook/useSnapshotReference","title":"useSnapshotReference","description":"Creates a ref containing a deep-compared snapshot that only updates when object contents actually change.","source":"@site/docs/winglet/react-utils/hook/useSnapshotReference.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useSnapshotReference","permalink":"/albatrion/docs/winglet/react-utils/hook/useSnapshotReference","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useSnapshotReference.mdx","tags":[],"version":"current","frontMatter":{"title":"useSnapshotReference","sidebar_label":"useSnapshotReference"},"sidebar":"winglet","previous":{"title":"useSnapshot","permalink":"/albatrion/docs/winglet/react-utils/hook/useSnapshot"},"next":{"title":"useTimeout","permalink":"/albatrion/docs/winglet/react-utils/hook/useTimeout"}}'),r=t(62540),s=t(43023),c=t(91297);let o={title:"useSnapshotReference",sidebar_label:"useSnapshotReference"},i="useSnapshotReference",l={},u=[{value:"When to Use vs useSnapshot",id:"when-to-use-vs-usesnapshot",level:3},{value:"Key Benefits of Ref-Based Approach",id:"key-benefits-of-ref-based-approach",level:3},{value:"Deep Comparison Algorithm",id:"deep-comparison-algorithm",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function f(e){let n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"usesnapshotreference",children:"useSnapshotReference"})}),"\n",(0,r.jsxs)(n.p,{children:["Creates a ref containing a deep-compared snapshot that only updates when object contents actually change.\nThis hook performs deep equality comparison and returns a stable ref object whose\n",(0,r.jsx)(n.code,{children:"current"})," value only changes when the object's contents genuinely change. Unlike\n",(0,r.jsx)(n.code,{children:"useSnapshot"}),", this provides a ref for imperative access, callback stability,\nand integration with external APIs that expect refs."]}),"\n",(0,r.jsx)(n.h3,{id:"when-to-use-vs-usesnapshot",children:"When to Use vs useSnapshot"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"useSnapshotReference"}),": Need ref object, imperative access, external API integration"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"useSnapshot"}),": Direct value access, simpler syntax, most common use case"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"key-benefits-of-ref-based-approach",children:"Key Benefits of Ref-Based Approach"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Callback Stability"}),": Ref reference never changes, perfect for stable callbacks"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Imperative Access"}),": Access current value in timers, event handlers, cleanup"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"External Library Integration"}),": Pass stable refs to non-React code"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Performance Monitoring"}),": Track actual changes separate from re-renders"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Cleanup Functions"}),": Access latest state in cleanup without dependencies"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"deep-comparison-algorithm",children:"Deep Comparison Algorithm"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Type & Emptiness Check"}),": Fast path for unchanged object types"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Deep Equality Comparison"}),": Recursive comparison with exclusion support"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Reference Preservation"}),": Returns same ref when contents identical"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optimized Updates"}),": Only updates ref.current when necessary"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"signature",children:"Signature"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:'const useSnapshotReference: <Input extends object | undefined>(input: Input, omit?: Set<keyof Input> | Array<keyof Input>) => import("react").RefObject<Input>\n'})}),"\n",(0,r.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Name"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"input"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"-"})}),(0,r.jsx)(n.td,{children:"The object to track with deep comparison"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"omit"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"-"})}),(0,r.jsx)(n.td,{children:"Properties to exclude from deep comparison (as Set or Array)"})]})]})]}),"\n",(0,r.jsx)(n.h2,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:"A ref whose current value updates only when object contents actually change"}),"\n",(0,r.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,r.jsx)(n.h3,{id:"example-1",children:"Example 1"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"// \u274C Problem: Callback recreated on every render\nconst DataProcessor = ({ complexData, onProcess }) => {\n  const processData = useCallback(() => {\n    // This callback recreates whenever complexData changes\n    const result = expensiveComputation(complexData);\n    onProcess(result);\n  }, [complexData, onProcess]);\n\n  return <Worker onMessage={processData} />;\n};\n\n// \u2705 Solution: Stable callback with current data access\nconst DataProcessor = ({ complexData, onProcess }) => {\n  const dataRef = useSnapshotReference(complexData);\n  const onProcessRef = useReference(onProcess);\n\n  const processData = useCallback(() => {\n    // Callback reference never changes, but accesses current data\n    const result = expensiveComputation(dataRef.current);\n    onProcessRef.current(result);\n  }, [dataRef]); // dataRef reference never changes\n\n  return <Worker onMessage={processData} />;\n};\n\n// Performance monitoring: separate renders from content changes\nconst PerformanceTracker = ({ data }) => {\n  const dataRef = useSnapshotReference(data);\n  const renderCount = useRef(0);\n  const changeCount = useRef(0);\n  const lastChangeTime = useRef(Date.now());\n\n  // Count every render\n  useEffect(() => {\n    renderCount.current++;\n  });\n\n  // Count only actual data changes\n  useEffect(() => {\n    changeCount.current++;\n    const now = Date.now();\n    const timeSinceLastChange = now - lastChangeTime.current;\n    lastChangeTime.current = now;\n\n    console.log(`Data change #${changeCount.current} after ${timeSinceLastChange}ms`);\n    console.log(`Efficiency: ${changeCount.current}/${renderCount.current} renders had actual changes`);\n  }, [dataRef]);\n\n  return <div>Monitoring data changes...</div>;\n};\n\n// External library integration with stable config\nconst ChartComponent = ({ data, options }) => {\n  const canvasRef = useRef<HTMLCanvasElement>(null);\n  const chartInstanceRef = useRef<Chart>();\n  const configRef = useSnapshotReference({\n    data,\n    options,\n    responsive: true,\n    maintainAspectRatio: false\n  });\n\n  useEffect(() => {\n    if (canvasRef.current) {\n      // Create chart with stable config reference\n      chartInstanceRef.current = new Chart(canvasRef.current, configRef.current);\n    }\n\n    return () => {\n      // Access current config in cleanup\n      const currentConfig = configRef.current;\n      if (currentConfig.options.saveOnDestroy) {\n        chartInstanceRef.current?.toBase64Image();\n      }\n      chartInstanceRef.current?.destroy();\n    };\n  }, [configRef]); // Only recreates when config content changes\n\n  return <canvas ref={canvasRef} />;\n};\n\n// WebSocket message handling with content-based processing\nconst MessageProcessor = ({ websocketMessage }) => {\n  // Exclude volatile fields from comparison\n  const messageRef = useSnapshotReference(websocketMessage, [\n    'timestamp',\n    'sequenceNumber',\n    'receivedAt'\n  ]);\n\n  const processedDataRef = useRef(null);\n\n  useEffect(() => {\n    const message = messageRef.current;\n    if (!message) return;\n\n    // Only reprocess when message content actually changes\n    console.log('Processing new message content:', message.type);\n    processedDataRef.current = processMessage(message);\n\n    // Trigger side effects\n    updateUI(processedDataRef.current);\n    logMessage(message.type, message.data);\n  }, [messageRef]);\n\n  return <MessageDisplay data={processedDataRef.current} />;\n};\n\n// State transition tracking\nconst StateTransitionLogger = ({ appState }) => {\n  const currentStateRef = useSnapshotReference(appState);\n  const previousStateRef = useRef(currentStateRef.current);\n\n  useEffect(() => {\n    const current = currentStateRef.current;\n    const previous = previousStateRef.current;\n\n    if (previous && current !== previous) {\n      const changes = detectChanges(previous, current);\n      logStateTransition({\n        from: previous,\n        to: current,\n        changes,\n        timestamp: Date.now()\n      });\n    }\n\n    previousStateRef.current = current;\n  }, [currentStateRef]);\n\n  return null; // This is a logging-only component\n};\n\n// Imperative handle with stable data access\nconst DataEditor = React.forwardRef(({ initialData, validation }, ref) => {\n  const [currentData, setCurrentData] = useState(initialData);\n  const dataRef = useSnapshotReference(currentData);\n  const validationRef = useSnapshotReference(validation);\n\n  useImperativeHandle(ref, () => ({\n    getData: () => dataRef.current,\n    validate: () => validateData(dataRef.current, validationRef.current),\n    isDirty: () => dataRef.current !== initialData,\n    reset: () => setCurrentData(initialData),\n    getChanges: () => diffData(initialData, dataRef.current)\n  }), [dataRef, validationRef, initialData]);\n\n  return (\n    <div>\n      <DataForm data={currentData} onChange={setCurrentData} />\n    </div>\n  );\n});\n\n// Timer/interval with current state access\nconst AutoSaver = ({ formData, onSave }) => {\n  const formDataRef = useSnapshotReference(formData);\n  const onSaveRef = useReference(onSave);\n\n  useEffect(() => {\n    const interval = setInterval(() => {\n      // Access current form data without recreating interval\n      const currentData = formDataRef.current;\n      if (currentData && currentData.isDirty) {\n        onSaveRef.current(currentData);\n      }\n    }, 30000); // Auto-save every 30 seconds\n\n    return () => clearInterval(interval);\n  }, [formDataRef]); // Interval only recreates when form structure changes\n\n  return null;\n};\n"})}),"\n",(0,r.jsx)(n.h2,{id:"playground",children:"Playground"}),"\n",(0,r.jsx)(c.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// \u{274C} Problem: Callback recreated on every render
const DataProcessor = ({ complexData, onProcess }) => {
const processData = useCallback(() => {
  // This callback recreates whenever complexData changes
  const result = expensiveComputation(complexData);
  onProcess(result);
}, [complexData, onProcess]);

return <Worker onMessage={processData} />;
};

// \u{2705} Solution: Stable callback with current data access
const DataProcessor = ({ complexData, onProcess }) => {
const dataRef = useSnapshotReference(complexData);
const onProcessRef = useReference(onProcess);

const processData = useCallback(() => {
  // Callback reference never changes, but accesses current data
  const result = expensiveComputation(dataRef.current);
  onProcessRef.current(result);
}, [dataRef]); // dataRef reference never changes

return <Worker onMessage={processData} />;
};

// Performance monitoring: separate renders from content changes
const PerformanceTracker = ({ data }) => {
const dataRef = useSnapshotReference(data);
const renderCount = useRef(0);
const changeCount = useRef(0);
const lastChangeTime = useRef(Date.now());

// Count every render
useEffect(() => {
  renderCount.current++;
});

// Count only actual data changes
useEffect(() => {
  changeCount.current++;
  const now = Date.now();
  const timeSinceLastChange = now - lastChangeTime.current;
  lastChangeTime.current = now;

  console.log(\`Data change #\${changeCount.current} after \${timeSinceLastChange}ms\`);
  console.log(\`Efficiency: \${changeCount.current}/\${renderCount.current} renders had actual changes\`);
}, [dataRef]);

return <div>Monitoring data changes...</div>;
};

// External library integration with stable config
const ChartComponent = ({ data, options }) => {
const canvasRef = useRef<HTMLCanvasElement>(null);
const chartInstanceRef = useRef<Chart>();
const configRef = useSnapshotReference({
  data,
  options,
  responsive: true,
  maintainAspectRatio: false
});

useEffect(() => {
  if (canvasRef.current) {
    // Create chart with stable config reference
    chartInstanceRef.current = new Chart(canvasRef.current, configRef.current);
  }

  return () => {
    // Access current config in cleanup
    const currentConfig = configRef.current;
    if (currentConfig.options.saveOnDestroy) {
      chartInstanceRef.current?.toBase64Image();
    }
    chartInstanceRef.current?.destroy();
  };
}, [configRef]); // Only recreates when config content changes

return <canvas ref={canvasRef} />;
};

// WebSocket message handling with content-based processing
const MessageProcessor = ({ websocketMessage }) => {
// Exclude volatile fields from comparison
const messageRef = useSnapshotReference(websocketMessage, [
  'timestamp',
  'sequenceNumber',
  'receivedAt'
]);

const processedDataRef = useRef(null);

useEffect(() => {
  const message = messageRef.current;
  if (!message) return;

  // Only reprocess when message content actually changes
  console.log('Processing new message content:', message.type);
  processedDataRef.current = processMessage(message);

  // Trigger side effects
  updateUI(processedDataRef.current);
  logMessage(message.type, message.data);
}, [messageRef]);

return <MessageDisplay data={processedDataRef.current} />;
};

// State transition tracking
const StateTransitionLogger = ({ appState }) => {
const currentStateRef = useSnapshotReference(appState);
const previousStateRef = useRef(currentStateRef.current);

useEffect(() => {
  const current = currentStateRef.current;
  const previous = previousStateRef.current;

  if (previous && current !== previous) {
    const changes = detectChanges(previous, current);
    logStateTransition({
      from: previous,
      to: current,
      changes,
      timestamp: Date.now()
    });
  }

  previousStateRef.current = current;
}, [currentStateRef]);

return null; // This is a logging-only component
};

// Imperative handle with stable data access
const DataEditor = React.forwardRef(({ initialData, validation }, ref) => {
const [currentData, setCurrentData] = useState(initialData);
const dataRef = useSnapshotReference(currentData);
const validationRef = useSnapshotReference(validation);

useImperativeHandle(ref, () => ({
  getData: () => dataRef.current,
  validate: () => validateData(dataRef.current, validationRef.current),
  isDirty: () => dataRef.current !== initialData,
  reset: () => setCurrentData(initialData),
  getChanges: () => diffData(initialData, dataRef.current)
}), [dataRef, validationRef, initialData]);

return (
  <div>
    <DataForm data={currentData} onChange={setCurrentData} />
  </div>
);
});

// Timer/interval with current state access
const AutoSaver = ({ formData, onSave }) => {
const formDataRef = useSnapshotReference(formData);
const onSaveRef = useReference(onSave);

useEffect(() => {
  const interval = setInterval(() => {
    // Access current form data without recreating interval
    const currentData = formDataRef.current;
    if (currentData && currentData.isDirty) {
      onSaveRef.current(currentData);
    }
  }, 30000); // Auto-save every 30 seconds

  return () => clearInterval(interval);
}, [formDataRef]); // Interval only recreates when form structure changes

return null;
};`})]})}function d(e={}){let{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(f,{...e})}):f(e)}}}]);