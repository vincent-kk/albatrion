export const checkEmptyDraft = (draft: object) => {
  for (const _ in draft) return false;
  return true;
};
