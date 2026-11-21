---
"@winglet/common-utils": patch
---

Clone supported built-in values from other realms into usable objects, including collections, dates, regular expressions, binary buffers, data views, and errors. Circular collections retain their cloned references, and forged built-in tags without internal slots remain ordinary object clones.

Cloning errors preserves their subtype and message even when the writable error name changes. An ordinary object tagged as an error is cloned without calling its constructor.
