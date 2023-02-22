import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';

import '../components/user-profile';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import { getSettings, Settings } from '../services/settings';

// import * as blurhash from "blurhash-wasm";

// @ts-ignore
import ImgWorker from '../utils/img-worker?worker';

@customElement('timeline-item')
export class TimelineItem extends LitElement {
    @property({ type: Object }) tweet: any;
    @property({ type: Boolean }) show: boolean = false;

    @state() isBoosted = false;
    @state() isReblogged = false;
    @state() isBookmarked = false;

    @state() settings: Settings | undefined;

    canvas = document.createElement('canvas');
    ctx = this.canvas.getContext('bitmaprenderer');

    worker: Worker | undefined;

    static styles = [
        css`
            :host {
                display: block;

                width: 100%;

                margin-bottom: 10px;
            }

            img[data-src] {
                opacity: 0;
            }

            img {
                opacity: 1;
                transition: opacity 0.3s ease-in-out;
            }

            .status-link-card {
                display: flex;
                align-items: center;
                justify-content: space-around;
                gap: 10px;
                background: rgb(255 255 255 / 11%);
                border-radius: 6px;
                padding: 10px;
            }

            .status-link-card a {
                display: flex;
                align-items: center;
                justify-content: space-around;
                gap: 10px;
            }

            .status-link-card img {
                width: 100%;
                max-width: 300px;
                border-radius: 6px;
                height: initial;
            }

            .status-link-card__content p {
                margin-top: 6px;

                white-space: nowrap;
                max-width: 40vw;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .status-link-card__title {
                padding: 0;
                margin: 0;
            }


            sl-card {
                --padding: 10px;
                width: 100%;

                --sl-panel-background-color: #1b1d26;
                color: white;

                animation: slideUp 0.3s ease-in-out;
            }

            sl-card a {
                color: var(--sl-color-secondary-700);
            }

            sl-card::part(base) {
                border: none;
            }

            sl-card::part(body) {
                padding-top: 0;
            }

            sl-card sl-icon {
                color: var(--sl-color-primary-600);
                color: var(--sl-color-primary-600);
            }

            sl-card img {
                height: 420px;
                object-fit: contain;

                border-radius: 6px 6px 0px 0px;
            }

            .header-block {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .header-block img {
                height: 62px;
                border-radius: 50%;
            }

            .header-block h4 {
                margin-bottom: 0;
            }

            .actions {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
            }

            .actions sl-button::part(base) {
                background: transparent;
                border: none;
                font-size: 1.2em;
                color: var(--sl-color-primary-600);
            }

            .actions sl-icon svg {
                color: var(--sl-color-primary-600);
                fill: var(--sl-color-primary-600);
            }

            .actions sl-button::part(base):hover {
                background: #ffffff4f;
            }

            img {
                background: #ffffff4f;
            }

            @media(prefers-color-scheme: dark) {
                img {
                    background: rgb(24 25 31);
                }
            }

            actions sl-button sl-icon {
                font-size: 1.2em;
            }

            sl-card::part(footer) {
                border-top: none;
            }

            .replyCard {
                margin-left: 15px;
                width: 96%;
            }

            #reply-to {
                height: 33px;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                padding-left: 16px;
                font-size: 18px;
                color: white;
                margin-top: 6px;
            }

            @media(max-width: 600px) {
                .actions {
                    justify-content: space-between;
                }
            }

            @media(prefers-color-scheme: light) {
                sl-card {
                    --sl-panel-background-color: white;
                    color: #000000e3;
                }

                #reply-to {
                    color: black;
                }

                sl-card sl-icon {
                    fill: white;
                    color: white;
                }

                .actions sl-button::part(base) {
                    color: white;
                }
            }

            @keyframes slideUp {
                0% {
                    transform: translateY(30px);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `
    ];

    async firstUpdated( ) {
        this.settings = await getSettings();

        if (!this.settings.data_saver) {
            // set up intersection observer
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(async entry => {
                    if (entry.isIntersecting) {
                        if (this.settings?.sensitive === false && this.tweet.sensitive === false) {
                            await this.loadImage();
                        }
                        else if (this.settings?.sensitive === true) {
                            await this.loadImage();
                        }

                        observer.unobserve(entry.target);
                    }
                });
            }
            , options);

            observer.observe(this.shadowRoot?.querySelector('sl-card') as Element);
        }

        if(this.tweet.in_reply_to_id !== null) {
            const { getAStatus } = await import('../services/timeline');
          const replyStatus = await getAStatus(this.tweet.in_reply_to_id);

          this.tweet.reply_to = replyStatus;
        }
    }

    async loadImage() {
       // window.requestIdleCallback(() => {

            const img = this.shadowRoot?.querySelector('img');

            if (img) {

                const src = img.getAttribute('data-src');

                // handle blurhash
                if (this.tweet.media_attachments[0] && this.tweet.media_attachments[0].blurhash) {
                    console.log("has blurhash", this.tweet.media_attachments[0].blurhash);
                    try {
                        this.worker = new ImgWorker();

                              this.canvas.width = this.tweet.media_attachments[0].meta.original.width;
                              this.canvas.height = this.tweet.media_attachments[0].meta.original.height;

                              this.worker!.onmessage = (e) => {
                                console.log("worker message", e.data)
                                // e.data is a bitmap
                                // display bitmap on canvas
                                this.ctx!.transferFromImageBitmap(e.data!)

                                img.setAttribute('src', this.canvas.toDataURL());

                                img.removeAttribute('data-src');

                                        if (src) {
                                            const placeholderImage = new Image();

                                            img.onload = () => {
                                                window.requestIdleCallback(() => {
                                                    // remove event listener

                                                    img.removeAttribute('data-src');

                                                }, {
                                                    timeout: 1000
                                                })
                                            }

                                            placeholderImage.onload = () => {
                                                img.setAttribute('src', src);
                                            };

                                            placeholderImage.src = src;
                                        }
                                    // }
                                //}, {
                                //    timeout: 3000
                                //})

                                this.worker!.terminate();
                              }
                                this.worker!.postMessage({
                                    hash: this.tweet.media_attachments[0].blurhash,
                                    width: this.tweet.media_attachments[0].meta.original.width,
                                    height: this.tweet.media_attachments[0].meta.original.height
                                });
                        // }, {
                        //     timeout: 3000
                        // });
                    } catch (error) {
                        console.log(error);
                    }
                }
                else {
                    console.log('in here', src);
                                    // start loading real image
                if (src) {
                    const placeholderImage = new Image();

                    img.onload = () => {
                        window.requestIdleCallback(() => {
                            // if (!this.tweet.media_attachments[0] || !this.tweet.media_attachments[0].blurhash) {
                                img.removeAttribute('data-src');
                            // }
                            // remove event listener
                            img.onload = null;
                        }, {
                            timeout: 1000
                        })
                    }

                    placeholderImage.onload = () => {
                        img.setAttribute('src', src);
                    };

                    placeholderImage.src = src;
                }
                }
            }
       // }, {
       //     timeout: 1000
       // })
    }

    async favorite(id: string) {
        console.log("favorite", id);

        const { boostPost } = await import('../services/timeline');
        await boostPost(id);

        this.isBoosted = true;

        // fire custom event
        this.dispatchEvent(new CustomEvent('favorite', {
            detail: {
                id
            }
        }));
    }

    async reblog(id: string) {
        console.log("reblog", id);

        const { reblogPost } = await import('../services/timeline');
        await reblogPost(id);

        this.isReblogged = true;

        // fire custom event
        this.dispatchEvent(new CustomEvent('reblog', {
            detail: {
                id
            }
        }));
    }

    async bookmark(id: string) {
        console.log("bookmark", id);
        const { addBookmark } = await import('../services/bookmarks');
        await addBookmark(id);

        this.isBookmarked = true;
    }

    async replies(id: string) {
        const { getReplies } = await import('../services/timeline');
      const data = await getReplies(id);
      console.log(data);

        // fire custom event
        this.dispatchEvent(new CustomEvent('replies', {
            detail: {
                data: data.descendants,
                id
            }
        }));
    }

    openInBox(imageURL: string) {
        console.log("open image", imageURL)
        this.dispatchEvent(new CustomEvent('openimage', {
            detail: {
                imageURL
            }
        }));
    }

    async analyzeStatus(tweet: any) {

        const { analyzeStatusText, analyzeStatusImage } = await import('../services/ai');
        const data = await analyzeStatusText(tweet.reblog ? tweet.reblog.content : tweet.content);

        let imageData: any = null;
        const imageURL = tweet.reblog ? tweet.reblog.media_attachments[0].preview_url : tweet.media_attachments[0]?.preview_url;

        if (imageURL) {
          imageData = await analyzeStatusImage(imageURL);
        }

        if (data) {
            console.log(data);

            this.dispatchEvent(new CustomEvent('analyze', {
                detail: {
                    data,
                    imageData: imageData ? imageData : null,
                    tweet
                }
            }));
        }

    }

    render() {
        return html`
          ${this.tweet.reblog === null || this.tweet.reblog === undefined ? html`
                ${
                    this.tweet.reply_to !== null && this.tweet.reply_to !== undefined ? html`
                      <sl-card part="card">
                        <user-profile .account="${this.tweet.reply_to.account}"></user-profile>
                        <div .innerHTML="${this.tweet.reply_to.content}"></div>

                        <div class="actions" slot="footer">
                          <sl-button pill @click="${() => this.analyzeStatus(this.tweet)}">
                            <sl-icon src="/assets/search-outline.svg"></sl-icon>
                          </sl-button>

                          ${this.show === true ? html`<sl-button pill @click="${() => this.replies(this.tweet.reply_to.id)}">
                          <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
                          </sl-button>` : null}

                          <sl-button ?disabled="${this.isBookmarked || this.tweet.reply_to.bookmarked}" pill @click="${() => this.bookmark(this.tweet.reply_to.id)}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></sl-button>
                          ${this.settings && this.settings.wellness === false ? html`<sl-button ?disabled="${this.isBoosted || this.tweet.reply_to.favourited}" pill @click="${() => this.favorite(this.tweet.reply_to.id)}">${this.tweet.reply_to.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></sl-button>` : null}
                          ${this.settings && this.settings.wellness === false ? html`<sl-button ?disabled="${this.isReblogged || this.tweet.reply_to.reblogged}" pill @click="${() => this.reblog(this.tweet.reply_to.id)}">${this.tweet.reply_to.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></sl-button>` : null}
                        </div>
                      </sl-card>

                      <div id="reply-to">
                        <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
                      </div>
                    ` : null
                }


                <sl-card part="card" class="${classMap({ replyCard: this.tweet.reply_to ? true : false})}">
                      ${
                        this.tweet.media_attachments.length > 0 ? html`

                          <img part="image" slot="image" @click="${() => this.openInBox(this.tweet.media_attachments[0].preview_url)}" data-src="${this.tweet.media_attachments[0].preview_url}">

                        ` : html``
                      }

                        <user-profile .account="${this.tweet.account}"></user-profile>
                        <div .innerHTML="${this.tweet.content}"></div>

                        <div class="actions" slot="footer">
                        <sl-button pill @click="${() => this.analyzeStatus(this.tweet)}">
                            <sl-icon src="/assets/search-outline.svg"></sl-icon>
                          </sl-button>
                          ${this.show === true ? html`<sl-button pill @click="${() => this.replies(this.tweet.id)}">
                          <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
                        </sl-button>` : null}
                          <sl-button ?disabled="${this.isBookmarked || this.tweet.bookmarked}" pill @click="${() => this.bookmark(this.tweet.id)}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></sl-button>
                          ${this.settings && this.settings.wellness === false ? html`<sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.favorite(this.tweet.id)}">${this.tweet.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></sl-button>` : null}
                          ${this.settings && this.settings.wellness === false ? html`<sl-button ?disabled="${this.isReblogged || this.tweet.reblogged}" pill @click="${() => this.reblog(this.tweet.id)}">${this.tweet.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></sl-button>` : null}
                        </div>
                    </sl-card>
                    ` : html`
                    <sl-card slot="card">
                    ${
                        this.tweet.reblog.media_attachments.length > 0 ? html`

<img part="image" slot="image" @click="${() => this.openInBox(this.tweet.reblog.media_attachments[0].preview_url)}" data-src="${this.tweet.reblog.media_attachments[0].preview_url}">
                        ` : html``
                      }

                        <div class="header-block" slot="header">

                            <user-profile ?small="${true}" .account="${this.tweet.account}"></user-profile>
                              <span>boosted</span>
                            <user-profile ?small="${true}"  .account="${this.tweet.reblog.account}"></user-profile>
                        </div>
                        <h5>${this.tweet.reblog.account.acct} posted</h5>

                        <div .innerHTML="${this.tweet.reblog.content}"></div>

                        <div class="actions" slot="footer">
                        <sl-button pill @click="${() => this.analyzeStatus(this.tweet)}">
                            <sl-icon src="/assets/search-outline.svg"></sl-icon>
                          </sl-button>
                        ${this.show === true ? html`<sl-button pill @click="${() => this.replies(this.tweet.id)}">
                            <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
                        </sl-button>` : null}
                            <sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.bookmark(this.tweet.id)}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></sl-button>
                            ${this.settings && this.settings.wellness === false ? html`<sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.favorite(this.tweet.id)}">${this.tweet.reblog.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></sl-button>` : null}
                            ${this.settings && this.settings.wellness === false ? html`<sl-button ?disabled="${this.isReblogged || this.tweet.reblogged}"  pill @click="${() => this.reblog(this.tweet.id)}">${this.tweet.reblog.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></sl-button>` : null}
                        </div>
                    </sl-card>


                    `}

        `;
    }
}
