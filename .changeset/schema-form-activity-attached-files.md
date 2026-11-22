---
"@canard/schema-form": patch
---

Hiding a file input with React 19 `<Activity mode="hidden">` no longer removes its files from `FormHandle.getAttachedFilesMap()`. Wizards and tabs built with Activity kept the field value but lost the attached file, so a submit after hiding sent no file. Unmounting the input still releases its attachment.
