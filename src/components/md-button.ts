import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Material Design 3 Button Component
 * Supports filled, outlined, text, elevated, and tonal variants
 */
@customElement('md-button')
export class MdButton extends LitElement {
  @property({ type: String }) variant: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal' = 'filled';
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) pill = false;
  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button';

  static styles = css`
    :host {
      display: inline-block;
    }

    :host([disabled]) {
      display: inline-block;
    }

    button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
      cursor: pointer;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 500;
      letter-spacing: 0.1px;
      transition: all 200ms cubic-bezier(0.2, 0, 0, 1);
      overflow: hidden;
      white-space: nowrap;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    button:hover::before {
      opacity: 0.08;
    }

    button:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, #6750A4);
      outline-offset: 2px;
    }

    button:active::before {
      opacity: 0.12;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.38;
    }

    /* Size variants */
    button.small {
      height: 32px;
      padding: 0 12px;
      font-size: 13px;
      border-radius: 16px;
    }

    button.medium {
      height: 40px;
      padding: 0 24px;
      font-size: 14px;
      border-radius: 20px;
    }

    button.large {
      height: 56px;
      padding: 0 32px;
      font-size: 16px;
      border-radius: 28px;
    }

    /* Pill shape override */
    button.pill {
      border-radius: 100px;
    }

    /* Filled variant (default) */
    button.filled {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
    }

    button.filled:hover {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
    }

    button.filled:disabled {
      background: color-mix(in srgb, currentColor 12%, transparent);
      color: color-mix(in srgb, currentColor 38%, transparent);
      box-shadow: none;
    }

    /* Outlined variant */
    button.outlined {
      background: transparent;
      color: var(--md-sys-color-primary, #6750A4);
      border: 1px solid var(--md-sys-color-outline, #79747E);
    }

    button.outlined:disabled {
      border-color: color-mix(in srgb, currentColor 12%, transparent);
      color: color-mix(in srgb, currentColor 38%, transparent);
    }

    /* Text variant */
    button.text {
      background: transparent;
      color: var(--md-sys-color-primary, #6750A4);
      box-shadow: none;
    }

    button.text:disabled {
      color: color-mix(in srgb, currentColor 38%, transparent);
    }

    /* Elevated variant */
    button.elevated {
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      color: var(--md-sys-color-primary, #6750A4);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
    }

    button.elevated:hover {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
    }

    button.elevated:disabled {
      background: color-mix(in srgb, currentColor 12%, transparent);
      color: color-mix(in srgb, currentColor 38%, transparent);
      box-shadow: none;
    }

    /* Tonal variant */
    button.tonal {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
      box-shadow: none;
    }

    button.tonal:disabled {
      background: color-mix(in srgb, currentColor 12%, transparent);
      color: color-mix(in srgb, currentColor 38%, transparent);
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      button.filled {
        background: var(--md-sys-color-primary, #D0BCFF);
        color: var(--md-sys-color-on-primary, #381E72);
      }

      button.outlined {
        color: var(--md-sys-color-primary, #D0BCFF);
        border-color: var(--md-sys-color-outline, #938F99);
      }

      button.text {
        color: var(--md-sys-color-primary, #D0BCFF);
      }

      button.elevated {
        background: var(--md-sys-color-surface-container-low, #1D1B20);
        color: var(--md-sys-color-primary, #D0BCFF);
      }

      button.tonal {
        background: var(--md-sys-color-secondary-container, #4A4458);
        color: var(--md-sys-color-on-secondary-container, #E8DEF8);
      }
    }

    /* Ripple effect */
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    ::slotted(*) {
      pointer-events: none;
    }
  `;

  private handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Create ripple effect
    const button = this.shadowRoot?.querySelector('button');
    if (!button) return;

    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: currentColor;
      border-radius: 50%;
      opacity: 0.3;
      pointer-events: none;
      animation: ripple 600ms cubic-bezier(0.4, 0, 0.2, 1);
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  render() {
    const classes = [
      this.variant,
      this.size,
      this.pill ? 'pill' : ''
    ].filter(Boolean).join(' ');

    return html`
      <button
        part="button"
        class="${classes}"
        ?disabled="${this.disabled}"
        type="${this.type}"
        @click="${this.handleClick}"
      >
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </button>
    `;
  }
}
