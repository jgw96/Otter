import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { clearNotifications, getNotifications } from '../services/notifications';

import './user-profile';

import '@shoelace-style/shoelace/dist/components/divider/divider';

@customElement('app-notifications')
export class Notifications extends LitElement {
    @state() notifications = [];

    static styles = [
        css`
            :host {
                display: block;
            }

            ul {
                display: flex;
                flex-direction: column;
                gap: 14px;
                margin: 0;
                padding: 0;
                list-style: none;

                height: 90vh;
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
                background: var(--sl-color-gray-50);
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
                          <li>
                            <user-profile .account=${notification.account}></user-profile>

                            <p>followed you</p>
                          </li>

                          <sl-divider></sl-divider>
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
