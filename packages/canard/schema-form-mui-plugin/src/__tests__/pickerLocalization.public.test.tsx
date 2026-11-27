import type { ReactNode } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { cleanup, render } from '@testing-library/react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(() => {
  cleanup();
  dayjs.locale('en');
});

/**
 * Render a date field through the public plugin and read the picker's form value.
 * @param wrap - Places the form inside an application-level provider.
 * @returns The text MUI writes into the picker's hidden form input.
 */
const renderDate = (wrap: (form: ReactNode) => ReactNode = (form) => form) => {
  const view = render(
    wrap(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: { day: { type: 'string', format: 'date' } },
        }}
        defaultValue={{ day: '2024-03-05' }}
      />,
    ),
  );
  return view.container.querySelector<HTMLInputElement>('input[name="day"]')
    ?.value;
};

it.each([
  ['date', '2024-03-05', '03/05/2024'],
  ['month', '2024-03', '2024-03'],
  ['time', '14:30:00', '02:30 PM'],
])(
  'the %s input renders its value without an application-level LocalizationProvider',
  (format, value, shown) => {
    const { container } = render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: { field: { type: 'string', format } },
        }}
        defaultValue={{ field: value }}
      />,
    );
    expect(
      container.querySelector<HTMLInputElement>('input[name="field"]')?.value,
    ).toBe(shown);
  },
);

it('an application-level adapterLocale does not reach the date input, while a bare picker beside it uses it', () => {
  const { container } = render(
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: { day: { type: 'string', format: 'date' } },
        }}
        defaultValue={{ day: '2024-03-05' }}
      />
      <DatePicker name="bare" defaultValue={dayjs('2024-03-05')} />
    </LocalizationProvider>,
  );
  const valueOf = (name: string) =>
    container.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value;
  expect(valueOf('day')).toBe('03/05/2024');
  expect(valueOf('bare')).toBe('2024.03.05.');
});

it("dayjs's global locale does not reach the date input", () => {
  dayjs.locale('ko');
  expect(dayjs('2024-03-05').format('dddd')).toBe('화요일');
  expect(renderDate()).toBe('03/05/2024');
});

it('a theme default adapterLocale for MuiLocalizationProvider reaches the date input', () => {
  const theme = createTheme({
    components: {
      MuiLocalizationProvider: { defaultProps: { adapterLocale: 'ko' } },
    },
  });
  expect(
    renderDate((form) => <ThemeProvider theme={theme}>{form}</ThemeProvider>),
  ).toBe('2024.03.05.');
});
