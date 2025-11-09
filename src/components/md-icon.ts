import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

/**
 * Material Design 3 Icon Component
 *
 * Displays icons from SVG files. Supports both inline SVG content and external SVG sources.
 *
 * @slot - Default slot for inline SVG content (alternative to src)
 *
 * @fires md-icon-load - Dispatched when the icon has loaded
 * @fires md-icon-error - Dispatched when the icon fails to load
 *
 * @csspart base - The icon's base container
 * @csspart svg - The SVG element
 */
@customElement('md-icon')
export class MdIcon extends LitElement {
  /** The path/URL to the SVG icon file */
  @property({ type: String }) src?: string;

  /** The label for accessibility */
  @property({ type: String }) label?: string;

  /** Size of the icon (CSS length value) */
  @property({ type: String }) size = '24px';

  @state() private svgContent = '';
  @state() private loadError = false;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: var(--md-icon-size, 24px);
      height: var(--md-icon-size, 24px);
      color: inherit;
      fill: currentColor;
      vertical-align: middle;
    }

    .icon svg {
      width: 100%;
      height: 100%;
      display: block;
      fill: currentColor;
      stroke: currentColor;
    }

    /* Ensure SVG paths inherit color */
    .icon ::slotted(svg),
    .icon svg {
      fill: currentColor;
    }

    .icon ::slotted(svg) path,
    .icon svg path {
      fill: currentColor;
    }

    /* Error state */
    .icon--error {
      opacity: 0.38;
    }
  `;

  async updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('src') && this.src) {
      await this.loadIcon();
    }
    if (changedProperties.has('size')) {
      this.style.setProperty('--md-icon-size', this.size);
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    if (this.src) {
      await this.loadIcon();
    }
    this.style.setProperty('--md-icon-size', this.size);
  }

  private async loadIcon() {
    if (!this.src) return;

    try {
      const response = await fetch(this.src);
      if (!response.ok) {
        throw new Error(`Failed to load icon: ${response.status}`);
      }

      const text = await response.text();
      this.svgContent = text;
      this.loadError = false;

      this.dispatchEvent(new CustomEvent('md-icon-load', {
        bubbles: true,
        composed: true,
        detail: { src: this.src }
      }));
    } catch (error) {
      console.error('Error loading icon:', error);
      this.loadError = true;
      this.svgContent = '';

      this.dispatchEvent(new CustomEvent('md-icon-error', {
        bubbles: true,
        composed: true,
        detail: { src: this.src, error }
      }));
    }
  }

  render() {
    const classes = {
      icon: true,
      'icon--error': this.loadError
    };

    return html`
      <div
        part="base"
        class="${Object.entries(classes).filter(([_, v]) => v).map(([k]) => k).join(' ')}"
        role="img"
        aria-label="${this.label || 'icon'}"
      >
        ${this.svgContent
          ? html`<div part="svg">${unsafeSVG(this.svgContent)}</div>`
          : html`<slot></slot>`
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-icon': MdIcon;
  }
}
