---
name: CyberProtect Design System
colors:
  surface: '#10131b'
  surface-dim: '#10131b'
  surface-bright: '#363942'
  surface-container-lowest: '#0b0e16'
  surface-container-low: '#181c23'
  surface-container: '#1c2028'
  surface-container-high: '#272a32'
  surface-container-highest: '#31353d'
  on-surface: '#e0e2ed'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#e0e2ed'
  inverse-on-surface: '#2d3039'
  outline: '#8b90a0'
  outline-variant: '#414755'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4b8eff'
  on-primary-container: '#00285c'
  inverse-primary: '#005bc1'
  secondary: '#b9c7e4'
  on-secondary: '#233148'
  secondary-container: '#3c4962'
  on-secondary-container: '#abb9d6'
  tertiary: '#b7c8e1'
  on-tertiary: '#213145'
  tertiary-container: '#8292aa'
  on-tertiary-container: '#1a2b3e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b9c7e4'
  on-secondary-fixed: '#0d1c32'
  on-secondary-fixed-variant: '#39475f'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#10131b'
  on-background: '#e0e2ed'
  surface-variant: '#31353d'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  container-max: 1200px
---

## Brand & Style

This design system is built for a high-trust, modern cybersecurity environment. It replaces the dated, high-contrast blocky aesthetic of the reference with a sophisticated **Corporate Modern** style infused with **Minimalist** precision.

The personality is authoritative yet accessible—positioning the chatbot as a reliable guardian rather than a rigid system. The emotional response should be one of "calm security," achieved through generous whitespace, technical color accents, and a refined typographical hierarchy. The interface utilizes subtle depth to organize complex security data without overwhelming the user.

Key characteristics include:
- **Security-First Clarity:** Information is prioritized over decoration.
- **Technical Precision:** Use of fine lines and systematic spacing.
- **Lightweight Interaction:** Fluid transitions and soft elevations to make "heavy" security topics feel manageable.

## Colors

The palette is rooted in a "Deep Space" dark mode to evoke the feeling of a secure terminal while maintaining modern accessibility standards.

- **Primary (Electric Blue):** Used for primary actions, active states, and highlighting critical system feedback. It provides the "energy" in the dark environment.
- **Secondary (Deep Navy):** The structural foundation. Used for the main chat background and persistent navigation elements.
- **Slate Gray (Neutral):** Used for secondary text, borders, and inactive icons to maintain a low-noise visual field.
- **Status Colors:** 
    - *Success:* Emerald green for "Secure" or "Resolved" states.
    - *Warning:* Amber for "Threat Detected" or "Action Needed."
    - *Error:* Crimson for "Critical Breach" or "Connection Lost."

## Typography

The system utilizes **Inter** for its exceptional legibility and neutral, professional character. To emphasize the "Cyber" aspect of the brand, **JetBrains Mono** is introduced sparingly for metadata, timestamps, and system logs to provide a technical, developer-friendly edge.

**Mobile Scaling:**
- On mobile devices, `headline-lg` should scale down to `24px` to prevent excessive line wrapping in chat headers.
- Body text remains at `16px` (body-md) to ensure high readability during long troubleshooting sessions.

## Layout & Spacing

This design system follows a **Fluid Grid** model with a mobile-first philosophy. The chatbot interface is treated as a centered container on desktop but expands to full-bleed on mobile devices.

- **Mobile (0-599px):** 16px margins, single column. The input field is pinned to the bottom of the viewport.
- **Tablet (600-1023px):** 24px margins, 12-column grid. The chat window occupies 8-10 columns.
- **Desktop (1024px+):** Fixed-width chat container (max 800px) centered in the viewport to maintain focus.

Spacing is based on a **4px baseline grid**. Internal component padding should strictly follow the `md` (16px) or `sm` (8px) increments to ensure visual harmony.

## Elevation & Depth

To achieve a lightweight, modern feel, this design system avoids heavy shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** Pure `#020617`.
- **Level 1 (Surface/Cards):** `#0F172A`. Used for the main chat area.
- **Level 2 (Active Elements/Popovers):** `#1E293B`. Used for tooltips or action menus.
- **Outlines:** Instead of shadows, use 1px borders in `Slate Gray` at 20% opacity to define boundaries. 
- **Active State Shadow:** Only the primary "Send" button and active text inputs use a subtle primary-colored outer glow (0px 0px 12px rgba(0, 122, 255, 0.3)) to indicate focus.

## Shapes

The shape language is **Rounded**, moving away from the sharp, dated corners of the reference image. This softens the technical nature of the app and makes the AI feel more approachable.

- **Default (0.5rem):** Used for standard buttons, input fields, and chat bubbles.
- **Large (1rem):** Used for main container surfaces and modal windows.
- **Pill (Full):** Used exclusively for status chips (e.g., "Active Scan") and notification badges.

## Components

### Buttons
- **Primary:** Solid Electric Blue background, white text. High-contrast for the "Send" action.
- **Ghost:** Transparent background with a Slate Gray border. Used for secondary actions like "Clear History."

### Chat Bubbles
- **Bot:** Surface-colored (`#0F172A`) with a subtle Slate Gray border. Text is left-aligned.
- **User:** Primary-colored (`#007AFF`) or a darker variant. Text is right-aligned to create a clear visual distinction.

### Input Fields
- The message input should be a floating bar with a blur effect (`backdrop-filter: blur(10px)`) to appear as if it sits above the scrolling content. It should use `rounded-xl` for a modern, pill-like feel.

### Status Chips
- Small, pill-shaped indicators located at the top of the chat to show "System Secure" or "Bot Typing..." states. They should use `label-mono` typography.

### Risk Cards
- When the bot identifies a threat, it should present information in a card with a subtle left-hand border accent in the respective status color (Success/Warning/Error).