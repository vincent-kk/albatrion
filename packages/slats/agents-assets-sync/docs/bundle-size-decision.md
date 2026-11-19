# Terminal Renderer Dependencies

The interactive terminal uses Ink and React for agent and scope selection, force confirmation and the final report. The dispatcher imports the UI only for an interactive TTY; plain and JSON runs use the same core result without mounting a terminal renderer.

The dependency choice supports one progressive screen that can preserve target context while it asks for missing values. Input screens return choices to the core; they do not implement separate validation or application pipelines. Final diagnostics come from the completed run result so choosing a terminal display cannot hide a failed path or its reason.

Consumer libraries keep this engine in devDependencies because neither the CLI nor its terminal renderer belongs in application runtime bundles. End users invoke the engine explicitly to install agent assets.
