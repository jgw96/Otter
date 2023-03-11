import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'

@customElement('image-preview')
export class ImagePreview extends LitElement {
    @property() src: string = '';

    static styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    render() {
        return html`
            <img src=${this.src} />
        `;
    }
}
