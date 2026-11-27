---
"@canard/schema-form": minor
---

Add optional application isolation with `registerPlugin(plugin, { scope })` and `<FormProvider pluginScope={scope}>`. Use the same stable string or symbol for one application. Compatible package copies share that scope, while other scopes and the unscoped registry remain independent, including resets. Omitting the options preserves realm-wide sharing.

Register configuration before rendering forms. Registrations do not trigger live updates, and scope registries remain for the lifetime of the realm.
