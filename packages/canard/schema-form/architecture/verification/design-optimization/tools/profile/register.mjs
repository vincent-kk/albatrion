// Loaded by Node --import; registers the resolver for bundles copied outside the repository.
import { register } from 'node:module';

register('./hooks.mjs', import.meta.url);
