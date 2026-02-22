"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["1899"],{21059(e,n,t){t.r(n),t.d(n,{metadata:()=>s,default:()=>h,frontMatter:()=>l,contentTitle:()=>o,toc:()=>u,assets:()=>i});var s=JSON.parse('{"id":"winglet/react-utils/hook/useReference","title":"useReference","description":"Creates a ref that always contains the current value, updating automatically on every render.","source":"@site/docs/winglet/react-utils/hook/useReference.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useReference","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useReference","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useReference.mdx","tags":[],"version":"current","frontMatter":{"title":"useReference","sidebar_label":"useReference"},"sidebar":"winglet","previous":{"title":"useOnUnmountLayout","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useOnUnmountLayout"},"next":{"title":"useRestProperties","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useRestProperties"}}'),r=t(62540),c=t(43023),a=t(91297);let l={title:"useReference",sidebar_label:"useReference"},o="useReference",i={},u=[{value:"Problem it Solves",id:"problem-it-solves",level:3},{value:"Use Cases",id:"use-cases",level:3},{value:"Comparison with Alternatives",id:"comparison-with-alternatives",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function d(e){let n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,c.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"usereference",children:"useReference"})}),"\n",(0,r.jsxs)(n.p,{children:['Creates a ref that always contains the current value, updating automatically on every render.\nThis hook solves the "stale closure" problem by ensuring that async callbacks, effects,\nand event handlers always have access to the latest value without needing to recreate\nthemselves. Unlike a regular ',(0,r.jsx)(n.code,{children:"useRef"}),", this ref's current value is updated on every\nrender to match the provided value."]}),"\n",(0,r.jsx)(n.h3,{id:"problem-it-solves",children:"Problem it Solves"}),"\n",(0,r.jsx)(n.p,{children:"When callbacks are created in React, they capture values from their closure. If these\nvalues change later, the callback still sees the old values. This hook ensures you\nalways have access to the current value without recreating callbacks."}),"\n",(0,r.jsx)(n.h3,{id:"use-cases",children:"Use Cases"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Async Callbacks"}),": Access current state in setTimeout/setInterval callbacks"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Event Handlers"}),": Use latest props/state in debounced or throttled handlers"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Effect Cleanup"}),": Access current values in cleanup functions"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Imperative Handles"}),": Expose methods that use current component state"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"External Library Callbacks"}),": Provide callbacks to non-React code"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"comparison-with-alternatives",children:"Comparison with Alternatives"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"vs useRef"}),": This updates automatically; useRef requires manual updates"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"vs useState"}),": This doesn't trigger re-renders when updated"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"vs useCallback deps"}),": This avoids recreating callbacks when values change"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"signature",children:"Signature"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:'const useReference: <T>(value: T) => import("react").RefObject<T>\n'})}),"\n",(0,r.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Name"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"value"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"-"})}),(0,r.jsx)(n.td,{children:"The value to track. The ref will always contain this latest value"})]})})]}),"\n",(0,r.jsx)(n.h2,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:["A ref object whose ",(0,r.jsx)(n.code,{children:"current"})," property always equals the latest ",(0,r.jsx)(n.code,{children:"value"})]}),"\n",(0,r.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,r.jsx)(n.h3,{id:"example-1",children:"Example 1"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"// Problem: Stale state in async callback\nconst [count, setCount] = useState(0);\nconst handleAsync = useCallback(async () => {\n  await delay(1000);\n  console.log(count); // Always logs 0, even if count changed\n}, []); // Can't add count to deps or callback recreates\n\n// Solution: Using useReference\nconst [count, setCount] = useState(0);\nconst countRef = useReference(count);\nconst handleAsync = useCallback(async () => {\n  await delay(1000);\n  console.log(countRef.current); // Always logs current count\n}, [countRef]); // countRef never changes, so callback is stable\n\n// Access current props in cleanup\nconst connectionRef = useReference(props.connection);\nuseEffect(() => {\n  const ws = new WebSocket(url);\n\n  return () => {\n    // Access current connection state during cleanup\n    if (connectionRef.current.shouldNotify) {\n      notifyDisconnection();\n    }\n    ws.close();\n  };\n}, [url, connectionRef]);\n\n// Debounced handler with current values\nconst searchTerm = useReference(inputValue);\nconst debouncedSearch = useMemo(\n  () => debounce(() => {\n    // Always searches with current term\n    search(searchTerm.current);\n  }, 500),\n  [searchTerm]\n);\n\n// Imperative handle with current state\nconst [items, setItems] = useState([]);\nconst itemsRef = useReference(items);\n\nuseImperativeHandle(ref, () => ({\n  getItemCount: () => itemsRef.current.length,\n  hasItems: () => itemsRef.current.length > 0,\n}), [itemsRef]);\n"})}),"\n",(0,r.jsx)(n.h2,{id:"playground",children:"Playground"}),"\n",(0,r.jsx)(a.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// Problem: Stale state in async callback
const [count, setCount] = useState(0);
const handleAsync = useCallback(async () => {
await delay(1000);
console.log(count); // Always logs 0, even if count changed
}, []); // Can't add count to deps or callback recreates

// Solution: Using useReference
const [count, setCount] = useState(0);
const countRef = useReference(count);
const handleAsync = useCallback(async () => {
await delay(1000);
console.log(countRef.current); // Always logs current count
}, [countRef]); // countRef never changes, so callback is stable

// Access current props in cleanup
const connectionRef = useReference(props.connection);
useEffect(() => {
const ws = new WebSocket(url);

return () => {
  // Access current connection state during cleanup
  if (connectionRef.current.shouldNotify) {
    notifyDisconnection();
  }
  ws.close();
};
}, [url, connectionRef]);

// Debounced handler with current values
const searchTerm = useReference(inputValue);
const debouncedSearch = useMemo(
() => debounce(() => {
  // Always searches with current term
  search(searchTerm.current);
}, 500),
[searchTerm]
);

// Imperative handle with current state
const [items, setItems] = useState([]);
const itemsRef = useReference(items);

useImperativeHandle(ref, () => ({
getItemCount: () => itemsRef.current.length,
hasItems: () => itemsRef.current.length > 0,
}), [itemsRef]);`})]})}function h(e={}){let{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}}}]);