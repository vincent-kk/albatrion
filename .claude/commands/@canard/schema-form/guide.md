# @canard/schema-form Q&A Command

**Package**: `@canard/schema-form`
**Expert Skill**: `schema-form-expert` (directory-based skill)

Ask questions about @canard/schema-form and get answers through the `/schema-form` command.

## Usage

```
/schema-form [question or topic]
```

## Examples

```
/schema-form What is the FormTypeInput priority?
/schema-form How to use relative paths in computed properties
/schema-form Difference between oneOf and anyOf
/schema-form How to implement file upload
/schema-form How to add custom validation keywords
```

## Supported Topics

### Basic Concepts
- Installation and setup
- Form component usage
- FormHandle API
- Basic examples

### Node System
- Node types (StringNode, NumberNode, ObjectNode, ArrayNode, etc.)
- Node properties and methods
- Strategy Pattern (BranchStrategy, TerminalStrategy)
- Event system

### FormTypeInput
- Writing FormTypeInputDefinition
- Test conditions (object, function)
- FormTypeInputMap (path-based mapping)
- Priority rules
- Writing custom input components

### Validation
- Validation plugins (AJV 6/7/8)
- ValidationMode
- Customizing error messages
- Multilingual support
- Custom validation keywords/formats

### Computed Properties
- watch, active, visible, readOnly, disabled
- derived (derived values)
- Path references (relative, absolute)
- Context references (@)

### Conditional Schemas
- oneOf, anyOf, allOf
- if-then-else
- Conditional required fields

### Advanced Features
- injectTo (value injection)
- File attachment management
- Array manipulation (push, remove, clear)
- prefixItems (tuples)

### JSONPointer
- Standard RFC 6901 syntax
- Extended syntax (.., ., *, @)
- Escape rules

### Plugin System
- Plugin registration
- Custom plugin writing
- ValidatorPlugin
- FormatError

### Troubleshooting
- Frequently asked questions
- Common problem resolution
- Performance optimization
- Debugging tips

## Knowledge Sources

For more detailed information, you can check the in-depth knowledge in the following related skills:

| Topic | Knowledge File |
|------|-----------|
| Comprehensive guide | `schema-form-expert` (directory skill) |
| Computed Properties | `knowledge/computed-properties.md` |
| Conditional schemas | `knowledge/conditional-schema.md` |
| FormTypeInput | `knowledge/formtype-input.md` |
| Validation system | `knowledge/validation.md` |
| InjectTo | `knowledge/inject-to.md` |
| Array manipulation | `knowledge/array-operations.md` |
| FormHandle | `knowledge/form-handle.md` |
| JSONPointer | `knowledge/jsonpointer.md` |
| Plugins | `knowledge/plugin-system.md` |
| Custom layouts | `knowledge/form-render.md` |
| Virtual Schema | `knowledge/virtual-schema.md` |
| State management | `knowledge/state-management.md` |
| Context | `knowledge/context-usage.md` |
| Performance optimization | `knowledge/performance-optimization.md` |
| Troubleshooting | `knowledge/troubleshooting.md` |
| Test guide | `knowledge/testing-guide.md` |

You can check the full API specification in the SPECIFICATION document.
