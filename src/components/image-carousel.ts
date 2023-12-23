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

                max-height: 508px;
                object-fit: cover;
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

    async openInBox(imageURL: string) {
        console.log("show image", imageURL);

        if ("startViewTransition" in document) {
            // @ts-ignore
            this.style.viewTransitionName = "image-preview";

            //@ts-ignore
            await document.startViewTransition();
            router.navigate(`/imagepreview?src=${imageURL}`);

                setTimeout(() => {
                    // @ts-ignore
                    this.style.viewTransitionName = '';
                }, 800)
        }
        else {
            router.navigate(`/imagepreview?src=${imageURL}`);
        }

    }

    render() {
        return html`
            <div id="list">
                ${this.images.map(image =>
                    image.type === "image" ? html`
                <div @click="${() => this.openInBox(image.preview_url)}">
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
