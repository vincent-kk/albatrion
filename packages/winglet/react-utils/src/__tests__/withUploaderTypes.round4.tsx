import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from 'react';

import { withUploader } from '../index';

// The ordinary shape of a design-system Button: React's own DOM attribute props.
const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" {...props} />
);

// A component whose click prop uses React's handler type explicitly.
const Card = (props: {
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
}) => <div {...props} />;

// The JSDoc example's inline zone component.
const Zone = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className="upload-zone" {...props}>
    {children}
  </div>
);

// Documented in docs/en/SPECIFICATION.md:858 and knowledge/components-and-utilities.md:33.
export const UploadButton = withUploader(Button);
export const UploadCard = withUploader(Card);
export const UploadZone = withUploader(Zone);

const usage = (
  <>
    <UploadButton onChange={(file: File) => file.name}>Upload</UploadButton>
    <UploadCard onChange={(file: File) => file.name}>Card</UploadCard>
    <UploadZone onChange={(file: File) => file.name}>Zone</UploadZone>
  </>
);

void usage;
