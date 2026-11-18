import type { CSSProperties, ComponentType, Context } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { ModalActions, ModalNode } from '@/promise-modal/core/node';

import type { BackgroundComponent, FooterComponentProps, ForegroundComponent, WrapperComponentProps } from './base';
import type { ModalHandlersWithId } from './modal';
import type { ModalOptions } from './option';

/** Configuration shared by a frame and the hooks from compatible package copies. */
export interface ConfigurationContextProps {
  ForegroundComponent: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
  TitleComponent: ComponentType<WrapperComponentProps>;
  SubtitleComponent: ComponentType<WrapperComponentProps>;
  ContentComponent: ComponentType<WrapperComponentProps>;
  FooterComponent: ComponentType<FooterComponentProps>;
  options: Required<Omit<ModalOptions, 'backdrop' | 'duration' | 'closeOnEscape'> & { backdrop: CSSProperties; duration: `${number}ms` }> & Pick<ModalOptions, 'closeOnEscape'>;
}

/** Stable operations provided by the current modal owner. */
export interface ModalManagerContextProps extends ModalHandlersWithId {
  getModal: Fn<[id: ModalNode['id'] | undefined], ModalActions>;
  getModalNode: Fn<[id: ModalNode['id'] | undefined], ModalNode | undefined>;
}

/** Typed identities live with the runtime without importing provider implementations. */
export interface ModalContexts {
  configuration?: Context<ConfigurationContextProps | undefined>;
  manager?: Context<ModalManagerContextProps | undefined>;
  userDefined?: Context<{ context: Dictionary }>;
}
