---
"@winglet/common-utils": patch
---

`debounce` no longer drops a call made from inside the debounced function: the new call runs after the next quiet period, whether the previous run came from the timer or from `execute()`. A call that throws is no longer run a second time with the same arguments by the trailing edge.
