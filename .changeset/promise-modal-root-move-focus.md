---
"@lerx/promise-modal": patch
---

Keep keyboard focus on the same control, including one inside an open shadow root, when the `root` of `ModalProvider` changes to another element, or `initialize` receives a new element, while a modal is open. Moving the portal used to drop focus to the page body, so a user typing into a prompt lost the caret.
