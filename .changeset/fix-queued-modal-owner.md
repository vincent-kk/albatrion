---
"@lerx/promise-modal": patch
---

Apply the receiving ModalProvider’s route and options to queued requests when portal ownership transfers. This prevents requests from opening hidden under the previous provider’s route. Reuse the shared styles during ownership transfer and remove them when the final provider leaves.
