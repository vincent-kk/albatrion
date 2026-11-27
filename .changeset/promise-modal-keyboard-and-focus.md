---
"@lerx/promise-modal": major
---

Breaking change: modals now respond to Escape, and a dimmed modal manages focus and isolates the page behind it by default.

Escape cancels the top visible pending modal with its normal cancellation result. The effective setting is the first defined of the call's `closeOnEscape`, the call's `closeOnBackdropClick`, the provider's `closeOnEscape` and the provider's `closeOnBackdropClick`, so a modal that could not be dismissed by a backdrop click gains no new exit. A modal that is neither dimmed nor closable by Escape is skipped, so the press reaches the modal below it; a dimmed modal that does not close on Escape stops the press. One press cancels at most one modal, even when a control inside the top modal settles it on that press without calling `preventDefault`. Calling `preventDefault` in a handler stops the library from closing any modal for that press.

```tsx
// Before: Escape did nothing.
await confirm({ title: 'Delete item?' });
// After: keep Escape from cancelling.
await confirm({ title: 'Delete item?', closeOnEscape: false });
```

A dimmed modal moves focus inside, keeps Tab within it, restores focus to the opener, makes the rest of the page `inert` and locks body scrolling. A custom frame that already traps focus and locks scrolling hands those two back:

```tsx
// Before
<ModalProvider ForegroundComponent={CustomDialog} />
// After
<ModalProvider
  ForegroundComponent={CustomDialog}
  options={{ trapFocus: false, lockScroll: false }}
/>
```

Initial focus movement and `inert` isolation stay active for dimmed modals. A custom frame remains responsible for the dialog role, the accessible name and the description. A portal added to `body` after isolation is outside the `inert` snapshot and the Tab cycle.

A dimmed backdrop blocks clicks on the page even with `closeOnBackdropClick: false`. For a notification that lets the page through, turn dimming off:

```tsx
// Before
alert({ title: 'Saved', closeOnBackdropClick: false });
// After
alert({ title: 'Saved', dimmed: false, closeOnBackdropClick: false });
```

The provider and each call accept the new options `closeOnEscape`, `trapFocus` and `lockScroll`, and the default frames expose `role="dialog"` and `aria-modal="true"`.
