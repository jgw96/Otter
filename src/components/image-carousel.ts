import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import { router } from '../utils/router';

@customElement('image-carousel')
export class ImageCarousel extends LitElement {

    @property({ type: Array }) images: any[] = [];

    static styles = [
        css`
            :host {
                display: block;
                width: 100%;
            }

            img {
                display: block;
                width: 100%;
            }

            video {
                width: 100%;
            }

            #list {
                display: flex;
                scroll-snap-type: x mandatory;
                overflow-x: scroll;
                scroll-behavior: smooth;
            }

            #list div {
                width: 100%;
                flex-shrink: 0;
                scroll-snap-align: start;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            #list::-webkit-scrollbar {
                display: none;
            }
        `
    ];

    firstUpdated() {
        console.log("image-carousel", this.images)
    }

    async openInBox(image: any) {
        console.log("show image", image);

        if ("startViewTransition" in document) {
            // @ts-ignore
            this.style.viewTransitionName = "image-preview";

            //@ts-ignore
            await document.startViewTransition();
            router.navigate(`/imagepreview?src=${image.url}&desc=${image.description}`);

                setTimeout(() => {
                    // @ts-ignore
                    this.style.viewTransitionName = '';
                }, 800)
        }
        else {
            router.navigate(`/imagepreview?src=${image.url}&desc=${image.description}`);
        }

    }

    generateTemplateBasedOnType(image: any) {
        switch (image.type) {
            case "image":
                return html`
                <div @click="${() => this.openInBox(image)}">
                  <img loading="lazy" src="${image.preview_url}" alt="${image.description}" />
                </div>
                `;
            case "video":
                return html`<video controls src="${image.url}"></video>`;
            case "gifv":
                return html`<video autoplay loop src="${image.url}"></video>`;
            default:
                return null;
        }
    }

    render() {
        return html`
            <div id="list">
                ${this.images.map(image =>
                    image.type === "image" ? html`
                <div @click="${() => this.openInBox(image)}">
                  <img loading="async" src="${image.preview_url}" alt="${image.description}" />
                </div>
                ` : image.type === "video" ? html`
                <div>
                  <video controls src="${image.url}"></video>
                </div>
                ` : null) }
            </div>
        `;
    }
}
