import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { authToClient, initAuth } from '../services/account';

import '@shoelace-style/shoelace/dist/components/input/input.js';

@customElement('app-login')
export class AppLogin extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }

            main {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 56vh;
                gap: 10px;
            }

            main sl-input {
                width: 20em;
            }

            main sl-button {
                width: 8em;
            }
        `
    ];

    async firstUpdated() {
        // get code from url
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        let token = localStorage.getItem('token');
        let server = localStorage.getItem('server');

        if (code) {
            await authToClient(code);

            await Router.go("/home");
        }
        else if (token && server) {
            await Router.go("/home");
        }
    }

    async login() {
        const serverURL = (this.shadowRoot?.querySelector('sl-input[name="serverURL"]') as HTMLInputElement)?.value;

        try {
            await initAuth(serverURL);
        }
        catch (err) {
            console.error(err);
        }
    }

    render() {
        return html`
        <main>
            <sl-input type="text" name="serverURL" label="Server URL"></sl-input>


            <sl-button @click="${() => this.login()}" variant="primary">Login</sl-button>
        </main>
        `;
    }
}
