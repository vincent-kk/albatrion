export const counterFactory = (initialValue = 0) => {
  let value = initialValue;
  return {
    get value() {
      return value;
    },
    increment: () => ++value,
    decrement: () => --value,
    reset: () => (value = initialValue),
  };
};
