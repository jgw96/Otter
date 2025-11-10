import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Material Design 3 Menu Component
 * A menu displays a list of choices on a temporary surface
 */
@customElement('md-menu')
export class MdMenu extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .menu {
      display: flex;
      flex-direction: column;
      min-width: 112px;
      max-width: 280px;
      padding: 8px 0;
      background-color: var(--md-sys-color-surface-container, #f3edf7);
      color: var(--md-sys-color-on-surface, #1d1b20);
      border-radius: 4px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3),
                  0 2px 6px 2px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      font-family: 'Roboto', system-ui, -apple-system, sans-serif;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .menu {
        background-color: var(--md-sys-color-surface-container, #2b2930);
        color: var(--md-sys-color-on-surface, #e6e1e5);
      }
    }

    /* Light mode override */
    @media (prefers-color-scheme: light) {
      .menu {
        background-color: var(--md-sys-color-surface-container-light, #f3edf7);
        color: var(--md-sys-color-on-surface-light, #1d1b20);
      }
    }
  `;

  render() {
    return html`
      <div class="menu" role="menu">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-menu': MdMenu;
  }
}
