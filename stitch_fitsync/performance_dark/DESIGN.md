---
name: Performance Dark
colors:
  surface: '#121412'
  surface-dim: '#121412'
  surface-bright: '#383938'
  surface-container-lowest: '#0d0f0d'
  surface-container-low: '#1b1c1a'
  surface-container: '#1f201e'
  surface-container-high: '#292a29'
  surface-container-highest: '#343533'
  on-surface: '#e3e2df'
  on-surface-variant: '#c4c6d2'
  inverse-surface: '#e3e2df'
  inverse-on-surface: '#2f312f'
  outline: '#8e909b'
  outline-variant: '#444650'
  surface-tint: '#b1c5ff'
  primary: '#b1c5ff'
  on-primary: '#082d6d'
  primary-container: '#0a2e6e'
  on-primary-container: '#7d98de'
  inverse-primary: '#415c9e'
  secondary: '#7ad0ff'
  on-secondary: '#003549'
  secondary-container: '#00a1d8'
  on-secondary-container: '#003247'
  tertiary: '#68dbae'
  on-tertiary: '#003827'
  tertiary-container: '#003a28'
  on-tertiary-container: '#34ad83'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001947'
  on-primary-fixed-variant: '#274484'
  secondary-fixed: '#c3e8ff'
  secondary-fixed-dim: '#7ad0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#86f8c9'
  tertiary-fixed-dim: '#68dbae'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#00513a'
  background: '#121412'
  on-background: '#e3e2df'
  surface-variant: '#343533'
typography:
  headline-xl:
    fontFamily: Lexend
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1200px
---

## Brand & Style

This design system is engineered for peak performance and athletic discipline. It utilizes a **Corporate Modern** foundation infused with high-performance technical aesthetics to evoke a sense of precision, data-driven progress, and elite coaching. 

The visual language is "Dark-First," prioritizing legibility in low-light environments (like a gym or early morning run) while maintaining a premium, high-contrast feel. The style leans into **Minimalism** with a focus on data visualization, using sharp accents to guide the user's eye toward critical performance metrics and achievements. The emotional response is one of focus, reliability, and momentum.

## Colors

The color palette is anchored by "Obsidian" depths and "Electric" accents:
- **Primary (Navy):** Used for structural authority, primary actions, and deep-state headers.
- **Accent (Cyan):** Reserved for interactivity, active navigation, and momentum-based elements like steppers and icons.
- **Success (Emerald):** Strictly quarantined for Personal Bests (PBs) and completion states to provide a high-value psychological reward.
- **Background & Surface:** A tiered dark-mode strategy using near-black for the canvas and a slightly elevated dark navy for cards and containers to create depth without relying on heavy shadows.
- **Text:** A warm white is used to reduce eye strain against the dark background while maintaining maximum contrast for accessibility.

## Typography

This design system utilizes **Lexend** exclusively. Chosen for its origins in improving reading proficiency, its geometric clarity mirrors the precision of athletic performance.

- **Headlines:** Set in Bold (700) or Semi-Bold (600) with slight negative letter-spacing for a tight, impactful appearance in data dashboards.
- **Body:** Set in Regular (400) for maximum readability.
- **Labels:** Set in Semi-Bold with uppercase transform and increased tracking for metadata, ensuring technical info is glanceable.

## Layout & Spacing

The layout follows a **8px linear scale** for consistent rhythm.
- **Grid:** A 12-column fluid grid for desktop and a 4-column fluid grid for mobile.
- **Margins:** 16px on mobile devices, scaling to 32px or centered containers on desktop.
- **Philosophy:** Layouts should prioritize "Information Density." Use tighter spacing (8px-16px) for related data points and larger breathing room (32px+) between distinct functional sections.

## Elevation & Depth

In this dark-mode environment, depth is achieved through **Tonal Layering** rather than traditional shadows.
- **Level 0 (Base):** #0D0D0F - The primary background color.
- **Level 1 (Surface):** #16181D - Used for cards and secondary containers.
- **Level 2 (Active/Floating):** #1C1F26 - Used for modals or hovered states.

**Subtle Outlines:** To define boundaries without clutter, use 1px solid borders at 10% opacity of the Accent color for interactive elements. Avoid heavy blurs; maintain a crisp, digital-first aesthetic.

## Shapes

The shape language balances approachability with technical structure.
- **Standard Radius:** 0.5rem (8px) for cards, buttons, and input fields.
- **Large Radius:** 1rem (16px) for bottom sheets and prominent containers.
- **Pill:** Reserved specifically for status chips and specific navigation toggles.

## Components

- **Primary Buttons:** Background #0A2E6E with #F4F3F0 text. Bold weight, 0.5rem roundedness.
- **Secondary Buttons:** Transparent background with a 1px solid #29B0E8 border.
- **Cards:** Background #16181D. For history/log items, include a 4px solid left-border using the Accent color (#29B0E8) to denote the timeline.
- **Progress Bars:** Utilize a linear gradient from #0A2E6E (Left/Start) to #29B0E8 (Right/End). The container background should be #0D0D0F with a subtle inner shadow for a "recessed" look.
- **Input Fields:** Dark background (#0D0D0F) with a subtle #16181D border that turns Cyan (#29B0E8) on focus.
- **Success States:** Any element reaching 100% or achieving a PB should transition its accent or border color to #1D9E75.
- **Chips/Badges:** Small, uppercase labels with a low-opacity background of the accent color for categorizing workouts or muscle groups.