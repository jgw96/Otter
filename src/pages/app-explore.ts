import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { getPreviewTimeline } from '../services/timeline';

import '../components/preview-timeline';

import "@shoelace-style/shoelace/dist/components/dropdown/dropdown.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";

@customElement('app-explore')
export class AppExplore extends LitElement {
    @state() timeline: any[] = [];

    static styles = [
        css`
        :host {
            display: block;

            overflow-y: scroll;
            height: 100vh;
        }

        :host::-webkit-scrollbar {
            display: none;
        }

        main {
            padding-top: 60px;
            display: grid;
            grid-template-columns: 67vw 30vw;
            gap: 10px;
            padding-left: 10px;
            padding-right: 10px;
        }

        #sign-up-block {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 10px;
            height: fit-content;
            background: #202023;
            border-radius: 6px;
            width: 94%;
            margin-bottom: 22px;
        }

        h2 {
            margin-top: 0;
        }

        #sign-up-block p {
            margin-top: 0;
            color: darkgrey;
        }

        #sign-up-block #login-button {
            margin-top: 6px;
        }

        @media (max-width: 768px) {
            main {
                grid-template-columns: 1fr;
                display: flex;
                flex-direction: column-reverse;
            }
        }

        @media(prefers-color-scheme: dark) {
            fluent-button {
                color: white;
            }
        }

        `
    ];

    async firstUpdated() {
        console.log('first updated');

        const data = await getPreviewTimeline();
        console.log(data);

        this.timeline = data;
    }

    async login() {
        let serverURL = (this.shadowRoot!.querySelector('#server-input') as any).value;
        if (serverURL.length > 0) {
            if (serverURL.includes("https://")) {
                // remove https://
                serverURL = serverURL.replace("https://", "");
            }

            try {
                const { initAuth } = await import('../services/account');
                await initAuth(serverURL);

                // (window as any).appInsights.setAuthenticatedUserContext(validatedId);
            }
            catch (err) {
                console.error(err);
            }
        }
    }

    async doRegister() {

    }

    render() {
        return html`
        <app-header ?enableBack="${true}"></app-header>

        <main>
          <div>
            <h2>Explore</h2>
            <preview-timeline></preview-timeline>
          </div>

          <div id="sign-up-block">
            <p>Already have an account? Log in to your server. Otherwise, sign up for a account to follow people, like posts, and more!</p>
            <fluent-text-field id="server-input" placeholder="https://tech.lgbt"></fluent-text-field>
            <fluent-button id="login-button" appearance="accent" @click="${this.login}">Login</fluent-button>
            <fluent-button appearance="outline">Sign up</fluent-button>
        </main>
        `;
    }
}
