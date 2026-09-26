/**
 * D-1 crosscheck probe (Claude) against the round-3 prototype
 * (../spikes/work-loop/proto/loop-v3.mjs): record A, then record B with the
 * host `null` — which paths bring A's latent child raw back?
 *
 * Run from the repo root:
 *   node packages/canard/schema-form/architecture/reviews/crosscheck-claude-d1-proto.mjs
 */
import {
  attach,
  declareFragments,
  declareInjections,
  flush,
  leaf,
  localValueOf,
  object,
  prime,
  setValue,
  valueOf,
  write,
} from '../spikes/work-loop/proto/loop-v3.mjs';

/** root { src, host: { note, keep, draft? } }; `draft` is declared by a fragment "if note is absent then draft default 'D'". */
function build() {
  const root = object('root');
  const src = attach(root, leaf('src'));
  const host = attach(root, object('host'));
  const note = attach(host, leaf('note'));
  const keep = attach(host, leaf('keep'));
  const draft = attach(host, leaf('draft', 'D'));
  declareFragments(host, [
    { guard: (L) => L.note === undefined, declares: ['draft'] },
  ]);
  prime(root);
  setValue(root, { host: { note: 'A-note', keep: 'A-keep' } }); // record A
  flush(root);
  const afterA = valueOf(root);
  setValue(root, { host: null }); // record B
  flush(root);
  return { root, src, host, note, keep, draft, afterA };
}

const show = (label, data) => console.log(label.padEnd(44), JSON.stringify(data));

{
  const t = build();
  show('record A emit', t.afterA);
  show('record B emit', valueOf(t.root));
  show('while null: host local (node.value, A8/E11)', localValueOf(t.host));
  show('while null: child raw note/keep/draft', [t.note.raw, t.keep.raw, t.draft.raw]);
  show('while null: draft active (fragment on {})', t.draft.active);
}
{
  const t = build();
  write(t.note, 'B-note'); // partial write (user input)
  flush(t.root);
  show('P1 partial write note → emit', valueOf(t.root));
}
{
  const t = build();
  write(t.keep, 'B-keep'); // partial write to the other child
  flush(t.root);
  show('P2 partial write keep → emit', valueOf(t.root));
}
{
  const t = build();
  setValue(t.host, { note: 'B-note' }); // full replacement of the host
  flush(t.root);
  show('P3 setValue(host, {note}) → emit', valueOf(t.root));
}
{
  const t = build();
  setValue(t.root, {}); // record C: the host key is absent
  flush(t.root);
  show('P4 setValue(root, {}) → emit', valueOf(t.root));
  show('P4 child raw note/keep', [t.note.raw, t.keep.raw]);
}
{
  const t = build();
  declareInjections(t.root, [
    { from: t.src, to: t.note, map: (e) => (e === undefined ? t.note.raw : `from:${e}`) },
  ]);
  write(t.src, 's'); // user edits a field outside the host; injectTo writes into the null host
  flush(t.root);
  show('P5 injectTo src→host/note → emit', valueOf(t.root));
}
