import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
// import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

import '../components/timeline';
import '../components/timeline-item';
import '../components/bookmarks';
import '../components/favorites';
import '../components/notifications';
import '../components/app-theme';
import '../components/right-click';

import './app-messages';
import './search-page';

import { styles } from '../styles/shared-styles';
import { getCurrentUser, getInstanceInfo } from '../services/account';
import { router } from '../utils/router';

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

  @state() wellnessMode: boolean = false;
  @state() dataSaverMode: boolean = false;
  @state() sensitiveMode: boolean = false;

  @state() attaching: boolean = false;

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

      .sponsor {
        background: rgba(128, 128, 128, 0.14);
        border-radius: 6px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: end;
        position: absolute;
        bottom: 10px;
        right: 10px;
        left: 10px;
      }

      #no-replies {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #reply-drawer sl-skeleton {
          height: 8em;
          width: 8em;
          --sl-border-radius-default: 4px;
      }

      .img-preview {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 8em;
        margin-top: 10px;
        background: #00000040;
        padding: 6px;
        gap: 6px;

        border-radius: 6px;
    }

    .img-preview img {
        width: 8em;
        min-height: 6em;
        border-radius: 6px;

        margin-top: 6px;
    }

      .setting sl-switch {
        --sl-toggle-size-medium: 16px;
      }

      #context-menu {
        z-index: 10000;
        width: 150px;
        background: #1blala;
        border-radius: 5px;
        position: fixed;
        transform: scale(0.9);
        opacity: 0;
        transform-origin: top left;
        transition: transform, opacity;
        transition-duration: 0.12s;
        pointer-events: none;
    }

    right-click sl-menu-item::part(checked-icon) {
      width: 8px;
    }

    #context-menu sl-menu-item::part(checked-icon) {
      width: 8px;
    }

    #context-menu.visible {
      display: block;
      transform: scale(1);
      opacity: 1;
      pointer-events: auto;
    }

      .setting div {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .setting p {
        margin-top: 4px;
      }

      @media(prefers-color-scheme: light) {

      }

      sl-badge {
        cursor: pointer;
      }

      #reply-drawer {
        --size: 100vh;
      }

      #reply-drawer::part(footer) {
        display: flex;
        justify-content: space-between;
        align-items: center;
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

      main.focus {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 10vw;
        padding-right: 10vw;
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
        border-radius: 6px;
        height: fit-content;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      #username-block {
        display: flex;
        align-items: center;
        gap: 14px;
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

      #profile-card-actions {
        margin-top: 22px;

        position: fixed;
        bottom: 24px;
        width: 20%;
      }

      #profile-card-actions sl-button {
        width: 80%;
      }

      #profile img {
        height: 88px;
        width: 88px;
        border-radius: 50%;

        border: solid var(--sl-color-primary-600) 4px;
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
        height: 160px;
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

        backdrop-filter: blur(40px);

      }

      sl-dialog {
        --width: 38em;
      }

      sl-dialog sl-textarea::part(textarea) {
        height: 14em;
      }

      sl-dialog::part(panel) {
        backdrop-filter: blur(40px);
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
      width: 1.8em;
      height: 1.8em;
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

    @media(max-width: 1030px) {
      #profile-card-actions sl-button {
        width: 100%;
      }
    }


    @media(max-width: 600px) and (prefers-color-scheme: light) {
      sl-tab-group::part(tabs) {
        background: white;
      }
    }

    @media(max-width: 600px) {
      #profile {
        display: none;
      }

      sl-tab-group::part(tabs) {
        border-top: hidden;
      }

      #mobile-actions {
        display: flex;
      }

      #mobile-actions sl-button::part(base) {
        border-radius: 16px;
        height: 56px;
        width: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 4px;

        box-shadow: #0000008a 0px 1px 13px 0px;
      }

      #mobile-actions sl-button sl-icon {
        height: 24px;
        width: 24px;
      }

      .tab-label {
        display: none;
      }

      main {
        display: block;
        padding-top: 30px;
        margin-top: initial;
      }

      sl-tab-group::part(nav) {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        background: rgb(15 17 24);
        z-index: 2;
      }

      sl-tab-group::part(tabs) {
        justify-content: space-between;
      }
    }

    sl-tab-group::part(tabs) {
      width: 20vw;
    }

    #focusModeButton {
      position: fixed;
      bottom: 18px;
      left: 12px;
    }

    @media(max-width: 600px) {
      sl-tab-group::part(tabs) {
        width: initial;
      }
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

    getCurrentUser().then((user) => {
      this.user = user;
    });
  }

  async firstUpdated() {
    console.log('This is your home page');

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("name")) {
      const name = urlParams.get("name");

      if (name) {
        await this.shareTarget(name);
      }
    }

    console.log("user", this.user);


    window.requestIdleCallback(async () => {
      const { getSettings } = await import("../services/settings");
      const settings = await getSettings();

      if (settings) {
        this.handleWellnessMode(settings.wellness || false);

        this.handleDataSaverMode(settings.data_saver || false);
      }
    }, { timeout: 3000 });

    // const contextMenu = this.shadowRoot?.getElementById("context-menu");
    // const scope = document.querySelector("body");

    // console.log("contextMenu", contextMenu);

    // if (scope && contextMenu) {
    //   scope.addEventListener("contextmenu", (event) => {
    //     event.preventDefault();
    //     const { clientX: mouseX, clientY: mouseY } = event;
    //     contextMenu.style.top = `${mouseY}px`;
    //     contextMenu.style.left = `${mouseX}px`;

    //     contextMenu.classList.remove("visible");

    //     setTimeout(() => {
    //       contextMenu.classList.add("visible");
    //     }, 300)

    //     event.preventDefault();
    //   });

    //   scope.addEventListener("click", (e) => {
    //     if ((e.target as any)!.offsetParent != contextMenu) {
    //       contextMenu.classList.remove("visible");
    //     }
    //   });
    // }
  }

  async shareTarget(name: string) {
    const cache = await caches.open("shareTarget");
    const result = [];

    for (const request of await cache.keys()) {
      // If the request URL matches, add the response to the result
      if (
        (request.url.endsWith(".png") && request.url.includes(name)) ||
        request.url.endsWith(".jpg") && request.url.includes(name)) {
        result.push(await cache.match(name));
      }
    }

    console.log("share target result", result);

    if (result.length > 0) {
      const blob = await result[0]!.blob();

      await this.openNewDialog();

      this.attaching = true;

      const { uploadImageFromBlob } = await import("../services/posts");
      const data = await uploadImageFromBlob(blob);

      this.attaching = false;

      this.attachmentID = data.id;
      this.attachmentPreview = data.preview_url;
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

  async openNewDialog() {
    // if on desktop, open the dialog
    if (window.innerWidth > 600) {
      await import("../components/post-dialog");
      // const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
      // dialog.show();
      const dialog: any = this.shadowRoot?.querySelector("post-dialog");
      dialog?.openNewDialog();
    }
    else {
      const drawer = this.shadowRoot?.getElementById('reply-drawer') as any;
      drawer.show();
    }
  }

  async publish() {
    const status = (this.shadowRoot?.querySelector('sl-textarea') as any).value;
    console.log(status);

    if (this.attachmentID) {
      const { publishPost } = await import("../services/posts");
      await publishPost(status, this.attachmentID);
    }
    else {
      const { publishPost } = await import("../services/posts");
      await publishPost(status);
    }

    const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
    dialog.hide();
  }

  async goToFollowers() {
    router.navigate(`/followers?id=${this.user.id}`)
  }

  async goToFollowing() {
    router.navigate(`/following?id=${this.user.id}`)
  }

  async openSettingsDrawer() {
    const drawer = this.shadowRoot?.getElementById('settings-drawer') as any;
    await drawer.show();

    this.instanceInfo = await getInstanceInfo();
    console.log("instanceInfo", this.instanceInfo)
  }

  async attachFile() {
    this.attaching = true;

    const { uploadImageAsFormData } = await import("../services/posts");
    const attachmentData = await uploadImageAsFormData();
    console.log("attachmentData", attachmentData);

    this.attaching = false;

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
      const { reply } = await import("../services/timeline");
      await reply(this.replyID, replyValue);
    }
  }

  async openThemingDrawer() {
    const drawer = this.shadowRoot?.getElementById('theming-drawer') as any;
    await drawer.show();
  }

  doFocusMode() {
    const main = this.shadowRoot?.querySelector('main') as any;

    main.classList.toggle('focus');

    const profile = this.shadowRoot?.querySelector('#profile') as any;
    profile.style.display = profile.style.display === 'none' ? 'flex' : 'none';

    const appTimeline = this.shadowRoot?.querySelector('app-timeline') as any;
    appTimeline.style.position = appTimeline.style.position === 'fixed' ? 'relative' : 'fixed';
    appTimeline.style.left = appTimeline.style.left === '11vw' ? '0' : '11vw';
    appTimeline.style.right = appTimeline.style.right === '11vw' ? '0' : '11vw';
  }

  async handleWellnessMode(check: boolean) {
    console.log("check", check);
    this.wellnessMode = check;

    const { setSettings } = await import("../services/settings");
    setSettings({ wellness: check });
  }

  async handleSensitiveContent(check: boolean) {
    console.log("check", check);
    this.sensitiveMode = check;

    const { setSettings } = await import("../services/settings");
    setSettings({ sensitive: check });
  }

  async handleDataSaverMode(mode: boolean) {
    console.log("mode", mode)
    this.dataSaverMode = mode;

    const { setSettings } = await import("../services/settings");
    setSettings({ data_saver: mode });
  }

  removeImage() {
    this.attachmentID = null;
    this.attachmentPreview = null;
  }

  openATab(name: string) {
    const tab = this.shadowRoot?.querySelector(`sl-tab[panel=${name}]`) as any;
    tab.click();
  }

  render() {
    return html`
      <!-- <div id="context-menu">
        <sl-menu>
          <sl-menu-item @click="${() => this.openNewDialog()}">
            <sl-icon slot="prefix" src="/assets/add-outline.svg"></sl-icon>
            New Post
          </sl-menu-item>
          <sl-divider></sl-divider>
          <sl-menu-item @click="${() => this.openATab(" search")}">
            <sl-icon src="/assets/search-outline.svg"></sl-icon>
            Explore
          </sl-menu-item>
          <sl-menu-item @click="${() => this.openATab(" notifications")}">
            <sl-icon src="/assets/notifications-outline.svg"></sl-icon>
            Notifications
          </sl-menu-item>
          <sl-menu-item @click="${() => this.openATab(" messages")}">
            <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
            Messages
          </sl-menu-item>
          <sl-menu-item @click="${() => this.openATab(" bookmarks")}">
            <sl-icon src="/assets/bookmark-outline.svg"></sl-icon>
            Bookmarks
          </sl-menu-item>
          <sl-menu-item @click="${() => this.openATab(" faves")}">
            <sl-icon src="/assets/heart-outline.svg"></sl-icon>
            Favorites
          </sl-menu-item>
        </sl-menu>
      </div> -->

      <right-click>
        <sl-menu>
            <sl-menu-item @click="${() => this.openNewDialog()}">
              <sl-icon slot="prefix" src="/assets/add-outline.svg"></sl-icon>
              New Post
            </sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-item @click="${() => this.openATab(" search")}">
              <sl-icon src="/assets/search-outline.svg"></sl-icon>
              Explore
            </sl-menu-item>
            <sl-menu-item @click="${() => this.openATab(" notifications")}">
              <sl-icon src="/assets/notifications-outline.svg"></sl-icon>
              Notifications
            </sl-menu-item>
            <sl-menu-item @click="${() => this.openATab(" messages")}">
              <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
              Messages
            </sl-menu-item>
            <sl-menu-item @click="${() => this.openATab(" bookmarks")}">
              <sl-icon src="/assets/bookmark-outline.svg"></sl-icon>
              Bookmarks
            </sl-menu-item>
            <sl-menu-item @click="${() => this.openATab(" faves")}">
              <sl-icon src="/assets/heart-outline.svg"></sl-icon>
              Favorites
            </sl-menu-item>
          </sl-menu>
      </right-click>

      <app-header @open-settings="${() => this.openSettingsDrawer()}" @open-theming="${() => this.openThemingDrawer()}">
      </app-header>

      <sl-button @click="${() => this.doFocusMode()}" circle size="small" id="focusModeButton">
        <sl-icon src="/assets/eye-outline.svg"></sl-icon>
      </sl-button>

      <sl-drawer label="Theming" id="theming-drawer">
        <app-theme @color-chosen="${($event: any) => this.handlePrimaryColor($event.detail.color)}"></app-theme>
      </sl-drawer>

      <post-dialog></post-dialog>

      <!-- <sl-dialog id="notify-dialog" label="New Post">
                                      <sl-button circle slot="header-actions" @click="${() => this.attachFile()}">
                                        <sl-icon src="/assets/attach-outline.svg"></sl-icon>
                                      </sl-button>
                                      <sl-textarea placeholder="What's on your mind?"></sl-textarea>

                                      ${this.attachmentPreview ? html`
                                      <img src="${this.attachmentPreview}" />
                                      ` : html``}

                                      <sl-button @click="${() => this.publish()}" slot="footer" variant="primary">Publish</sl-button>
                                    </sl-dialog> -->

      <sl-drawer id="reply-drawer" placement="bottom" label="Reply">
        <sl-button circle slot="footer" @click="${() => this.attachFile()}">
          <sl-icon src="/assets/attach-outline.svg"></sl-icon>
        </sl-button>
        <sl-textarea placeholder="What's on your mind?"></sl-textarea>

        ${this.attachmentPreview && this.attaching === false ? html`
        <div class="img-preview">
          <sl-button circle size="small" @click="${() => this.removeImage()}">
            <sl-icon src="/assets/close-outline.svg"></sl-icon>
          </sl-button>
          <img src="${this.attachmentPreview}" />
        </div>
        ` : this.attaching === true ? html`<div class="img-preview">
          <sl-skeleton></sl-skeleton>
        </div>` : null}

        <sl-button @click="${() => this.publish()}" slot="footer" variant="primary">Publish</sl-button>
      </sl-drawer>

      <sl-drawer id="settings-drawer" placement="end" label="Settings">
        <div class="setting">
          <div>
            <h4>Show Sensitive Content</h4>

            <sl-switch @sl-change="${($event: any) => this.handleSensitiveContent($event.target.checked)}" ?checked="${this.sensitiveMode}"></sl-switch>
          </div>

          <p>
            Show sensitive content in your timeline.
          </p>
        </div>

        <div class="setting">
          <div>
            <h4>Wellness Mode</h4>

            <sl-switch @sl-change="${($event: any) => this.handleWellnessMode($event.target.checked)}"
              ?checked="${this.wellnessMode}"></sl-switch>
          </div>

          <p>
            Wellness Mode hides likes and boosts.
          </p>
        </div>

        <div class="setting">
          <div>
            <h4>Data Saver Mode</h4>

            <sl-switch @sl-change="${($event: any) => this.handleDataSaverMode($event.target.checked)}"
              ?checked="${this.dataSaverMode}"></sl-switch>
          </div>

          <p>
            Data Saver Mode reduces the amount of data used by Mammoth.
          </p>
        </div>

        <div class="sponsor">
          Thanks for using Mammoth! If you are enjoying the app and want to help me spend more time on it, please consider sponsoring me on GitHub!
          <iframe src="https://github.com/sponsors/jgw96/button" title="Sponsor jgw96" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>
        </div>

        ${this.instanceInfo ? html`
        <div id="instanceInfo">
          <h4>Instance Info</h4>

          <img src="${this.instanceInfo.thumbnail}">
          <p>${this.instanceInfo.title}</p>

          <div .innerHTML="${this.instanceInfo.description}"></div>
        </div>
        ` : null}

      </sl-drawer>

      <sl-drawer id="replies-drawer" placement="end" label="Comments">
        ${this.replies.length > 0 ? html`<ul>
          ${this.replies.map((reply: any) => {
          return html`
          <timeline-item ?show="${false}" .tweet="${reply}"></timeline-item>
          `
        })
        }
        </ul>` : html`
        <div id="no-replies">
          <p>No comments yet.</p>
        </div>
        `}

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
          <sl-tab slot="nav" panel="search">
            <sl-icon src="/assets/search-outline.svg"></sl-icon>

            <span class="tab-label">Explore</span>
          </sl-tab>
          <sl-tab slot="nav" panel="notifications">
            <sl-icon src="/assets/notifications-outline.svg"></sl-icon>

            <span class="tab-label">Notifications</span>
          </sl-tab>
          <!-- <sl-tab slot="nav" panel="messages">
                  <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>

                  <span class="tab-label">Messages</span>
                </sl-tab> -->
          <sl-tab id="bookmarks-tab" slot="nav" panel="bookmarks">
            <sl-icon src="/assets/bookmark-outline.svg"></sl-icon>

            <span class="tab-label">Bookmarks</span>
          </sl-tab>
          <sl-tab id="faves-tab" slot="nav" panel="faves">
            <sl-icon src="/assets/heart-outline.svg"></sl-icon>

            <span class="tab-label">Favorites</span>
          </sl-tab>


          <sl-tab-panel name="general">
            <app-timeline .timelineType="Home"
              @replies="${($event: any) => this.handleReplies($event.detail.data, $event.detail.id)}"></app-timeline>
          </sl-tab-panel>
          <sl-tab-panel name="media">
            <app-timeline .timelineType="Media"></app-timeline>
          </sl-tab-panel>
          <sl-tab-panel name="messages">
            <app-messages></app-messages>
          </sl-tab-panel>
          <sl-tab-panel name="custom">
            <app-timeline .timelineType="Public"></app-timeline>
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
          <sl-tab-panel name="search">
            <search-page></search-page>
          </sl-tab-panel>
        </sl-tab-group>

        <div id="mobile-actions">
          <sl-button size="large" pill variant="primary" @click="${() => this.openNewDialog()}">
            <sl-icon src="/assets/add-outline.svg"></sl-icon>
          </sl-button>
        </div>

        <div id="profile">
          <div id="profile-top">
            ${this.user ? html`<img src="${this.user.avatar}" />` : html`<img src="https://via.placeholder.com/150" />`}
            <div id="username-block">
              <h3>${this.user ? this.user.display_name : "Loading..."}</h3>
            </div>

            <p id="user-url">${this.user ? this.user.url : "Loading..."}</p>

            <sl-badge @click="${() => this.goToFollowers()}">${this.user ? this.user.followers_count : "0"} followers
            </sl-badge>
            <sl-badge @click="${() => this.goToFollowing()}">${this.user ? this.user.following_count : "0"} following
            </sl-badge>

          </div>

          <div id="profile-card-actions">
            <sl-button pill size="large" variant="primary" @click="${() => this.openNewDialog()}">
              New Post

              <sl-icon slot="suffix" src="/assets/add-outline.svg"></sl-icon>
            </sl-button>
          </div>
        </div>
      </main>
    `;
  }
}
