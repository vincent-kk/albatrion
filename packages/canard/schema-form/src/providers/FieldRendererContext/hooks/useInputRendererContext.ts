import { useContext } from 'react';

import { InputRendererContext } from '../components/InputRendererContext';

/** @returns The Form's input frame, before external and plugin fallback. */
export const useInputRendererContext = () => useContext(InputRendererContext);
