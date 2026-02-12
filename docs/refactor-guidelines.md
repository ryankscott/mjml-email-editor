# Refactor Guidelines

This document captures the current architectural conventions used by the prototype editor.

## Feature-first structure

- `src/features/editor/*` contains editor domain logic and editor-specific UI decomposition.
- `src/features/templates/*`, `src/features/images/*`, and `src/features/brand/*` contain feature APIs/hooks.
- `src/shared/*` contains reusable layout and UI primitives.

## Domain boundaries

- Block-tree traversal and mutation logic lives in `src/features/editor/domain/blockTree.ts`.
- MJML conversion is split by responsibility:
  - `src/features/editor/domain/blockFactories.ts`
  - `src/features/editor/domain/dslToBlocks.ts`
  - `src/features/editor/domain/blocksToMjml.ts`
- `src/lib/editor.ts` is a compatibility export surface for the domain modules.

## State and data access

- Editor state uses split hooks:
  - `useEditorState()` for read access.
  - `useEditorActions()` for commands.
- Async feature data uses TanStack Query wrappers:
  - `useTemplatesQuery()` / template mutations
  - `useImagesQuery()` / image mutations
  - `useBrandsQuery()` / brand mutations

## UI decomposition

- Large components should be split into focused subcomponents under feature folders.
- Route pages should use shared shells (`src/shared/layout/*`) and shared async state UI (`src/shared/ui/*`) where possible.

## Feedback patterns

- Use toasts via `useToast()` from `src/shared/ui/ToastProvider.tsx` for transient action feedback (copy, save, import/export, etc.).
- Avoid one-off inline status text in headers/toolbars for ephemeral outcomes; reserve inline text for persistent page state.

## Testing expectations

- Add unit tests for pure domain logic first (tree operations, parsing, variable handling).
- Add smoke tests for route-level rendering and critical workflows.
- Run `npm run build` and `npm run test` after non-trivial refactors.
