"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["7933"],{83879(e,t,s){s.r(t),s.d(t,{metadata:()=>n,default:()=>h,frontMatter:()=>o,contentTitle:()=>c,toc:()=>u,assets:()=>r});var n=JSON.parse('{"id":"winglet/react-utils/hook/useTimeout","title":"useTimeout","description":"Provides imperative control over setTimeout with React-friendly state management.","source":"@site/docs/winglet/react-utils/hook/useTimeout.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useTimeout","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useTimeout","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useTimeout.mdx","tags":[],"version":"current","frontMatter":{"title":"useTimeout","sidebar_label":"useTimeout"},"sidebar":"winglet","previous":{"title":"useSnapshotReference","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useSnapshotReference"},"next":{"title":"useTruthyConstant","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useTruthyConstant"}}'),i=s(62540),a=s(43023),l=s(91297);let o={title:"useTimeout",sidebar_label:"useTimeout"},c="useTimeout",r={},u=[{value:"Key Features",id:"key-features",level:3},{value:"Use Cases",id:"use-cases",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function d(e){let t={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,a.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.header,{children:(0,i.jsx)(t.h1,{id:"usetimeout",children:"useTimeout"})}),"\n",(0,i.jsx)(t.p,{children:"Provides imperative control over setTimeout with React-friendly state management.\nThis hook creates a managed timeout system that integrates seamlessly with React's\nlifecycle. Unlike raw setTimeout, it provides state tracking, automatic cleanup,\nand safe callback updates without recreating timers."}),"\n",(0,i.jsx)(t.h3,{id:"key-features",children:"Key Features"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Manual Control"}),": Explicitly schedule, reschedule, or cancel timeouts"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"State Tracking"}),": Check if a timeout is pending with ",(0,i.jsx)(t.code,{children:"isIdle()"})]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Safe Updates"}),": Callback updates don't affect running timers"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Auto-cleanup"}),": Prevents memory leaks on unmount"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Reschedule Support"}),": Calling schedule() resets existing timers"]}),"\n"]}),"\n",(0,i.jsx)(t.h3,{id:"use-cases",children:"Use Cases"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Delayed Actions"}),": Show notifications, hide tooltips, or auto-save"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Debouncing"}),": Implement custom debounce logic with full control"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Timeout Sequences"}),": Chain multiple timeouts with state awareness"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Conditional Delays"}),": Execute actions based on timeout state"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Loading States"}),": Auto-hide loading indicators after delay"]}),"\n"]}),"\n",(0,i.jsx)(t.h2,{id:"signature",children:"Signature"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-typescript",children:"const useTimeout: (callback: Fn, timeout?: number) => UseTimeoutReturn\n"})}),"\n",(0,i.jsx)(t.h2,{id:"parameters",children:"Parameters"}),"\n",(0,i.jsxs)(t.table,{children:[(0,i.jsx)(t.thead,{children:(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.th,{children:"Name"}),(0,i.jsx)(t.th,{children:"Type"}),(0,i.jsx)(t.th,{children:"Description"})]})}),(0,i.jsxs)(t.tbody,{children:[(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"callback"})}),(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"-"})}),(0,i.jsx)(t.td,{children:"The function to execute after the timeout. Can be updated without affecting running timers"})]}),(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"timeout"})}),(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"-"})}),(0,i.jsx)(t.td,{children:"The delay in milliseconds before executing the callback (default: 0)"})]})]})]}),"\n",(0,i.jsx)(t.h2,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.code,{children:"Object"})," \u2014 Control object with three methods:"]}),"\n",(0,i.jsx)(t.h2,{id:"examples",children:"Examples"}),"\n",(0,i.jsx)(t.h3,{id:"example-1",children:"Example 1"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-typescript",children:"// Auto-dismiss notification\nconst Notification = ({ message, duration = 3000 }) => {\n  const { schedule, cancel } = useTimeout(() => {\n    setVisible(false);\n  }, duration);\n\n  useEffect(() => {\n    schedule();\n    return cancel; // Cleanup on unmount\n  }, [schedule, cancel]);\n\n  return (\n    <div onMouseEnter={cancel} onMouseLeave={schedule}>\n      {message}\n    </div>\n  );\n};\n\n// Loading state with timeout\nconst DataFetcher = () => {\n  const [showSkeleton, setShowSkeleton] = useState(false);\n  const { isIdle, schedule, cancel } = useTimeout(\n    () => setShowSkeleton(true),\n    200 // Show skeleton after 200ms\n  );\n\n  const fetchData = async () => {\n    schedule(); // Start skeleton timer\n    try {\n      const data = await api.getData();\n      if (!isIdle()) {\n        cancel(); // Cancel if data loads quickly\n      }\n      setData(data);\n    } catch (error) {\n      cancel();\n      setError(error);\n    }\n  };\n};\n\n// Sequential timeouts\nconst AnimationSequence = () => {\n  const [stage, setStage] = useState(0);\n\n  const stage1Timeout = useTimeout(() => setStage(1), 1000);\n  const stage2Timeout = useTimeout(() => setStage(2), 1000);\n  const stage3Timeout = useTimeout(() => setStage(3), 1000);\n\n  useEffect(() => {\n    if (stage === 0) stage1Timeout.schedule();\n    else if (stage === 1) stage2Timeout.schedule();\n    else if (stage === 2) stage3Timeout.schedule();\n  }, [stage]);\n};\n\n// Conditional execution based on state\nconst { isIdle, schedule, cancel } = useTimeout(() => {\n  if (hasUnsavedChanges) {\n    saveDocument();\n  }\n}, 5000);\n\n// Reschedule on user activity\nconst handleUserInput = () => {\n  cancel();\n  schedule(); // Reset 5-second timer\n};\n"})}),"\n",(0,i.jsx)(t.h2,{id:"playground",children:"Playground"}),"\n",(0,i.jsx)(l.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// Auto-dismiss notification
const Notification = ({ message, duration = 3000 }) => {
const { schedule, cancel } = useTimeout(() => {
  setVisible(false);
}, duration);

useEffect(() => {
  schedule();
  return cancel; // Cleanup on unmount
}, [schedule, cancel]);

return (
  <div onMouseEnter={cancel} onMouseLeave={schedule}>
    {message}
  </div>
);
};

// Loading state with timeout
const DataFetcher = () => {
const [showSkeleton, setShowSkeleton] = useState(false);
const { isIdle, schedule, cancel } = useTimeout(
  () => setShowSkeleton(true),
  200 // Show skeleton after 200ms
);

const fetchData = async () => {
  schedule(); // Start skeleton timer
  try {
    const data = await api.getData();
    if (!isIdle()) {
      cancel(); // Cancel if data loads quickly
    }
    setData(data);
  } catch (error) {
    cancel();
    setError(error);
  }
};
};

// Sequential timeouts
const AnimationSequence = () => {
const [stage, setStage] = useState(0);

const stage1Timeout = useTimeout(() => setStage(1), 1000);
const stage2Timeout = useTimeout(() => setStage(2), 1000);
const stage3Timeout = useTimeout(() => setStage(3), 1000);

useEffect(() => {
  if (stage === 0) stage1Timeout.schedule();
  else if (stage === 1) stage2Timeout.schedule();
  else if (stage === 2) stage3Timeout.schedule();
}, [stage]);
};

// Conditional execution based on state
const { isIdle, schedule, cancel } = useTimeout(() => {
if (hasUnsavedChanges) {
  saveDocument();
}
}, 5000);

// Reschedule on user activity
const handleUserInput = () => {
cancel();
schedule(); // Reset 5-second timer
};`})]})}function h(e={}){let{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}}}]);