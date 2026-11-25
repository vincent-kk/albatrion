# Rows of the 1.0.0 speed comparison

These 115 rows compare the public calls that the 1.0.0 bug-bounty fixes changed against the commit before those fixes, `1c77ced57`. They run with [`../compare/`](../compare/README.md); [`../DESIGN.md`](../DESIGN.md) and [`../IMPROVING.md`](../IMPROVING.md) give the method.

## Groups

The file name is `<group>-<number>-<name>.mjs`, and `--only` selects by prefix.

| Prefix | Rows | Contents                                                                                                                   |
| ------ | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| `p1-`  | 24   | Calls on ordinary input that became slower.                                                                                |
| `p2c-` | 24   | Calls whose input reaches a fixed path, plus ordinary-input rows of the UI plugins and `@slats/agents-assets-sync`.        |
| `p2e-` | 18   | `@canard/schema-form` engine calls without React.                                                                          |
| `p2u-` | 25   | UI plugin mounts and interactions. `am` in the name means `@canard/schema-form-antd-mobile-plugin`.                        |
| `p3-`  | 19   | Calls that differed by less, or that only one of the two commits accepts.                                                  |
| `p4-`  | 5    | Calls on the paths where reading order, built-in checks and tuple identity are decided: early-mismatch and deep `equals`, a context holding built-ins, and repeated reads of a virtual `defaultValue`. |

`inputKind` in a row is `plain` for input a consumer passes every day and `repaired` for input that reaches a path a fix changed on purpose.

## Preparing the trees

The trees are not kept in the repository. Each is a commit unpacked outside it, installed and built on its own.

1. Unpack `git archive <commit>` into an empty directory and write the commit into `.speed-ref` at its root.
2. Run `yarn install --immutable` inside that directory. Run from outside, the global Yarn 1 is selected and the install fails.
3. Build every workspace except `@canard/schema-form` in dependency order, then build `@canard/schema-form`. Built in one pass, its typecheck fails on plugin declarations that do not exist yet.
4. To bring a new change into a candidate tree, overwrite only the changed package with `git archive <commit> <package path>`, rebuild that package, and confirm with `diff -rq` that its `src` equals the commit.

| Tree              | Commit                                                           | Use                               |
| ----------------- | ---------------------------------------------------------------- | --------------------------------- |
| Baseline          | `1c77ced57`                                                      | `--a` for every row.              |
| Baseline variant  | `1c77ced57` with the plugin's `antd-mobile` aligned to 5.43.0    | `--a` for the `antd-mobile` rows. |
| Candidate         | The commit under test                                            | `--b`.                            |

```sh
node benchmarks/compare/run.mjs --a <baseline tree> --b <candidate tree> \
  --rows benchmarks/rows --only p1- --rounds 24 --out <new directory>
```

The `antd-mobile` rows use the variant because the two lockfiles resolve that library to different versions (5.40.0 at the baseline), and the comparison is about this repository's code. `@canard/schema-form` is measured through its Node entry (`dist/index.node.mjs`), which is what a row's import by package name selects in both trees.

## Limits

The kit marks a row `over` above 1.03. The limit for these rows depends on the baseline time of one operation, and both min and p10 must be under it:

| Baseline time of one operation                             | Limit      |
| ---------------------------------------------------------- | ---------- |
| 1 ms or more                                               | under 1.05 |
| 1 µs to 1 ms                                               | under 1.35 |
| Under 1 µs                                                 | under 3x   |
| UI plugin rows and `@slats/agents-assets-sync`, any time   | under 1.5  |

The smaller the operation, the more the ratio moves with noise, so a small row is judged by whether the extra work is needed, not by the ratio alone. `p1-02`, `p1-03` and `p1-05` repeat one call 2000, 2000 and 12 times per run, and `p2e-16` to `p2e-18` hold several reads per run (one read is about 34 ns, 95 ns and 3.3 ns): their limit follows the time of one call or read.

## Rows that exceed their limit

These rows are over their limit because the fixed code does work the baseline skipped. Each was attributed with a diagnostic build that skips only that work, and the tests named fail without it. The ratios are min / p10 at 24 rounds on Node v24.20.0, Apple M1 Max, measured on `53099d518`. A new excess on any other row, or a clear rise on these, is a regression.

| Rows                                             | Ratio                        | The work the fix requires                                                                                                                                                         |
| ------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p1-01`, `p2c-23`, `p3-18` (`@winglet/json-schema`) | 8.43, 11.12, 4.20            | The first miss normalizes every registration key and indexes the registered documents, once per resolver. Tests on embedded identifiers, duplicate identifiers and key spellings. |
| `p2c-22`, `p2c-24` (`@winglet/json-schema`)      | 1.92, 2.33                   | Normalization of non-canonical registration keys; construction of the `DuplicateIdentifier` error.                                                                                |
| `p1-04` (`equals`, deep)                         | 1.47                         | Tracking of the active pair, which turns a cyclic input into a `RangeError` instead of a hang (`publicCycleBoundaries.test.ts`).                                                   |
| `p2c-12` to `p2c-17` (`@winglet/style-utils`)    | 2.23 to 3.33                 | Reading real CSS tokens instead of searching for `{`, `}` and `,`, so punctuation in strings, comments, escapes and nested groups is not misread.                                  |
| `p2c-08` (context update, changed `Error` cause) | 5.92                         | The baseline treats errors that differ only in `cause` as equal and skips the update.                                                                                             |
| `p2c-11` (slider gate and focus)                 | 3.40                         | The baseline loses focus; focus now reaches the slider handle and `antd` opens its tooltip.                                                                                       |
| `p2c-10`, `p2e-14`, `p3-14` (whole-array write)  | 1.34 / 1.35, 1.44, 1.35      | An uncontrolled input that held a stale value is remounted once. `p2c-10` and `p3-14` sit on the limit and measure on either side of it.                                          |
| `p2c-03`, `p2c-02`, `p2u-13`, `p2u-20` (UI plugins) | 7.70, 1.98, 2.35, 1.57       | `p2c-03`: the same remount makes `antd` insert its styles again. The three branch-error rows were accepted without a separate attribution.                                        |
| `p2c-09` (server render of 100 fields)           | 1.06                         | The identifiers of each input and title are computed and rendered.                                                                                                                |
| `p2e-15` (structural batch)                      | 1.83                         | The batch settles once per verb.                                                                                                                                                  |
| `p3-16` (write-back with validation errors)      | 1.55                         | The validation result is published after a write-back of the same value.                                                                                                          |
| `p3-01` to `p3-04` (ajv7 compile)                | 1.06 to 1.09                 | Compilation is isolated from the caller's `ajv` instance.                                                                                                                         |
| `p3-19` (ajv6, invalid `$id` resource)           | 7.55                         | The `$async` marking and locating the rejected key inside the resource; an error path of about 4 µs.                                                                              |
| `p2c-18` to `p2c-20` (`@slats/agents-assets-sync`) | 1.68 to 2.01                 | Atomic replacement through a temporary directory per file, and the path containment and ownership checks. The baseline time of these rows moves from day to day.                   |

## Rows that need care

- `p3-11` and `p3-17` use input the baseline rejects. Measure them with the candidate tree on both sides; the ratio then shows noise only.
- The control of `p1-07` and `p3-19` leaves its window on most runs. Repeat them alone, and read the result as approximate.
- A row under about 2 µs measured as `render` carries two timer reads in both arms, which pulls its ratio toward 1.
- `p4-05` reads a virtual `defaultValue`, which the baseline `1c77ced57` answers with `undefined`; compare it between two trees that both hold the tuple projection.
