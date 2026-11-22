// Loaded after tsx so the provenance resolver sees the product's ESM imports.
import { register } from 'node:module';

register('./provenance-loader.mjs', import.meta.url);
