---
"@winglet/common-utils": patch
---

Generate content-based `createSafeFingerprint` keys for plain objects, dates, and regular expressions from other realms. Equal values now share keys and changed plain data invalidates its previous key, including the default safe mode of `createFingerprintFactory`.
