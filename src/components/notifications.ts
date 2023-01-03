import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { clearNotifications, getNotifications } from '../services/notifications';

import './user-profile';
import './timeline-item';

import '@shoelace-style/shoelace/dist/components/divider/divider';

@customElement('app-notifications')
export class Notifications extends LitElement {
    @state() notifications = [];

    static styles = [
        css`
            :host {
                height: 91vh;
                display: flex;
                flex-direction: column;
                gap: 8px;
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

            @media(max-width: 600px) {
                ul {
                    height: initial;
                }
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

                background: var(--sl-panel-background-color);
                border-radius: 6px;
                padding: 10px;
                padding-right: 15px;
                padding-left: 15px;
            }

            li.follow {
                justify-content: flex-start;
                gap: 20p;
                font-weight: bold;
            }

            li.reblog, li.favourite, li.mention, li.edit {
                display: flex;
                flex-direction: column;
            }

            li.reblog div, li.favourite div, li.mention div, li.edit div {
                display: flex;
                align-items: center;
                gap: 20px;
                width: 97%;
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
                justify-content: flex-end;
                align-items: center;
            }
        `
    ];

    async firstUpdated() {
        const notificationsData = await getNotifications();
        console.log(notificationsData);

        this.notifications = notificationsData;
    }

    async clear() {
        await clearNotifications();

        const notificationsData = await getNotifications();
        console.log(notificationsData);

        this.notifications = notificationsData;
    }

    render() {
        return html`
          <div id="notify-actions">
            <sl-button pill size="small" @click="${() => this.clear()}">Clear</sl-button>
          </div>

          <ul>
            ${
                this.notifications && this.notifications.length > 0 ? this.notifications.map((notification: any) => {
                    return html`
                    ${
                        notification.type === "follow" ? html`
                          <li class="follow">

                            <user-profile .account=${notification.account}></user-profile>

                            <p>followed you</p>
                          </li>
                        ` : null
                    }

                    ${
                        notification.type === "reblog" ? html`
                          <li class="reblog">
                            <div>
                                <user-profile .account=${notification.account}></user-profile>

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
                                <user-profile .account=${notification.account}></user-profile>

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
                                    <user-profile .account=${notification.account}></user-profile>

                                    <p>mentioned you</p>
                                </div>

                                <timeline-item .tweet=${notification.status}></timeline-item>
                        ` : null
                    }

                    ${
                        notification.type === "update" ? html`
                            <li class="edit">
                                <div>
                                    <user-profile .account=${notification.account}></user-profile>

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
        `;
    }
}
