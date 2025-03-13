export const getRandomString = (radix?: number) =>
  Math.random().toString(radix).slice(2);

export const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomBoolean = () => Math.random() < 0.5;
