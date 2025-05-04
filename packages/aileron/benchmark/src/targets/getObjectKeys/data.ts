export const createLargeObject = (size: number) => {
  const obj: Record<string, string> = {};
  for (let i = 0; i < size; i++) {
    obj[`key::${i}`] = Math.random().toString(36).slice(2);
  }
  return obj;
};
