---
"@winglet/common-utils": patch
---

Notify every `getTrackableHandler` subscriber even when another subscriber throws. Start-notification errors still reject the handler; completion-notification errors preserve the operation's result and reach the host through `reportError` or a separately scheduled throw.
