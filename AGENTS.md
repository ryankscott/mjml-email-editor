# AGENTS.md

## Project Overview

This is a **prototype application** for an MJML email editor built with React, TypeScript, and Vite. The primary goal is to demonstrate functionality and user experience patterns before full production implementation.

## Key Principles

### Data Fetching Strategy

- **Current State**: All data fetching should be **mocked** for prototyping purposes
- **Future State**: Data sources will eventually be backed by REST APIs
- When implementing features requiring data:
  - Use mock data generators (e.g., `@faker-js/faker` is already available)
  - Structure mock responses to match expected API response shapes
  - Use TanStack Query for data fetching patterns, even with mocked data
  - Comment where real API endpoints will be integrated

### Development Workflow

**Always run the build command after making changes:**

```bash
npm run build
```

This ensures:
- TypeScript compilation succeeds
- No build-time errors are introduced
- The production bundle remains functional

Available scripts:
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (Vite + TypeScript)
- `npm run preview` - Preview production build
- `npm run test` - Run tests with Vitest

### Best Practices

#### Web Design & UX
- Follow modern web design principles (responsive, accessible, performant)
- Maintain consistent spacing, typography, and color schemes
- Ensure mobile-first responsive design
- Use semantic HTML elements
- Implement proper ARIA labels for accessibility
- Test across different viewport sizes

#### shadcn UI Usage (Required)
- Use shadcn-style components from `/src/components/ui/` as the default for UI controls and overlays
- Prefer imports from `@/components/ui/*` over raw HTML controls for app UI
- Avoid raw `<button>`, `<input>`, `<select>`, `<textarea>`, and custom modal/dialog implementations in feature code
- Allowed exceptions:
  - Hidden/native file inputs required for upload UX (`type="file"` with `className="hidden"`)
  - Native color inputs (`type="color"`) where browser picker behavior is required
- Use shared semantic button variants (neutral/accent/danger pill styles) to preserve the existing slate/cyan/rose look
- Use shared overlay primitives for interaction patterns:
  - `Dialog` for modal forms
  - `Popover` for anchored menus/tooling
  - `AlertDialog` for destructive confirmations
  - Sonner-style `Toaster` + `useToast` for notifications

#### React & TypeScript
- Use functional components with hooks
- Leverage TypeScript for type safety - avoid `any` types
- Follow React best practices (proper key usage, effect dependencies, etc.)
- Use proper component composition and separation of concerns
- Implement error boundaries where appropriate

#### Code Quality
- Write clean, readable, and maintainable code
- Use meaningful variable and function names
- Add comments for complex logic, not obvious code
- Follow the existing project structure and patterns
- Ensure proper error handling

#### Performance
- Optimize bundle size and load times
- Implement code splitting where beneficial
- Use React.memo, useMemo, useCallback appropriately (but don't over-optimize)
- Lazy load routes and heavy components

#### State Management
- Use React Query (TanStack Query) for server state
- Use local state (useState, useReducer) for UI state
- Leverage context providers for shared state (see existing providers)

## Project Structure

- `/src/components/editor/` - Main editor UI components
- `/src/lib/` - Business logic, utilities, and stores
- `/src/routes/` - TanStack Router route definitions
- `/src/types/` - TypeScript type definitions
- `/docs/` - Project documentation

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS 4
- **Email Rendering**: MJML Browser
- **Testing**: Vitest + React Testing Library

## When Making Changes

1. Understand the existing patterns before implementing new features
2. Ensure TypeScript types are properly defined
3. Test changes in the browser (`npm run dev`)
4. Run the build command to verify no issues (`npm run build`)
5. Consider the impact on bundle size and performance
6. Update relevant documentation if introducing new patterns

## Common Tasks

### Adding a New Feature
1. Create necessary components in appropriate directories
2. Add types in `/src/types/` if needed
3. Implement mock data if data fetching is required
4. Add route if it's a new page
5. Test thoroughly
6. Run build command

### Modifying Existing Features
1. Read the existing code to understand current implementation
2. Make minimal, focused changes
3. Preserve existing patterns and conventions
4. Test edge cases
5. Run build command

### Fixing Bugs
1. Reproduce the issue
2. Identify root cause
3. Implement fix with proper error handling
4. Add test coverage if appropriate
5. Run build command

## Notes for AI Agents

- Prefer reading files before making assumptions about implementation
- Use existing utilities and helpers rather than creating duplicates
- Follow the component structure already established
- When in doubt, maintain consistency with existing patterns
- Always verify your changes compile successfully
