import { LitElement, css, html, PropertyValueMap } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import { fluentButton, provideFluentDesignSystem } from '@fluentui/web-components';
import './md-icon.js';

import { enableVibrate } from '../utils/handle-vibrate';
provideFluentDesignSystem().register(fluentButton());
@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'Otter';

  @property({ type: Boolean }) enableBack: boolean = false;

  static get styles() {
    return css`
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: transparent;
        backdrop-filter: blur(40px);
        color: white;
        padding-right: 5px;
        position: fixed;
        left: env(titlebar-area-x, 0);
        top: env(titlebar-area-y, 0);
        right: 0;
        height: env(titlebar-area-height, 33px);
        app-region: drag;

        width: calc(env(titlebar-area-width, intitial) + -23px);
        padding-top: 4px;
        padding-left: 12px;

        view-transition-name: full-embed;
        contain: layout;

        z-index: 99999;
      }

      #actions {
        display: flex;
        gap: 0px;
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

      fluent-button {
        -webkit-app-region: no-drag;
        app-region: no-drag;
      }

      @media (min-width: 768px) {
        #mammoth-bot {
          display: none;
        }

        header {
          padding-left: 20px;
        }
      }

      @media(prefers-color-scheme: light) {
        header {
          color: black;
        }

        nav a {
          color: initial;
        }
      }

      @media(prefers-color-scheme: dark) {
        fluent-button[appearance="neutral"]::part(control) {
          background: #1e1e1e;
          color: white;
        }

          fluent-button::part(control) {
              --neutral-fill-stealth-active: #1b1d26;
              --neutral-fill-stealth-hover: #1b1d26;
          }

      }
    `;
  }

  constructor() {
    super();
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    window.requestIdleCallback(() => {
      if (this.shadowRoot) {
          enableVibrate(this.shadowRoot);
      }
    })
  }

  openSettings() {
    // fire custom event
    this.dispatchEvent(new CustomEvent('open-settings'));
  }

  handleTheming() {
    // fire custom event
    this.dispatchEvent(new CustomEvent('open-theming'));
  }

  openBotDrawer() {
    // fire custom event
    this.dispatchEvent(new CustomEvent('open-bot-drawer'));
  }

  async goBack() {
    if ("navigation" in window) {
      // @ts-ignore
      if (window.navigation.canGoBack) {
        // @ts-ignore
        await window.navigation.back();
      }
    }
    else {
      window.history.back();
    }
  }

  render() {
    return html`
      <header>

      <div id="back-button-block">
          ${this.enableBack ? html`<fluent-button @click="${() => this.goBack()}" title="back" size="small" href="/home">
            Back
          </fluent-button>` : null}

          <img src="/assets/icons/Android/64-icon.png" alt="Otter" width="20" height="20">
        </div>

        <div id="actions">
          <!-- <fluent-button @click="${() => this.openBotDrawer()}" appearance="lightweight" title=="Open MammothBot" id="mammoth-bot">
            <md-icon src="/assets/sparkles-outline.svg" alt="MammothBot"></md-icon>
          </fluent-button> -->

          <fluent-button appearance="lightweight" title="Open Theme Settings" id="open-button" circle size="small" @click="${() => this.handleTheming()}">
            <md-icon src="/assets/color-palette-outline.svg" alt="Theme"></md-icon>
          </fluent-button>

          <fluent-button id="settings-button" appearance="lightweight"  title="Open Settings" @click="${() => this.openSettings()}" circle size="small">
            <md-icon src="/assets/settings-outline.svg"></md-icon>
          </fluent-button>
        </div>

      </header>
    `;
  }
}
