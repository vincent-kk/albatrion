import { act } from '@testing-library/react';

/**
 * Wait until the root validation a native submit started has resolved and the submit's
 * continuation, including the native handler's catch, has run.
 * @param validate - Spy on the root's `validate`, installed before the submit.
 * @returns Completion after the last spied validation and the following macrotask.
 */
export const awaitNativeSubmitVerdict = async (validate: {
  mock: { results: { value: unknown }[] };
}): Promise<void> => {
  await act(async () => {
    await validate.mock.results.at(-1)!.value;
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};
