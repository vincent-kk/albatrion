export const style = `
[data-foreground] {
  pointer-events: none;
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1;
}

[data-foreground][data-active] > * {
  pointer-events: all;
}

[data-foreground][data-visible] {
  display: flex !important;
  justify-content: center;
  align-items: center;
}
`;
