# Merge and Schema Intersection Worker Evidence

- Scope: common-utils optional merge policies and the schemaIntersection module. No legacy imports or consumers changed by this worker.
- Contracts preceded implementation in coordinator commits `2cc88718` and `39d939ca`.
- common-utils version changed from 0.15.0 to 0.16.0 as the approved substitute for a changeset before release transition.

## Fail-first evidence

`yarn workspace @winglet/common-utils test --run src/utils/object/__tests__/mergeOptions.test.ts` exited 1 before implementation: 7 failed and 3 passed. Failures proved missing immutable/reference/array/atomic policies; the atomic getter was traversed and frozen input mutation threw.

`yarn workspace @canard/schema-form test --run src/helpers/schemaIntersection/__tests__/intersectionValues.test.ts` exited 1 before implementation because the new module entry point did not exist.

## Post-change checks

- `yarn workspace @winglet/common-utils test --run src/utils/object/__tests__/mergeOptions.test.ts src/utils/object/__tests__/merge.test.ts`: exit 0, 2 files and 22 cases passed.
- `yarn workspace @winglet/common-utils build`: exit 0, including designated type declaration generation, hashes and package typecheck. An initial diagnostic run found an ES2022-only test API and generic array cast; both were corrected and the full build rerun successfully.
- `yarn workspace @canard/schema-form test --run src/helpers/schemaIntersection/__tests__/intersectionValues.test.ts`: exit 0, 1 file and 9 cases passed after the common-utils build, exercising package exports.
- Scoped Prettier formatting completed. Generated dist files are excluded from the source commit.

## Contract coverage

The optionless merge body is unchanged. The option path has array replacement, caller-supplied opaque atomic values, one-sided reference preservation and immutable overlapping-container copies. Reserved own keys are carried with the existing safe property primitives in the option path. Existing optionless reserved-key behavior remains unchanged.

The new six leaf functions reuse the existing enum equality/intersection and numerical helpers. Enum/const/range impossibility is a symbol, and const equality uses the existing structural equality utility. Pattern algebra is absent by design. Legacy adapter exception formatting and complete package gates remain the coordinator's integration work.

## Remaining integration work

- Legacy leaf consumers must move and adapt the empty marker to their original errors.
- Full common-utils/schema-form lint, strict checks and regression suites remain PR-boundary gates.
- The new merge options must be consumed by the effective-schema worker; source and dist were built here, but the consuming integration test is still required.
