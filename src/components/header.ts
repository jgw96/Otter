import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'Mammoth';

  @property({ type: Boolean }) enableBack: boolean = false;

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
        app-region: drag;

        width: calc(env(titlebar-area-width, intitial) + -23px);
        padding-top: 4px;
        padding-left: 6px;

        view-transition-name: full-embed;
        contain: layout;
      }


      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 20px;
        font-weight: bold;
      }

      header img {
        view-transition-name: main-header-icon;
        contain: layout;
        width: fit-content;
      }

      nav a {
        margin-left: 10px;
      }

      #back-button-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
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

  handleTheming() {
    // fire custom event
    this.dispatchEvent(new CustomEvent('open-theming'));
  }

  render() {
    return html`
      <header>

        <div id="back-button-block">
          ${this.enableBack ? html`<sl-button size="small" href="/home">
            Back
          </sl-button>` : null}

          <img src="/assets/icons/64-icon.png" alt="Mammoth" width="32" height="32">
        </div>

        <div>
          <sl-button id="open-button" circle size="small" @click="${() => this.handleTheming()}">
            <sl-icon src="/assets/color-palette-outline.svg" alt="Theme"></sl-icon>
          </sl-button>

          <sl-button @click="${() => this.openSettings()}" circle size="small">
            <sl-icon src="/assets/settings-outline.svg"></sl-icon>
          </sl-button>
        </div>

      </header>
    `;
  }
}
