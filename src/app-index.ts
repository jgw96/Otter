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

      @media(max-width: 600px) {
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
      document.body.style.setProperty('--sl-color-primary-600', potentialColor);

      document.querySelector("html")!.style.setProperty('--primary-color', potentialColor);
    }
    else {
      // get css variable color
      const color = getComputedStyle(document.body).getPropertyValue('--sl-color-primary-600');
      document.querySelector("html")!.style.setProperty('--primary-color', color);

    }
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
