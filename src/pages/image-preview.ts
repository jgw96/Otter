import { LitElement, html, css } from 'lit';
import { customElement, state} from 'lit/decorators.js';

import '../components/header';

@customElement('image-preview')
export class ImagePreview extends LitElement {
    @state() src: string = '';
    @state() desc: string = '';

    static styles = [
        css`
            :host {
                display: block;
            }

            img {
                view-transition-name: image-preview;
                border-radius: 8px;
                width: 85vw;
                height: 85vh;
                object-fit: contain;
                max-width: 100%;
                max-height: 100%;
            }

            main {
                padding-top: 60px;

                display: flex;
                align-items: center;
                justify-content: center;

                flex-direction: column;
            }

            p {
                max-width: 60vw;
                text-align: center;
            }

            @media(max-width: 640px) {
                img {
                    width: 90%;
                    height: 70vh;
                }
            }
        `
    ];

    connectedCallback() {
        super.connectedCallback();
        const params = new URLSearchParams(window.location.search);
        this.src = params.get('src') || '';
        this.desc = params.get('desc') || '';
    }

    render() {
        return html`
            <app-header ?enableBack="${true}"></app-header>

            <main>
              <img src=${this.src} />

              ${this.desc && this.desc.length > 0 && this.desc !== "null" ? html`<p>${this.desc}</p>` : ''}
            </main>
        `;
    }
}
