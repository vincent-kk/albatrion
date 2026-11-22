import { equals } from "@winglet/common-utils";

/** Wraps 1 in 128 nested `{ child }` objects. */
const chain = () => {
  let value = 1;
  for (let i = 0; i < 128; i++) value = { child: value };
  return value;
};

export default {
  pkg: "@winglet/common-utils",
  fn: "equals",
  input: "two independent 128-deep chains",
  inputKind: "plain",
  kind: "micro",
  setup: () => {
    const left = chain();
    const right = chain();
    return {
      run: () => equals(left, right),
      check: (result) => result === true,
    };
  },
};
