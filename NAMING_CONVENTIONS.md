# Naming Conventions

This file holds the grammar of member names (properties, fields, getters, methods and function-valued fields of classes, interfaces and object types) in every package of this repository. It decides which part of speech a name takes; `.claude/rules/seiri_naming.md` still decides case, suffixes and file names. A name is read far more often than its declaration, so it must say what the member is or does without opening the code.

## Decide in this order

1. **A standard already names it.** JSON Schema keywords (`uniqueItems`, `readOnly`), DOM and React attributes (`disabled`), and platform API shapes (`IdleDeadline.timeRemaining`) keep the standard's name. Renaming them breaks pass-through and structural compatibility.
2. **A consumer passes it in or writes it**, or an internal name carries such a value unchanged: React props, options, schema options, definition objects, a stored copy of an option, a context that forwards props. These use input vocabulary: prefix-less adjectives (`disabled`, `nullable`) and imperative flags (`omitEmpty`, `disableAutomaticWrites`). Consumers meet these names beside DOM and JSON Schema, and a value that changes name at every hop cannot be traced. A copy keeps the input name only while it holds the value unchanged; a value the code derives from it is state (rule 7).
3. **A caller injects it as a callback.** It takes a role name (`listener`, `onChange`). A verb would read as the owner's own behavior.
4. **Everything else is the owner's own vocabulary**, and the rules below apply.

## Rules

1. **Methods and function-valued fields start with a verb** (`applyPendingSettings`, `runValidation`). Callback role names and platform API copies are the exceptions above, and a pure query may name its result instead (rule 3).
2. **A member that returns nothing, mutates an argument or feeds a sink always starts with a verb** (`collectAffected(path, candidates)`, `registerOwner`, `recordHit`). A noun there hides the side effect.
3. **A pure query may be a noun phrase naming its result** (`occurrenceCount`, `affectedOwners`), never a bare participle: `affected` does not say what was affected. Collection idioms on a Map- or Set-shaped type are allowed (`under`, `tail`, `forBranch`).
4. **Value fields are nouns, and a number names its unit** (`previousItemCount`, `pendingRevisionMask`, `loadEpoch`). A row of two or three fields whose parent names the context may omit the unit (`{ commit, paths }`). An adjective or verb used as a value (`local`, `emit`) reads as a flag or a method, and a noun that names a shape instead of its contents (`structure`) does not say what it holds.
5. **State booleans start with `is`**, followed by an adjective or a passive participle that describes the owner (`isActive`, `isMoved`). Use `has` for something the owner holds or itself did (`hasTypeConflict`, `hasThrown`, `hasWritten`), `can` for a capability (`canRetain`) and `should` for an obligation (`shouldFlushReads`), each only where `is` would distort the meaning. Input vocabulary (step 2) stays prefix-less. One type never mixes the two forms: a props type keeps `misfit` beside `disabled` even though the node calls it `isMisfit`.
6. **A boolean says what `true` means.** `retainedExitPolicy` does not; `shouldUnsetOnInactive` does.
7. **Imperative flags belong only to options, props, schema options and parameters**, where they are an instruction from the caller. State the code decides for itself takes `is` or `should` even when it resembles an option (`isAutomaticWriteSuppressed`, `shouldDeferLoadValidation`).
8. **A field behind a public member, and every name derived from either, uses the public vocabulary and is renamed in the same change.** The backing field of getter `value` is `storedValue`, of `isRequired` is `storedIsRequired`; derived names follow (`previousOutputValue`, `keepRootOutputValue`). Keep the getter instead of exposing the field, because assigning to a getter-only member fails loudly while assigning to a field silently overwrites state.

Not flags, so outside rules 5 to 7: a field that boxes one boolean whose meaning the owner's name gives (`GatePredicateMemo.value`), and a setting that takes `true` or an options object (`virtualization`).

## Applying a rename

- Local variables and parameters that hold a member's value take the member's name.
- Rename by symbol (the TypeScript language service), never by text search, then update comments, string literals, test titles and documents in the same pull request.
- A symbol rename does not reach string keys (`'x' in`, `Reflect.get`, `hasOwnProperty`, `Object.defineProperty`, `toHaveProperty`), values typed `any`, objects behind `as unknown as`, JavaScript files, code inside template strings, or stored test data. Search these by the old name in the same change: they compile and then read `undefined`, and a test that asserts absence or a zero count keeps passing without testing anything.
- Code that predates this file may not follow it yet. A new member follows these rules; when that would mix two forms in one type, rename the type's existing members in the same change.
