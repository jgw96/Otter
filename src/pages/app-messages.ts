import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js'
import { getMessages } from '../services/messages';

import '../components/header';

@customElement('app-messages')
export class AppMessages extends LitElement {
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

                height: 81vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

        `
    ];

    async firstUpdated() {
        const messages = await getMessages();
        console.log("messages", messages);
    }

    render() {
        return html`
            <ul>
                <h2>Coming soon...</h2>
            </ul>
        `;
    }
}
