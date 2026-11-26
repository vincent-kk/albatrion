// Harness self-test: the B slot does 10% more work, so the expected ratio is about 1.10.
const turns = process.env.SPEED_SLOT === "B" ? 1100 : 1000;
export default {
  pkg: "harness",
  fn: "selftest",
  input: "B slot +10% work",
  inputKind: "plain",
  kind: "micro",
  setup: () => ({
    run: () => {
      let sum = 0;
      for (let i = 0; i < turns; i++) sum += Math.sqrt(i);
      return sum;
    },
    check: (sum) => sum > 0,
  }),
};
