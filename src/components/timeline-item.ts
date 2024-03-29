import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';

import '../components/user-profile';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import '../components/image-carousel';

// import { getSettings, Settings } from '../services/settings';

// import * as blurhash from "blurhash-wasm";

import { fluentButton, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentButton());

// @ts-ignore
import ImgWorker from '../utils/img-worker?worker';
import { router } from '../utils/router';
import { Post } from '../interfaces/Post';
// import { enableVibrate } from '../utils/handle-vibrate';

@customElement('timeline-item')
export class TimelineItem extends LitElement {
    @property({ type: Object }) tweet: Post | undefined;
    @property({ type: Boolean }) show: boolean = false;
    @property({ type: Boolean }) showreply: boolean = false;

    @state() isBoosted = false;
    @state() isReblogged = false;
    @state() isBookmarked = false;

    @state() settings: any | undefined;

    @state() currentUser: any;

    worker: Worker | undefined;

    device: "mobile" | "desktop" = "mobile";

    static styles = [
        css`
            :host {
                display: block;

                width: 100%;

                margin-bottom: 10px;
            }

            sl-card {
                content-visibility: auto;
                cursor: pointer;

                border-radius: 8px;

                animation-name: slideUp;
                animation-duration: 0.3s;
                animation-fill-mode: forwards;
            }

            .boosted-by {
                flex: 2;
            }

            .boosted-by span {
                font-size: 12px;

                margin-bottom: 6px;
                display: block;
            }

            @media(prefers-color-scheme: dark) {
                fluent-button::part(control) {
                    --neutral-fill-stealth-active: #1b1d26;
                    --neutral-fill-stealth-hover: #1b1d26;
                }
            }

            fluent-button::part(content) {
                display: flex;
                align-items: center;
                gap: 2px;
            }

            .sensitive {
                background: rgb(32 32 35);
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                border-radius: 6px;
                padding-top: 8px;
                padding-bottom: 8px;
            }

            .sensitive span {
                font-weight: bold;
                display: block;
                width: 136px;
            }

            .sensitive p {
                text-align: center;
            }

            .link-card {
                align-items: center;
                display: flex;
                gap: 10px;

                background: #ffffff0d;
                border-radius: 6px;

                overflow: hidden;
            }

            .link-card h4 {
                margin-bottom: 0;
                margin-top: 0;
            }

            .link-card img {
                height: 140px;
                border-radius: 6px;
                width: 140px;
                object-fit: cover;
            }

            .link-card-content {
                width: 52%;
            }

            .link-card-content p {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }


            @media(prefers-color-scheme: light) {
                sl-card {
                    --sl-panel-background-color: white;
                }
            }

            @media(prefers-color-scheme: light) {
                .sensitive {
                    background: white;
                }
            }

            .header-actions-block {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-actions-block div {
                display: flex;
                align-items: center;
            }

            .header-actions-block span {
                color: #878792;
                font-size: 14px;
            }

            img[data-src] {
                opacity: 0;
            }

            img {
                opacity: 1;
                transition: opacity 0.3s ease-in-out;

                contain: content;
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

                --sl-panel-background-color: rgb(32 32 35);;
                color: white;

                overflow-x: hidden;

                content-visibility: auto;
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

            .actions fluent-button:disabled {
                color: var(--sl-color-primary-600);
            }

            .actions fluent-button::part(control) {
                opacity: 1 !important;
            }

            sl-card img {
                object-fit: cover;
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

            .actions fluent-button {
                background: transparent;
                border: none;
                font-size: 1.2em;
                color: grey;
            }

            .actions sl-icon svg {

            }

            img {
                background: #ffffff4f;
            }

            @media(prefers-color-scheme: dark) {
                img {
                    background: rgb(24 25 31);
                }
            }

            actions fluent-button sl-icon {
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
                color: var(--primary-color);
                margin-top: 6px;

                font-size: 14px;
                gap: 8px;
            }

            @media(max-width: 600px) {
                .actions {
                    justify-content: space-between;
                }
            }

            @media(prefers-color-scheme: light) {
                sl-card {
                    color: #000000e3;
                }

                #reply-to {
                    color: black;
                }

                .actions fluent-button::part(base) {
                    color: white;
                }
            }

            @media(prefers-color-scheme: light) {
                sl-card {
                    --sl-panel-background-color: white;
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

    async firstUpdated() {
        const { getSettings } = await import('../services/settings');
        this.settings = await getSettings();

        const { getCurrentUser } = await import("../services/account")
        this.currentUser = await getCurrentUser();

        this.device = window.innerWidth <= 600 ? "mobile" : "desktop";

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
                        console.log("intersected");
                        window.requestIdleCallback(() => {
                            console.log("intersected 2", this.tweet)
                            sessionStorage.setItem(`latest-read`, this.tweet?.id || "");
                            // savePlace(this.tweet?.id || "");
                        });

                        observer.unobserve(entry.target);
                    }
                });
            }
                , options);

            observer.observe(this.shadowRoot?.querySelector('sl-card') as Element);
        }

        if (this.tweet && this.tweet.in_reply_to_id !== null) {
            console.log("getting reply to status", this.tweet)
            const { getAStatus } = await import('../services/timeline');
            const replyStatus = await getAStatus(this.tweet?.in_reply_to_id || "");

            this.tweet.reply_to = replyStatus;

            this.requestUpdate();

            console.log("reply status", replyStatus);
        }

        window.requestIdleCallback(async () => {
            if (this.shadowRoot) {
                const { enableVibrate } = await import('../utils/handle-vibrate');
                enableVibrate(this.shadowRoot);
            }
        })
    }

    async favorite(id: string) {
        console.log("favorite", id);

        this.isBoosted = true;

        this.tweet && this.tweet.reblog ? this.tweet.reblog.favourites_count++ : this.tweet ? this.tweet.favourites_count++ : null;

        const { boostPost } = await import('../services/timeline');
        await boostPost(id);

        // fire custom event
        this.dispatchEvent(new CustomEvent('favorite', {
            detail: {
                id
            }
        }));
    }

    async reblog(id: string) {
        console.log("reblog", id);

        this.isReblogged = true;

        this.tweet && this.tweet.reblog ? this.tweet.reblog.reblogs_count++ : this.tweet ? this.tweet.reblogs_count++ : null;

        const { reblogPost } = await import('../services/timeline');
        await reblogPost(id);

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

    async replies() {
        await this.openPost();
    }

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

    // async analyzeStatus(tweet: Post | null) {
    //     if (tweet) {
    //         const { analyzeStatusText, analyzeStatusImage } = await import('../services/ai');
    //         const data = await analyzeStatusText(tweet.reblog ? tweet.reblog.content : tweet.content);

    //         let imageData: string | null = null;
    //         const imageURL = tweet.reblog ? tweet.reblog.media_attachments[0] ? tweet.reblog.media_attachments[0].preview_url : null : tweet.media_attachments[0] ? tweet.media_attachments[0]?.preview_url : null;

    //         if (imageURL) {
    //             imageData = await analyzeStatusImage(imageURL);
    //         }

    //         if (data) {
    //             console.log(data);

    //             this.dispatchEvent(new CustomEvent('analyze', {
    //                 detail: {
    //                     data,
    //                     imageData: imageData ? imageData : null,
    //                     tweet
    //                 }
    //             }));
    //         }
    //     }

    // }

    async shareStatus(tweet: Post | null) {
        if (tweet) {
            // share status with web share api
            if (navigator.share) {
                await navigator.share({
                    title: 'Otter',
                    text: tweet.reblog ? tweet.reblog.content : tweet.content,
                    url: `https://mastodon.social/web/statuses/${tweet.reblog ? tweet.reblog.id : tweet.id}`
                })
            }
            else {
                // fallback to clipboard api
                const url = `https://mastodon.social/web/statuses/${tweet.reblog ? tweet.reblog.id : tweet.id}`;
                await navigator.clipboard.writeText(url);
            }
        }
    }

    async openPost() {
        if (this.device === "mobile") {
            // @ts-ignore
            if ("startViewTransition" in document) {
                // @ts-ignore
                this.style.viewTransitionName = 'card';

                // @ts-ignore
                // document.startViewTransition(async () => {
                //     if (this.tweet) {
                //         const serialized = new URLSearchParams(JSON.stringify(this.tweet)).toString();

                //         await router.navigate(`/home/post?${serialized}`);

                //         setTimeout(() => {
                //             // @ts-ignore
                //             this.style.viewTransitionName = '';
                //         }, 800)
                //     }
                // });
                await document.startViewTransition();

                if (this.tweet) {
                    const serialized = new URLSearchParams(JSON.stringify(this.tweet)).toString();

                    await router.navigate(`/home/post?${serialized}`);

                    setTimeout(() => {
                        // @ts-ignore
                        this.style.viewTransitionName = '';
                    }, 800)
                }


            }
            else {
                const serialized = new URLSearchParams(JSON.stringify(this.tweet)).toString();

                await router.navigate(`/home/post?${serialized}`);
            }
        }
        else {
            // emit custom event with post
            this.dispatchEvent(new CustomEvent('open', {
                detail: {
                    tweet: this.tweet
                }
            }));
        }
    }

    async deleteStatus() {
        if (this.tweet) {
            const { deletePost } = await import('../services/posts');
            await deletePost(this.tweet.id);

            this.dispatchEvent(new CustomEvent('delete', {
                detail: {
                    id: this.tweet.id
                }
            }));
        }
    }

    async initEditStatus() {
        this.dispatchEvent(new CustomEvent('edit', {
            detail: {
                tweet: this.tweet
            }
        }));
    }

    viewSensitive() {
        if (this.tweet) {
            this.tweet.sensitive = false;
            this.requestUpdate()
        }
    }

    openLinkCard(url: string) {
        if (url) {
            window.open(url, "_blank");
        }
    }

    async summarizePost(postContent: string | null) {
        if (!postContent) return;

        // remove all html tags
        const text = postContent.replace(/(<([^>]+)>)/gi, "");

        const { summarize } = await import('../services/ai');
        const summaryData = await summarize(text);

        if (summaryData) {
            console.log(summaryData);

            this.dispatchEvent(new CustomEvent('summarize', {
                detail: {
                    data: summaryData.choices[0].message.content,
                    tweet: this.tweet
                }
            }));
        }
    }

    async translatePost(postContent: string | null) {
        if (!postContent) return;

        // remove all html tags
        const text = postContent.replace(/(<([^>]+)>)/gi, "");

        const { translate } = await import('../services/ai');
        const translateData = await translate(text);

        if (translateData) {
            console.log(translateData);

            this.dispatchEvent(new CustomEvent('summarize', {
                detail: {
                    data: translateData.choices[0].message.content,
                    tweet: this.tweet
                }
            }));
        }
    }

    render() {
        return html`
        ${this.tweet && this.tweet.sensitive === true ? html`
        <div class="sensitive">
            <span>Sensitive Content</span>
            <p>${this.tweet.spoiler_text || "No spoiler text provided"}</p>

            <fluent-button appearance="lightweight" pill @click="${() => this.viewSensitive()}">
                View
                <sl-icon src="/assets/eye-outline.svg"></sl-icon>
            </fluent-button>
        </div>
        ` : html`
        ${this.tweet?.reblog === null || this.tweet?.reblog === undefined ? html`
        ${this.tweet?.reply_to !== null && this.tweet?.reply_to !== undefined && this.show === true ? html`
                      <div id="reply-to">
                        <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
                        Thread
                      </div>

                      <sl-card part="card">
                        <user-profile .account="${this.tweet?.reply_to.account}"></user-profile>
                        <div .innerHTML="${this.tweet?.reply_to.content}"></div>

                        <div class="actions" slot="footer">
                          ${this.show === true ? html`<fluent-button appearance="lightweight" pill @click="${() => this.replies()}">
                          <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
                          </fluent-button>` : null}

                          <fluent-button appearance="lightweight" ?disabled="${this.isBookmarked || this.tweet?.reply_to.bookmarked}" pill @click="${() => this.bookmark(this.tweet?.reply_to.id || "")}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></fluent-button>
                          ${this.settings && this.settings.wellness === false ? html`<fluent-button appearance="lightweight" ?disabled="${this.isBoosted || this.tweet?.reply_to.favourited}" pill @click="${() => this.favorite(this.tweet?.reply_to.id || "")}">${this.tweet?.reply_to.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></fluent-button>` : null}
                          ${this.settings && this.settings.wellness === false ? html`<fluent-button appearance="lightweight" ?disabled="${this.isReblogged || this.tweet?.reply_to.reblogged}" pill @click="${() => this.reblog(this.tweet?.reply_to.id || "")}">${this.tweet?.reply_to.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></fluent-button>` : null}
                        </div>
                      </sl-card>
                    ` : null
                    }

                <sl-card part="card" class="${classMap({ replyCard: this.tweet?.reply_to ? true : false })}">
                      ${this.tweet && this.tweet.media_attachments.length > 0 ? html`
                          <image-carousel .images="${this.tweet.media_attachments}" slot="image">
                          </image-carousel>
                        ` : html``
                    }

                      <div class="header-actions-block" slot="header">
                        <!-- <sl-icon-button @click="${() => this.summarizePost(this.tweet?.content || null)}" src="/assets/search-outline.svg">

                        </sl-icon-button> -->

                        <!-- <sl-dropdown>
                            <sl-button size="small" pill slot="trigger" caret>AI</sl-button>
                            <sl-menu>
                                <sl-menu-item @click="${() => this.summarizePost(this.tweet?.content || null)}">Summarize</sl-menu-item>
                                <sl-menu-item @click="${() => this.translatePost(this.tweet?.content || null)}">Translate</sl-menu-item>
                            </sl-menu>
                        </sl-dropdown> -->

                        <div>
                        <sl-button size="small" @click="${() => this.translatePost(this.tweet?.content || null)}" pill>Translate</sl-button>

                        <sl-icon-button @click="${() => this.shareStatus(this.tweet || null)}" src="/assets/share-social-outline.svg">
                        </sl-icon-button>

                        ${this.tweet?.account.acct === this.currentUser?.acct ? html`
                            <sl-icon-button @click="${() => this.deleteStatus()}" src="/assets/trash-outline.svg">
                            </sl-icon-button>

                            <sl-icon-button @click="${() => this.initEditStatus()}" src="/assets/brush-outline.svg">
                            </sl-icon-button>
                            ` : null
                    }
                    </div>

                        <span>
                            ${new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                        Math.floor(-(new Date() as any - (new Date(this.tweet?.created_at || "") as any)) / 1000 / 60),
                        'minutes'
                    )
                    }
                        </span>
                      </div>

                        <user-profile .account="${this.tweet?.account}"></user-profile>
                        <div @click="${this.openPost}" .innerHTML="${this.tweet?.content}"></div>

                        ${this.tweet && this.tweet.card ? html`
                              <div @click="${() => this.openLinkCard(this.tweet?.card?.url || "")}" class="link-card">
                                <img src="${this.tweet.card.image || "/assets/bookmark-outline.svg"}" alt="${this.tweet.card.title}" />

                                <div class="link-card-content">
                                    <h4>${this.tweet.card.title}</h4>
                                    <p>${this.tweet.card.description}</p>
                                </div>
                              </div>
                            ` : null
                    }

                        <div class="actions" slot="footer">
                            ${this.show === true ? html`<fluent-button appearance="lightweight" pill @click="${() => this.replies()}">
                            <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
                            </fluent-button>` : null}
                            <fluent-button appearance="lightweight" ?disabled="${this.isBookmarked || this.tweet?.bookmarked}" pill @click="${() => this.bookmark(this.tweet?.id || "")}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></fluent-button>
                            ${this.settings && this.settings.wellness === false ? html`<fluent-button appearance="lightweight" ?disabled="${this.isBoosted || this.tweet?.favourited}" pill @click="${() => this.favorite(this.tweet?.id || "")}">${this.tweet?.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></fluent-button>` : null}
                            ${this.settings && this.settings.wellness === false ? html`<fluent-button appearance="lightweight" ?disabled="${this.isReblogged || this.tweet?.reblogged}" pill @click="${() => this.reblog(this.tweet?.id || "")}">${this.tweet?.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></fluent-button>` : null}
                        </div>
                    </sl-card>
                    ` : html`
                    <sl-card slot="card">

                      ${this.tweet.reblog && this.tweet.reblog.media_attachments.length > 0 ? html`
                         <image-carousel .images="${this.tweet.reblog.media_attachments}" slot="image">
                      </image-carousel>
                        ` : html``
                    }

                        <div class="header-block reblog-header" slot="header">
                            <user-profile ?small="${true}"  .account="${this.tweet?.reblog.account}"></user-profile>

                            <div class="boosted-by">
                                <span>Boosted by</span>
                                <user-profile boosted class="smaller-profile" ?small="${true}" .account="${this.tweet?.account}"></user-profile>
                            </div>
                            <sl-icon-button @click="${() => this.shareStatus(this.tweet || null)}" src="/assets/share-social-outline.svg">
                            </sl-icon-button>

                        </div>
                        <h5>${this.tweet?.reblog.account.acct} posted</h5>

                        <div @click="${() => this.openPost()}" .innerHTML="${this.tweet?.reblog.content}"></div>

                        <div class="actions" slot="footer">
                        ${this.show === true ? html`<fluent-button appearance="lightweight" pill @click="${() => this.replies()}">
                            <sl-icon src="/assets/chatbox-outline.svg"></sl-icon>
                        </fluent-button>` : null}
                            <fluent-button appearance="lightweight" ?disabled="${this.isBookmarked}" pill @click="${() => this.bookmark(this.tweet?.id || "")}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></fluent-button>
                            ${this.settings && this.settings.wellness === false ? html`<fluent-button appearance="lightweight" ?disabled="${this.isBoosted || this.tweet?.favourited}" pill @click="${() => this.favorite(this.tweet?.id || "")}">${this.tweet?.reblog.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></fluent-button>` : null}
                            ${this.settings && this.settings.wellness === false ? html`<fluent-button appearance="lightweight" ?disabled="${this.isReblogged || this.tweet?.reblogged}"  pill @click="${() => this.reblog(this.tweet?.id || "")}">${this.tweet?.reblog.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></fluent-button>` : null}
                        </div>
                    </sl-card>


                    `}

        `}
        `;
    }
}
