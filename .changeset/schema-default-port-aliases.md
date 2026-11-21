---
"@winglet/json-schema": patch
---

Recognize explicit default and empty ports in `$schema` dialect URIs and custom dialect aliases. HTTP port 80 and HTTPS port 443 compare like omitted ports, while non-default ports and case-sensitive URI components retain their meaning.
