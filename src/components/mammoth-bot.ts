import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { fluentTextArea, provideFluentDesignSystem } from '@fluentui/web-components';
import { requestMammothBot } from '../services/ai';
provideFluentDesignSystem().register(fluentTextArea());

@customElement('mammoth-bot')
export class MammothBot extends LitElement {

    @state() previousMessages: any[] = [];

    static styles = [
        css`
            :host {
                display: flex;
                flex-direction: column;
                background: #ffffff14;
                padding: 8px;
                border-radius: 8px;
            }

            fluent-text-area::part(control) {
                height: 130px;
                width: 26vw;
                overflow-y: clip;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            ul {
                padding: 0;
                margin: 0;
                list-style: none;
                width: 24.5vw;
                margin-bottom: 8px;
                max-height: 200px;
                border-radius: 6px;
                padding: 8px;
                overflow-y: auto;
                overflow-x: hidden;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            ul li {
                background: #ffffff14;
                border-radius: 6px;
                padding: 6px;
            }

            .role {
                font-weight: bold;
                text-decoration: underline;
                margin-bottom: 6px;
            }

            fluent-button {
                place-self: flex-end;
                margin-top: 6px;
            }

            fluent-button::part(control) {
                border: none;
            }

            @media(prefers-color-scheme: dark) {
                fluent-text-area::part(control), fluent-button[appearance="neutral"]::part(control), fluent-text-field::part(control), fluent-text-field::part(root) {
                    background: #1e1e1e;
                    color: white;
                }

                ul {
                    background: #1e1e1e;
                }
            }
        `
    ];

    async handleInput() {
        const value = (this.shadowRoot?.querySelector("fluent-text-area") as any).value;
        console.log("value", value);

        this.previousMessages = [
            ...this.previousMessages,
            {
            role: "user",
            content: value
        }];

        const textarea = this.shadowRoot?.querySelector("fluent-text-area") as any;
        textarea.value = "";

        const data = await requestMammothBot(value, this.previousMessages);
        console.log("data", data);

        const response = data.choices[0].message;

        this.previousMessages = [
            ...this.previousMessages,
            response
        ]

        // scroll list to last item in the list
        const list = this.shadowRoot?.querySelector("ul") as any;
        list.scrollTop = list.scrollHeight;

        list.scrollTo(0, list.scrollHeight);
    }

    render() {
        return html`
            <ul>
                ${
                    this.previousMessages.map((message: any) => {
                        return html`
                            <li>
                                <div class="role">${message.role}</div>
                                <div>${message.content}</div>
                            </li>
                        `;
                    })
                }
            </ul>

            <fluent-text-area placeholder="Hello, I am MammothBot. I can help you with Mastodon, such as by generating posts etc, summarizing posts and more. You can chat with me like you would anyone else, no need to talk like a robot 😊" rows="3"></fluent-text-area>

            <fluent-button @click="${() => this.handleInput()}" appearance="accent">Send</fluent-button>
        `;
    }
}
