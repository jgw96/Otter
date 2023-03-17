import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

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

            @media(prefers-color-scheme: light) {
                :host {
                    background: #f3f3f3;
                }
            }

            span {
                font-size: 10px;
                margin-bottom: 7px;
                margin-left: 4px;
                color: #d2d2d2;
            }

            fluent-text-area::part(control) {
                height: 130px;
                width: 26vw;
                overflow-y: clip;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            .wrapper {
                display: flex;
                justify-content: space-between;
                align-items: center;
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

            .copy-button {
                background: #ffffff14;
                backdrop-filter: blur(40px);
                border: none;
                border-radius: 6px;

                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px;
            }

            @media(prefers-color-scheme: light) {
                .copy-button {
                    background: var(--primary-color);
                }
            }

            .copy-button img {
                height: 12px;
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

            @media(max-width: 600px) {
                fluent-text-area::part(control) {
                    display: block;
                    width: 100%;
                }

                ul {
                    width: 95%;
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

    copyContent(content: string) {
        // copy to clipboard
        navigator.clipboard.writeText(content);
    }

    render() {
        return html`
           <span>alpha</span>
            <ul>
                ${
                    this.previousMessages.map((message: any) => {
                        return html`
                            <li>
                                <div class="wrapper">
                                  <div class="role">${message.role}</div>

                                  <button @click="${() => this.copyContent(message.content)}" class="copy-button">
                                    <img src="/assets/copy-outline.svg">
                                  </button>
                                </div>
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
