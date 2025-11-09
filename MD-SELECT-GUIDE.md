# MD Select and Option Components

This document provides a guide for using the new Material Design 3 `md-select` and `md-option` components, which replace the Fluent UI `fluent-combobox` and `fluent-option` components.

## Components Created

### 1. `md-select` (`src/components/md-select.ts`)
A Material Design 3 dropdown selector component with filled and outlined variants.

### 2. `md-option` (`src/components/md-option.ts`)
An option element used within `md-select` to represent selectable items.

## Features

### md-select
- ✅ **Two variants**: `filled` (default) and `outlined`
- ✅ **Keyboard support**: ESC key to close dropdown
- ✅ **Accessible**: ARIA attributes for screen readers
- ✅ **Dark mode**: Automatic theme switching
- ✅ **Custom events**: `change`, `md-select-open`, `md-select-close`
- ✅ **Disabled state**: Full support
- ✅ **Material Design 3**: Follows MD3 color tokens, elevation, and motion

### md-option
- ✅ **Checkmark indicator**: Shows selected state
- ✅ **Ripple effect**: Press animation
- ✅ **Disabled state**: Can be disabled individually
- ✅ **Hover states**: MD3 color-mix overlays
- ✅ **Dark mode**: Automatic theme switching

## Basic Usage

### Import the Components
```typescript
import './components/md-select';
import './components/md-option';
```

### Simple Select
```typescript
html`
  <md-select
    placeholder="Choose an option"
    @change=${(e: any) => console.log('Selected:', e.detail.value)}
  >
    <md-option value="option1">Option 1</md-option>
    <md-option value="option2">Option 2</md-option>
    <md-option value="option3">Option 3</md-option>
  </md-select>
`
```

### With State Management
```typescript
@state() selectedValue = '';

render() {
  return html`
    <md-select
      .value=${this.selectedValue}
      placeholder="Select a value"
      @change=${(e: any) => this.handleChange(e.detail.value)}
    >
      <md-option value="home">Home</md-option>
      <md-option value="public">Public</md-option>
      <md-option value="local">Local</md-option>
    </md-select>
  `;
}

private handleChange(value: string) {
  this.selectedValue = value;
  console.log('New selection:', value);
}
```

### Outlined Variant
```typescript
html`
  <md-select variant="outlined" placeholder="Select server">
    <md-option value="mastodon.social">mastodon.social</md-option>
    <md-option value="fosstodon.org">fosstodon.org</md-option>
    <md-option value="mastodon.world">mastodon.world</md-option>
  </md-select>
`
```

### With Disabled Options
```typescript
html`
  <md-select placeholder="Choose a tier">
    <md-option value="free">Free Tier</md-option>
    <md-option value="pro">Pro Tier</md-option>
    <md-option value="enterprise" disabled>Enterprise (Coming Soon)</md-option>
  </md-select>
`
```

### Disabled Select
```typescript
html`
  <md-select disabled placeholder="Unavailable">
    <md-option value="1">Option 1</md-option>
  </md-select>
`
```

### Dynamic Options
```typescript
@state() instances = ['mastodon.social', 'fosstodon.org', 'mastodon.world'];

render() {
  return html`
    <md-select placeholder="Select instance">
      ${this.instances.map(instance => html`
        <md-option value="${instance}">${instance}</md-option>
      `)}
    </md-select>
  `;
}
```

## Migration from Fluent UI

### Before (fluent-combobox)
```typescript
import { fluentCombobox, fluentOption, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentCombobox());
provideFluentDesignSystem().register(fluentOption());

html`
  <fluent-combobox
    .value="${this.timelineType}"
    @change="${($event: any) => this.changeTimelineType($event.target.value)}"
    placeholder="home"
  >
    <fluent-option value="home">home</fluent-option>
    <fluent-option value="public">public</fluent-option>
  </fluent-combobox>
`
```

### After (md-select)
```typescript
import './components/md-select';
import './components/md-option';

html`
  <md-select
    .value="${this.timelineType}"
    @change="${($event: any) => this.changeTimelineType($event.detail.value)}"
    placeholder="home"
  >
    <md-option value="home">home</md-option>
    <md-option value="public">public</md-option>
  </md-select>
`
```

### Key Migration Changes
1. **Remove Fluent registration code** - No need for `provideFluentDesignSystem()`
2. **Change tag names** - `fluent-combobox` → `md-select`, `fluent-option` → `md-option`
3. **Update event handler** - Access value via `event.detail.value` instead of `event.target.value`
4. **Remove CSS part overrides** - No need for `::part(control)` or `::part(listbox)` styles

## Props & Events

### md-select Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | `''` | Currently selected value |
| `placeholder` | `string` | `''` | Placeholder text when nothing selected |
| `disabled` | `boolean` | `false` | Whether the select is disabled |
| `variant` | `'filled' \| 'outlined'` | `'filled'` | Visual style variant |

### md-select Events
| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: string, oldValue: string }` | Fired when selection changes |
| `md-select-open` | - | Fired when dropdown opens |
| `md-select-close` | - | Fired when dropdown closes |

### md-option Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | `''` | The value of this option |
| `disabled` | `boolean` | `false` | Whether this option is disabled |
| `selected` | `boolean` | `false` | Whether this option is selected (managed by parent) |

## Styling

### CSS Custom Properties
The components use Material Design 3 design tokens:

- `--md-sys-color-primary` - Primary accent color
- `--md-sys-color-surface-container` - Surface background
- `--md-sys-color-surface-container-highest` - Elevated surface
- `--md-sys-color-on-surface` - Text color on surfaces
- `--md-sys-color-on-surface-variant` - Secondary text color
- `--md-sys-color-outline` - Border/outline color

### Dark Mode
Both components automatically adapt to dark mode via `@media (prefers-color-scheme: dark)`.

## Accessibility

- **ARIA roles**: `combobox` for select, `listbox` for dropdown, `option` for options
- **Keyboard navigation**: ESC to close
- **Focus management**: Clear focus indicators
- **Screen reader support**: Proper labels and states

## Files Created

1. `/src/components/md-select.ts` - Main select component
2. `/src/components/md-option.ts` - Option component
3. `/types/components/md-select.d.ts` - TypeScript definitions for select
4. `/types/components/md-option.d.ts` - TypeScript definitions for option

## Next Steps for Migration

Search the codebase for `fluent-combobox` and `fluent-option` usage:
```bash
grep -r "fluent-combobox" src/
grep -r "fluent-option" src/
```

Current files using Fluent components:
- `src/components/timeline.ts`
- `src/pages/app-login.ts`

Replace them following the migration guide above, then remove Fluent UI imports and CSS overrides.
