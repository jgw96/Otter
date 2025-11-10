import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Material Design 3 Badge Component
 * A badge displays a descriptor for a UI element (e.g., count, status)
 */
@customElement('md-badge')
export class MdBadge extends LitElement {
  @property({ type: String }) variant: 'filled' | 'outlined' = 'filled';
  @property({ type: Boolean }) clickable = false;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: 8px;
      font-family: 'Roboto', system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0.1px;
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
      user-select: none;
    }

    .badge.filled {
      background-color: var(--md-sys-color-secondary-container, var(--sl-color-primary-100, #e8def8));
      color: var(--md-sys-color-on-secondary-container, var(--sl-color-primary-900, #1d192b));
    }

    .badge.outlined {
      background-color: transparent;
      color: var(--md-sys-color-on-surface, var(--sl-color-neutral-900, #1d1b20));
      border: 1px solid var(--md-sys-color-outline, var(--sl-color-primary-600, #79747e));
    }

    .badge.clickable {
      cursor: pointer;
    }

    .badge.clickable:hover {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3),
                  0 1px 3px 1px rgba(0, 0, 0, 0.15);
    }

    .badge.clickable.filled:hover {
      background-color: var(--md-sys-color-secondary-container-hover, var(--sl-color-primary-200, #ddd0f0));
    }

    .badge.clickable.outlined:hover {
      background-color: var(--md-sys-color-surface-variant, var(--sl-color-neutral-100, #e7e0ec));
    }

    .badge.clickable:active {
      transform: scale(0.98);
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .badge.filled {
        background-color: var(--md-sys-color-secondary-container, var(--sl-color-primary-800, #4a4458));
        color: var(--md-sys-color-on-secondary-container, var(--sl-color-primary-100, #e8def8));
      }

      .badge.outlined {
        color: var(--md-sys-color-on-surface, var(--sl-color-neutral-100, #e6e1e5));
        border-color: var(--md-sys-color-outline, var(--sl-color-primary-600, #938f99));
      }

      .badge.clickable.filled:hover {
        background-color: var(--md-sys-color-secondary-container-hover, var(--sl-color-primary-700, #544a5e));
      }

      .badge.clickable.outlined:hover {
        background-color: var(--md-sys-color-surface-variant, var(--sl-color-neutral-800, #49454f));
      }
    }
  `;

  render() {
    return html`
      <div
        class="badge ${this.variant} ${this.clickable ? 'clickable' : ''}"
        @click="${this._handleClick}"
      >
        <slot></slot>
      </div>
    `;
  }

  private _handleClick(e: Event) {
    if (this.clickable) {
      this.dispatchEvent(new CustomEvent('badge-click', {
        bubbles: true,
        composed: true,
        detail: { originalEvent: e }
      }));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-badge': MdBadge;
  }
}
