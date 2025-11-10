# Material Design 3 Tabs Component Guide

## Overview
The MD3 tabs system provides a flexible, accessible tabbed interface following Material Design 3 specifications. It supports both horizontal (top/bottom) and vertical (side navigation) orientations.

## Components

### `md-tabs`
Container component that manages tab selection and panel visibility.

**Properties:**
- `orientation`: `'horizontal' | 'vertical'` (default: `'horizontal'`)
  - `horizontal`: Tabs arranged in a row (for top/bottom placement)
  - `vertical`: Tabs arranged in a column (for side navigation)
- `placement`: `'top' | 'bottom' | 'start' | 'end'` (default: `'top'`)
  - For horizontal: `top` or `bottom`
  - For vertical: `start` (left) or `end` (right)
- `active`: `string` - Name of initially active panel

**Events:**
- `tab-change`: Emitted when active tab changes
  ```typescript
  event.detail = { panel: 'panel-name' }
  ```

**Slots:**
- `nav`: For `md-tab` elements
- `default`: For `md-tab-panel` elements

---

### `md-tab`
Individual tab button.

**Properties:**
- `panel`: `string` (required) - ID of panel this tab controls
- `active`: `boolean` - Whether tab is currently active (managed by parent)
- `disabled`: `boolean` - Whether tab is disabled

**Events:**
- `tab-selected`: Emitted when tab is clicked (internal, handled by md-tabs)

**Slots:**
- `icon`: Optional icon before label
- `default`: Tab label text

---

### `md-tab-panel`
Content container for tab panels.

**Properties:**
- `name`: `string` (required) - Panel identifier matching md-tab's `panel` property
- `active`: `boolean` - Whether panel is visible (managed by parent)

**Attributes:**
- `no-padding`: Remove default padding from panel content

**Slots:**
- `default`: Panel content

---

## Usage Examples

### Horizontal Tabs (Top Placement)
Typical content tabs at the top of a section:

```html
<md-tabs orientation="horizontal" placement="top">
  <md-tab slot="nav" panel="accounts">Accounts</md-tab>
  <md-tab slot="nav" panel="trending">Trending</md-tab>
  <md-tab slot="nav" panel="news">News</md-tab>
  <md-tab slot="nav" panel="hashtags">Hashtags</md-tab>

  <md-tab-panel name="accounts">
    <ul>
      <li>Account 1</li>
      <li>Account 2</li>
    </ul>
  </md-tab-panel>

  <md-tab-panel name="trending">
    <p>Trending content here</p>
  </md-tab-panel>

  <md-tab-panel name="news">
    <p>News content here</p>
  </md-tab-panel>

  <md-tab-panel name="hashtags">
    <p>Hashtag content here</p>
  </md-tab-panel>
</md-tabs>
```

### Horizontal Tabs (Bottom Placement)
Tabs at bottom, useful for mobile navigation:

```html
<md-tabs orientation="horizontal" placement="bottom">
  <md-tab slot="nav" panel="all">All</md-tab>
  <md-tab slot="nav" panel="mentions">Mentions</md-tab>
  <md-tab slot="nav" panel="follows">Follows</md-tab>

  <md-tab-panel name="all">
    <!-- All notifications -->
  </md-tab-panel>

  <md-tab-panel name="mentions">
    <!-- Mention notifications -->
  </md-tab-panel>

  <md-tab-panel name="follows">
    <!-- Follow notifications -->
  </md-tab-panel>
</md-tabs>
```

### Vertical Tabs (Side Navigation - Start)
Side navigation with tabs on the left:

```html
<md-tabs orientation="vertical" placement="start">
  <md-tab slot="nav" panel="home">
    <sl-icon slot="icon" name="house"></sl-icon>
    Home
  </md-tab>
  <md-tab slot="nav" panel="explore">
    <sl-icon slot="icon" name="search"></sl-icon>
    Explore
  </md-tab>
  <md-tab slot="nav" panel="notifications">
    <sl-icon slot="icon" name="bell"></sl-icon>
    Notifications
  </md-tab>

  <md-tab-panel name="home">
    <!-- Home content -->
  </md-tab-panel>

  <md-tab-panel name="explore">
    <!-- Explore content -->
  </md-tab-panel>

  <md-tab-panel name="notifications">
    <!-- Notifications content -->
  </md-tab-panel>
</md-tabs>
```

### Vertical Tabs (Side Navigation - End)
Side navigation with tabs on the right:

```html
<md-tabs orientation="vertical" placement="end">
  <md-tab slot="nav" panel="settings">Settings</md-tab>
  <md-tab slot="nav" panel="profile">Profile</md-tab>

  <md-tab-panel name="settings">
    <!-- Settings content -->
  </md-tab-panel>

  <md-tab-panel name="profile">
    <!-- Profile content -->
  </md-tab-panel>
</md-tabs>
```

### With Icons
Icons can be added to tabs using the `icon` slot:

```html
<md-tab slot="nav" panel="accounts">
  <sl-icon slot="icon" src="/assets/person-outline.svg"></sl-icon>
  Accounts
</md-tab>
```

### Programmatic Tab Control
Set active tab programmatically:

```typescript
// In component
@property() activeTab = 'trending';

// In template
html`
  <md-tabs .active=${this.activeTab} @tab-change=${this.handleTabChange}>
    <!-- tabs and panels -->
  </md-tabs>
`

// Handle tab changes
private handleTabChange(e: CustomEvent) {
  this.activeTab = e.detail.panel;
  console.log('Active tab:', this.activeTab);
}
```

### Disabled Tabs
Individual tabs can be disabled:

```html
<md-tab slot="nav" panel="admin" disabled>Admin</md-tab>
```

### No Padding Panels
Remove default padding for full-bleed content:

```html
<md-tab-panel name="media" no-padding>
  <img src="large-image.jpg" style="width: 100%;">
</md-tab-panel>
```

---

## Migration from Fluent Tabs

### Before (Fluent UI)
```typescript
// Imports
import { fluentTabs, fluentTab, fluentTabPanel, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentTabs());
provideFluentDesignSystem().register(fluentTab());
provideFluentDesignSystem().register(fluentTabPanel());

// Template
html`
  <fluent-tabs orientation="horizontal">
    <fluent-tab slot="nav" panel="all">All</fluent-tab>
    <fluent-tab slot="nav" panel="mentions">Mentions</fluent-tab>

    <fluent-tab-panel name="all">
      Content
    </fluent-tab-panel>

    <fluent-tab-panel name="mentions">
      Content
    </fluent-tab-panel>
  </fluent-tabs>
`
```

### After (MD3)
```typescript
// Imports
import './components/md-tabs';
import './components/md-tab';
import './components/md-tab-panel';

// Template - direct replacement
html`
  <md-tabs orientation="horizontal">
    <md-tab slot="nav" panel="all">All</md-tab>
    <md-tab slot="nav" panel="mentions">Mentions</md-tab>

    <md-tab-panel name="all">
      Content
    </md-tab-panel>

    <md-tab-panel name="mentions">
      Content
    </md-tab-panel>
  </md-tabs>
`
```

### Attribute Mapping
| Fluent Tabs | MD3 Tabs | Notes |
|-------------|----------|-------|
| `orientation="horizontal"` | `orientation="horizontal"` | Direct replacement |
| `orientation="vertical"` | `orientation="vertical"` | Direct replacement |
| `placement="top"` | `placement="top"` | Direct replacement |
| No equivalent | `placement="start"` | New: side nav on left |
| No equivalent | `placement="end"` | New: side nav on right |
| No equivalent | `active="panel-name"` | New: programmatic control |

---

## Styling & Customization

### CSS Custom Properties
The tabs inherit MD3 design tokens but can be customized:

```css
md-tabs {
  /* Override primary color */
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-surface-variant: #49454f;
  --md-sys-color-outline-variant: #cac4d0;
}

/* Vertical tabs width */
md-tabs[orientation="vertical"] {
  --md-tabs-nav-width: 240px; /* Custom width if needed */
}
```

### Dark Mode
Dark mode styling is automatic via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  md-tab {
    /* Automatically uses dark mode colors */
  }
}
```

### Custom Styles
Target components directly in your component styles:

```css
/* In component styles */
md-tabs {
  height: 100vh;
}

md-tab {
  font-size: 16px;
}

md-tab-panel {
  background: var(--custom-panel-bg);
}
```

---

## Accessibility

- **Keyboard Navigation**: Tabs are keyboard accessible (Tab, Enter, Space)
- **ARIA Attributes**: Proper `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-hidden`
- **Focus Management**: Visible focus ring on keyboard navigation
- **Screen Readers**: Proper labeling and state announcements

### Keyboard Shortcuts
- `Tab`: Move focus between tabs
- `Enter` or `Space`: Activate focused tab
- Focus visible ring shows current keyboard focus

---

## Best Practices

1. **Use Horizontal Tabs** for 3-5 related content sections at the top of content
2. **Use Vertical Tabs** for side navigation with 3-8 sections, especially on desktop
3. **Add Icons** to vertical tabs for better scannability
4. **Limit Tab Count**:
   - Horizontal: 3-5 tabs max (7 on desktop)
   - Vertical: 3-8 tabs max
5. **Keep Labels Short**: 1-2 words per tab label
6. **Provide Initial Active Tab**: Use `active` property to set default
7. **Handle Tab Changes**: Listen to `tab-change` event for analytics or side effects

---

## Performance Notes

- Panels use `display: none` when inactive (not rendered to DOM until shown)
- Animations use GPU-accelerated properties (transform, opacity)
- No JavaScript polling or watchers - event-driven architecture
- Lazy content rendering: Content only processes when panel becomes active

---

## Browser Support

- Modern browsers with Web Components support (Chrome, Edge, Firefox, Safari)
- Requires ES2020+ (top-level await in workers not related to tabs)
- Graceful degradation for non-supporting browsers

---

## Examples in Otter App

### Search Page (Horizontal)
```typescript
// src/pages/search-page.ts
import './components/md-tabs';
import './components/md-tab';
import './components/md-tab-panel';

html`
  <md-tabs orientation="horizontal" placement="top">
    <md-tab slot="nav" panel="accounts">Accounts</md-tab>
    <md-tab slot="nav" panel="trending">Trending</md-tab>
    <md-tab slot="nav" panel="news">News</md-tab>
    <md-tab slot="nav" panel="hashtags">Hashtags</md-tab>

    <!-- Panels with content -->
  </md-tabs>
`
```

### Notifications Component (Horizontal)
```typescript
// src/components/notifications.ts
html`
  <md-tabs orientation="horizontal">
    <md-tab slot="nav" panel="all">All</md-tab>
    <md-tab slot="nav" panel="mentions">Mentions</md-tab>
    <md-tab slot="nav" panel="follows">Follows</md-tab>

    <!-- Filtered notification panels -->
  </md-tabs>
`
```

---

## Common Issues & Solutions

### Tabs Not Showing
- Ensure `slot="nav"` on `md-tab` elements
- Check that `panel` and `name` properties match
- Import all three components

### Panel Not Switching
- Verify `panel` property on `md-tab` matches `name` on `md-tab-panel`
- Check browser console for errors
- Ensure only one `md-tabs` container per set

### Styling Not Applying
- Use CSS custom properties for theme colors
- Check specificity if overriding styles
- Ensure dark mode media query is present

### Layout Issues with Vertical Tabs
- Set explicit height on `md-tabs` container
- Use flexbox parent if needed
- Check `min-width` and `max-width` on vertical tab bar

---

## TypeScript Definitions

```typescript
// Event types
interface TabChangeEvent extends CustomEvent {
  detail: {
    panel: string;
  };
}

// Component types
interface MdTabs extends HTMLElement {
  orientation: 'horizontal' | 'vertical';
  placement: 'top' | 'bottom' | 'start' | 'end';
  active?: string;
}

interface MdTab extends HTMLElement {
  panel: string;
  active: boolean;
  disabled: boolean;
}

interface MdTabPanel extends HTMLElement {
  name: string;
  active: boolean;
}

// Usage in Lit components
html`
  <md-tabs
    orientation="horizontal"
    .active=${this.activePanel}
    @tab-change=${(e: TabChangeEvent) => this.handleChange(e)}
  >
    <!-- tabs -->
  </md-tabs>
`
```

---

## Future Enhancements

Potential improvements for future versions:
- [ ] Arrow key navigation between tabs
- [ ] Swipe gestures for mobile panel switching
- [ ] Scroll buttons for overflowing horizontal tabs
- [ ] Animated indicator sliding between tabs
- [ ] Badge support on tabs (notification counts)
- [ ] Secondary/supporting text on vertical tabs
- [ ] Nested tabs support
- [ ] Persist active tab to localStorage

---

## Resources

- [Material Design 3 Tabs Spec](https://m3.material.io/components/tabs/overview)
- [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/)
- Otter Project Copilot Instructions: `.github/copilot-instructions.md`
