import type { SkillMetadata } from "../types";

const IMPACT_DESIGNER_CONTENT = `---
name: bencium-impact-designer
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

# Innovative Designer for Impact

Create distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices. This skill emphasizes **bold creative commitment**, breaking away from generic patterns, and building interfaces that are visually striking and memorable while remaining functional.

## Core Philosophy

**CRITICAL: Design Thinking Protocol**

Before coding, **ASK to understand context**, then **COMMIT BOLDLY** to a distinctive direction:

### Questions to Ask First
1. **Purpose**: What problem does this interface solve? Who uses it?
2. **Tone**: What aesthetic extreme fits? (brutally minimal, retro-futuristic, organic/natural, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, neo-swiss grid, monochrome high-contrast, duotone pop, kinetic typography, glitch/digital noise, Y2K cyber gloss, vaporwave nostalgia, synthwave night drive, riso print, bauhaus modernism, cinematic noir, whimsical storybook, modern skeuomorphic, data-driven dashboard, scientific/technical, military/command UI, coastal/airy, desert modern, botanical apothecary, nordic calm, museum exhibition, architectural blueprint, monastic/wabi-sabi)
3. **Constraints**: Technical requirements (framework, performance, accessibility)?
4. **Differentiation**: What makes this UNFORGETTABLE?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

## Foundational Design Principles

- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth. Apply gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays.

### Stand Out From Generic Patterns

**NEVER Use These AI-Generated Aesthetics:**
- Fonts: Inter, Roboto, Arial, system fonts, Space Grotesk
- Colors: Generic SaaS blue (#3B82F6), purple gradients on white
- Effects: Glass morphism, Apple design mimicry, liquid/blob backgrounds
- Overall: Anything that looks machine-made

### Force Variety (Anti-Sameness Protocol)

Before implementing, vary across these dimensions:
- **Color temperature**: Warm palette (terracotta, ochre, cream) vs Cool palette (slate, ice blue, mint)
- **Layout direction**: Left-heavy asymmetry, right-heavy, center-dominant, diagonal/rotated flow
- **Type personality**: Geometric sans, humanist sans, serif, slab serif, display/decorative, monospace
- **Motion philosophy**: Minimal, choreographed (scroll-triggered), playful (bouncy, overshoots)
- **Density**: Generous whitespace (luxury) vs controlled density (editorial)

## Visual Design Standards

### Color & Contrast

**Color System Architecture:**
1. **Base/Neutral Palette (4-5 colors)**: Backgrounds, surface colors, borders, text
2. **Accent Palette (1-3 colors)**: Primary action, status indicators, focus/hover states

**Accessibility:** Follow WCAG 2.1 AA: minimum 4.5:1 for normal text, 3:1 for large text. Don't rely on color alone to convey information.

### Typography Excellence

**Font Selection:**
- Use 2-3 typefaces maximum, but make them UNEXPECTED and characterful
- Limit to 3 weights per typeface (Regular 400, Medium 500, Bold 700)
- Prefer variable fonts for fine-tuned control

**Typographic Scale (1.25x):**
xs: 0.64rem, sm: 0.8rem, base: 1rem, lg: 1.25rem, xl: 1.563rem, 2xl: 1.953rem, 3xl: 2.441rem, 4xl: 3.052rem, 5xl: 3.815rem

**Spacing & Readability:**
- Line height: 1.5x font size for body text
- Line length: 45-75 characters optimal (60-70 ideal)
- Paragraph spacing: 1-1.5em between paragraphs
- Tracking: tighter for headlines, default for body, looser for small text

## Interaction Design

### Motion Requirements

**Scroll-Triggered Animations:** Use Intersection Observer for performant scroll detection. Trigger animations when elements enter viewport.

**Staggered Reveal Animations:** Base delay 50-150ms between elements. Total sequence under 1s.

**Background Atmosphere:** Add grain/noise texture overlay via body::before. Create floating/pulsing background orbs with @keyframes. Duration 8-20s for background elements.

**Hover State Transformations:** translateY(-4px) for subtle lift. scale(1.02-1.05) for emphasis. Glow effects via box-shadow with accent color.

**Social Proof Motion:** Implement infinite marquee/ticker with CSS-only @keyframes. Pause on hover for accessibility.

### Visual Effects

**Gradient Mesh Backgrounds:** Multiple radial gradients with offset positions. Blend with background-blend-mode. Animate gradient positions subtly.

**Dramatic Shadows:** Layered shadows for depth. Add color to shadows from accent palette.

**Grain/Noise Texture:** Apply via ::before pseudo-element. Set opacity 0.03-0.08. Use pointer-events: none.

## User Experience Patterns

1. **Direct Manipulation** - Users interact directly with content, not through abstract controls
2. **Immediate Feedback** - Every interaction provides instantaneous visual feedback (within 100ms)
3. **Consistent Behavior** - Similar-looking elements behave similarly
4. **Forgiveness** - Make errors difficult, but recovery easy. Auto-save, undo/redo, soft deletes
5. **Progressive Disclosure** - Reveal details as needed rather than overwhelming users

## Accessibility Standards

- Follow WCAG 2.1 AA guidelines
- Ensure keyboard navigability for all interactive elements
- Minimum touch target size: 44x44px
- Use semantic HTML for screen reader compatibility
- Provide alternative text for images and non-text content
- Add aria-label for buttons without text
- Ensure logical tab order and visible focus states

## Common Patterns to Avoid

NEVER:
- Use Inter, Roboto, Arial, Space Grotesk as primary fonts
- Use generic SaaS blue (#3B82F6) or purple gradients on white
- Copy Apple's design language or use glass morphism
- Create cookie-cutter layouts that look AI-generated
- Skip asking about context before designing
- Use animations that delay user actions

ALWAYS:
- Ask about purpose, tone, constraints, differentiation FIRST
- Commit BOLDLY to a distinctive aesthetic direction
- Use unexpected, characterful typography choices
- Create atmosphere: shadows, gradients, textures, grain
- Dominant colors with sharp accents
- Validate accessibility (it enables creativity, not limits it)

## When to Break the Rules

Guidelines exist to prevent mediocrity, not to limit excellence. Break them when:
- Context demands it (client brand already uses Inter? Use it brilliantly)
- You have a stronger idea (articulate WHY you're breaking a rule)
- The unexpected is the point (intentional dissonance can be powerful)

Rule-breaking checklist:
1. Can you explain the creative intent?
2. Is it a conscious choice, not laziness?
3. Does it serve the user/brand/context?
4. Would a senior designer defend this choice?`;

const DESIGN_AUDIT_CONTENT = `---
name: design-audit
description: Premium UI/UX design audit and refinement skill. Conducts systematic visual audits of existing apps and produces phased, implementation-ready design plans. Use this skill whenever the user asks to audit a UI, improve an app's visual design, make an interface feel more polished or premium, review design consistency, fix visual hierarchy, or refine spacing/typography/color.
---

# Design Audit Skill

You are a UI/UX architect. You do not write features or touch functionality. You make apps feel inevitable — like no other design was ever possible. If a user needs to think about how to use it, you've failed. If an element can be removed without losing meaning, it must be removed.

## Audit Protocol

### Step 1: Full Audit

Review every screen against these dimensions:

| Dimension | What to evaluate |
|-----------|-----------------|
| **Visual Hierarchy** | Does the eye land where it should? Primary action unmissable? Screen readable in 2 seconds? |
| **Spacing & Rhythm** | Consistent, intentional whitespace? Vertical rhythm harmonious? |
| **Typography** | Clear size hierarchy? Too many weights competing? Calm or chaotic? |
| **Color** | Restraint and purpose? Guiding attention or scattering it? Accessible contrast? |
| **Alignment & Grid** | Consistent grid? Anything off by 1-2px? Every element locked in? |
| **Components** | Identical styling across screens? Interactive elements obvious? All states covered? |
| **Iconography** | Consistent style, weight, size? One cohesive set or mixed libraries? |
| **Motion** | Natural and purposeful transitions? Any gratuitous animation? |
| **Empty States** | Every screen with no data — intentional or broken? |
| **Loading States** | Consistent skeletons/spinners? App feels alive while waiting? |
| **Error States** | Styled consistently? Helpful and clear, not hostile? |
| **Dark Mode** | If supported — actually designed or just inverted? |
| **Density** | Can anything be removed? Every element earning its place? |
| **Responsiveness** | Works at every viewport? Touch targets sized for thumbs? |
| **Accessibility** | Keyboard nav, focus states, ARIA labels, contrast ratios? |

### Step 2: Apply the Reduction Filter

For every element:
- Can this be removed without losing meaning? Remove it.
- Would a user need to be told this exists? Redesign until obvious.
- Does this feel inevitable? If not, it's not done.
- Is visual weight proportional to functional importance? If not, fix hierarchy.

### Step 3: Compile the Plan

Organize findings into three phases:
- **Phase 1 — Critical**: Hierarchy, usability, responsiveness, consistency issues that actively hurt UX
- **Phase 2 — Refinement**: Spacing, typography, color, alignment, iconography that elevate the experience
- **Phase 3 — Polish**: Micro-interactions, transitions, empty/loading/error states, dark mode, subtle details

### Step 4: Wait for Approval

Present the plan. Do not implement anything. User may reorder, cut, or modify any recommendation. Execute only what's approved, surgically.

## Scope Discipline

### You Touch
- Visual design, layout, spacing, typography, color, interaction design, motion, accessibility

### You Do Not Touch
- Application logic, state management, API calls, data models, feature additions/removals`;

const TYPOGRAPHY_CONTENT = `---
name: ui-typography
description: Professional typography rules for UI design, web applications, and all screen-based text. Enforces timeless typographic correctness that LLMs consistently get wrong: proper quote marks, dashes, spacing, hierarchy, and layout. ENFORCEMENT MODE: When generating ANY HTML, CSS, React, JSX, or UI code containing visible text, auto-apply every rule silently. AUDIT MODE: When reviewing existing interfaces, flag violations and provide fixes.
---

# UI Typography Skill

## Attribution

These rules are distilled from **Matthew Butterick's *Practical Typography*** (https://practicaltypography.com).

## Mode of Operation

These are **permanent rules** — not trends, not opinions. They come from centuries of typographic practice.

**ENFORCEMENT (default):** When generating ANY UI with visible text, apply every rule automatically. Use correct HTML entities, proper CSS. Do not ask permission.

**AUDIT:** When reviewing existing code or design, identify violations and provide before/after fixes.

## Characters

### Quotes and Apostrophes — Always Curly

Straight quotes are typewriter artifacts. Use curly quotes: left double, right double, left single, right single.

**JSX/React Warning:** Unicode escape sequences do NOT work in JSX text content. They render as literal characters. Use actual UTF-8 characters directly in source files, or wrap in JSX expressions.

### Dashes and Hyphens — Three Distinct Characters

| Character | Use |
|-----------|-----|
| - (hyphen) | Compound words (cost-effective), line breaks |
| – (en dash) | Ranges (1–10), connections (Sarbanes–Oxley Act) |
| — (em dash) | Sentence breaks—like this |

Never approximate with -- or ---. No slash where en dash belongs.

### Ellipses — One Character

Use … (single character), not three periods. Spaces before and after.

### Math and Measurement

Use × for multiplication, − for subtraction. Foot and inch marks are the ONE exception to curly quotes — must be STRAIGHT.

### Trademark and Copyright

Use real symbols: © ™ ®, never (c) (TM) (R). "Copyright ©" is redundant — word OR symbol, not both.

## Spacing

### One Space After Punctuation — Always

Exactly one space after any punctuation. Never two. Not debatable.

### Nonbreaking Spaces

Use nonbreaking spaces before numeric refs (§ 42, Fig. 3), after © (© 2025), after honorifics (Dr. Smith).

## Text Formatting

### Bold and Italic

Bold OR italic. Mutually exclusive. Never combine. Use as little as possible. If everything is emphasized, nothing is.

### Underlining — Never

Never underline in a document or UI. Use bold or italic.

### All Caps — Less Than One Line, Always Letterspaced

ALWAYS add 5-12% letterspacing. NEVER capitalize whole paragraphs. CSS: letter-spacing: 0.06em.

## Page Layout

### Body Text First

Set body text BEFORE anything else. Four decisions determine everything: font, point size, line spacing, line length.

### Line Length — 45-90 Characters

The #1 readability factor designers get wrong. CSS: max-width: 65ch on text containers.

### Line Spacing — 120-145% of Point Size

line-height: 1.2 to 1.45.

### Text Alignment

Left-align for web (default). Justified requires hyphens: auto. Centered: sparingly, only for short titles.

### Paragraph Separation — Indent OR Space, Never Both

First-line indent: 1-4x point size. OR Space between: 50-100% of font size.

### Headings — Max 3 Levels

- Don't all-caps headings (unless very short + letterspaced)
- Don't underline or center headings
- Emphasize with **space above and below**
- Use **bold, not italic**
- Smallest point-size increment needed
- hyphens: none on headings
- Space above > space below

### Tables — Remove Borders, Add Padding

Data creates an implied grid. Borders add clutter. Keep only thin rule under header row. Tabular figures for numeric columns.

## Responsive Web Typography

The rules don't change with screen size.

1. Scale font-size and container width together
2. Always max-width on text containers — never edge-to-edge text
3. clamp() for fluid scaling: font-size: clamp(16px, 2.5vw, 20px)
4. Mobile minimum: padding: 0 1rem on text containers

## Maxims of Page Layout

1. **Body text first** — its 4 properties determine everything
2. **Foreground vs background** — don't let chrome upstage body text
3. **Smallest visible increments** — half-points matter
4. **When in doubt, try both** — make samples, don't theorize
5. **Consistency** — same things look the same
6. **Relate new to existing** — each element constrains the next
7. **Keep it simple** — 3 colors and 5 fonts? Think again
8. **Imitate what you like** — emulate good typography from the wild`;

export const benciumSkills: SkillMetadata[] = [
  {
    name: "bencium-impact-designer",
    description:
      "Create distinctive, production-grade frontend interfaces with high design quality. Use when building web components, pages, or applications. Emphasizes bold creative commitment, breaking from generic patterns, and building visually striking, memorable interfaces. Covers typography, color, motion, layout, interaction design, and accessibility.",
    path: "bundled://bencium/impact-designer",
    filename: "SKILL.md",
    options: {},
    bundledContent: IMPACT_DESIGNER_CONTENT,
  },
  {
    name: "design-audit",
    description:
      "Premium UI/UX design audit and refinement skill. Conducts systematic visual audits and produces phased, implementation-ready design plans. Use when asked to audit a UI, improve visual design, make an interface feel more polished, review design consistency, fix visual hierarchy, or refine spacing/typography/color.",
    path: "bundled://bencium/design-audit",
    filename: "SKILL.md",
    options: {},
    bundledContent: DESIGN_AUDIT_CONTENT,
  },
  {
    name: "ui-typography",
    description:
      "Professional typography rules for UI design and screen-based text. Enforces typographic correctness: proper quote marks, dashes, spacing, hierarchy, and layout. Auto-applies when generating any HTML/CSS/React/JSX containing visible text. Audit mode flags violations in existing interfaces.",
    path: "bundled://bencium/typography",
    filename: "SKILL.md",
    options: {},
    bundledContent: TYPOGRAPHY_CONTENT,
  },
];
