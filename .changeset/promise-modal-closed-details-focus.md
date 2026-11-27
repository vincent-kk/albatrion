---
"@lerx/promise-modal": patch
---

Keep hidden controls inside closed `details` elements out of modal focus navigation. Tab and Shift+Tab now wrap through visible controls, while the first summary and its interactive children remain reachable. Opening the details makes its content available again.
