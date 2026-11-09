/** Closed action flags executed by the input position after its queue completes. */
export enum FieldLifecycleAction {
  /** Observe the event without changing the input DOM. */
  None = 0,
  /** Focus the first native control in the input container. */
  Focus = 1 << 0,
  /** Select text in the first input or textarea in the container. */
  Select = 1 << 1,
}
