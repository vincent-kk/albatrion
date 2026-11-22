---
"@winglet/react-utils": patch
---

withUploader opens the file picker without sending a second click through React or native ancestor capture listeners, including ShadowRoot containers. The same file input is restored immediately for normal file selection and change handling.
