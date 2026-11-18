---
"@lerx/promise-modal": patch
---

Hiding only ModalProvider or the component rendering useInitializeModal now preserves pending requests from outside the hidden subtree instead of cancelling them. The same modal and prompt value return when shown, while keyboard and page effects are released during hiding. A hidden useModal caller cancels its own requests; actual Provider removal still cancels or hands over. To retain cancellation on Provider hide, abort the request explicitly or unmount the Provider.
