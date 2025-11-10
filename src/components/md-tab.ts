import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * MD3 Tab Button
 *
 * Individual tab button within md-tabs container.
 * Follows Material Design 3 primary tabs specification.
 *
 * @fires tab-selected - Emitted when tab is clicked { detail: { panel: string } }
 *
 * @slot default - Tab label content
 * @slot icon - Optional icon before label
 *
 * @example
 * ```html
 * <md-tab slot="nav" panel="accounts">
 *   <md-icon slot="icon" name="person"></md-icon>
 *   Accounts
 * </md-tab>
 * ```
 */
@customElement('md-tab')
export class MdTab extends LitElement {
  /**
   * Panel ID this tab controls
   */
  @property({ type: String }) panel = '';

  /**
   * Whether tab is currently active
   */
  @property({ type: Boolean, reflect: true }) active = false;

  /**
   * Whether tab is disabled
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
      outline: none;
    }

    button {
      all: unset;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      min-height: 48px;
      cursor: pointer;
      position: relative;
      flex: 1;
      box-sizing: border-box;

      /* Typography - Label Large */
      font-family: Roboto, system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0.1px;

      color: var(--md-sys-color-on-surface-variant, var(--sl-color-neutral-600));
      background: transparent;
      transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
      white-space: nowrap;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    /* Vertical orientation (side nav) - align left with more padding */
    :host-context(md-tabs[orientation="vertical"]) button {
      justify-content: flex-start;
      padding: 16px 24px;
      width: 100%;
    }

    /* Icon slot */
    ::slotted([slot="icon"]) {
      width: 24px;
      height: 24px;
      font-size: 24px;
    }

    /* Active state */
    :host([active]) button {
      color: var(--md-sys-color-primary, var(--sl-color-primary-600));
    }

    /* Disabled state */
    :host([disabled]) button {
      color: var(--md-sys-color-on-surface, var(--sl-color-neutral-400));
      opacity: 0.38;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Hover overlay */
    button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
      pointer-events: none;
    }

    button:hover::before {
      opacity: 0.08;
    }

    button:active::before {
      opacity: 0.12;
    }

    /* Focus visible ring */
    :host(:focus-visible) button::after {
      content: '';
      position: absolute;
      inset: -2px;
      border: 2px solid var(--md-sys-color-primary, var(--sl-color-primary-600));
      border-radius: 4px;
      pointer-events: none;
    }

    /* Active indicator (bottom border for horizontal, left border for vertical) */
    .indicator {
      position: absolute;
      background: var(--md-sys-color-primary, var(--sl-color-primary-600));
      transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
      opacity: 0;
    }

    /* Horizontal indicator (bottom) */
    :host-context(md-tabs[orientation="horizontal"]) .indicator {
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 3px 3px 0 0;
    }

    /* Horizontal bottom placement indicator (top) */
    :host-context(md-tabs[orientation="horizontal"][placement="bottom"]) .indicator {
      bottom: auto;
      top: 0;
      border-radius: 0 0 3px 3px;
    }

    /* Vertical indicator (left or right) */
    :host-context(md-tabs[orientation="vertical"]) .indicator {
      top: 0;
      bottom: 0;
      left: 0;
      width: 3px;
      border-radius: 0 3px 3px 0;
    }

    :host-context(md-tabs[orientation="vertical"][placement="end"]) .indicator {
      left: auto;
      right: 0;
      border-radius: 3px 0 0 3px;
    }

    :host([active]) .indicator {
      opacity: 1;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      button {
        color: var(--md-sys-color-on-surface-variant, var(--sl-color-neutral-400));
      }

      :host([active]) button {
        color: var(--md-sys-color-primary, var(--sl-color-primary-600));
      }

      :host([disabled]) button {
        color: var(--md-sys-color-on-surface, var(--sl-color-neutral-600));
      }
    }

    /* Ripple effect on click */
    @keyframes ripple {
      from {
        transform: scale(0);
        opacity: 0.4;
      }
      to {
        transform: scale(1);
        opacity: 0;
      }
    }

    .ripple {
      position: absolute;
      border-radius: 50%;
      background: currentColor;
      pointer-events: none;
      animation: ripple 0.6s cubic-bezier(0.2, 0, 0, 1);
    }
  `;

  private _handleClick(e: MouseEvent) {
    if (this.disabled) return;

    // Create ripple effect
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // Emit tab selected event
    this.dispatchEvent(new CustomEvent('tab-selected', {
      detail: { panel: this.panel },
      bubbles: true,
      composed: true
    }));
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick(e as any);
    }
  }

  render() {
    return html`
      <button
        role="tab"
        aria-selected="${this.active}"
        aria-disabled="${this.disabled}"
        tabindex="${this.disabled ? '-1' : '0'}"
        @click="${this._handleClick}"
        @keydown="${this._handleKeyDown}"
      >
        <slot name="icon"></slot>
        <slot></slot>
        <span class="indicator"></span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tab': MdTab;
  }
}
