/** Complete mount and label-edit sequence for one cross of the initial order. */
export const fieldLabelLifecycle = (order: 'label first' | 'control first') => {
  const both = { outer: 'Outer caption', inner: 'Inner caption', control: 1 };
  return [
    {
      ...both,
      step: order,
      control: order === 'label first' ? 0 : 1,
      outer: order === 'label first' ? both.outer : undefined,
      stored: 2.4,
    },
    { ...both, step: 'two labels', stored: 7.4 },
    {
      ...both,
      step: 'external text changed',
      outer: 'Revised caption',
      stored: 3.25,
    },
    {
      ...both,
      step: 'built-in text changed',
      inner: 'Revised inner',
      stored: 4.7,
    },
    { ...both, step: 'external removed', outer: undefined, stored: 5.35 },
    { ...both, step: 'external re-mounted', stored: 6.1 },
    { ...both, step: 'built-in removed', inner: undefined, stored: 7.15 },
    { ...both, step: 'built-in re-mounted', stored: 8.4 },
    {
      ...both,
      step: 'control removed while label stays',
      control: 0,
      stored: 1.65,
    },
    {
      ...both,
      step: 'control re-mounted while label stays',
      control: 2,
      stored: 2.75,
    },
  ];
};
