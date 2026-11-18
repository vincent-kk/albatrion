import type { CSSProperties, ComponentType, Context } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { ModalActions, ModalNode } from '@/promise-modal/core/node';

import type {
  BackgroundComponent,
  FooterComponentProps,
  ForegroundComponent,
  WrapperComponentProps,
} from './base';
import type { ModalHandlersWithId } from './modal';
import type { ModalOptions } from './option';

/** Configuration shared by a frame and the hooks from compatible package copies. */
export interface ConfigurationContextProps {
  /** Frame wrapper supplied by the provider. */
  ForegroundComponent: ForegroundComponent;
  /** Optional backdrop renderer paired with the foreground. */
  BackgroundComponent?: BackgroundComponent;
  /** Wrapper for textual titles. */
  TitleComponent: ComponentType<WrapperComponentProps>;
  /** Wrapper for textual subtitles. */
  SubtitleComponent: ComponentType<WrapperComponentProps>;
  /** Wrapper for textual content. */
  ContentComponent: ComponentType<WrapperComponentProps>;
  /** Default action controls when no footer override is supplied. */
  FooterComponent: ComponentType<FooterComponentProps>;
  /** Resolved provider defaults inherited by new requests. */
  options: Required<
    Omit<ModalOptions, 'backdrop' | 'duration' | 'closeOnEscape'> & {
      backdrop: CSSProperties;
      duration: `${number}ms`;
    }
  > &
    Pick<ModalOptions, 'closeOnEscape'>;
}

/** Stable operations provided by the current modal owner. */
export interface ModalManagerContextProps extends ModalHandlersWithId {
  /** Returns stable operations for the requested node. */
  getModal: Fn<[id: ModalNode['id'] | undefined], ModalActions>;
  /** Reads the current node without duplicating the store. */
  getModalNode: Fn<[id: ModalNode['id'] | undefined], ModalNode | undefined>;
}

/** Typed identities live with the runtime without importing provider implementations. */
export interface ModalContexts {
  /** Settings identity shared by frame consumers. */
  configuration?: Context<ConfigurationContextProps | undefined>;
  /** Operation identity shared by request consumers. */
  manager?: Context<ModalManagerContextProps | undefined>;
  /** Application data identity shared by content consumers. */
  userDefined?: Context<{ context: Dictionary }>;
}
