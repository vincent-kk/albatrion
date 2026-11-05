import { createElement, createRef } from 'react';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import type { VirtualizationOptions } from '@/schema-form/helpers/virtualization';
import type { JSONSchema } from '@/schema-form/types';

import { Form } from '../../Form';
import type { FormHandle } from '../../components/FormCore';

/** A connected form whose setup and disposal run outside each timed sample. */
export class LifecycleBenchForm {
  /** Connected host makes focus and document order observable. */
  readonly container = document.body.appendChild(document.createElement('div'));
  /** React root reused only for this sample. */
  readonly root = createRoot(this.container);
  /** Public commands address the same mounted source form. */
  readonly handle = createRef<FormHandle>();

  /** Mount the supplied schema synchronously; measure this only in mount cases. */
  mount(schema: JSONSchema, virtualization?: VirtualizationOptions | boolean) {
    flushSync(() => {
      this.root.render(
        createElement(Form, {
          jsonSchema: schema,
          virtualization,
          ref: this.handle,
        }),
      );
    });
  }

  /** Dispose after the sample so cleanup is excluded from its elapsed time. */
  dispose() {
    flushSync(() => this.root.unmount());
    this.container.remove();
  }
}
