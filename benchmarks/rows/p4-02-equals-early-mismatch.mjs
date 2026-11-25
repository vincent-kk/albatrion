import { equals } from "@winglet/common-utils";

/**
 * Builds an object shaped like component props: 12 keys mixing numbers,
 * strings and booleans, one nested object of 4 keys and one array of 8 numbers.
 * @param first - value of the first key
 * @returns a fresh object that shares no reference with earlier results
 */
const props = (first) => ({
  id: first,
  width: 320,
  height: 240,
  label: "Name",
  placeholder: "Enter a name",
  variant: "outlined",
  disabled: false,
  readOnly: false,
  required: true,
  style: { color: "red", margin: 4, padding: 8, display: "block" },
  tabs: [1, 2, 3, 4, 5, 6, 7, 8],
  size: "medium",
});

export default {
  pkg: "@winglet/common-utils",
  fn: "equals",
  input: "two props objects of 12 keys whose first key differs",
  inputKind: "plain",
  kind: "micro",
  setup: () => {
    const left = props(1);
    const right = props(2);
    return {
      run: () => equals(left, right),
      check: (result) => result === false,
    };
  },
};
