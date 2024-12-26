declare type DomSize =
  | number
  | `${number}%`
  | `${number}px`
  | `${number}rem`
  | `${number}em`
  | `${number}vh`
  | `${number}vw`
  | `calc(${string})`;

declare type Color =
  | `#${string}`
  | `rgb(${number}, ${number}, ${number})`
  | `rgba(${number}, ${number}, ${number}, ${number})`
  | `var(--${string})`;

declare type Duration = `${number}ms` | `${number}s`;
