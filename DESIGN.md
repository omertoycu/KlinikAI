---
name: Lumina Dental AI
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf1'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fa'
  on-surface: '#111c2c'
  on-surface-variant: '#434750'
  inverse-surface: '#263142'
  inverse-on-surface: '#ebf1ff'
  outline: '#747781'
  outline-variant: '#c4c6d2'
  surface-tint: '#3d5d9e'
  primary: '#0c3474'
  on-primary: '#ffffff'
  primary-container: '#2b4c8c'
  on-primary-container: '#a4bfff'
  inverse-primary: '#afc6ff'
  secondary: '#575f6b'
  on-secondary: '#ffffff'
  secondary-container: '#dbe3f1'
  on-secondary-container: '#5d6571'
  tertiary: '#4a3220'
  on-tertiary: '#ffffff'
  tertiary-container: '#634835'
  on-tertiary-container: '#ddb89f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001943'
  on-primary-fixed-variant: '#234584'
  secondary-fixed: '#dbe3f1'
  secondary-fixed-dim: '#bfc7d4'
  on-secondary-fixed: '#141c26'
  on-secondary-fixed-variant: '#3f4752'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#e4bfa6'
  on-tertiary-fixed: '#2b1707'
  on-tertiary-fixed-variant: '#5b412e'
  background: '#f9f9ff'
  on-background: '#111c2c'
  surface-variant: '#d8e3fa'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 120px
  container-padding: 24px
  grid-gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built on the principles of **Clinical Precision** and **Human Warmth**. It leverages a modern corporate aesthetic that bridges the gap between high-tech AI diagnostics and the comforting presence of a local family dentist. 

The visual direction uses a "Fresh & Airy" minimalism. By utilizing expansive whitespace and a soft, cool color palette, the UI evokes a sense of cleanliness and calm, essential for reducing patient anxiety. Subtle decorative elements—like low-opacity geometric patterns and soft organic blobs—add a layer of contemporary friendliness without distracting from the core medical information. The target audience is tech-savvy individuals seeking high-quality dental care that is both efficient and compassionate.

## Colors

The palette is anchored by **Deep Navy (Primary)** to establish authority and trust. It is supported by a **Soft Sky Blue (Secondary)** which serves as the primary background tint, creating a cohesive clinical environment that is easier on the eyes than pure white. 

**Peach (Tertiary)** is used sparingly as an accent color for organic background shapes to add a "human" flush of warmth. The neutral palette focuses on slate grays for text to maintain high readability without the harshness of pure black.

- **Primary:** Action items, headers, and brand marks.
- **Secondary:** Surface backgrounds and subtle section transitions.
- **Tertiary:** Decorative accents and soft-call-to-action highlights.
- **Surface:** Pure white (#FFFFFF) is reserved for cards and content containers to "pop" against the secondary background.

## Typography

The typography system uses a pairing of **Manrope** and **Inter**. 

Manrope provides a modern, geometric feel for headlines that remains approachable due to its slightly rounded terminals. It signals the "AI" and technology aspect of the brand. Inter is used for all body and UI elements, chosen for its exceptional legibility in medical contexts where clarity of information (like dosage or appointment times) is paramount. 

Headlines should use tight letter-spacing to appear confident, while body text uses a generous 1.6x line height to ensure a relaxed reading experience.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model for desktop, centered within a maximum width of 1280px. It follows a 12-column structure with generous 24px gutters.

The spacing philosophy is "Breathable." Section gaps are intentionally large (120px+) to ensure that AI-driven features and traditional dental services are distinct and not overwhelming. Content should be grouped using a hierarchical stack: 12px for related labels/inputs, 24px for paragraphs, and 48px for major component breaks.

## Elevation & Depth

To maintain the clean medical aesthetic, depth is created primarily through **Tonal Layers** and **Ambient Shadows**. 

1.  **Level 0 (Background):** Secondary Blue (#E8F0FE) tint.
2.  **Level 1 (Cards/Containers):** Pure White (#FFFFFF) with a very soft, highly diffused shadow (0px 10px 30px rgba(43, 76, 140, 0.05)). The shadow should have a slight blue tint to match the brand.
3.  **Level 2 (Interactive):** Elements like "Book Now" buttons use a slightly deeper shadow on hover to indicate tactility.

Avoid heavy borders; use light 1px strokes in a 10% opacity version of the primary color to define boundaries only when necessary.

## Shapes

The shape language is **Pill-shaped and Highly Rounded**. This "soft-touch" geometry is critical for removing the "sharpness" or "fear" often associated with dental tools.

- **Primary Buttons:** Fully pill-shaped (999px radius).
- **Cards & Image Containers:** Use the `rounded-xl` (3rem) setting to create a friendly, modern container feel.
- **Icons:** Should feature rounded caps and corners, avoiding any sharp 90-degree angles.

## Components

### Buttons
- **Primary:** Pill-shaped, Primary Blue background, White text. Large padding (16px top/bottom, 32px left/right).
- **Secondary:** Pill-shaped, transparent background with a 1px Primary Blue border or a soft light-blue fill.
- **AI-Action:** Use a subtle gradient or a "sparkle" icon prefix to denote AI-powered features (e.g., "Analyze my Smile").

### Cards
Cards should be white with `rounded-xl` corners. Use them to group "AI Features" or "Service Benefits." They must include a subtle ambient shadow to lift them off the sky-blue background.

### Input Fields
Inputs should be large and easy to tap, with a 1rem border-radius. Use a light gray border that turns Primary Blue on focus.

### Additional Components
- **Trust Badges:** Small chips with icons indicating certifications or "AI-Verified" status.
- **Comparison Sliders:** For "Before & After" dental results, featuring a clean vertical handle with rounded edges.
- **AI Diagnostic Indicator:** A pulse or glowing ring animation around specific focal points in dental photography to highlight technological integration.