"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["3416"],{38638(e,a,r){r.r(a),r.d(a,{metadata:()=>n,default:()=>u,frontMatter:()=>i,contentTitle:()=>l,toc:()=>c,assets:()=>d});var n=JSON.parse('{"id":"canard/schema-form/playground","title":"Schema Form Playground","description":"JSON Schema\uC640 \uCF54\uB4DC\uB97C \uD3B8\uC9D1\uD558\uC5EC \uC2E4\uC2DC\uAC04\uC73C\uB85C \uD3FC\uC774 \uB80C\uB354\uB9C1\uB418\uB294 \uAC83\uC744 \uD655\uC778\uD558\uC138\uC694.","source":"@site/i18n/ko/docusaurus-plugin-content-docs/current/canard/schema-form/playground.mdx","sourceDirName":"canard/schema-form","slug":"/canard/schema-form/playground","permalink":"/ko/docs/canard/schema-form/playground","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/canard/schema-form/playground.mdx","tags":[],"version":"current","sidebarPosition":99,"frontMatter":{"sidebar_label":"Playground","sidebar_position":99},"sidebar":"canard","previous":{"title":"\uD29C\uD50C \uBC30\uC5F4","permalink":"/ko/docs/canard/schema-form/examples/tuple-arrays"},"next":{"title":"ajv6-plugin","permalink":"/ko/docs/canard/schema-form-ajv6-plugin/"}}'),t=r(62540),s=r(43023),o=r(23392);let i={sidebar_label:"Playground",sidebar_position:99},l="Schema Form Playground",d={},c=[];function m(e){let a={div:"div",h1:"h1",header:"header",p:"p",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(a.header,{children:(0,t.jsx)(a.h1,{id:"schema-form-playground",children:"Schema Form Playground"})}),"\n",(0,t.jsx)(a.p,{children:"JSON Schema\uC640 \uCF54\uB4DC\uB97C \uD3B8\uC9D1\uD558\uC5EC \uC2E4\uC2DC\uAC04\uC73C\uB85C \uD3FC\uC774 \uB80C\uB354\uB9C1\uB418\uB294 \uAC83\uC744 \uD655\uC778\uD558\uC138\uC694."}),"\n",(0,t.jsx)(o.A,{fallback:(0,t.jsx)(a.div,{children:"Loading playground..."}),children:()=>{let e=r(71364).A;return(0,t.jsx)(e,{})}})]})}function u(e={}){let{wrapper:a}={...(0,s.R)(),...e.components};return a?(0,t.jsx)(a,{...e,children:(0,t.jsx)(m,{...e})}):m(e)}},71364(e,a,r){r.d(a,{A:()=>i});var n=r(62540),t=r(20010);let s=`{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name"
    },
    "age": {
      "type": "number",
      "title": "Age"
    },
    "email": {
      "type": "string",
      "title": "Email",
      "format": "email"
    },
    "agree": {
      "type": "boolean",
      "title": "I agree to terms"
    }
  },
  "required": ["name", "email"]
}`,o=`import { Form, registerPlugin } from "@canard/schema-form";
import { plugin as antd5Plugin } from "@canard/schema-form-antd5-plugin";
import { plugin as ajv8Plugin } from "@canard/schema-form-ajv8-plugin";
import schema from "./schema.json";

registerPlugin(antd5Plugin);
registerPlugin(ajv8Plugin);

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <Form
        jsonSchema={schema}
        showError
        onSubmit={(value) => {
          alert(JSON.stringify(value, null, 2));
        }}
      />
    </div>
  );
}
`;function i({schema:e=s,code:a=o}){return(0,n.jsx)(t.l5,{template:"react",theme:"auto",files:{"/App.js":{code:a,active:!0},"/schema.json":{code:e}},customSetup:{dependencies:{"@canard/schema-form":"0.10.5","@canard/schema-form-antd5-plugin":"0.10.0","@canard/schema-form-ajv8-plugin":"0.10.0",antd:"^5.10.0",dayjs:"^1.11.0"}},options:{externalResources:[]},children:(0,n.jsxs)(t.am,{children:[(0,n.jsx)(t.cW,{showTabs:!0,showLineNumbers:!0,style:{height:480}}),(0,n.jsx)(t.G5,{showOpenInCodeSandbox:!1,style:{height:480}})]})})}}}]);