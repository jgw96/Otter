import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './user-profile';
import './timeline-item';

import '@shoelace-style/shoelace/dist/components/divider/divider';

// import fluent tabs
import { fluentTabs, fluentTab, fluentTabPanel, fluentButton, fluentSwitch, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentTabs());
provideFluentDesignSystem().register(fluentTab());
provideFluentDesignSystem().register(fluentTabPanel());
provideFluentDesignSystem().register(fluentButton());
provideFluentDesignSystem().register(fluentSwitch());


@customElement('app-notifications')
export class Notifications extends LitElement {
    @state() notifications = [];
    @state() subbed: boolean = false;

    static styles = [
        css`
            :host {
                height: 91vh;
                display: flex;
                flex-direction: column;
                gap: 8px;

                contain: paint layout style;
                content-visibility: auto;
            }

            @media(prefers-color-scheme: dark) {
                fluent-tab {
                    color: white;
                }

                fluent-button {
                    background: transparent;
                }

                li {
                    color: white;
                }

            }

            fluent-tab-panel {
                margin-top: 16px;
              }

            #notify-inner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }

            sl-switch {
                --sl-toggle-size-small: 16px;
              }

            ul {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 0;
                list-style: none;
                margin-top: 0px;

                height: 87.5vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            .notify-header img {
                border-radius: 50%;
                height: 62px;
            }

            li {
                display: flex;
                align-items: center;
                gap: 10px;
                justify-content: space-between;
                cursor: pointer;

                background: var(--sl-panel-background-color);
                border-radius: 6px;
                padding: 10px;
                padding-right: 15px;
                padding-left: 15px;
            }

            li.follow {
              gap: 20p;
              justify-content: space-between;
              font-weight: bold;
            }

            li.follow div {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            li.reblog, li.favourite, li.mention, li.edit {
                display: flex;
                flex-direction: column;
            }

            li.reblog div, li.favourite div, li.mention div, li.edit div {
                display: flex;
                align-items: center;
                gap: 20px;
                width: 100%;
                font-weight: bold;
            }

            li.reblog timeline-item, li.favourite timeline-item, li.mention timeline-item, li.edit timeline-item {
                width: 100%;
            }

            #no {
                flex-direction: column;
                font-size: 1.4em;
                margin-top: 40px;
            }

            #no img {
                height: 400px;
            }

            #notify-actions {
                padding: 8px;
                border-radius: 6px;
                background: transparent;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }

            @media(max-width: 600px) {
                sl-tab-group {
                    padding-left: 10px;
                    padding-right: 10px;
                }
            }
        `
    ];

    async firstUpdated() {
        //load notifications when this component is visible using intersectionObserver

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {

            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const { getNotifications } = await import('../services/notifications');
                    const notificationsData = await getNotifications();
                    console.log(notificationsData);

                    this.notifications = notificationsData;

                    // check push reg
                    const reg = await navigator.serviceWorker.getRegistration();
                    if (reg && reg.pushManager) {
                        const sub = await reg.pushManager.getSubscription();
                        if (sub) {
                            this.subbed = true;
                        }
                    }

                    if ("clearAppBadge" in navigator) {
                        // @ts-ignore
                        navigator.clearAppBadge();
                    }

                    observer.disconnect();
                }
            });
        }
        , options);

        observer.observe(this);
    }

    async clear() {
        const { getNotifications, clearNotifications } = await import('../services/notifications');
        await clearNotifications();

        const notificationsData = await getNotifications();
        console.log(notificationsData);

        this.notifications = notificationsData;
    }

    async sub(flag: boolean) {
        console.log("flag", flag)
        const { subToPush, unsubToPush, modifyPush } = await import('../services/notifications');

        if (flag === false) {
          await unsubToPush();
        }
        else {
            try {
                await subToPush();
                this.subbed = true;

                await modifyPush();

            }
            catch (err) {
                console.log(err);
            }
        }
    }

    render() {
        return html`
          <div id="notify-actions">
            <div id="notify-inner">
            <sl-switch size="small" label="Notifications" ?checked="${this.subbed}" @sl-change="${($event: any) => this.sub($event.target.checked)}">Notifications</sl-switch>
            </div>
            <fluent-button appearance="accent" pill size="small" @click="${() => this.clear()}">Clear</fluent-button>
          </div>

          <fluent-tabs orientation="horizontal">
                <fluent-tab slot="nav" panel="all">All</fluent-tab>
                <fluent-tab slot="nav" panel="mentions">Mentions</fluent-tab>
                <fluent-tab slot="nav" panel="follows">Follows</fluent-tab>

                <fluent-tab-panel name="all">
                <ul>
            ${
                this.notifications && this.notifications.length > 0 ? this.notifications.map((notification: any) => {
                    return html`
                    ${
                        notification.type === "follow" ? html`
                          <li class="follow">

                            <div>
                                <user-profile small .account=${notification.account}></user-profile>

                                <p>followed you</p>
                            </div>

                          </li>
                        ` : null
                    }

                    ${
                        notification.type === "reblog" ? html`
                          <li class="reblog">
                            <div>

                                    <user-profile small .account=${notification.account}></user-profile>

                                    <p>boosted your post</p>

                            </div>

                            <timeline-item .tweet=${notification.status}></timeline-item>
                          </li>
                        ` : null
                    }

                    ${
                        notification.type === "favourite" ? html`
                          <li class="favourite">
                            <div>
                                <user-profile small .account=${notification.account}></user-profile>

                                <p>liked your post</p>
                            </div>

                            <timeline-item .tweet=${notification.status}></timeline-item>
                          </li>
                        ` : null
                    }

                    ${
                        notification.type === "mention" ? html`
                            <li class="mention">
                                <div>
                                    <user-profile small .account=${notification.account}></user-profile>

                                    <p>mentioned you</p>
                                </div>

                                <timeline-item .tweet=${notification.status}></timeline-item>
                        ` : null
                    }

                    ${
                        notification.type === "update" ? html`
                            <li class="edit">
                                <div>
                                    <user-profile small .account=${notification.account}></user-profile>

                                    <p>edited a post</p>
                                </div>

                                <timeline-item .tweet=${notification.status}></timeline-item>
                        ` : null
                    }
                    `;
                }) : html`
                    <li id="no">
                        <img src="/assets/notify-done.svg" alt="no notifications">
                        <p>No notifications</p>
                    </li>
                `
            }
          </ul>
                </fluent-tab-panel>

                <fluent-tab-panel name="mentions">
                <ul>
            ${
                this.notifications && this.notifications.length > 0 ? this.notifications.map((notification: any) => {
                    return html`

                    ${
                        notification.type === "mention" ? html`
                            <li class="mention">
                                <div>
                                    <user-profile small .account=${notification.account}></user-profile>

                                    <p>mentioned you</p>
                                </div>

                                <timeline-item .tweet=${notification.status}></timeline-item>
                        ` : null
                    }

                    `;
                }) : html`
                    <li id="no">
                        <img src="/assets/notify-done.svg" alt="no notifications">
                        <p>No notifications</p>
                    </li>
                `
            }
          </ul>
                </fluent-tab-panel>

                <fluent-tab-panel name="follows">
                <ul>
            ${
                this.notifications && this.notifications.length > 0 ? this.notifications.map((notification: any) => {
                    return html`
                    ${
                        notification.type === "follow" ? html`
                          <li class="follow">

                            <div>
                                <user-profile small .account=${notification.account}></user-profile>

                                <p>followed you</p>
                            </div>

                          </li>
                        ` : null
                    }
                    `;
                }) : html`
                    <li id="no">
                        <img src="/assets/notify-done.svg" alt="no notifications">
                        <p>No notifications</p>
                    </li>
                `
            }
          </ul>
                </fluent-tab-panel>
          </fluent-tabs>
        `;
    }
}
