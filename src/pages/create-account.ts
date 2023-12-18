import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { getServers } from '../services/account';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

import { fluentButton, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentButton())


@customElement('create-account')
export class CreateAccount extends LitElement {
    @state() servers: any[] = [];
    @state() chosenServer: string | undefined = "";
    @state() fullDesc: string | undefined = "";
    @state() registered: boolean = false;

    @state() filledValues: any[] = [];

    static styles = [
        css`
            :host {
                display: block;
            }

            main {
                padding: 10px;
                padding-top: 60px;

                overflow-y: auto;
                height: 88vh;
            }

            main ul {
                list-style: none;
                margin: 0;
                padding: 0;

                display: grid;
                gap: 12px;
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            }

            li {
                background: #ffffff12;
                border-radius: 10px;
                padding: 10px;
            }

            li img {
                width: 100%;
                border-radius: 10px;
                height: 160px;
                object-fit: cover;
                display: block;
            }

            li .info {
                overflow: hidden;
                margin-top: 12px;
                height: 22ch;
            }

            li .name {
                font-size: 20px;
                font-weight: bold;
                display: block;
                margin-top: 6px;
            }

            #inputs {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top:  2em;
            }

            fluent-button {
                width: 100%;
            }

            @media(prefers-color-scheme: dark) {
                fluent-text-area::part(control), fluent-button[appearance="neutral"]::part(control), fluent-text-field::part(control), fluent-text-field::part(root) {
                    background: #1e1e1e;
                    color: white;
                }
            }

            @media(prefers-color-scheme: light) {
                li {
                    background: rgb(0 0 0 / 7%);
                }
            }

        `
    ];

    protected async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        const servers = await getServers();
        console.log("servers", servers)

        this.servers = servers.instances;
    }

    startRegister(serverInfo: any) {
        this.chosenServer = serverInfo.name;
        this.fullDesc = serverInfo.info.full_description;
        const dialog = this.shadowRoot?.querySelector('#create-dialog');
        // @ts-ignore
        dialog?.show();
    }

    async doRegister() {
        this.registered = true;

        const createDialog = this.shadowRoot?.querySelector('#create-dialog');
        // @ts-ignore
        await createDialog?.hide();

        console.log("this.chosenServer", this.chosenServer)
        window.open(`https://${this.chosenServer}/auth/sign_up`, "_blank");

    }

    registerInputChange(id: string) {
        this.filledValues.push(id);

        console.log("filledValues", this.filledValues)

        if (this.filledValues.includes("username") && this.filledValues.includes("password") && this.filledValues.includes("email")) {
            const button = this.shadowRoot?.querySelector('fluent-button') as HTMLElement;
            button.removeAttribute("disabled");
        }
    }


    render() {
        return html`
          <app-header ?enableBack=${true}></app-header>

          <sl-dialog id="create-dialog" label="Create Account">
            <span .innerHTML="${this.fullDesc}"></span>

            <fluent-button @click="${() => this.doRegister()}" slot="footer" appearance="accent">Go Create An Account</fluent-button>
          </sl-dialog>

          <sl-dialog id="registered-dialog" label="Account Created">
            <p>A confirmation email has been sent to the provided email address, please click the link in the email to confirm your account</p>

            <fluent-button appearance="accent">Account Confirmed, Login</fluent-button>
          </sl-dialog>

          <main>
            <h1>Create Account</h1>
            <p>Mastodon is a decentralized social network that allows users to create and join communities of their interest. To use Mastodon, you need to choose a server that hosts your account and connects you to other servers. Choosing a server is an important decision, as it affects your privacy, moderation, and content policies. You can browse the list of servers below to find one that suits your needs and preferences. Once you have created an account at your chosen server,
                come back to Otter and login to start using Otter as your Mastodon client.
            </p>

            <ul>
                ${this.servers.map((server) => {
            return html`

                        <li>
                            <img src="${server.thumbnail}" alt="${server.name} thumbnail" />
                            <div class="info">
                                <div class="tags">
                                    <sl-badge apperance="accent">${server.users} users</sl-badge>
                                </div>
                              <span class="name">${server.name}</span>

                              <p>${server.info.short_description ||"No Description..."}</p>
                            </div>

                            <fluent-button @click="${() => this.startRegister(server)}">Create Account</fluent-button>
                        </li>
                    `
        })}
            </ul>
          </main>
        `;
    }
}
