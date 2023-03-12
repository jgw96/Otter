import { LitElement, html, css } from 'lit';
import { customElement, state} from 'lit/decorators.js';

import '../components/header';

@customElement('image-preview')
export class ImagePreview extends LitElement {
    @state() src: string = '';

    static styles = [
        css`
            :host {
                display: block;
            }

            img {
                view-transition-name: image-preview;
                max-width: 100%;
            }

            main {
                padding-top: 60px;

                display: flex;
                align-items: center;
                justify-content: center;
            }
        `
    ];

    connectedCallback() {
        super.connectedCallback();
        const params = new URLSearchParams(window.location.search);
        this.src = params.get('src') || '';
    }

    render() {
        return html`
            <app-header ?enableBack="${true}"></app-header>

            <main>
              <img src=${this.src} />
            </main>
        `;
    }
}
