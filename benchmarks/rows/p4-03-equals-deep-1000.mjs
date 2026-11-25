import { equals } from "@winglet/common-utils";

/**
 * Wraps 1 in 1000 nested `{ child }` objects.
 * @returns a fresh chain that shares no reference with earlier results
 */
const chain = () => {
  let value = 1;
  for (let i = 0; i < 1000; i++) value = { child: value };
  return value;
};

export default {
  pkg: "@winglet/common-utils",
  fn: "equals",
  input: "two independent 1000-deep chains",
  inputKind: "repaired",
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
