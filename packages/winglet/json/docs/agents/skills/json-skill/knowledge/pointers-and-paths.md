# Pointers and Paths

Addressing a location (`getValue`/`setValue`), producing a safe pointer string (the escape trio), and finding the address of an object you already hold (`getJSONPointer`/`getJSONPath`).

## getValue never reports a miss

`getValue` returns `undefined` for a path that does not exist, at any depth. It throws only when the _document_ is unusable (not a plain object or array) or the _pointer_ is malformed (a string not starting with `/` or `#`, or a non-string/non-array argument). Missing data and broken input are therefore distinguishable, but only if you check the return value — a `try`/`catch` alone will not catch a miss.

```typescript
getValue({ a: 1 }, '/b/c'); // undefined — no throw
getValue(null, '/foo'); // throws: INVALID_INPUT
getValue({}, 'no-slash'); // throws: INVALID_POINTER_TYPE
```

An empty pointer (`''` or `[]`) returns the whole document. A pointer may also be passed pre-split as a token array, in which case the tokens are unescaped for you.

## setValue mutates, builds, and refuses in silence

`setValue` always mutates the document in place and returns that same reference. Three behaviors have no signature to reveal them:

- **Auto-vivification.** Missing intermediate nodes are created. The next segment decides the shape: an array index or `-` creates an array, anything else creates an object.
- **`preserveNull: true` (default) stops traversal at a `null`.** The write is abandoned and the document comes back untouched — no error. Pass `preserveNull: false` to replace the `null` and continue.
- **A forbidden key aborts the write silently.** A segment of `__proto__`, `constructor`, or `prototype` returns the document unchanged, with no error and no option to disable it.

```typescript
setValue({}, '/a/b/c', 42); // { a: { b: { c: 42 } } }
setValue({ items: [1, 2] }, '/items/-', 3); // { items: [1, 2, 3] }
setValue({ profile: null }, '/profile/name', 'A'); // { profile: null } — abandoned
setValue({ x: 1 }, '/__proto__/pwn', true); // { x: 1 } — abandoned
```

Two further edges: `overwrite: false` skips the write when the key already exists (existing-but-`undefined` still counts as existing), and passing `undefined` as the value **deletes** the key rather than assigning it.

The `-` append token is honored by `setValue` and by the JSON Patch `add` operation. Everywhere else — `getValue`, `remove`, `replace` — it is an ordinary key name.

## escapePath and escapeSegment are not interchangeable

Both come from `@winglet/json/pointer-escape`, and choosing wrong produces a wrong pointer rather than an error.

`escapePath` splits its argument on `/` and escapes each piece, so the separators survive and **a `/` is never escaped**. Since no piece can contain a `/` after the split, `~` is the only character it ever escapes.

`escapeSegment` treats its whole argument as one key and escapes both characters: `~` → `~0`, `/` → `~1`.

```typescript
escapePath('config/database'); // 'config/database'   — unchanged
escapeSegment('config/database'); // 'config~1database' — one key named "config/database"
escapePath('/users/jane~doe/settings'); // '/users/jane~0doe/settings'
```

So: build a pointer from a user-supplied **key** with `escapeSegment`; normalize an already-structured **path** with `escapePath`.

```typescript
const pointer = `/config/${escapeSegment(userKey)}`;
```

Going the other way, `unescapePath` reverses `~0` and `~1` and **leaves any other `~` sequence alone** — `~2` and a trailing `~` pass through unchanged rather than raising an error. `unescapeSegment` is an alias for the very same function, not a segment-specific counterpart to `escapeSegment`; the asymmetry is real, and it means unescaping cannot tell you whether the input was a path or a key.

The function that actually hands you unescaped tokens is `compilePointer`, not one of the `convert*` pair. It keeps the leading empty token produced by the initial `/`:

```typescript
compilePointer('/a~1b/c~0d'); // ['', 'a/b', 'c~d']
compilePointer(''); // []
```

## Finding the address of an object you hold

`getJSONPointer(root, target)` from `@winglet/json/pointer-common` is the direct answer, and it escapes correctly:

```typescript
const doc = { a: { b: [1, 2, { c: 'x' }] } };
getJSONPointer(doc, doc.a.b[2]); // '/a/b/2'
getJSONPointer(doc, doc); // '/'
getJSONPointer(doc, {}); // null — not found

const escaped = { 'a/b': { v: 1 } };
getJSONPointer(escaped, escaped['a/b']); // '/a~1b' — escaped for you
```

`getJSONPath(root, target)` answers the same question in Goessner syntax — `'$.a.b[2]'`, `'$'` for the root, `null` when absent. Two properties of the match are easy to misread:

- It compares with `===`, so **primitives are found too**, not only object references. `getJSONPath({ a: 'x', b: 'x' }, 'x')` returns `'$.a'`.
- It returns **one** match. With duplicate values the winner depends on traversal order, so treat the result as "an address of this value", not "the address".

Keys that would break dot notation switch to bracket-and-quote form: `getJSONPath({ 'key.with.dots': v }, v)` yields `"$['key.with.dots']"`.

## Do not bridge JSONPath to a pointer by string conversion

`convertJsonPathToPointer` is named for JSONPath but does **not** accept a full JSONPath expression. It consumes a bare data path and treats `$` as an ordinary character, so it neither strips the root token nor applies RFC 6901 escaping:

```typescript
convertJsonPathToPointer('users[0].name'); // '/users/0/name'  — intended input shape
convertJsonPathToPointer('users[]'); // '/users/-'      — empty brackets become append
convertJsonPathToPointer(''); // '/'            — not ''
convertJsonPathToPointer('$'); // '/$'           — '$' kept as a key
convertJsonPathToPointer('a~b.c'); // '/a~b/c'       — '~' left raw, not escaped to '~0'
convertJsonPathToPointer("['key.with.dots']"); // "/'key.with.dots'" — quotes kept
```

Feeding a `getJSONPath` result straight in therefore produces a pointer with a phantom `$` segment, and the subsequent read silently misses:

```typescript
const jsonPath = getJSONPath(doc, doc.users[1]); // '$.users[1]'
getValue(doc, convertJsonPathToPointer(jsonPath)); // undefined — pointer was '/$/users/1'
```

What `convertJsonPathToPointer` really is, is one half of an inverse pair with `convertJsonPointerToPath`, over the leading-dot data path form — the shape a schema library or form library tends to use, not JSONPath proper. Neither half touches `$` or RFC 6901 escapes, and both pass already-converted input through unchanged, so a double call is safe:

```typescript
convertJsonPointerToPath('/users/0/name'); // '.users[0].name'  — numeric segments bracketed
convertJsonPathToPointer('.users[0].name'); // '/users/0/name'   — round-trips
convertJsonPointerToPath('/'); // '.'
```

Use `getJSONPointer` when you have the object, and reserve the `convert*` pair for data paths that never carried a `$`, quoted keys, or `~`.

## Constants

`JSONPointer` is `{ Root: '', Fragment: '#', Separator: '/' }`; `JSONPath` is `{ Root: '$', Current: '@', Child: '.', Filter: '#' }`. Note that `JSONPointer.Root` is the empty string while `getJSONPointer` returns `'/'` for the root — they are not the same value.
