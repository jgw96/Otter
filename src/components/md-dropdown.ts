import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

/**
 * Material Design 3 Dropdown
 * Shows a popup surface when trigger is clicked. Content can be anything (md-menu, form, etc).
 */
@customElement('md-dropdown')
export class MdDropdown extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' = 'bottom-start';
  @property({ type: Number }) distance = 8;

  @query('.popup') popup!: HTMLElement;
  @query('slot[name="trigger"]') triggerSlot!: HTMLSlotElement;

  static styles = css`
    :host {
      position: relative;
      display: inline-block;
    }

    .trigger {
      display: inline-flex;
    }

    .popup-container {
      position: fixed;
      z-index: 1000;
      pointer-events: none;
    }

    .popup {
      opacity: 0;
      transform: scale(0.95);
      transform-origin: top left;
      transition: opacity 0.15s cubic-bezier(0.2, 0, 0, 1), transform 0.15s cubic-bezier(0.2, 0, 0, 1);
      pointer-events: auto;
    }

    :host([open]) .popup {
      opacity: 1;
      transform: scale(1);
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;
      background: transparent;
      display: none;
    }

    :host([open]) .backdrop {
      display: block;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleEscape);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleEscape);
  }

  private _handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this.hide();
    }
  };

  private _handleTriggerClick = () => {
    this.open ? this.hide() : this.show();
  };

  show() {
    this.open = true;
    this.requestUpdate();
    this.updateComplete.then(() => this._positionPopup());
    this.dispatchEvent(new CustomEvent('md-dropdown-show', { bubbles: true, composed: true }));
  }

  hide() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('md-dropdown-hide', { bubbles: true, composed: true }));
  }

  private _positionPopup() {
    const triggerEl = this.triggerSlot?.assignedElements()[0] as HTMLElement;
    if (!triggerEl || !this.popup) return;

    const rect = triggerEl.getBoundingClientRect();

    const container = this.shadowRoot!.querySelector('.popup-container') as HTMLElement;
    if (!container) return;

    let top = rect.bottom + this.distance;
    let left = rect.left;

    if (this.placement === 'bottom-end') {
      left = rect.right - this.popup.offsetWidth;
    } else if (this.placement === 'top-start') {
      top = rect.top - this.popup.offsetHeight - this.distance;
    } else if (this.placement === 'top-end') {
      top = rect.top - this.popup.offsetHeight - this.distance;
      left = rect.right - this.popup.offsetWidth;
    }

    container.style.top = `${top}px`;
    container.style.left = `${left}px`;
  }

  private _handleBackdropClick = () => {
    this.hide();
  };

  render() {
    return html`
      <div class="trigger" @click=${this._handleTriggerClick}>
        <slot name="trigger"></slot>
      </div>
      <div class="backdrop" @click=${this._handleBackdropClick}></div>
      <div class="popup-container">
        <div class="popup">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-dropdown': MdDropdown;
  }
}
