import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Material Design 3 Menu Item Component
 * A menu item represents an option within a menu
 */
@customElement('md-menu-item')
export class MdMenuItem extends LitElement {
  @property({ type: Boolean }) disabled = false;

  static styles = css`
    :host {
      display: block;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 48px;
      padding: 0 12px;
      cursor: pointer;
      user-select: none;
      font-family: 'Roboto', system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: var(--md-sys-color-on-surface, #1d1b20);
      transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
      position: relative;
      overflow: hidden;
    }

    .menu-item:hover:not(.disabled) {
      background-color: var(--md-sys-color-on-surface, #1d1b20);
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 8%, transparent);
    }

    .menu-item:active:not(.disabled) {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 12%, transparent);
    }

    .menu-item.disabled {
      opacity: 0.38;
      cursor: not-allowed;
    }

    .prefix {
      display: flex;
      align-items: center;
    }

    .content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    ::slotted([slot="prefix"]) {
      width: 24px;
      height: 24px;
    }

    /* Ripple effect */
    .menu-item::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background-color: currentColor;
      opacity: 0;
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s, opacity 0.3s;
    }

    .menu-item:active:not(.disabled)::before {
      width: 100%;
      height: 100%;
      opacity: 0.1;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .menu-item {
        color: var(--md-sys-color-on-surface, #e6e1e5);
      }

      .menu-item:hover:not(.disabled) {
        background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #e6e1e5) 8%, transparent);
      }

      .menu-item:active:not(.disabled) {
        background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #e6e1e5) 12%, transparent);
      }
    }

    /* Light mode override */
    @media (prefers-color-scheme: light) {
      .menu-item {
        color: var(--md-sys-color-on-surface-light, #1d1b20);
      }

      .menu-item:hover:not(.disabled) {
        background-color: color-mix(in srgb, var(--md-sys-color-on-surface-light, #1d1b20) 8%, transparent);
      }

      .menu-item:active:not(.disabled) {
        background-color: color-mix(in srgb, var(--md-sys-color-on-surface-light, #1d1b20) 12%, transparent);
      }
    }
  `;

  render() {
    return html`
      <div
        class="menu-item ${this.disabled ? 'disabled' : ''}"
        role="menuitem"
        tabindex="${this.disabled ? '-1' : '0'}"
        @click="${this._handleClick}"
        @keydown="${this._handleKeydown}"
      >
        <div class="prefix">
          <slot name="prefix"></slot>
        </div>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  private _handleClick(e: Event) {
    if (!this.disabled) {
      this.dispatchEvent(new CustomEvent('menu-item-click', {
        bubbles: true,
        composed: true,
        detail: { originalEvent: e }
      }));
    }
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (!this.disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this._handleClick(e);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-menu-item': MdMenuItem;
  }
}
