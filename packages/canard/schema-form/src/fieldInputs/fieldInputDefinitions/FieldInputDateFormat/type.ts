import type {
  FieldInputPropsWithSchema,
  BaseStringSchema,
} from '@/schema-form/types';

/** Native HTML input types whose value grammar this check knows. */
export type DateInputType =
  | 'date'
  | 'month'
  | 'week'
  | 'time'
  | 'datetime-local';

/** String schema whose format is a native date input type. */
export type DateFormatJSONSchema = {
  format: DateInputType;
} & BaseStringSchema;

/** Props of the date input, including the presentation range bounds. */
export type FieldInputDateFormatProps = FieldInputPropsWithSchema<
  string | null,
  DateFormatJSONSchema
> & {
  /** Earliest allowed value, from `presentation.FieldInputProps.minimum`. */
  minimum?: string;
  /** Latest allowed value, from `presentation.FieldInputProps.maximum`. */
  maximum?: string;
};
