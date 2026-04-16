import type { SkillMetadata } from "../types";

const REACT_BEST_PRACTICES_CONTENT = `---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
---

# Vercel React Best Practices

Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel. Contains 70 rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | async- |
| 2 | Bundle Size Optimization | CRITICAL | bundle- |
| 3 | Server-Side Performance | HIGH | server- |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | client- |
| 5 | Re-render Optimization | MEDIUM | rerender- |
| 6 | Rendering Performance | MEDIUM | rendering- |
| 7 | JavaScript Performance | LOW-MEDIUM | js- |
| 8 | Advanced Patterns | LOW | advanced- |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)

- async-cheap-condition-before-await - Check cheap sync conditions before awaiting flags or remote values
- async-defer-await - Move await into branches where actually used
- async-parallel - Use Promise.all() for independent operations
- async-dependencies - Use better-all for partial dependencies
- async-api-routes - Start promises early, await late in API routes
- async-suspense-boundaries - Use Suspense to stream content

### 2. Bundle Size Optimization (CRITICAL)

- bundle-barrel-imports - Import directly, avoid barrel files
- bundle-analyzable-paths - Prefer statically analyzable import and file-system paths to avoid broad bundles and traces
- bundle-dynamic-imports - Use next/dynamic for heavy components
- bundle-defer-third-party - Load analytics/logging after hydration
- bundle-conditional - Load modules only when feature is activated
- bundle-preload - Preload on hover/focus for perceived speed

### 3. Server-Side Performance (HIGH)

- server-auth-actions - Authenticate server actions like API routes
- server-cache-react - Use React.cache() for per-request deduplication
- server-cache-lru - Use LRU cache for cross-request caching
- server-dedup-props - Avoid duplicate serialization in RSC props
- server-hoist-static-io - Hoist static I/O (fonts, logos) to module level
- server-no-shared-module-state - Avoid module-level mutable request state in RSC/SSR
- server-serialization - Minimize data passed to client components
- server-parallel-fetching - Restructure components to parallelize fetches
- server-parallel-nested-fetching - Chain nested fetches per item in Promise.all
- server-after-nonblocking - Use after() for non-blocking operations

### 4. Client-Side Data Fetching (MEDIUM-HIGH)

- client-swr-dedup - Use SWR for automatic request deduplication
- client-event-listeners - Deduplicate global event listeners
- client-passive-event-listeners - Use passive listeners for scroll
- client-localstorage-schema - Version and minimize localStorage data

### 5. Re-render Optimization (MEDIUM)

- rerender-defer-reads - Don't subscribe to state only used in callbacks
- rerender-memo - Extract expensive work into memoized components
- rerender-memo-with-default-value - Hoist default non-primitive props
- rerender-dependencies - Use primitive dependencies in effects
- rerender-derived-state - Subscribe to derived booleans, not raw values
- rerender-derived-state-no-effect - Derive state during render, not effects
- rerender-functional-setstate - Use functional setState for stable callbacks
- rerender-lazy-state-init - Pass function to useState for expensive values
- rerender-simple-expression-in-memo - Avoid memo for simple primitives
- rerender-split-combined-hooks - Split hooks with independent dependencies
- rerender-move-effect-to-event - Put interaction logic in event handlers
- rerender-transitions - Use startTransition for non-urgent updates
- rerender-use-deferred-value - Defer expensive renders to keep input responsive
- rerender-use-ref-transient-values - Use refs for transient frequent values
- rerender-no-inline-components - Don't define components inside components

### 6. Rendering Performance (MEDIUM)

- rendering-animate-svg-wrapper - Animate div wrapper, not SVG element
- rendering-content-visibility - Use content-visibility for long lists
- rendering-hoist-jsx - Extract static JSX outside components
- rendering-svg-precision - Reduce SVG coordinate precision
- rendering-hydration-no-flicker - Use inline script for client-only data
- rendering-hydration-suppress-warning - Suppress expected mismatches
- rendering-activity - Use Activity component for show/hide
- rendering-conditional-render - Use ternary, not && for conditionals
- rendering-usetransition-loading - Prefer useTransition for loading state
- rendering-resource-hints - Use React DOM resource hints for preloading
- rendering-script-defer-async - Use defer or async on script tags

### 7. JavaScript Performance (LOW-MEDIUM)

- js-batch-dom-css - Group CSS changes via classes or cssText
- js-index-maps - Build Map for repeated lookups
- js-cache-property-access - Cache object properties in loops
- js-cache-function-results - Cache function results in module-level Map
- js-cache-storage - Cache localStorage/sessionStorage reads
- js-combine-iterations - Combine multiple filter/map into one loop
- js-length-check-first - Check array length before expensive comparison
- js-early-exit - Return early from functions
- js-hoist-regexp - Hoist RegExp creation outside loops
- js-min-max-loop - Use loop for min/max instead of sort
- js-set-map-lookups - Use Set/Map for O(1) lookups
- js-tosorted-immutable - Use toSorted() for immutability
- js-flatmap-filter - Use flatMap to map and filter in one pass
- js-request-idle-callback - Defer non-critical work to browser idle time

### 8. Advanced Patterns (LOW)

- advanced-effect-event-deps - Don't put useEffectEvent results in effect deps
- advanced-event-handler-refs - Store event handlers in refs
- advanced-init-once - Initialize app once per app load
- advanced-use-latest - useLatest for stable callback refs`;

const VIEW_TRANSITIONS_CONTENT = `---
name: vercel-react-view-transitions
description: Guide for implementing smooth, native-feeling animations using React's View Transition API. Use this skill whenever the user wants to add page transitions, animate route changes, create shared element animations, animate enter/exit of components, animate list reorder, implement directional navigation animations, or integrate view transitions in Next.js.
---

# React View Transitions

Animate between UI states using the browser's native document.startViewTransition. Declare *what* with <ViewTransition>, trigger *when* with startTransition / useDeferredValue / Suspense, control *how* with CSS classes. Unsupported browsers skip animations gracefully.

## When to Animate

Every <ViewTransition> should communicate a spatial relationship or continuity. If you can't articulate what it communicates, don't add it.

Implement **all** applicable patterns from this list, in this order:

| Priority | Pattern | What it communicates |
|----------|---------|---------------------|
| 1 | **Shared element** (name) | "Same thing — going deeper" |
| 2 | **Suspense reveal** | "Data loaded" |
| 3 | **List identity** (per-item key) | "Same items, new arrangement" |
| 4 | **State change** (enter/exit) | "Something appeared/disappeared" |
| 5 | **Route change** (layout-level) | "Going to a new place" |

## Availability

- **Next.js:** Do **not** install react@canary — the App Router already bundles React canary internally. ViewTransition works out of the box.
- **Without Next.js:** Install react@canary react-dom@canary.
- Browser support: Chromium 111+, Firefox 144+, Safari 18.2+. Graceful degradation on unsupported browsers.

## Core Concepts

### The <ViewTransition> Component

\`\`\`jsx
import { ViewTransition } from 'react';

<ViewTransition>
  <Component />
</ViewTransition>
\`\`\`

React auto-assigns a unique view-transition-name and calls document.startViewTransition behind the scenes. Never call startViewTransition yourself.

### Animation Triggers

| Trigger | When it fires |
|---------|--------------|
| **enter** | ViewTransition first inserted during a Transition |
| **exit** | ViewTransition first removed during a Transition |
| **update** | DOM mutations inside a ViewTransition |
| **share** | Named VT unmounts and another with same name mounts |

Only startTransition, useDeferredValue, or Suspense activate VTs. Regular setState does not animate.

### Critical Placement Rule

ViewTransition only activates enter/exit if it appears **before any DOM nodes**:

\`\`\`jsx
// Works
<ViewTransition enter="auto" exit="auto">
  <div>Content</div>
</ViewTransition>

// Broken — div wraps the VT, suppressing enter/exit
<div>
  <ViewTransition enter="auto" exit="auto">
    <div>Content</div>
  </ViewTransition>
</div>
\`\`\`

## Styling with View Transition Classes

Values: "auto" (browser cross-fade), "none" (disabled), "class-name" (custom CSS), or { [type]: value } for type-specific animations.

\`\`\`jsx
<ViewTransition default="none" enter="slide-in" exit="slide-out" share="morph" />
\`\`\`

### CSS Pseudo-Elements

- ::view-transition-old(.class) — outgoing snapshot
- ::view-transition-new(.class) — incoming snapshot
- ::view-transition-group(.class) — container
- ::view-transition-image-pair(.class) — old + new pair

## Transition Types

Tag transitions with addTransitionType so VTs can pick different animations based on context:

\`\`\`jsx
startTransition(() => {
  addTransitionType('nav-forward');
  router.push('/detail/1');
});
\`\`\`

Pass an object to map types to CSS classes:

\`\`\`jsx
<ViewTransition
  enter={{ 'nav-forward': 'slide-from-right', 'nav-back': 'slide-from-left', default: 'none' }}
  exit={{ 'nav-forward': 'slide-to-left', 'nav-back': 'slide-to-right', default: 'none' }}
  default="none"
>
  <Page />
</ViewTransition>
\`\`\`

### router.back() and Browser Back Button

router.back() and the browser's back/forward buttons do **not** trigger view transitions. Use router.push() with an explicit URL instead.

## Shared Element Transitions

Same name on two VTs — one unmounting, one mounting — creates a shared element morph:

\`\`\`jsx
<ViewTransition name="hero-image">
  <img src="/thumb.jpg" onClick={() => startTransition(() => onSelect())} />
</ViewTransition>

// On the other view — same name
<ViewTransition name="hero-image">
  <img src="/full.jpg" />
</ViewTransition>
\`\`\`

- Only one VT with a given name can be mounted at a time.
- share takes precedence over enter/exit.
- Never use a fade-out exit on pages with shared morphs — use a directional slide instead.

## Common Patterns

### Enter/Exit

\`\`\`jsx
{show && (
  <ViewTransition enter="fade-in" exit="fade-out"><Panel /></ViewTransition>
)}
\`\`\`

### List Reorder

\`\`\`jsx
{items.map(item => (
  <ViewTransition key={item.id}><ItemCard item={item} /></ViewTransition>
))}
\`\`\`

### Suspense Fallback to Content

\`\`\`jsx
<ViewTransition>
  <Suspense fallback={<Skeleton />}><Content /></Suspense>
</ViewTransition>
\`\`\`

## Use default="none" Liberally

Without it, every VT fires the browser cross-fade on **every** transition. Always use default="none" and explicitly enable only desired triggers.

## Accessibility

Always add reduced motion CSS to your global stylesheet:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0s !important;
  }
}
\`\`\``;

const COMPOSITION_PATTERNS_CONTENT = `---
name: vercel-composition-patterns
description: React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on tasks involving compound components, render props, context providers, or component architecture. Includes React 19 API changes.
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid boolean prop proliferation by using compound components, lifting state, and composing internals.

## When to Apply

Reference these guidelines when:
- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture
- Working with compound components or context providers

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Component Architecture | HIGH | architecture- |
| 2 | State Management | MEDIUM | state- |
| 3 | Implementation Patterns | MEDIUM | patterns- |
| 4 | React 19 APIs | MEDIUM | react19- |

## Quick Reference

### 1. Component Architecture (HIGH)

- architecture-avoid-boolean-props - Don't add boolean props to customize behavior; use composition
- architecture-compound-components - Structure complex components with shared context

### 2. State Management (MEDIUM)

- state-decouple-implementation - Provider is the only place that knows how state is managed
- state-context-interface - Define generic interface with state, actions, meta for dependency injection
- state-lift-state - Move state into provider components for sibling access

### 3. Implementation Patterns (MEDIUM)

- patterns-explicit-variants - Create explicit variant components instead of boolean modes
- patterns-children-over-render-props - Use children for composition instead of renderX props

### 4. React 19 APIs (MEDIUM)

> React 19+ only. Skip this section if using React 18 or earlier.

- react19-no-forwardref - ref is now a regular prop (no forwardRef needed); use use(Context) instead of useContext(Context)`;

export const vercelSkills: SkillMetadata[] = [
  {
    name: "vercel-react-best-practices",
    description:
      "React and Next.js performance optimization guidelines from Vercel Engineering. Use when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.",
    path: "bundled://vercel/react-best-practices",
    filename: "SKILL.md",
    options: {},
    bundledContent: REACT_BEST_PRACTICES_CONTENT,
  },
  {
    name: "vercel-react-view-transitions",
    description:
      "Guide for implementing smooth, native-feeling animations using React's View Transition API. Use this skill whenever the user wants to add page transitions, animate route changes, create shared element animations, animate enter/exit of components, animate list reorder, or implement directional navigation animations in Next.js.",
    path: "bundled://vercel/react-view-transitions",
    filename: "SKILL.md",
    options: {},
    bundledContent: VIEW_TRANSITIONS_CONTENT,
  },
  {
    name: "vercel-composition-patterns",
    description:
      "React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on compound components, render props, context providers, or component architecture.",
    path: "bundled://vercel/composition-patterns",
    filename: "SKILL.md",
    options: {},
    bundledContent: COMPOSITION_PATTERNS_CONTENT,
  },
];
