import { LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { router } from './utils/router';

import './pages/app-login';
import './components/header';
import { getSettings } from './services/settings';

@customElement('app-index')
export class AppIndex extends LitElement {
  static get styles() {
    return css`
      main {
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 16px;
      }

      @media(max-width: 700px) {
        main {
          padding-left: 8px;
          padding-right: 8px;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }

        to {
          opacity: 0;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0.2;
        }

        to {
          opacity: 1;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();

    const settings = await getSettings();
    console.log("settings", settings)

    const potentialColor = settings.primary_color;

    if (potentialColor) {
      this.applyThemeColor(potentialColor);
    }
    else {
      // get css variable color
      const color = getComputedStyle(document.body).getPropertyValue('--sl-color-primary-600');
      this.applyThemeColor(color);
    }
  }

  /**
   * Apply theme color to both Shoelace and MD3 design tokens
   */
  private applyThemeColor(color: string) {
    const root = document.documentElement;

    // Shoelace tokens
    root.style.setProperty('--sl-color-primary-600', color);
    root.style.setProperty('--primary-color', color);

    // MD3 tokens - primary color (set on :root for highest priority)
    root.style.setProperty('--md-sys-color-primary', color);
    root.style.setProperty('--md-sys-color-outline', color);

    // Generate lighter/darker variants for better MD3 integration
    const lighterVariant = this.adjustColorBrightness(color, 40);
    const darkerVariant = this.adjustColorBrightness(color, -40);

    root.style.setProperty('--sl-color-primary-500', lighterVariant);
    root.style.setProperty('--sl-color-primary-700', darkerVariant);

    // Also update body for legacy support
    document.body.style.setProperty('--sl-color-primary-600', color);
    document.body.style.setProperty('--md-sys-color-primary', color);
    document.body.style.setProperty('--md-sys-color-outline', color);
  }

  /**
   * Adjust color brightness (from app-theme component)
   */
  private adjustColorBrightness(col: string, amt: number): string {
    let usePound = false;
    if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
    }

    const num = parseInt(col, 16);

    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  }

  firstUpdated() {
    router.addEventListener('route-changed', () => {
      if ("startViewTransition" in document) {
        return (document as any).startViewTransition(() => {
          this.requestUpdate();
        });
      }
      else {
        this.requestUpdate();
      }
    });
  }


  render() {
    return router.render();
  }
}
