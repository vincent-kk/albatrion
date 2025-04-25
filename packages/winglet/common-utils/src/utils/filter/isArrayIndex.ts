export const isArrayIndex = (key: string): boolean => {
  if (key === '') return false;
  const index = +key;
  return index >>> 0 === index && index < 0xffffffff;
};
