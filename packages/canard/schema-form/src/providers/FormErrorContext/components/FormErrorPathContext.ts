import { createContext } from 'react';

import type { Optional } from '@aileron/declare';

/** Deferred Placeholder path, supplied only by DeferredFieldProxy. */
export const FormErrorPathContext = createContext<Optional<string>>(undefined);
