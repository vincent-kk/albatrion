"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["1172"],{28070(e,n,t){t.r(n),t.d(n,{metadata:()=>r,default:()=>h,frontMatter:()=>a,contentTitle:()=>i,toc:()=>l,assets:()=>u});var r=JSON.parse('{"id":"winglet/react-utils/hook/useOnUnmount","title":"useOnUnmount","description":"Executes a cleanup function when the component unmounts.","source":"@site/docs/winglet/react-utils/hook/useOnUnmount.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useOnUnmount","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useOnUnmount","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useOnUnmount.mdx","tags":[],"version":"current","frontMatter":{"title":"useOnUnmount","sidebar_label":"useOnUnmount"},"sidebar":"winglet","previous":{"title":"useOnMountLayout","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useOnMountLayout"},"next":{"title":"useOnUnmountLayout","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useOnUnmountLayout"}}'),s=t(62540),c=t(43023),o=t(91297);let a={title:"useOnUnmount",sidebar_label:"useOnUnmount"},i="useOnUnmount",u={},l=[{value:"Use Cases",id:"use-cases",level:3},{value:"Critical Limitations",id:"critical-limitations",level:3},{value:"Solutions for Current State Access",id:"solutions-for-current-state-access",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function d(e){let n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,c.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"useonunmount",children:"useOnUnmount"})}),"\n",(0,s.jsxs)(n.p,{children:["Executes a cleanup function when the component unmounts.\nThis hook provides a semantic and intentional way to handle cleanup logic that should\nonly run when a component is removed from the DOM. It offers cleaner syntax than\nremembering to return cleanup functions from ",(0,s.jsx)(n.code,{children:"useEffect"})," and makes unmount logic explicit."]}),"\n",(0,s.jsx)(n.h3,{id:"use-cases",children:"Use Cases"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Resource Cleanup"}),": Cancel subscriptions, timers, or async operations"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Event Listener Removal"}),": Clean up global event listeners"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Connection Closure"}),": Close WebSocket, SSE, or database connections"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"State Persistence"}),": Save component state before unmounting"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Analytics Tracking"}),": Record session duration or usage metrics"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Memory Management"}),": Clear caches, release large objects, or cleanup workers"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"critical-limitations",children:"Critical Limitations"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Stale Closure Warning"}),": The handler function captures values at mount time only"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"No State Updates"}),": Handler won't see later state or prop changes"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Single Execution"}),": Only runs on unmount, never on dependency changes"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"solutions-for-current-state-access",children:"Solutions for Current State Access"}),"\n",(0,s.jsxs)(n.p,{children:["Use ",(0,s.jsx)(n.code,{children:"useReference"})," or ",(0,s.jsx)(n.code,{children:"useRef"})," to access current values in cleanup:"]}),"\n",(0,s.jsx)(n.h2,{id:"signature",children:"Signature"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"const useOnUnmount: (handler: Fn) => void\n"})}),"\n",(0,s.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Name"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"handler"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"-"})}),(0,s.jsx)(n.td,{children:"The cleanup function to execute when the component unmounts"})]})})]}),"\n",(0,s.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,s.jsx)(n.h3,{id:"example-1",children:"Example 1"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"// \u274C Problematic: captures stale state\nconst [count, setCount] = useState(0);\nuseOnUnmount(() => {\n  console.log(count); // Always logs initial value (0)\n});\n\n// \u2705 Correct: access current state\nconst [count, setCount] = useState(0);\nconst countRef = useReference(count);\nuseOnUnmount(() => {\n  console.log(countRef.current); // Logs current value\n});\n\n// Cancel ongoing requests with current context\nconst controller = useRef(new AbortController());\nconst userIdRef = useReference(userId);\n\nuseOnUnmount(() => {\n  controller.current.abort();\n  analytics.track('UserSessionEnd', {\n    userId: userIdRef.current,\n    timestamp: Date.now()\n  });\n});\n\n// Save draft with current form state\nconst formDataRef = useReference(formData);\nconst isDirtyRef = useReference(isDirty);\n\nuseOnUnmount(() => {\n  if (isDirtyRef.current) {\n    localStorage.setItem('draft', JSON.stringify(formDataRef.current));\n  }\n});\n\n// Third-party library cleanup\nconst chartInstance = useRef<Chart>();\n\nuseOnMount(() => {\n  chartInstance.current = new Chart(canvasRef.current, config);\n});\n\nuseOnUnmount(() => {\n  chartInstance.current?.destroy();\n  chartInstance.current = undefined;\n});\n\n// Multiple timer cleanup with Set\nconst activeTimers = useRef(new Set<NodeJS.Timer>());\n\nconst scheduleTimer = useCallback((callback: () => void, delay: number) => {\n  const timer = setTimeout(() => {\n    activeTimers.current.delete(timer);\n    callback();\n  }, delay);\n  activeTimers.current.add(timer);\n  return timer;\n}, []);\n\nuseOnUnmount(() => {\n  activeTimers.current.forEach(timer => clearTimeout(timer));\n  activeTimers.current.clear();\n});\n\n// WebSocket with graceful shutdown\nconst wsRef = useRef<WebSocket>();\nconst connectionStateRef = useReference(connectionState);\n\nuseOnUnmount(() => {\n  if (wsRef.current && connectionStateRef.current === 'connected') {\n    wsRef.current.close(1000, 'Component unmounting');\n  }\n});\n"})}),"\n",(0,s.jsx)(n.h2,{id:"playground",children:"Playground"}),"\n",(0,s.jsx)(o.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// \u{274C} Problematic: captures stale state
const [count, setCount] = useState(0);
useOnUnmount(() => {
console.log(count); // Always logs initial value (0)
});

// \u{2705} Correct: access current state
const [count, setCount] = useState(0);
const countRef = useReference(count);
useOnUnmount(() => {
console.log(countRef.current); // Logs current value
});

// Cancel ongoing requests with current context
const controller = useRef(new AbortController());
const userIdRef = useReference(userId);

useOnUnmount(() => {
controller.current.abort();
analytics.track('UserSessionEnd', {
  userId: userIdRef.current,
  timestamp: Date.now()
});
});

// Save draft with current form state
const formDataRef = useReference(formData);
const isDirtyRef = useReference(isDirty);

useOnUnmount(() => {
if (isDirtyRef.current) {
  localStorage.setItem('draft', JSON.stringify(formDataRef.current));
}
});

// Third-party library cleanup
const chartInstance = useRef<Chart>();

useOnMount(() => {
chartInstance.current = new Chart(canvasRef.current, config);
});

useOnUnmount(() => {
chartInstance.current?.destroy();
chartInstance.current = undefined;
});

// Multiple timer cleanup with Set
const activeTimers = useRef(new Set<NodeJS.Timer>());

const scheduleTimer = useCallback((callback: () => void, delay: number) => {
const timer = setTimeout(() => {
  activeTimers.current.delete(timer);
  callback();
}, delay);
activeTimers.current.add(timer);
return timer;
}, []);

useOnUnmount(() => {
activeTimers.current.forEach(timer => clearTimeout(timer));
activeTimers.current.clear();
});

// WebSocket with graceful shutdown
const wsRef = useRef<WebSocket>();
const connectionStateRef = useReference(connectionState);

useOnUnmount(() => {
if (wsRef.current && connectionStateRef.current === 'connected') {
  wsRef.current.close(1000, 'Component unmounting');
}
});`})]})}function h(e={}){let{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}}}]);