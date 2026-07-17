# AGENTS.md

## Project Philosophy

This project must feel **designed, not generated**.

The frontend should look like it was created by a highly skilled product designer and an experienced frontend engineer who made deliberate decisions at every level.

Do not produce generic AI-generated UI.

Do not blindly follow common SaaS design patterns.

Do not optimize for "safe" or predictable design. Optimize for **strong visual identity, usability, and memorable execution**.

Every major visual decision should feel intentional.

---

## Design Standard

The final product must feel:

* Premium
* Distinctive
* Modern
* Visually confident
* Highly polished
* Intentional
* Human-designed

Avoid anything that resembles a generic AI-generated website, template, dashboard, or landing page.

### Strictly avoid

* Generic purple/blue AI gradients
* Random gradient blobs
* Excessive glassmorphism
* Overuse of rounded cards
* Repetitive card grids
* Generic SaaS dashboards
* Predictable hero sections
* Default Tailwind-looking interfaces
* Excessive pills and badges
* Random decorative elements
* Unnecessary glowing borders
* Overused neon aesthetics
* "AI startup" visual language
* Generic Inter + gradient combinations without a strong design system
* Components that look copied from a UI library demo
* Excessive use of the same border radius everywhere

If a design choice feels like the obvious AI-generated choice, reconsider it.

---

## Design Direction

Build a **cohesive visual system**, not a collection of individually attractive components.

Use design principles such as:

* Strong typography and hierarchy
* Intentional whitespace
* Editorial composition
* Asymmetrical layouts where appropriate
* Bento layouts when they improve information hierarchy
* Layered visual depth
* Immersive backgrounds
* Subtle texture
* Strong contrast
* Controlled motion
* Unexpected but usable compositions

The design should have a clear visual personality.

Do not force bento grids, glassmorphism, animations, or visual effects into the product simply because they are trendy.

**Design decisions must serve the product.**

---

## UX Principles

Prioritize the user's experience over visual novelty.

Before changing a major interface, understand:

* What the user is trying to accomplish
* What information matters most
* What actions are most important
* What should be visually prominent
* What can be hidden or simplified

Remove friction.

Reduce unnecessary clicks.

Improve information hierarchy.

Do not create visually impressive interfaces that are frustrating to use.

The interface should feel **obvious without feeling boring**.

---

## Existing Codebase

Before modifying the application:

1. Inspect the entire repository.
2. Understand the existing architecture.
3. Understand the data model.
4. Understand the major user flows.
5. Identify core functionality that must be preserved.
6. Identify existing technical constraints.

Do not make assumptions about the project without inspecting the code.

Do not immediately start rewriting random components.

---

## Implementation Standard

The code must look **hand-crafted by an experienced developer**.

Write code that is:

* Clear
* Intentional
* Maintainable
* Concise
* Easy to understand

### Remove

* Dead code
* Unused imports
* Unused variables
* Redundant abstractions
* Unnecessary wrapper components
* Duplicate logic
* Duplicate styles
* Placeholder code
* Half-finished implementations
* AI-style overengineering

### Naming

Use natural, descriptive names.

Avoid vague names such as:

* `Component1`
* `ModernCard`
* `EnhancedSection`
* `PremiumWrapper`
* `BeautifulContainer`
* `MainContentNew`

Do not use names that describe marketing language instead of the component's actual purpose.

---

## Comments

Do not add comments unless they are genuinely necessary.

The code should be self-explanatory through good structure and naming.

Remove unnecessary existing comments.

Do not write comments that simply explain obvious code.

Do not leave AI-generated explanatory comments throughout the codebase.

---

## Component Architecture

Do not create a component for every small `<div>`.

Do not over-abstract.

Do not create massive monolithic components either.

Create components when they represent:

* A meaningful UI concept
* A reusable interaction
* A distinct product section
* A complex piece of logic

Component boundaries should be intentional.

---

## Libraries

Use existing libraries and UI libraries intelligently.

Libraries such as:

* Vengeance UI
* Skipper UI
* Motion / Framer Motion
* Aceternity UI
* Magic UI

may be used where appropriate.

However:

**Never use a library component unchanged just because it looks impressive in its documentation.**

Customize, compose, and adapt components to fit the product's visual language.

Do not stack multiple UI libraries without a clear reason.

The final interface must not look like a collection of components copied from different libraries.

---

## Motion

Use motion with restraint and purpose.

Animations should:

* Communicate state
* Improve transitions
* Add depth
* Make interactions feel intentional

Avoid:

* Constant floating animations
* Random bouncing elements
* Excessive scroll animations
* Animation on every component
* Slow animations that make the app feel sluggish

Motion should feel **designed**, not added for decoration.

---

## Visual Consistency

Maintain a coherent design system across the application.

Be intentional about:

* Typography
* Font sizes
* Font weights
* Spacing
* Border treatment
* Shadows
* Surface hierarchy
* Color usage
* Interaction states

Do not make every page visually unrelated.

Do not use a different design language for every section.

---

## Redesign Expectations

When asked to redesign the application, do not perform a superficial visual refresh.

A redesign means reconsidering:

* Layout
* Information hierarchy
* Navigation
* Component composition
* Visual hierarchy
* Interaction patterns
* Responsive behavior

Do not simply change colors, border radius, and fonts.

If the existing layout is fundamentally weak, rebuild it.

---

## Responsive Design

The application must work properly across:

* Desktop
* Tablet
* Mobile

Do not treat mobile as an afterthought.

Do not simply stack every desktop element vertically.

Design responsive layouts intentionally.

---

## Quality Bar

Before considering a task complete, review the result as both:

### A designer

Ask:

* Does this feel generic?
* Does the design have a clear identity?
* Is the hierarchy obvious?
* Are the visual choices intentional?
* Does anything look AI-generated or template-based?

### A frontend engineer

Ask:

* Is the code clean?
* Is there dead code?
* Is there unnecessary complexity?
* Are there unused imports?
* Are components appropriately structured?
* Does the implementation preserve functionality?

### A real user

Ask:

* Is the interface easy to understand?
* Can I complete the main task quickly?
* Does anything feel confusing?
* Does the product feel polished?

If the result feels like a generic AI-generated redesign, **do not consider the task complete**.

---

## Final Rule

Do not stop at a plan.

Do not provide a superficial redesign.

Do not preserve weak UI simply because it already exists.

**Actually inspect, rethink, rebuild, and polish the product.**

The final result should feel like a real designer and an excellent frontend engineer worked on it together.
