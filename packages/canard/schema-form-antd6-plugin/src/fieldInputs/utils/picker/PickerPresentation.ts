import type { SizeType } from 'antd/es/config-provider/SizeContext';

/** Options for date and time pickers with configurable limits. */
export interface PickerPresentation {
  /** Control size, overriding the context size when supplied. */
  size?: SizeType;
  /** Earliest selectable value in the picker's stored format. */
  minimum?: string;
  /** Latest selectable value in the picker's stored format. */
  maximum?: string;
}
