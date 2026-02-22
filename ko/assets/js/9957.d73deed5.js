"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["9957"],{71364(e,a,t){t.r(a),t.d(a,{default:()=>o});var r=t(62540),n=t(20010);let i=`{
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
}`,s=`import { Form, registerPlugin } from "@canard/schema-form";
import { plugin as antd6Plugin } from "@canard/schema-form-antd6-plugin";
import { plugin as ajv8Plugin } from "@canard/schema-form-ajv8-plugin";
import schema from "./schema.json";

registerPlugin(antd6Plugin);
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
`;function o({schema:e=i,code:a=s}){return(0,r.jsx)(n.l5,{template:"react",theme:"auto",files:{"/App.js":{code:a,active:!0},"/schema.json":{code:e}},customSetup:{dependencies:{"@canard/schema-form":"0.10.5","@canard/schema-form-antd6-plugin":"0.10.1","@canard/schema-form-ajv8-plugin":"0.10.0",antd:"^6.0.0",dayjs:"^1.11.0"}},options:{externalResources:[]},children:(0,r.jsxs)(n.am,{children:[(0,r.jsx)(n.cW,{showTabs:!0,showLineNumbers:!0,style:{height:480}}),(0,r.jsx)(n.G5,{showOpenInCodeSandbox:!1,style:{height:480}})]})})}}}]);