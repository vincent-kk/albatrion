"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["8250"],{96917(e,t,n){n.r(t),n.d(t,{metadata:()=>s,default:()=>h,frontMatter:()=>l,contentTitle:()=>a,toc:()=>c,assets:()=>u});var s=JSON.parse('{"id":"winglet/react-utils/hook/useOnMountLayout","title":"useOnMountLayout","description":"Executes a side effect synchronously only once when the component mounts, before the browser paints.","source":"@site/docs/winglet/react-utils/hook/useOnMountLayout.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useOnMountLayout","permalink":"/albatrion/docs/winglet/react-utils/hook/useOnMountLayout","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useOnMountLayout.mdx","tags":[],"version":"current","frontMatter":{"title":"useOnMountLayout","sidebar_label":"useOnMountLayout"},"sidebar":"winglet","previous":{"title":"useOnMount","permalink":"/albatrion/docs/winglet/react-utils/hook/useOnMount"},"next":{"title":"useOnUnmount","permalink":"/albatrion/docs/winglet/react-utils/hook/useOnUnmount"}}'),o=n(62540),i=n(43023),r=n(91297);let l={title:"useOnMountLayout",sidebar_label:"useOnMountLayout"},a="useOnMountLayout",u={},c=[{value:"When to Use Over useOnMount",id:"when-to-use-over-useonmount",level:3},{value:"Performance Warning",id:"performance-warning",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function d(e){let t={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(t.header,{children:(0,o.jsx)(t.h1,{id:"useonmountlayout",children:"useOnMountLayout"})}),"\n",(0,o.jsxs)(t.p,{children:["Executes a side effect synchronously only once when the component mounts, before the browser paints.\nThis hook is the synchronous version of ",(0,o.jsx)(t.code,{children:"useOnMount"}),", using ",(0,o.jsx)(t.code,{children:"useLayoutEffect"})," to ensure\nthe effect runs before the browser updates the screen. This makes it ideal for DOM\nmanipulations that must complete before the user sees the initial render."]}),"\n",(0,o.jsx)(t.h3,{id:"when-to-use-over-useonmount",children:"When to Use Over useOnMount"}),"\n",(0,o.jsxs)(t.ul,{children:["\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.strong,{children:"Preventing Flash of Unstyled Content (FOUC)"}),": Apply styles before first paint"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.strong,{children:"Initial DOM Measurements"}),": Get accurate dimensions for layout calculations"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.strong,{children:"Scroll Position Restoration"}),": Set scroll position without visible jumps"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.strong,{children:"Focus Management"}),": Set initial focus without delay"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.strong,{children:"Third-party UI Libraries"}),": Initialize libraries that manipulate DOM immediately"]}),"\n"]}),"\n",(0,o.jsx)(t.h3,{id:"performance-warning",children:"Performance Warning"}),"\n",(0,o.jsx)(t.p,{children:"Since this blocks painting, use sparingly. Only use when synchronous behavior\nis necessary to prevent visual issues."}),"\n",(0,o.jsx)(t.h2,{id:"signature",children:"Signature"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"const useOnMountLayout: (handler: EffectCallback) => void\n"})}),"\n",(0,o.jsx)(t.h2,{id:"parameters",children:"Parameters"}),"\n",(0,o.jsxs)(t.table,{children:[(0,o.jsx)(t.thead,{children:(0,o.jsxs)(t.tr,{children:[(0,o.jsx)(t.th,{children:"Name"}),(0,o.jsx)(t.th,{children:"Type"}),(0,o.jsx)(t.th,{children:"Description"})]})}),(0,o.jsx)(t.tbody,{children:(0,o.jsxs)(t.tr,{children:[(0,o.jsx)(t.td,{children:(0,o.jsx)(t.code,{children:"handler"})}),(0,o.jsx)(t.td,{children:(0,o.jsx)(t.code,{children:"-"})}),(0,o.jsx)(t.td,{children:"The effect function to execute synchronously on mount. Can return a cleanup function"})]})})]}),"\n",(0,o.jsx)(t.h2,{id:"examples",children:"Examples"}),"\n",(0,o.jsx)(t.h3,{id:"example-1",children:"Example 1"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"// Prevent layout shift by measuring before paint\nuseOnMountLayout(() => {\n  const element = containerRef.current;\n  if (!element) return;\n\n  const height = element.scrollHeight;\n  element.style.height = '0px';\n\n  // Trigger reflow for animation\n  element.offsetHeight;\n  element.style.height = `${height}px`;\n});\n\n// Apply theme before first paint to prevent flicker\nuseOnMountLayout(() => {\n  const savedTheme = localStorage.getItem('theme');\n  if (savedTheme === 'dark') {\n    document.documentElement.classList.add('dark-mode');\n  }\n});\n\n// Initialize tooltip library that needs immediate DOM access\nuseOnMountLayout(() => {\n  const tooltips = tippy('[data-tooltip]', {\n    placement: 'top',\n    animation: 'fade',\n  });\n\n  return () => {\n    tooltips.forEach(instance => instance.destroy());\n  };\n});\n\n// Restore scroll position without jump\nuseOnMountLayout(() => {\n  const scrollY = sessionStorage.getItem('scrollPosition');\n  if (scrollY) {\n    window.scrollTo(0, parseInt(scrollY, 10));\n    sessionStorage.removeItem('scrollPosition');\n  }\n});\n\n// Set initial focus for accessibility\nuseOnMountLayout(() => {\n  const firstInput = document.querySelector<HTMLInputElement>(\n    'input:not([disabled]), textarea:not([disabled])'\n  );\n  firstInput?.focus();\n});\n"})}),"\n",(0,o.jsx)(t.h2,{id:"playground",children:"Playground"}),"\n",(0,o.jsx)(r.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// Prevent layout shift by measuring before paint
useOnMountLayout(() => {
const element = containerRef.current;
if (!element) return;

const height = element.scrollHeight;
element.style.height = '0px';

// Trigger reflow for animation
element.offsetHeight;
element.style.height = \`\${height}px\`;
});

// Apply theme before first paint to prevent flicker
useOnMountLayout(() => {
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark-mode');
}
});

// Initialize tooltip library that needs immediate DOM access
useOnMountLayout(() => {
const tooltips = tippy('[data-tooltip]', {
  placement: 'top',
  animation: 'fade',
});

return () => {
  tooltips.forEach(instance => instance.destroy());
};
});

// Restore scroll position without jump
useOnMountLayout(() => {
const scrollY = sessionStorage.getItem('scrollPosition');
if (scrollY) {
  window.scrollTo(0, parseInt(scrollY, 10));
  sessionStorage.removeItem('scrollPosition');
}
});

// Set initial focus for accessibility
useOnMountLayout(() => {
const firstInput = document.querySelector<HTMLInputElement>(
  'input:not([disabled]), textarea:not([disabled])'
);
firstInput?.focus();
});`})]})}function h(e={}){let{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}}}]);