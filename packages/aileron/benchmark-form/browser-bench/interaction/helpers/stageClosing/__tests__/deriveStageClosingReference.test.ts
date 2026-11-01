import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { expect, it } from 'vitest';

import type { ValidationAfterPaintPage } from '../../../validationAfterPaintTypes';
import type { SampleResult } from '../../summarizeResults';
import { deriveStageClosingReference } from '../deriveStageClosingReference';

it('C7 reproduces every recorded IR-6 round-6 verdict from stored raw pages', () => {
  const directory = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../../../../../canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/browser/round-6',
  );
  const complete = JSON.parse(
    gunzipSync(
      fs.readFileSync(path.join(directory, 'complete.json.gz')),
    ).toString(),
  );
  const pages: Record<string, ValidationAfterPaintPage> = JSON.parse(
    gunzipSync(
      fs.readFileSync(path.join(directory, 'pages.json.gz')),
    ).toString(),
  );
  const samples: SampleResult[] = complete.samples;
  const result = deriveStageClosingReference(
    samples.map((sample) => ({
      ...sample,
      lane: sample.lane === 'E' ? 'S' : sample.lane,
    })),
    pages,
    'S',
  );
  expect(result.gates).toEqual(
    JSON.parse(fs.readFileSync(path.join(directory, 'decision.json'), 'utf8')),
  );
}, 120000);
