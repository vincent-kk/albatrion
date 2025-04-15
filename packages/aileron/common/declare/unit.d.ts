export type DomSize =
  | number
  | `${number}%`
  | `${number}px`
  | `${number}rem`
  | `${number}em`
  | `${number}vh`
  | `${number}vw`
  | `calc(${string})`;

export type Color =
  | `#${string}`
  | `rgb(${number}, ${number}, ${number})`
  | `rgba(${number}, ${number}, ${number}, ${number})`
  | `var(--${string})`;

export type Time = `${number}ms` | `${number}s`;

export type Duration = `${number}ms`;
