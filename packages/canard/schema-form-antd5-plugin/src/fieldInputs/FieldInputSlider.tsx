import { useCallback, useMemo } from 'react';

import { Slider, version } from 'antd';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import { getSliderBounds } from './utils/slider/getSliderBounds';
import { useSliderControl } from './utils/slider/useSliderControl';

interface FieldInputSliderProps
  extends FieldInputPropsWithSchema<number | null, NumberSchema> {
  /** Publish on movement only when false; otherwise publish on commit. */
  lazy?: boolean;
}

const FieldInputSlider = ({
  inputId,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  lazy,
  misfit,
  labelId: labelledBy,
}: FieldInputSliderProps) => {
  const bounds = useMemo(
    () =>
      getSliderBounds(
        jsonSchema.minimum,
        jsonSchema.maximum,
        jsonSchema.multipleOf,
        Array.isArray(jsonSchema.type)
          ? jsonSchema.type.includes('integer')
          : jsonSchema.type === 'integer',
        jsonSchema.exclusiveMinimum,
        jsonSchema.exclusiveMaximum,
      ),
    [jsonSchema],
  );
  const control = useSliderControl(
    bounds,
    defaultValue,
    lazy,
    disabled || readOnly,
    readOnly,
    onChange,
  );
  const { min, max, empty } = bounds;
  const {
    unset,
    needsCommit,
    draft,
    change,
    complete,
    beginPointer,
    keyDown,
    keyUp,
  } = control;
  // Ant Design's id targets the track rather than its keyboard-operable thumb.
  const markFocusTarget = useCallback(
    (group: HTMLDivElement | null) => {
      const handle = group?.querySelector<HTMLElement>('[role="slider"]');
      if (!handle) return;
      handle.id = inputId;
      handle.setAttribute('data-focus-target', '');
      handle.setAttribute('aria-valuemin', String(min));
      handle.setAttribute('aria-valuemax', String(max));
      if (labelledBy) handle.setAttribute('aria-labelledby', labelledBy);
      if (unset) {
        handle.removeAttribute('aria-valuenow');
        handle.setAttribute('aria-valuetext', 'Not set');
        handle.style.opacity = handle === document.activeElement ? '1' : '0';
      } else {
        handle.setAttribute('aria-valuenow', String(draft));
        handle.removeAttribute('aria-valuetext');
        handle.style.opacity = '';
      }
    },
    [inputId, labelledBy, unset, min, max, draft],
  );
  const committedChange =
    version.startsWith('5.10.') || version.startsWith('5.11.')
      ? { onAfterChange: complete }
      : { onChangeComplete: complete };
  return (
    <div
      ref={markFocusTarget}
      role="group"
      aria-labelledby={labelledBy}
      aria-invalid={misfit || undefined}
      onMouseDownCapture={beginPointer}
      onTouchStartCapture={beginPointer}
      onKeyDownCapture={keyDown}
      onKeyUpCapture={keyUp}
    >
      <Slider
        ariaLabelledByForHandle={labelledBy}
        onFocus={(event) => {
          if (unset) event.currentTarget.style.opacity = '1';
        }}
        onBlur={(event) => {
          if (unset) event.currentTarget.style.opacity = '0';
        }}
        disabled={disabled || readOnly || empty}
        min={bounds.libraryMin}
        max={bounds.libraryMax}
        step={bounds.libraryStep}
        value={bounds.toLibrary(draft)}
        tooltip={{ formatter: unset ? null : () => String(draft) }}
        onChange={change}
        {...(lazy !== false || needsCommit ? committedChange : {})}
      />
    </div>
  );
};

export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: {
    schemaType: ['number', 'integer'],
    inputType: 'slider',
  },
} satisfies FieldInputDefinition;
