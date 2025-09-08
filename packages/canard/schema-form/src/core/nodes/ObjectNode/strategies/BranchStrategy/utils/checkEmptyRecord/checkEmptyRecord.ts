export const checkEmptyRecord = (draft: object) => {
  for (const _ in draft) return false;
  return true;
};
