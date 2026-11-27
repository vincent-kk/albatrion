import "../dom.mjs";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Form, ValidationMode } from "@canard/schema-form";

export default {
  pkg: "@canard/schema-form",
  fn: "Form client mount",
  input: "object with a string and a number field",
  inputKind: "plain",
  kind: "render",
  setup: () => {
    const jsonSchema = {
      type: "object",
      properties: { name: { type: "string" }, count: { type: "number" } },
    };
    const defaultValue = { name: "Ada", count: 3 };
    const element = createElement(Form, {
      jsonSchema,
      defaultValue,
      validationMode: ValidationMode.None,
    });
    return {
      run: () => {
        const container = document.body.appendChild(
          document.createElement("div"),
        );
        const root = createRoot(container);
        flushSync(() => root.render(element));
        return { root, container };
      },
      check: ({ container }) =>
        container.querySelectorAll("input").length === 2,
      after: ({ root, container }) => {
        root.unmount();
        container.remove();
      },
    };
  },
};
