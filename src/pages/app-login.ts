import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { fluentButton, fluentTextField, fluentCombobox, fluentOption, provideFluentDesignSystem } from '@fluentui/web-components';

import { router } from '../utils/router';
import { enableVibrate } from '../utils/handle-vibrate';
import { getPeers } from '../services/account';

provideFluentDesignSystem().register(fluentButton());
provideFluentDesignSystem().register(fluentTextField());
provideFluentDesignSystem().register(fluentCombobox());
provideFluentDesignSystem().register(fluentButton());
provideFluentDesignSystem().register(fluentOption());

let scrollWidth: number = 0;

@customElement('app-login')
export class AppLogin extends LitElement {

    @state() loadIntro: boolean = false;
    @state() instances: any[] = [];
    @state() chosenServer: string = '';

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

            @media(prefers-color-scheme: dark) {
                fluent-combobox::part(control) {
                    background: #242428;
                    color: white;
                }

                fluent-option {
                    background: #242428;
                    color: white;
                }

                fluent-combobox::part(listbox) {
                    background: #242428;
                    color: white;
                }
            }

            #intro-carousel {
                display: grid;
                grid-template-columns: 100% 100% 100%;
                overflow-x: auto;
                overflow-y: hidden;
                width: 100%;
                height: 100%;
                scroll-snap-type: x mandatory;
            }

            #intro-carousel::-webkit-scrollbar {
                display: none;
            }

            .scroll-item {
                scroll-snap-align: center;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-content: center;
                flex-wrap: wrap;
                padding-left: 100px;
                padding-right: 100px;
            }

            .scroll-item fluent-button {
                width: 100px;
                align-self: center;
            }

            sl-dialog a {
              color: var(--sl-color-primary-600);
            }

            main fluent-text-field {
                width: 20em;
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
                    height: 100vh;
                    width: 100vw;
                    max-height: 100vh;
                    max-width: 100vw;
                    min-height: 100vh;
                    min-width: 100vw;
                }

                #intro-carousel {
                    overflow-y: auto;
                    overflow-x: hidden;
                    scroll-snap-type: y;
                    display: flex;
                    flex-direction: column;
                }

                .scroll-item fluent-button {
                    display: none;
                }

                .scroll-item {
                    display: flex;
                    flex-flow: column;
                    padding: 0px;
                    height: 100vh;
                    scroll-snap-align: start;
                }
            }
        `
    ];

    async firstUpdated() {
        // get code from url
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        const accessToken = localStorage.getItem('accessToken');

        const server = localStorage.getItem('server');

        if (code) {
            const { authToClient } = await import('../services/account');

            await authToClient(code);

            await router.navigate("/home");
        }
        else if (accessToken && server) {
            const { getCurrentUser } = await import("../services/account");
            const currentUser = await getCurrentUser();

           (window as any).appInsights.setAuthenticatedUserContext(currentUser.id);

            await router.navigate("/home");
        }

        window.requestIdleCallback(() => {
            if (this.shadowRoot) {
                enableVibrate(this.shadowRoot);
            }
        })

        this.getInstances();

    }

    async login() {
        let serverURL = this.chosenServer
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

    async openIntro() {
        await import("@shoelace-style/shoelace/dist/components/dialog/dialog.js")
        this.loadIntro = true;

        await this.updateComplete;

        const dialog = this.shadowRoot?.querySelector('sl-dialog') as any;

        dialog.show();
    }

    scrollToItem(scroller: any, width: number) {
        const newWidth = scrollWidth + width;
        scrollWidth = newWidth;

        scroller.scrollTo({
            top: 0,
            left: newWidth,
            behavior: "smooth",
          })
      }

      next() {
        const scroller = this.shadowRoot?.querySelector('#intro-carousel') as any;


        this.scrollToItem(scroller, 1000);

      }

      async getStarted() {
        const dialog = this.shadowRoot?.querySelector('sl-dialog') as any;
        await dialog.hide();

        scrollWidth = 0;
      }

    async getInstances() {
        const instances = await getPeers();

        this.instances = instances;
    }

    handleServerInput(server: string) {
        console.log(server)

        this.chosenServer = server;
    }

    joinMastodon() {
        // open https://joinmastodon.org/servers in new tab
        window.open("https://joinmastodon.org/servers", "_blank");
    }

    render() {
        return html`
        ${
            this.loadIntro ? html`
                      <sl-dialog label="Intro To Mastodon">
                        <div id="intro-carousel">

            <div class="scroll-item">
            <h2>What is Mammoth?</h2>
            <p>
                Mammoth is the app your using 😊. It is an open source, cross-platform Mastodon client. Mammoth
                brings the best of Mastodon to any device, with a fast and intuitive interface,
                no matter your device or internet connection. To use Mammoth, you need a Mastodon account. Once you have a Mastodon account
                you will need to enter the URL of the Mastodon instance you signed up at.
            </p>

            <fluent-button appearance="lightweight" pill @click="${() => this.next()}">Next</fluent-button>

            </div>

            <div class="scroll-item">

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

            <fluent-button appearance="lightweight" pill @click="${() => this.next()}">Next</fluent-button>
            </div>

            <div class="scroll-item">

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

                <fluent-button variant="accent" pill @click="${() => this.getStarted()}">Get Started</fluent-button>
                </div>

                        </div>
        </sl-dialog>
            ` : null
        }

        <main>

            <div id="login-block">
                <fluent-combobox @change="${($event: any) => this.handleServerInput($event.target.value)}">
                    ${
                        this.instances.map((instance: any) => {
                            return html`
                            <fluent-option value="${instance}">${instance}</fluent-option>
                            `
                        })
                    }
                </fluent-combobox>

                <fluent-button @click="${() => this.login()}" appearance="accent">Login</fluent-button>
                <fluent-button @click="${() => this.joinMastodon()}" appearance="lightweight">Sign up for Mastodon Account</fluent-button>
            </div>

            <fluent-button @click="${() => this.openIntro()}" appearance="lightweight">Intro To Mastodon</fluent-button>

            <p>Welcome To Mammoth, your Mastodon Client</p>
        </main>
        `;
    }
}
