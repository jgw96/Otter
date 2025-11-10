import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

/**
 * Material Design 3 Dialog Component
 * A dialog using native HTML <dialog> element with Material Design 3 styling
 */
@customElement('md-dialog')
export class MdDialog extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: Boolean }) open = false;
  @property({ type: Boolean }) fullscreen = false;

  @query('dialog') dialog!: HTMLDialogElement;

  static styles = css`
    :host {
      display: contents;
    }

    dialog {
      border: none;
      border-radius: 28px;
      padding: 0;
      max-width: min(560px, calc(100vw - 48px));
      max-height: calc(100vh - 48px);
      background-color: var(--md-sys-color-surface-container-high, #ece6f0);
      color: var(--md-sys-color-on-surface, #1d1b20);
      box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12),
                  0 5px 5px -3px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      font-family: 'Roboto', system-ui, -apple-system, sans-serif;
    }

    dialog.fullscreen {
      max-width: 100vw;
      max-height: 100vh;
      width: 100vw;
      height: 100vh;
      border-radius: 0;
    }

    dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.32);
      backdrop-filter: blur(4px);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 16px 24px;
      gap: 16px;
    }

    .dialog-title {
      font-size: 24px;
      font-weight: 400;
      line-height: 32px;
      margin: 0;
      flex: 1;
    }

    .dialog-body {
      padding: 0 24px 24px 24px;
      overflow-y: auto;
      max-height: calc(100vh - 200px);
    }

    .dialog-body::-webkit-scrollbar {
      width: 8px;
    }

    .dialog-body::-webkit-scrollbar-track {
      background: transparent;
    }

    .dialog-body::-webkit-scrollbar-thumb {
      background-color: var(--md-sys-color-outline, #79747e);
      border-radius: 4px;
    }

    .dialog-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px 24px 24px;
    }

    ::slotted([slot="header-actions"]) {
      display: flex;
      gap: 8px;
    }

    .close-btn {
      appearance: none;
      border: 0;
      background: transparent;
      color: inherit;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .close-btn:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1d1b20) 8%, transparent);
    }

    .close-btn:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, var(--sl-color-primary-600, #6750a4));
      outline-offset: 2px;
    }

    .close-icon {
      width: 24px;
      height: 24px;
      display: block;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      dialog {
        background-color: var(--md-sys-color-surface-container-high, #2b2930);
        color: var(--md-sys-color-on-surface, #e6e1e5);
      }

      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
      }

      .dialog-body::-webkit-scrollbar-thumb {
        background-color: var(--md-sys-color-outline, #938f99);
      }
    }

    /* Mobile adjustments */
    @media (max-width: 700px) {
      dialog:not(.fullscreen) {
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 32px);
        border-radius: 20px;
      }

      .dialog-header {
        padding: 16px 16px 12px 16px;
      }

      .dialog-title {
        font-size: 20px;
        line-height: 28px;
      }

      .dialog-body {
        padding: 0 16px 16px 16px;
      }

      .dialog-footer {
        padding: 12px 16px 16px 16px;
      }
    }

    /* Animation */
    dialog[open] {
      animation: dialog-show 0.3s cubic-bezier(0.2, 0, 0, 1);
    }

    @keyframes dialog-show {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  render() {
    return html`
      <dialog part="dialog" class="${this.fullscreen ? 'fullscreen' : ''}" @close="${this._handleClose}" @click="${this._handleBackdropClick}">
        <div class="dialog-header">
          <h2 class="dialog-title">${this.label}</h2>
          <slot name="header-actions"></slot>
          <button class="close-btn" aria-label="Close dialog" @click="${this.hide}">
            <svg class="close-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"/>
            </svg>
          </button>
        </div>

        <div class="dialog-body">
          <slot></slot>
        </div>

        ${this._hasFooterSlot() ? html`
          <div class="dialog-footer">
            <slot name="footer"></slot>
          </div>
        ` : ''}
      </dialog>
    `;
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  show() {
    if (this.dialog && !this.dialog.open) {
      this.dialog.showModal();
      this.open = true;
      this.dispatchEvent(new CustomEvent('md-dialog-show', {
        bubbles: true,
        composed: true
      }));
    }
  }

  hide() {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
      this.open = false;
      this.dispatchEvent(new CustomEvent('md-dialog-hide', {
        bubbles: true,
        composed: true
      }));
    }
  }

  private _handleBackdropClick(e: MouseEvent) {
    // Close when clicking on the backdrop area of the native dialog
    if (e.target === this.dialog) {
      this.hide();
    }
  }

  private _handleClose() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('md-dialog-hide', {
      bubbles: true,
      composed: true
    }));
  }

  private _hasFooterSlot(): boolean {
    return this.querySelector('[slot="footer"]') !== null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-dialog': MdDialog;
  }
}
