"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["9901"],{89915(e,n,t){t.r(n),t.d(n,{metadata:()=>o,default:()=>m,frontMatter:()=>a,contentTitle:()=>l,toc:()=>u,assets:()=>c});var o=JSON.parse('{"id":"winglet/react-utils/hook/useOnUnmountLayout","title":"useOnUnmountLayout","description":"Executes a cleanup function synchronously when the component unmounts, before browser painting.","source":"@site/docs/winglet/react-utils/hook/useOnUnmountLayout.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useOnUnmountLayout","permalink":"/albatrion/docs/winglet/react-utils/hook/useOnUnmountLayout","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useOnUnmountLayout.mdx","tags":[],"version":"current","frontMatter":{"title":"useOnUnmountLayout","sidebar_label":"useOnUnmountLayout"},"sidebar":"winglet","previous":{"title":"useOnUnmount","permalink":"/albatrion/docs/winglet/react-utils/hook/useOnUnmount"},"next":{"title":"useReference","permalink":"/albatrion/docs/winglet/react-utils/hook/useReference"}}'),r=t(62540),s=t(43023),i=t(91297);let a={title:"useOnUnmountLayout",sidebar_label:"useOnUnmountLayout"},l="useOnUnmountLayout",c={},u=[{value:"When to Use Over useOnUnmount",id:"when-to-use-over-useonunmount",level:3},{value:"Performance Warning",id:"performance-warning",level:3},{value:"Critical Limitations (Same as useOnUnmount)",id:"critical-limitations-same-as-useonunmount",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function d(e){let n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"useonunmountlayout",children:"useOnUnmountLayout"})}),"\n",(0,r.jsxs)(n.p,{children:["Executes a cleanup function synchronously when the component unmounts, before browser painting.\nThis hook is the synchronous version of ",(0,r.jsx)(n.code,{children:"useOnUnmount"}),", using ",(0,r.jsx)(n.code,{children:"useLayoutEffect"})," to ensure\ncleanup runs before the browser reflows or repaints. This prevents visual glitches, layout\nshifts, and DOM inconsistencies during component removal."]}),"\n",(0,r.jsx)(n.h3,{id:"when-to-use-over-useonunmount",children:"When to Use Over useOnUnmount"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Prevent Visual Flicker"}),": Remove DOM nodes before layout recalculation"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Animation Cleanup"}),": Cancel in-progress animations before next frame"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Global Style Restoration"}),": Reset document/body styles before paint"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Portal Management"}),": Remove portal containers before DOM updates"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Synchronous Library APIs"}),": Clean up libraries that require immediate DOM cleanup"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"performance-warning",children:"Performance Warning"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"This blocks browser painting"})," - use sparingly and only when synchronous cleanup\nis essential to prevent visual artifacts. For most cleanup, prefer ",(0,r.jsx)(n.code,{children:"useOnUnmount"}),"."]}),"\n",(0,r.jsx)(n.h3,{id:"critical-limitations-same-as-useonunmount",children:"Critical Limitations (Same as useOnUnmount)"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Stale Closure Warning"}),": Handler captures values at mount time only"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"No State Updates"}),": Handler won't see later state or prop changes"]}),"\n",(0,r.jsxs)(n.li,{children:["Use ",(0,r.jsx)(n.code,{children:"useReference"})," for accessing current state in cleanup"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"signature",children:"Signature"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"const useOnUnmountLayout: (handler: Fn) => void\n"})}),"\n",(0,r.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Name"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"handler"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"-"})}),(0,r.jsx)(n.td,{children:"The cleanup function to execute synchronously when the component unmounts"})]})})]}),"\n",(0,r.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,r.jsx)(n.h3,{id:"example-1",children:"Example 1"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"// Portal cleanup to prevent layout shift\nconst portalRoot = useRef<HTMLDivElement>();\n\nuseOnMountLayout(() => {\n  portalRoot.current = document.createElement('div');\n  portalRoot.current.className = 'modal-portal';\n  document.body.appendChild(portalRoot.current);\n});\n\nuseOnUnmountLayout(() => {\n  // Must remove synchronously to prevent layout issues\n  portalRoot.current?.remove();\n});\n\n// Stop animations before component removal\nconst animatingElementsRef = useReference(animatingElements);\n\nuseOnUnmountLayout(() => {\n  animatingElementsRef.current.forEach(element => {\n    element.style.animation = 'none';\n    element.style.transition = 'none';\n    element.getAnimations().forEach(anim => anim.cancel());\n  });\n});\n\n// Body scroll lock with synchronous restoration\nconst originalBodyStylesRef = useRef<{\n  overflow: string;\n  position: string;\n  touchAction: string;\n}>();\n\nuseOnMountLayout(() => {\n  const body = document.body;\n  originalBodyStylesRef.current = {\n    overflow: body.style.overflow,\n    position: body.style.position,\n    touchAction: body.style.touchAction,\n  };\n\n  body.style.overflow = 'hidden';\n  body.style.position = 'fixed';\n  body.style.touchAction = 'none';\n});\n\nuseOnUnmountLayout(() => {\n  const body = document.body;\n  const original = originalBodyStylesRef.current;\n  if (original) {\n    body.style.overflow = original.overflow;\n    body.style.position = original.position;\n    body.style.touchAction = original.touchAction;\n  }\n});\n\n// Drag-and-drop state cleanup before paint\nconst dragStateRef = useReference(dragState);\n\nuseOnUnmountLayout(() => {\n  // Remove all drag-related DOM elements\n  document.querySelectorAll('.drag-ghost, .drop-indicator')\n    .forEach(el => el.remove());\n\n  // Reset global cursor and selection\n  document.body.style.cursor = '';\n  document.body.classList.remove('dragging');\n  window.getSelection()?.removeAllRanges();\n\n  // Clear drag data if still active\n  if (dragStateRef.current.isActive) {\n    dragStateRef.current.cleanup();\n  }\n});\n\n// Synchronous editor cleanup (prevents memory leaks)\nconst editorInstanceRef = useRef<CodeMirror.Editor>();\n\nuseOnUnmountLayout(() => {\n  const editor = editorInstanceRef.current;\n  if (editor) {\n    // Some editors require synchronous cleanup to prevent errors\n    editor.toTextArea(); // Restore original textarea\n    editor.getWrapperElement().remove(); // Remove DOM immediately\n    editorInstanceRef.current = undefined;\n  }\n});\n\n// WebGL context cleanup before reflow\nconst canvasRef = useRef<HTMLCanvasElement>();\nconst glContextRef = useRef<WebGLRenderingContext>();\n\nuseOnUnmountLayout(() => {\n  const gl = glContextRef.current;\n  if (gl) {\n    // Synchronously release WebGL resources\n    const extension = gl.getExtension('WEBGL_lose_context');\n    extension?.loseContext();\n\n    // Clear canvas immediately\n    if (canvasRef.current) {\n      canvasRef.current.width = 1;\n      canvasRef.current.height = 1;\n    }\n  }\n});\n"})}),"\n",(0,r.jsx)(n.h2,{id:"playground",children:"Playground"}),"\n",(0,r.jsx)(i.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// Portal cleanup to prevent layout shift
const portalRoot = useRef<HTMLDivElement>();

useOnMountLayout(() => {
portalRoot.current = document.createElement('div');
portalRoot.current.className = 'modal-portal';
document.body.appendChild(portalRoot.current);
});

useOnUnmountLayout(() => {
// Must remove synchronously to prevent layout issues
portalRoot.current?.remove();
});

// Stop animations before component removal
const animatingElementsRef = useReference(animatingElements);

useOnUnmountLayout(() => {
animatingElementsRef.current.forEach(element => {
  element.style.animation = 'none';
  element.style.transition = 'none';
  element.getAnimations().forEach(anim => anim.cancel());
});
});

// Body scroll lock with synchronous restoration
const originalBodyStylesRef = useRef<{
overflow: string;
position: string;
touchAction: string;
}>();

useOnMountLayout(() => {
const body = document.body;
originalBodyStylesRef.current = {
  overflow: body.style.overflow,
  position: body.style.position,
  touchAction: body.style.touchAction,
};

body.style.overflow = 'hidden';
body.style.position = 'fixed';
body.style.touchAction = 'none';
});

useOnUnmountLayout(() => {
const body = document.body;
const original = originalBodyStylesRef.current;
if (original) {
  body.style.overflow = original.overflow;
  body.style.position = original.position;
  body.style.touchAction = original.touchAction;
}
});

// Drag-and-drop state cleanup before paint
const dragStateRef = useReference(dragState);

useOnUnmountLayout(() => {
// Remove all drag-related DOM elements
document.querySelectorAll('.drag-ghost, .drop-indicator')
  .forEach(el => el.remove());

// Reset global cursor and selection
document.body.style.cursor = '';
document.body.classList.remove('dragging');
window.getSelection()?.removeAllRanges();

// Clear drag data if still active
if (dragStateRef.current.isActive) {
  dragStateRef.current.cleanup();
}
});

// Synchronous editor cleanup (prevents memory leaks)
const editorInstanceRef = useRef<CodeMirror.Editor>();

useOnUnmountLayout(() => {
const editor = editorInstanceRef.current;
if (editor) {
  // Some editors require synchronous cleanup to prevent errors
  editor.toTextArea(); // Restore original textarea
  editor.getWrapperElement().remove(); // Remove DOM immediately
  editorInstanceRef.current = undefined;
}
});

// WebGL context cleanup before reflow
const canvasRef = useRef<HTMLCanvasElement>();
const glContextRef = useRef<WebGLRenderingContext>();

useOnUnmountLayout(() => {
const gl = glContextRef.current;
if (gl) {
  // Synchronously release WebGL resources
  const extension = gl.getExtension('WEBGL_lose_context');
  extension?.loseContext();

  // Clear canvas immediately
  if (canvasRef.current) {
    canvasRef.current.width = 1;
    canvasRef.current.height = 1;
  }
}
});`})]})}function m(e={}){let{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}}}]);