import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'Mammoth';

  @property({ type: Boolean}) enableBack: boolean = false;

  static get styles() {
    return css`
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--app-color-primary);
        color: white;
        padding-left: 16px;
        padding-right: 16px;
        padding-top: 12px;
        position: fixed;
        left: env(titlebar-area-x, 0);
        top: env(titlebar-area-y, 0);
        right: 0;
        height: env(titlebar-area-height, 33px);
        width: env(titlebar-area-width, initial);
        app-region: drag;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 20px;
        font-weight: bold;
      }

      nav a {
        margin-left: 10px;
      }

      #back-button-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 12em;
      }

      @media(prefers-color-scheme: light) {
        header {
          color: black;
        }

        nav a {
          color: initial;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  openSettings() {
    // fire custom event
    this.dispatchEvent(new CustomEvent('open-settings'));
  }

  render() {
    return html`
      <header>

        <div id="back-button-block">
          ${this.enableBack ? html`<sl-button href="/home">
            Back
          </sl-button>` : null}

          <h1>${this.title}</h1>
        </div>

        <sl-button @click="${() => this.openSettings()}" circle size="small">
          <sl-icon src="/assets/settings-outline.svg"></sl-icon>
        </sl-button>
      </header>
    `;
  }
}
