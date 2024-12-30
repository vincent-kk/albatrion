export const getRandomString = (radix?: number) =>
  Math.random().toString(radix).slice(2);
