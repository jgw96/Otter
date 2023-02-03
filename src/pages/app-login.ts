import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import { router } from '../utils/router';

@customElement('app-login')
export class AppLogin extends LitElement {

    @state() loadIntro: boolean = false;

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
                gap: 20px;
                position: fixed;
                inset: 0px;
                height: 72vh;
                width: 100vw;
            }

            sl-dialog a {
              color: var(--sl-color-primary-600);
            }

            main sl-input {
                width: 20em;
            }

            main sl-button {
                width: 8em;
            }

            #login-block {
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: center;
            }

            main p {
                font-size: 12px;
                position: fixed;
                bottom: 10px;
                text-align: center;
                justify-content: center;
            }

            sl-dialog::part(panel) {
                backdrop-filter: blur(80px);

                height: 80vh;
                width: 80vw;
              }

            @media(max-width: 600px) {
                sl-dialog::part(panel) {
                    height: 90vh;
                    width: 90vw;
                }
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
            const { authToClient } = await import('../services/account');
            await authToClient();

            await router.navigate("/home");
        }
        else if (token && server) {
            await router.navigate("/home");
        }
    }

    async login() {
        const serverURL = (this.shadowRoot?.querySelector('sl-input[name="serverURL"]') as HTMLInputElement)?.value;

        try {
            const { initAuth } = await import('../services/account');
            await initAuth(serverURL);
        }
        catch (err) {
            console.error(err);
        }
    }

    async openIntro() {
        await import("@shoelace-style/shoelace/dist/components/dialog/dialog.js")
        this.loadIntro = true;

        await this.updateComplete;

        const dialog = this.shadowRoot?.querySelector('sl-dialog') as any;

        dialog.show();
    }

    render() {
        return html`
        ${
            this.loadIntro ? html`
                      <sl-dialog label="Intro To Mastodon">
            <h2>What is Mammoth?</h2>
            <p>
                Mammoth is the app your using 😊. It is an open source, cross-platform Mastodon client. Mammoth
                brings the best of Mastodon to any device, with a fast and intuitive interface,
                no matter your device or internet connection. To use Mammoth, you need a Mastodon account. Once you have a Mastodon account
                you will need to enter the URL of the Mastodon instance you signed up at.
            </p>

            <h2>What Is Mastodon?</h2>
            <p>
                Mastodon is a social media platform that allows users to create and share short posts, called "toots," and
                interact with each other through features like boosting, direct messaging, and hashtags. It is decentralized,
                meaning that it is not controlled by a central authority and users can choose which communities, called
                "instances," they want to join. Mastodon is open-source and free to use.
            </p>

            <p>
                Each instance is run by a different administrator and can have its own rules and moderation policies.
            </p>

            <h2>How do I join Mastodon?</h2>

            <ol>
                <li>Go to <a href='https://joinmastodon.org/'>https://joinmastodon.org/</a> and select an instance to sign up
                    for. There are many different Mastodon instances to choose from, each with its own rules and community
                    guidelines. You can read more about each instance to find one that fits your interests.</li>
                <li>Click the "Sign up" button on the instance you have chosen.</li>
                <li>Fill out the sign-up form with your desired username, email address, and password.</li>
                <li>Read and agree to the terms of service for the instance.</li>
                <li>Click the "Sign up" button to complete the registration process.</li>
                <li>You will receive an email with a confirmation link. Click the link to confirm your email address and
                    complete the sign-up process.</li>
                <li>Once you have confirmed your email, you can log in to Mastodon and start using the platform.</li>
            </ol>
            <p>Note: Some instances may have additional requirements or restrictions for new users, such as requiring a valid
                email address or approving new accounts manually. Be sure to read the rules and guidelines of the instance you
                are joining before signing up.</p>

        </sl-dialog>
            ` : null
        }

        <main>
            <img src="/assets/icons/256-icon.png" alt="logo">

            <div id="login-block">
                <sl-input type="text" name="serverURL" label="Server URL"></sl-input>

                <sl-button @click="${() => this.login()}" variant="primary">Login</sl-button>
            </div>

            <sl-button @click="${() => this.openIntro()}" size="small" pill>Intro To Mastodon</sl-button>

            <p>Welcome To Mammoth, your Mastodon Client</p>
        </main>
        `;
    }
}
