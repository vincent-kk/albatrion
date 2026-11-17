---
"@lerx/promise-modal": patch
---

Keep modals visible when the owning `ModalProvider` unmounts and a waiting provider with a different `usePathname` hook takes over. Such a modal used to be hidden under the previous provider's pathname, which the new hook never reported, so its Promise never settled. Modals visible at the handover now follow the receiving provider's route; modals already hidden by route keep their original route.

Frames and backgrounds still receive the original `initiator` for a modal that moved to the receiving provider's route.
