/** Current title and ownership scenarios for the independent name model. */
export const fieldLabelSemantics = () => ({
  labels: [
    { kind: 'regular', caption: 'Outer' },
    { kind: 'decorative only', caption: undefined },
    { kind: 'hidden', caption: undefined },
    { kind: 'aria hidden', caption: undefined },
    { kind: 'hidden ancestor', caption: undefined },
    { kind: 'CSS display', caption: 'Outer' },
    { kind: 'CSS visibility', caption: 'Outer' },
    { kind: 'CSS class', caption: 'Outer' },
  ] as const,
  ownership: [
    { kind: 'authored before', caption: 'Before', outer: true, mount: 1 },
    { kind: 'generated first', caption: undefined, outer: false, mount: 2 },
    { kind: 'authored after', caption: 'After', outer: true, mount: 2 },
    { kind: 'authored changed', caption: 'Changed', outer: false, mount: 2 },
    { kind: 'cleanup', caption: 'Changed', outer: false, mount: 2 },
  ] as const,
});
