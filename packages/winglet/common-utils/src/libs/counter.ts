export const counterFactory = () => {
  let __value__ = 0;
  return {
    get value() {
      return __value__;
    },
    increment: () => __value__++,
    decrement: () => __value__--,
    reset: () => (__value__ = 0),
  };
};
