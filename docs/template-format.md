# Template And Block Format

This document describes the JSON formats used by the email editor for templates and blocks.

## Template Schema

Templates are stored as JSON objects with the following fields:

- `schemaVersion` (number): Current template schema version. Today this is `2`.
- `id` (string): Unique template identifier.
- `name` (string): Display name.
- `description` (string, optional)
- `createdAt` (string): ISO timestamp.
- `updatedAt` (string): ISO timestamp.
- `preview` (object, optional)
  - `mjml` (string)
  - `html` (string)
- `blocks` (Block[]): Editor blocks (source of truth for editing).
- `mjmlJson` (MjmlJsonNode): Serialized MJML JSON representation of the template.

### Template Example

```json
{
  "schemaVersion": 2,
  "id": "b82f0db0-7e9b-4a8c-9a3c-7f3fce2ea2f7",
  "name": "Welcome Email",
  "description": "Onboarding email",
  "createdAt": "2026-02-11T12:34:56.789Z",
  "updatedAt": "2026-02-11T12:34:56.789Z",
  "preview": {
    "mjml": "<mjml>...</mjml>",
    "html": "<!doctype html>..."
  },
  "blocks": [],
  "mjmlJson": {
    "tagName": "mjml",
    "children": []
  }
}
```

## Block Schema

Blocks represent the editable building blocks on the canvas.

- `id` (string): Unique block identifier.
- `type` (string): One of `section`, `text`, `image`, `layout-2`, `layout-3`, `divider`, `html`.
- `data` (object): Fields specific to the block type.
- `dsl` (MjmlJsonNode, optional): Original MJML JSON used to generate the block.
- `meta` (object, optional):
  - `mjmlComponent` (string): MJML component name used for this block.

## MJML JSON DSL (Block DSL)

The block DSL is the MJML JSON shape used throughout the editor. It is represented by `MjmlJsonNode` in `src/lib/mjmlJson.ts` and is used in two places:

- `Block.dsl`: Captures the original MJML JSON when blocks are generated from a DSL payload.
- Import/export and template parsing: Used to derive blocks when only MJML JSON is present.

### `MjmlJsonNode` shape

- `tagName` (string): MJML tag name such as `mjml`, `mj-body`, `mj-section`, `mj-column`, `mj-text`, `mj-image`, `mj-divider`, `mj-raw`.
- `attributes` (object, optional): String attributes. Non-string values are coerced to strings during normalization.
- `children` (MjmlJsonNode[], optional): Child nodes.
- `content` (string, optional): Text content. For `mj-raw`, content is treated as raw HTML.

### Normalization and serialization

- `normalizeMjmlNode` drops invalid nodes, coerces attribute values to strings, and removes empty `attributes`/`children`.
- `serializeMjmlJson` escapes text content and attributes, except for `mj-raw` content which is emitted verbatim.

## DSL Expansion To Blocks

DSL expansion is implemented in `expandDsl` and `mjmlJsonToBlocks` in `src/lib/editor.ts`.

### Accepted roots

- `mjml`: Finds the first `mj-body` child, then processes its `mj-section` children.
- `mj-body`: Processes its `mj-section` children.
- `mj-section`: Processes a single section.

Any other root tag produces no blocks and a warning.

### Section conversion rules

1. Only `mj-column` children are considered. Non-column children are dropped with warnings.
2. If there are no columns, a `section` block is created with `background-color` and `padding`.
3. If there are 2 or 3 columns, a `layout-2` or `layout-3` block is created.
4. Inside layout columns, only `mj-text` and `mj-image` nodes are converted. Other tags are dropped with warnings.
5. If there is exactly one column, its children are expanded into leaf blocks. Supported child mappings are `mj-text` → `text`, `mj-image` → `image`, `mj-divider` → `divider`, and `mj-raw` → `html`.
6. If a one-column section has multiple children, section-level attributes are dropped and warnings are emitted.

All blocks created from a DSL payload retain the original DSL in `block.dsl`.

## Blocks To MJML JSON

Block rendering to MJML JSON is implemented by `blockToMjmlJson` and `buildMjmlJson` in `src/lib/editor.ts`.

### Root structure

`buildMjmlJson` always emits:

- `mjml`
- `mj-head` with a `mj-preview` node containing `"Email preview"`
- `mj-body` with `background-color: #f8fafc`

If there are no blocks, a placeholder section with `"Drop blocks to start building"` is emitted.

### Per-block rendering

- `section`: Emits a placeholder `mj-section` with a single column and a `mj-text` node containing `"Section"`.
- `layout-2` / `layout-3`: Emits a `mj-section` with 2 or 3 columns. Empty columns get a placeholder `mj-text` node (`"Drop blocks"`).
- `text`: Emits a `mj-section` with a single column and an `mj-text`. Text styling uses `resolveTextStyle` and does not emit editor-only metadata attributes.
- `image`: Emits a `mj-section` with a single column and an `mj-image`. The `data-asset-id` attribute is preserved when set.
- `divider`: Emits a `mj-section` with a single column and an `mj-divider`.
- `html`: Emits a `mj-section` with a single column and an `mj-raw` node. This content is not escaped.

## MJML And HTML Output

### MJML

- `buildMjml` serializes the MJML JSON via `serializeMjmlJson`.
- Output is a string ready for MJML compilation.

### HTML

- `compileMjml` (in `src/lib/mjml.ts`) uses `mjml-browser` with `validationLevel: "soft"`.
- `compileBlocks` is a convenience wrapper that calls `buildMjml` then compiles to HTML.

## Templates: From Blocks To Stored JSON

Template creation and parsing live in `src/lib/templates.ts`.

### Creating templates

`createTemplateFromBlocks`:

1. Generates a preview using `buildTemplatePreview`, which builds MJML and compiles HTML.
2. Generates `mjmlJson` using `buildMjmlJson`.
3. Stores `blocks` as the editable source of truth alongside `mjmlJson`.

### Parsing templates

`parseTemplateJson`:

1. Validates required fields and schema version.
2. If `blocks` are present, they are sanitized and used directly.
3. If `blocks` are missing and `mjmlJson` is present (schema v2), blocks are derived via `mjmlJsonToBlocks`.
4. `mjmlJson` is normalized if present or generated from blocks if missing.

### MJML Component Mapping

| Block type | `meta.mjmlComponent` | Notes |
| --- | --- | --- |
| `section` | `mj-section` | Always emits a single column placeholder. |
| `text` | `mj-text` | Compiled inside a section + column. |
| `image` | `mj-image` | Compiled inside a section + column. |
| `layout-2` | `mj-section` | Emits two `mj-column` children. |
| `layout-3` | `mj-section` | Emits three `mj-column` children. |
| `divider` | `mj-divider` | Compiled inside a section + column. |
| `html` | `mj-raw` | Compiled inside a section + column. |

### Block Examples

#### Text Block
```json
{
  "id": "7f6cbd07-5cf8-45dd-8d1f-4a6f0f1d6a19",
  "type": "text",
  "data": {
    "content": "Hello {{ first_name }}",
    "color": "#111827",
    "fontSize": "16px",
    "align": "left",
    "textStyle": "paragraph",
    "colorToken": "primary",
    "fontFamily": "Inter",
    "fontWeight": "600",
    "lineHeight": "24px"
  },
  "meta": {
    "mjmlComponent": "mj-text"
  }
}
```

#### Layout Block (2 columns)
```json
{
  "id": "0a7f09a1-5e2d-4f47-b5e6-11c6ae8d7e40",
  "type": "layout-2",
  "data": {
    "columns": 2,
    "backgroundColor": "#ffffff",
    "padding": "16px",
    "columnBlocks": [
      [
        {
          "id": "b6f64c36-2a2b-4c4c-8c12-2b0a9ea4b2cf",
          "type": "text",
          "data": {
            "content": "Left column",
            "color": "#111827",
            "fontSize": "16px",
            "align": "left"
          },
          "meta": {
            "mjmlComponent": "mj-text"
          }
        }
      ],
      [
        {
          "id": "c3a9fa83-4b17-4b1b-8ec7-48d6f8a7a3b1",
          "type": "image",
          "data": {
            "src": "https://placehold.co/600x400",
            "alt": "Product",
            "width": "300px"
          },
          "meta": {
            "mjmlComponent": "mj-image"
          }
        }
      ]
    ]
  },
  "meta": {
    "mjmlComponent": "mj-section"
  }
}
```

#### Divider Block
```json
{
  "id": "2d0d1dd9-0a37-4f8b-9090-7a4b1a07c3ab",
  "type": "divider",
  "data": {
    "borderColor": "#e2e8f0",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "padding": "10px 0"
  },
  "meta": {
    "mjmlComponent": "mj-divider"
  }
}
```
