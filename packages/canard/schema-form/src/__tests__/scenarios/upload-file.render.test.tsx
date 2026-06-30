import type { FC } from 'react';

import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { type FormTypeInputProps } from '@/schema-form';
import { SetValueOption } from '@/schema-form/core';

import { type FormHarness, renderForm } from '../renderForm';

/**
 * File attachment lifecycle via `getAttachedFilesMap()`.
 *
 * The library keeps uploaded `File` objects OUT of the JSON value: a custom
 * file `FormTypeInput` calls `onFileAttach(file | File[])` to stash the raw
 * File(s) in `attachedFilesMap` (keyed by the node path) and `onChange(meta)`
 * to put only serialisable metadata into `node.value`. The default
 * `SchemaNodeInput.handleFileAttach` (used here — no Form-level onFileAttach)
 * stores single files as `File[]` of length 1 and arrays as `File[]` of length
 * N, deletes the entry on `onFileAttach(undefined)`, and — crucially — deletes
 * the entry in `useOnUnmount` when the input leaves the DOM (branch switch /
 * form unmount). Every test asserts BOTH the attachedFilesMap (size/keys/File[]
 * lengths + identity) AND the rendered DOM / node-tree metadata.
 *
 * Schemas mirror stories/26.UploadFileUsecase.
 */

// ---------------------------------------------------------------------------
// Custom file FormTypeInput (mirrors the story; adds id={path} so the harness
// can target it via field(path) / user.upload).
// ---------------------------------------------------------------------------

interface FileMeta {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

const toMeta = (file: File): FileMeta => ({
  name: file.name,
  size: file.size,
  type: file.type,
  lastModified: file.lastModified,
});

const FileInput: FC<FormTypeInputProps<any>> = ({
  path,
  jsonSchema,
  readOnly,
  disabled,
  onChange,
  onFileAttach,
}) => {
  const multiple: boolean =
    (jsonSchema as any)?.FormTypeInputProps?.multiple ?? false;
  return (
    <input
      id={path}
      type="file"
      multiple={multiple}
      disabled={readOnly || disabled}
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) {
          onFileAttach?.(undefined);
          onChange(undefined);
          return;
        }
        if (multiple) {
          onFileAttach?.(files);
          onChange(files.map(toMeta));
        } else {
          onFileAttach?.(files[0]);
          onChange(toMeta(files[0]));
        }
      }}
    />
  );
};

const fileMetaSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    size: { type: 'number' },
    type: { type: 'string' },
    lastModified: { type: 'number' },
  },
} as const;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const singleSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', default: 'single' },
    attachment: {
      ...fileMetaSchema,
      FormTypeInput: FileInput,
      FormTypeInputProps: { accept: '*/*', multiple: false },
    },
  },
} satisfies JsonSchema;

const multiSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', default: 'multiple' },
    attachments: {
      type: 'array',
      FormTypeInput: FileInput,
      FormTypeInputProps: { accept: '*/*', multiple: true },
      items: fileMetaSchema,
    },
  },
} satisfies JsonSchema;

const oneOfSchema = {
  type: 'object',
  oneOf: [
    {
      '&if': "./category === 'movie'",
      properties: {
        trailer: {
          ...fileMetaSchema,
          FormTypeInput: FileInput,
          FormTypeInputProps: { accept: '*/*', multiple: false },
        },
      },
    },
    {
      '&if': "./category === 'game'",
      properties: {
        manual: { type: 'string', default: 'text-only, no file input' },
      },
    },
  ],
  properties: {
    category: { type: 'string', enum: ['movie', 'game'], default: 'movie' },
    title: { type: 'string' },
  },
} satisfies JsonSchema;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const png = (name: string): File =>
  new File(['png-bytes'], name, { type: 'image/png' });

const upload = async (
  form: FormHarness,
  path: string,
  files: File | File[],
): Promise<void> => {
  const field = form.field(path);
  if (!field) throw new Error(`upload: no file field at "${path}"`);
  await form.user.upload(field as HTMLInputElement, files);
  await form.flush();
};

// ---------------------------------------------------------------------------

describe('upload-file — single-file field', () => {
  it('stores one File in attachedFilesMap and metadata in node.value', async () => {
    const form = await renderForm(singleSchema);

    // DOM: the custom file input is mounted; map starts empty.
    expect(form.field('/attachment')).not.toBeNull();
    expect(form.field('/attachment')?.getAttribute('type')).toBe('file');
    expect(form.attachedFilesMap().size).toBe(0);

    await upload(form, '/attachment', png('a.png'));

    const map = form.attachedFilesMap();
    expect(Array.from(map.keys())).toEqual(['/attachment']);
    const files = map.get('/attachment');
    expect(Array.isArray(files)).toBe(true);
    expect(files).toHaveLength(1);
    expect(files![0]).toBeInstanceOf(File);
    expect(files![0].name).toBe('a.png');

    // node.value holds only the serialisable metadata, never the File.
    const meta = form.node('/attachment')?.value as FileMeta;
    expect(meta.name).toBe('a.png');
    expect(meta.type).toBe('image/png');
    expect(form.getValue()?.attachment?.name).toBe('a.png');
  });

  it('replaces the stored File on a second upload (map stays length 1)', async () => {
    const form = await renderForm(singleSchema);

    await upload(form, '/attachment', png('first.png'));
    expect(form.attachedFilesMap().get('/attachment')![0].name).toBe(
      'first.png',
    );

    await upload(form, '/attachment', png('second.png'));

    const map = form.attachedFilesMap();
    expect(map.size).toBe(1);
    expect(map.get('/attachment')).toHaveLength(1);
    expect(map.get('/attachment')![0].name).toBe('second.png');
    expect((form.node('/attachment')?.value as FileMeta).name).toBe(
      'second.png',
    );
  });
});

describe('upload-file — multi-file array', () => {
  it('stores File[] of length N and a metadata array in node.value', async () => {
    const form = await renderForm(multiSchema);

    expect(form.field('/attachments')).not.toBeNull();
    expect(form.attachedFilesMap().size).toBe(0);

    await upload(form, '/attachments', [
      png('a.png'),
      png('b.png'),
      png('c.png'),
    ]);

    const map = form.attachedFilesMap();
    expect(Array.from(map.keys())).toEqual(['/attachments']);
    const files = map.get('/attachments');
    expect(files).toHaveLength(3);
    expect(files!.map((f) => f.name)).toEqual(['a.png', 'b.png', 'c.png']);

    const value = form.node('/attachments')?.value as FileMeta[];
    expect(Array.isArray(value)).toBe(true);
    expect(value).toHaveLength(3);
    expect(value.map((m) => m.name)).toEqual(['a.png', 'b.png', 'c.png']);
  });

  it('replaces the whole File[] on a re-upload with a smaller set', async () => {
    const form = await renderForm(multiSchema);

    await upload(form, '/attachments', [png('a.png'), png('b.png')]);
    expect(form.attachedFilesMap().get('/attachments')).toHaveLength(2);

    await upload(form, '/attachments', [png('only.png')]);

    const map = form.attachedFilesMap();
    expect(map.size).toBe(1);
    expect(map.get('/attachments')).toHaveLength(1);
    expect(map.get('/attachments')![0].name).toBe('only.png');
    expect(
      (form.node('/attachments')?.value as FileMeta[]).map((m) => m.name),
    ).toEqual(['only.png']);
  });
});

describe('upload-file — oneOf branch switch purges the file', () => {
  it('removes the file field from the DOM and purges its map entry on switch', async () => {
    const form = await renderForm(oneOfSchema);

    // Default category=movie → movie branch active → trailer field rendered.
    expect(form.exists('/trailer')).toBe(true);

    await upload(form, '/trailer', png('trailer.png'));
    expect(form.attachedFilesMap().get('/trailer')).toHaveLength(1);
    expect((form.node('/trailer')?.value as FileMeta).name).toBe('trailer.png');

    // Switch to the game branch: trailer leaves the DOM, its node disables,
    // and useOnUnmount purges the map entry.
    await form.setValue({ category: 'game' });

    expect(form.exists('/trailer')).toBe(false);
    expect(form.node('/trailer')?.enabled).toBe(false);
    expect(form.attachedFilesMap().has('/trailer')).toBe(false);
    expect(form.attachedFilesMap().size).toBe(0);
    expect(form.getValue()).not.toHaveProperty('trailer');
    // game-branch text field is now rendered.
    expect(form.exists('/manual')).toBe(true);
  });

  it('does not re-add the old File when switching back to the file branch', async () => {
    const form = await renderForm(oneOfSchema);

    await upload(form, '/trailer', png('trailer.png'));
    await form.setValue({ category: 'game' });
    expect(form.attachedFilesMap().size).toBe(0);

    await form.setValue({ category: 'movie' });

    // trailer field is back and empty (no stored File, no metadata).
    expect(form.exists('/trailer')).toBe(true);
    expect(form.attachedFilesMap().has('/trailer')).toBe(false);
    expect(form.attachedFilesMap().size).toBe(0);
    expect(form.getValue()?.trailer).toBeUndefined();
  });
});

describe('upload-file — lifecycle cleanup', () => {
  it('clears the map when the form unmounts (no File leak)', async () => {
    const form = await renderForm(singleSchema);

    await upload(form, '/attachment', png('keep.png'));
    // Grab the live Map instance before tearing down (handle is gone after).
    const map = form.attachedFilesMap();
    expect(map.size).toBe(1);

    form.unmount();

    // The same Map instance is emptied by each input's useOnUnmount.
    expect(map.size).toBe(0);
  });

  it('purges the map entry on an empty selection (onFileAttach(undefined))', async () => {
    const form = await renderForm(singleSchema);

    await upload(form, '/attachment', png('a.png'));
    expect(form.attachedFilesMap().get('/attachment')).toHaveLength(1);

    // Re-fire change with no files selected.
    await upload(form, '/attachment', []);

    expect(form.attachedFilesMap().has('/attachment')).toBe(false);
    expect(form.attachedFilesMap().size).toBe(0);
    expect(form.node('/attachment')?.value).toBeUndefined();
  });

  it('empties the map when the whole value is cleared via setValue({})', async () => {
    const form = await renderForm(singleSchema);

    await upload(form, '/attachment', png('a.png'));
    expect(form.attachedFilesMap().get('/attachment')).toHaveLength(1);

    // Overwriting the root with {} resets the attachment input (RequestRefresh
    // remounts it through useOnUnmount), purging the stored File while the node
    // itself stays rendered.
    await form.setValue({}, SetValueOption.Overwrite);

    expect(form.attachedFilesMap().has('/attachment')).toBe(false);
    expect(form.attachedFilesMap().size).toBe(0);
    expect(form.exists('/attachment')).toBe(true);
    expect(form.getValue()?.attachment).toBeUndefined();
  });
});
