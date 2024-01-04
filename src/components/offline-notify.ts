import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import "@shoelace-style/shoelace/dist/components/alert/alert.js";

@customElement('offline-notify')
export class OfflineNotify extends LitElement {

    @state() public network_status: boolean = true;
    @state() back_online: boolean = false;

    static styles = [
        css`
            :host {
                display: block;
            }

            .offline {
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        `
    ];

    constructor() {
        super();

        window.addEventListener('offline', () => {
            this.network_status = false;

            this.showOfflineToast();
        });

        window.addEventListener('online', () => {
            if (this.network_status === false) {
                this.network_status = true;

                this.showBackOnlineToast();
            }
        });

        this.network_status = navigator.onLine;
    }

    showOfflineToast() {
        const toast = this.shadowRoot?.getElementById('offline-toast') as any;

        toast.toast();
    }

    showBackOnlineToast() {
        const toast = this.shadowRoot?.getElementById('back-online-toast') as any;

        toast.toast();
    }

    render() {
        return html`
            <sl-alert id="offline-toast" variant="primary" duration="3000" closable>
                <strong>You have entered offline mode</strong><br />
                Otter will still work, including if you close and reopen the app, but some functionality may be limited.
            </sl-alert>

            <sl-alert id="back-online-toast" variant="primary" duration="3000" closable>
                <strong>You are back online</strong><br />
                Otter will resume normal functionality.
            </sl-alert>
        `;
    }
}
