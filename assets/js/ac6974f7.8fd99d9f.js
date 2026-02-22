"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["7737"],{68113(e,n,t){t.r(n),t.d(n,{metadata:()=>s,default:()=>h,frontMatter:()=>a,contentTitle:()=>i,toc:()=>d,assets:()=>c});var s=JSON.parse('{"id":"winglet/react-utils/hook/useOnMount","title":"useOnMount","description":"Executes a side effect only once when the component mounts.","source":"@site/docs/winglet/react-utils/hook/useOnMount.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useOnMount","permalink":"/albatrion/docs/winglet/react-utils/hook/useOnMount","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useOnMount.mdx","tags":[],"version":"current","frontMatter":{"title":"useOnMount","sidebar_label":"useOnMount"},"sidebar":"winglet","previous":{"title":"useMemorize","permalink":"/albatrion/docs/winglet/react-utils/hook/useMemorize"},"next":{"title":"useOnMountLayout","permalink":"/albatrion/docs/winglet/react-utils/hook/useOnMountLayout"}}'),r=t(62540),o=t(43023),l=t(91297);let a={title:"useOnMount",sidebar_label:"useOnMount"},i="useOnMount",c={},d=[{value:"Use Cases",id:"use-cases",level:3},{value:"Cleanup Support",id:"cleanup-support",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function u(e){let n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,o.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"useonmount",children:"useOnMount"})}),"\n",(0,r.jsxs)(n.p,{children:["Executes a side effect only once when the component mounts.\nThis hook provides a semantic way to run initialization logic that should only\nexecute once during the component's lifecycle. It's equivalent to ",(0,r.jsx)(n.code,{children:"useEffect"}),"\nwith an empty dependency array but with clearer intent."]}),"\n",(0,r.jsx)(n.h3,{id:"use-cases",children:"Use Cases"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Data Fetching"}),": Load initial data when component first renders"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Event Listener Setup"}),": Attach global event listeners or subscriptions"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Third-party Library Initialization"}),": Initialize external libraries or SDKs"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Animation Triggers"}),": Start animations when component enters the DOM"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Analytics Tracking"}),": Track page views or component usage"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"cleanup-support",children:"Cleanup Support"}),"\n",(0,r.jsx)(n.p,{children:"The handler can return a cleanup function that will be called when the\ncomponent unmounts, making it perfect for managing resources."}),"\n",(0,r.jsx)(n.h2,{id:"signature",children:"Signature"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"const useOnMount: (handler: EffectCallback) => void\n"})}),"\n",(0,r.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Name"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"handler"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"-"})}),(0,r.jsx)(n.td,{children:"The effect function to execute on mount. Can return a cleanup function"})]})})]}),"\n",(0,r.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,r.jsx)(n.h3,{id:"example-1",children:"Example 1"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"// Simple initialization\nuseOnMount(() => {\n  console.log('Component mounted!');\n  trackEvent('ComponentView', { name: 'UserProfile' });\n});\n\n// With cleanup\nuseOnMount(() => {\n  const controller = new AbortController();\n\n  fetchUserData({ signal: controller.signal })\n    .then(data => setUser(data))\n    .catch(err => {\n      if (!controller.signal.aborted) {\n        setError(err);\n      }\n    });\n\n  return () => controller.abort();\n});\n\n// Event listener with cleanup\nuseOnMount(() => {\n  const handleKeyPress = (e: KeyboardEvent) => {\n    if (e.key === 'Escape') closeModal();\n  };\n\n  document.addEventListener('keydown', handleKeyPress);\n  return () => document.removeEventListener('keydown', handleKeyPress);\n});\n\n// WebSocket connection\nuseOnMount(() => {\n  const ws = new WebSocket('wss://api.example.com');\n\n  ws.onmessage = (event) => {\n    handleMessage(JSON.parse(event.data));\n  };\n\n  ws.onopen = () => setConnected(true);\n  ws.onclose = () => setConnected(false);\n\n  return () => ws.close();\n});\n"})}),"\n",(0,r.jsx)(n.h2,{id:"playground",children:"Playground"}),"\n",(0,r.jsx)(l.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// Simple initialization
useOnMount(() => {
console.log('Component mounted!');
trackEvent('ComponentView', { name: 'UserProfile' });
});

// With cleanup
useOnMount(() => {
const controller = new AbortController();

fetchUserData({ signal: controller.signal })
  .then(data => setUser(data))
  .catch(err => {
    if (!controller.signal.aborted) {
      setError(err);
    }
  });

return () => controller.abort();
});

// Event listener with cleanup
useOnMount(() => {
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeModal();
};

document.addEventListener('keydown', handleKeyPress);
return () => document.removeEventListener('keydown', handleKeyPress);
});

// WebSocket connection
useOnMount(() => {
const ws = new WebSocket('wss://api.example.com');

ws.onmessage = (event) => {
  handleMessage(JSON.parse(event.data));
};

ws.onopen = () => setConnected(true);
ws.onclose = () => setConnected(false);

return () => ws.close();
});`})]})}function h(e={}){let{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(u,{...e})}):u(e)}}}]);