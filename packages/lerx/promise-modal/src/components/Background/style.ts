export const style = `
[data-background] {
  display: none;
  position: fixed;
  inset: 0;
  z-index: -999;
  pointer-events: none;
}

[data-background] > * {
  pointer-events: none;
}

[data-background][data-active] {
  pointer-events: all;
}

[data-background][data-visible] {
  display: flex;
  align-items: center;
  justify-content: center;
}
`;
