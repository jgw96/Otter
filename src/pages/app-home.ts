import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';

import '../components/timeline';
import '../components/timeline-item';
import '../components/bookmarks';
import '../components/favorites';
import '../components/notifications';
import './app-messages';

import { styles } from '../styles/shared-styles';
import { getCurrentUser, getInstanceInfo } from '../services/account';
import { publishPost, uploadImageAsFormData } from '../services/posts';
import { Router } from '@vaadin/router';
import { reply } from '../services/timeline';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @state() user: any | null = null;
  @state() attachmentID: string | null = null;
  @state() attachmentPreview: string | null = null;
  @state() replies: any[] = [];
  @state() replyID: string | null = null;
  @state() primary_color: string = '#000000';
  @state() instanceInfo: any | null = null;

  static get styles() {
    return [
      styles,
      css`
      #welcomeBar {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      #instanceInfo {
        border-radius: 6px;
        background: #0000001a;
        padding-left: 12px;
        padding-top: 1px;
        padding-right: 12px;
        margin-top: 2em;
      }

      #instanceInfo img {
        width: 160px;
      }

      main {
        display: grid;
        grid-template-columns: 75vw 22vw;
      }

      #settings-drawer label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
      }

      #profile {
        padding: 12px;
        padding-top: 14px;
        background: #242428;
        border-radius: 6px;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      #username-block {
        display: flex;
        align-items: center;
        gap: 14px;
        justify-content: space-between;
        margin-top: 8px;
      }

      sl-radio {
        padding: 8px;
        margin-top: 4px;
        background: #00000024;
        border-radius: 4px;
      }

      sl-radio::part(control) {
        --toggle-size: 20px;
        height: 20px;
      }

      #replies-drawer ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      #replies-drawer #reply-post-actions {
        display: flex;
        justify-content: space-between;
        gap: 11px;
      }

      #replies-drawer #reply-post-actions sl-input {
        flex: 2;
      }

      #profile-card-actions sl-button {
        width: 100%;
      }

      #profile img {
        height: 5em;
        border-radius: 50%;
      }

      #profile-top h3 {
        margin-bottom: 0;
        margin-top: 0;
      }

      #profile-top p {
        color: grey;
        font-size: 14px;
      }

      sl-dialog::part(header-actions) {
        display: flex;
        align-items: center;
      }

      sl-dialog img {
        width: 98%;
        margin-top: 16px;
        background: #0e0e0e45;
        padding: 5px;
        border-radius: 6px;
      }

      #user-url {
        margin-top: 4px;
        font-size: 12px;
      }

      #welcomeCard,
      #infoCard {
        padding: 18px;
        padding-top: 0px;
      }

      sl-color-picker::part(base) {
        right: 91px;
        position: fixed;
      }

      sl-drawer::part(panel) {
        overflow-x: hidden;
      }

      pwa-install {
        position: absolute;
        bottom: 16px;
        right: 16px;
      }

      sl-card::part(footer) {
        display: flex;
        justify-content: flex-end;
      }

    sl-tab-panel::part(base)::-webkit-scrollbar) {
      display: none;
    }

    sl-tab-group sl-icon {
      width: 1.4em;
      height: 1.4em;
    }

    sl-tab::part(base) {
      gap: 8px;
    }

    #mobile-actions {
      position: fixed;
      bottom: 72px;
      right: 16px;
      display: none;
    }

    @media(max-width: 600px) {
      #profile {
        display: none;
      }

      #mobile-actions {
        display: flex;
      }

      .tab-label {
        display: none;
      }

      main {
        display: block;
        padding-top: 50px;
        margin-top: initial;
      }

      sl-tab-group::part(nav) {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        background: #181818;
        z-index: 2;
      }

      sl-tab-group::part(tabs) {
        justify-content: space-between;
      }
    }

    sl-tab-group::part(tabs) {
      width: 18vw;
    }


      @media (horizontal-viewport-segments: 2) {
        #welcomeBar {
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
        }

        #welcomeCard {
          margin-right: 64px;
        }
      }
    `];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');
    this.user = await getCurrentUser();

    console.log("user", this.user);

    const potentialColor = localStorage.getItem("primary_color");

    if (potentialColor) {
      this.primary_color = potentialColor;
      document.documentElement.style.setProperty('--sl-color-primary-600', potentialColor);
    }
    else {
      // get css variable color
      const color = getComputedStyle(document.documentElement).getPropertyValue('--sl-color-primary-600');
      this.primary_color = color;
    }
  }

  handlePrimaryColor(color: string) {
    this.primary_color = color;

    // set css variable color
    document.documentElement.style.setProperty('--sl-color-primary-600', color);

    localStorage.setItem("primary_color", color);
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'PWABuilder pwa-starter',
        text: 'Check out the PWABuilder pwa-starter!',
        url: 'https://github.com/pwa-builder/pwa-starter',
      });
    }
  }

  openNewDialog() {
    const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
    dialog.show();
  }

  async publish() {
    const status = (this.shadowRoot?.querySelector('sl-textarea') as any).value;
    console.log(status);

    if (this.attachmentID) {
      await publishPost(status, this.attachmentID);
    }
    else {
      await publishPost(status);
    }

    const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
    dialog.hide();
  }

  async goToFollowers() {
    Router.go(`/followers?id=${this.user.id}`)
  }

  async openSettingsDrawer() {
    this.instanceInfo = await getInstanceInfo();
    console.log("instanceInfo", this.instanceInfo)
    const drawer = this.shadowRoot?.getElementById('settings-drawer') as any;
    drawer.show();
  }

  async attachFile() {
    const attachmentData = await uploadImageAsFormData();
    console.log("attachmentData", attachmentData);

    this.attachmentID = attachmentData.id;
    this.attachmentPreview = attachmentData.preview_url;
  }

  async handleReplies(replies: any[], id: string) {
    this.replies = replies;

    this.replyID = id;

    const drawer = this.shadowRoot?.getElementById('replies-drawer') as any;
    await drawer.show();
  }

  async replyToAStatus() {
    const replyValue = (this.shadowRoot?.querySelector('#reply-post-actions sl-input') as any).value;

    if (this.replyID && replyValue) {
      await reply(this.replyID, replyValue);
    }
  }

  render() {
    return html`
      <app-header @open-settings="${() => this.openSettingsDrawer()}"></app-header>

      <sl-dialog id="notify-dialog" label="New Post">
        <sl-button circle slot="header-actions" @click="${() => this.attachFile()}">
          <sl-icon src="/assets/attach-outline.svg"></sl-icon>
        </sl-button>
        <sl-textarea placeholder="What's on your mind?"></sl-textarea>

        ${this.attachmentPreview ? html`
          <img src="${this.attachmentPreview}" />
        ` : html``}

        <sl-button @click="${() => this.publish()}" slot="footer" variant="primary">Publish</sl-button>
      </sl-dialog>

      <sl-drawer id="settings-drawer" placement="end" label="Settings">

          <label>
            Theme Color
            <sl-color-picker @sl-change="${($event: any) => this.handlePrimaryColor($event.target.value)}" .value="${this.primary_color}"></sl-color-picker>
          </label>

          ${this.instanceInfo ? html`
            <div id="instanceInfo">
              <h3>Instance Info</h3>

              <img src="${this.instanceInfo.thumbnail}">
              <p>${this.instanceInfo.title}</p>

              <div .innerHTML="${this.instanceInfo.description}"></div>
            </div>
          ` : null}

      </sl-drawer>

      <sl-drawer id="replies-drawer" placement="end" label="Comments">
        <ul>
        ${
          this.replies.map((reply: any) => {
            return html`
              <timeline-item ?show="${false}" .tweet="${reply}"></timeline-item>
            `
          })
        }
        </ul>

        <div slot="footer" id="reply-post-actions">
          <sl-input placeholder="Reply"></sl-input>
          <sl-button variant="primary" @click="${() => this.replyToAStatus()}">Reply</sl-button>
        </div>
      </sl-drawer>

      <main>
        <sl-tab-group .placement="${window.matchMedia(" (max-width: 600px)").matches ? "bottom" : "start" }">
          <sl-tab slot="nav" panel="general">
            <sl-icon src="/assets/home-outline.svg"></sl-icon>

            <span class="tab-label">Home</span>
          </sl-tab>
          <sl-tab slot="nav" panel="custom">
            <sl-icon src="/assets/planet-outline.svg"></sl-icon>

            <span class="tab-label">Town Hall</span>
          </sl-tab>
          <sl-tab slot="nav" panel="notifications">
            <sl-icon src="/assets/notifications-outline.svg"></sl-icon>

            <span class="tab-label">Notifications</span>
          </sl-tab>
          <sl-tab slot="nav" panel="messages">
            <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>

            <span class="tab-label">Messages</span>
          </sl-tab>
          <sl-tab id="bookmarks-tab" slot="nav" panel="bookmarks">
            <sl-icon src="/assets/bookmark-outline.svg"></sl-icon>

            <span class="tab-label">Bookmarks</span>
          </sl-tab>
          <sl-tab id="faves-tab" slot="nav" panel="faves">
            <sl-icon src="/assets/heart-outline.svg"></sl-icon>

            <span class="tab-label">Favorites</span>
          </sl-tab>


          <sl-tab-panel name="general">
            <app-timeline .type="Home" @replies="${($event: any) => this.handleReplies($event.detail.data, $event.detail.id)}"></app-timeline>
          </sl-tab-panel>
          <sl-tab-panel name="messages">
            <app-messages></app-messages>
          </sl-tab-panel>
          <sl-tab-panel name="custom">
            <app-timeline .type="Public"></app-timeline>
          </sl-tab-panel>
          <sl-tab-panel name="bookmarks">
            <app-bookmarks></app-bookmarks>
          </sl-tab-panel>
          <sl-tab-panel name="faves">
            <app-favorites></app-favorites>
          </sl-tab-panel>
          <sl-tab-panel name="notifications">
            <app-notifications></app-notifications>
          </sl-tab-panel>
        </sl-tab-group>

        <div id="mobile-actions">
          <sl-button size="large" pill variant="primary" @click="${() => this.openNewDialog()}">
            New Post
            <sl-icon src="/assets/add-outline.svg"></sl-icon>
          </sl-button>
        </div>

        <div id="profile">
          <div id="profile-top">
            ${this.user ? html`<img src="${this.user.avatar}" />` : html`<img src="https://via.placeholder.com/150" />`}
            <div id="username-block">
              <h3>${this.user ? this.user.display_name : "Loading..."}</h3>
              <sl-button size="small" id="share-button">Share Profile</sl-button>
            </div>

            <p id="user-url">${this.user ? this.user.url : "Loading..."}</p>

            <div .innerHTML=${this.user ? this.user.note : "Loading..."}></div>

            <sl-badge @click="${() => this.goToFollowers()}">${this.user ? this.user.followers_count : "Loading..."} followers
            </sl-badge>
            <sl-badge>${this.user ? this.user.following_count : "Loading..."} following</sl-badge>

          </div>

          <div id="profile-card-actions">
            <sl-button pill variant="primary" @click="${() => this.openNewDialog()}">New Post</sl-button>
          </div>
        </div>
      </main>
    `;
  }
}
