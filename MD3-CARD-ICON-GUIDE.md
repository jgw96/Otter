# MD3 Card, Icon, and Icon Button Components Guide

## Overview
This guide covers the new Material Design 3 components for cards, icons, and icon buttons that replace Shoelace equivalents (`sl-card`, `sl-icon`, `sl-icon-button`).

## Components

### `<md-card>`
A container for content and actions following MD3 design principles.

#### Properties
- `variant`: `'filled'` | `'outlined'` | `'elevated'` (default: `'filled'`)
- `clickable`: `boolean` - Makes the card interactive
- `disabled`: `boolean` - Disables interaction

#### Slots
- Default slot: Card body content
- `image`: Media content at the top
- `header`: Header content
- `footer`: Footer content (typically for actions)

#### Parts
- `base`: The card's base container
- `header`: The header container
- `body`: The body container
- `footer`: The footer container

#### Events
- `card-click`: Dispatched when a clickable card is clicked

#### Basic Usage
```typescript
import '../components/md-card';

html`
  <md-card>
    <div slot="header">
      <h3>Card Title</h3>
    </div>

    <p>Card content goes here.</p>

    <div slot="footer">
      <md-button variant="text">Action</md-button>
    </div>
  </md-card>
`
```

#### With Image
```typescript
html`
  <md-card variant="elevated">
    <img slot="image" src="/path/to/image.jpg" alt="Description" />

    <h3>Title</h3>
    <p>Content</p>
  </md-card>
`
```

#### Clickable Card
```typescript
html`
  <md-card clickable @card-click=${this.handleCardClick}>
    <p>Click me!</p>
  </md-card>
`
```

---

### `<md-icon>`
Displays SVG icons from external files or inline SVG content.

#### Properties
- `src`: `string` - Path/URL to SVG file
- `label`: `string` - Accessibility label
- `size`: `string` - CSS length value (default: `'24px'`)

#### Slots
- Default slot: Inline SVG content (alternative to `src`)

#### Parts
- `base`: The icon's base container
- `svg`: The SVG element

#### Events
- `md-icon-load`: Dispatched when icon loads successfully
- `md-icon-error`: Dispatched when icon fails to load

#### Basic Usage
```typescript
import '../components/md-icon';

// From external file
html`<md-icon src="/assets/heart-outline.svg" label="Favorite"></md-icon>`

// With custom size
html`<md-icon src="/assets/menu.svg" size="32px"></md-icon>`

// Inline SVG
html`
  <md-icon label="Star">
    <svg viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  </md-icon>
`
```

---

### `<md-icon-button>`
A clickable icon button following MD3 principles.

#### Properties
- `src`: `string` - Path/URL to SVG icon file
- `label`: `string` - Accessibility label
- `variant`: `'standard'` | `'filled'` | `'outlined'` (default: `'standard'`)
- `disabled`: `boolean` - Disables the button

#### Slots
- Default slot: Custom icon content (alternative to `src`)

#### Parts
- `base`: The button's base container
- `icon`: The icon container

#### Events
- `click`: Standard click event

#### Basic Usage
```typescript
import '../components/md-icon-button';

// Standard icon button
html`
  <md-icon-button
    src="/assets/share-social-outline.svg"
    label="Share"
    @click=${this.handleShare}>
  </md-icon-button>
`

// Filled variant
html`
  <md-icon-button
    variant="filled"
    src="/assets/add-outline.svg"
    label="Add">
  </md-icon-button>
`

// Outlined variant
html`
  <md-icon-button
    variant="outlined"
    src="/assets/settings-outline.svg"
    label="Settings">
  </md-icon-button>
`

// Disabled
html`
  <md-icon-button
    src="/assets/trash-outline.svg"
    label="Delete"
    disabled>
  </md-icon-button>
`
```

---

## Migration from Shoelace

### `sl-card` → `md-card`

**Before:**
```typescript
import '@shoelace-style/shoelace/dist/components/card/card.js';

html`
  <sl-card>
    <div slot="header">Header</div>
    <div>Body</div>
    <div slot="footer">Footer</div>
  </sl-card>
`
```

**After:**
```typescript
import '../components/md-card';

html`
  <md-card>
    <div slot="header">Header</div>
    <div>Body</div>
    <div slot="footer">Footer</div>
  </md-card>
`
```

#### Key Differences
- Default variant is `filled` instead of Shoelace's default
- Use `variant="outlined"` for bordered cards
- Use `variant="elevated"` for cards with shadow
- Cards can be made `clickable` for interactive behavior
- Parts are renamed: `base`, `header`, `body`, `footer`

### `sl-icon` → `md-icon`

**Before:**
```typescript
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

html`<sl-icon src="/assets/heart.svg"></sl-icon>`
```

**After:**
```typescript
import '../components/md-icon';

html`<md-icon src="/assets/heart.svg"></md-icon>`
```

#### Key Differences
- Same API for `src` attribute
- Add `label` for accessibility
- Size controlled via `size` property (CSS length)
- Emits `md-icon-load` and `md-icon-error` events

### `sl-icon-button` → `md-icon-button`

**Before:**
```typescript
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

html`<sl-icon-button src="/assets/settings.svg"></sl-icon-button>`
```

**After:**
```typescript
import '../components/md-icon-button';

html`<md-icon-button src="/assets/settings.svg" label="Settings"></md-icon-button>`
```

#### Key Differences
- Variants: `standard`, `filled`, `outlined` (vs Shoelace's default style)
- Always include `label` for accessibility
- Standard click events work the same way
- Focus and keyboard navigation built-in (Enter/Space)

---

## Styling and Theming

All MD3 components support CSS custom properties for theming:

### Color Tokens
```css
--md-sys-color-surface-container
--md-sys-color-surface
--md-sys-color-on-surface
--md-sys-color-primary
--md-sys-color-on-primary
--md-sys-color-outline
--md-sys-color-outline-variant
--md-sys-color-on-surface-variant
```

### Fallbacks
Components fall back to Shoelace tokens when MD3 tokens aren't defined:
- `--sl-color-primary-600` for primary color
- Standard transparency values for overlays

### Custom Styling via Parts

```css
md-card::part(base) {
  border-radius: 16px;
}

md-card::part(header) {
  background: var(--custom-header-bg);
}

md-icon::part(svg) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
```

---

## Accessibility

All components are built with accessibility in mind:

- **md-card**: Uses `role="article"` by default, `role="button"` when clickable
- **md-icon**: Requires `label` attribute for screen readers
- **md-icon-button**: Proper ARIA labels, keyboard navigation (Enter/Space)
- All focusable elements have visible focus indicators
- Disabled states prevent interaction and update `aria-disabled`

---

## Best Practices

### Cards
1. Use `variant="elevated"` sparingly (only for primary content surfaces)
2. Keep header/footer content concise
3. Use `clickable` only when the entire card is an action target
4. Place interactive elements in footer slot

### Icons
1. Always provide meaningful `label` values
2. Use consistent icon size across similar contexts
3. Prefer external SVG files for better caching
4. Keep SVG files optimized (use SVGO or similar)

### Icon Buttons
1. Always include descriptive `label` for accessibility
2. Use `filled` variant for primary floating actions
3. Use `outlined` for secondary actions in toolbars
4. Group related icon buttons with consistent spacing

---

## Example: Timeline Item Migration

**Before (Shoelace):**
```typescript
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

html`
  <sl-card>
    <div slot="header">
      <sl-icon-button src="/assets/share.svg"></sl-icon-button>
    </div>

    <p>Post content</p>

    <div slot="footer">
      <sl-icon src="/assets/heart.svg"></sl-icon>
    </div>
  </sl-card>
`
```

**After (MD3):**
```typescript
import '../components/md-card';
import '../components/md-icon';
import '../components/md-icon-button';

html`
  <md-card variant="filled">
    <div slot="header">
      <md-icon-button
        src="/assets/share.svg"
        label="Share post"
        @click=${this.handleShare}>
      </md-icon-button>
    </div>

    <p>Post content</p>

    <div slot="footer">
      <md-icon src="/assets/heart.svg" label="Likes"></md-icon>
    </div>
  </md-card>
`
```

---

## Future Enhancements
- Add ripple effect to clickable cards
- Support for card actions overflow menu
- Icon library integration (Material Symbols)
- Badge integration on icon buttons
- Tooltip support for icon buttons
