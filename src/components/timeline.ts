import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { getLastPlaceTimeline, getPaginatedHomeTimeline, getPreviewTimeline, mixTimeline } from '../services/timeline';

// @ts-ignore
import TimelineWorker from '../utils/timeline-worker?worker';


import '../components/md-dialog';
import '../components/md-button';
import '../components/md-icon';

import '@lit-labs/virtualizer';

import '../components/timeline-item';
import '../components/search';
import '../components/md-select';
import '../components/md-option';
import { Post } from '../interfaces/Post';

import { guard } from 'lit/directives/guard.js';

import { router } from '../utils/router';

@customElement('app-timeline')
export class Timeline extends LitElement {
    @state() timeline: Post[] = [];
    @state() loadingData: boolean = false;

    @state() imgPreview: string | undefined = undefined;

    @state() analyzeData: any | undefined = undefined;
    @state() imageDesc: string | undefined = undefined;
    @state() analyzeTweet: Post | null = null;

    @property({ type: String }) timelineType: "home" | "public" | "media" | "for you" | "home and some trending" = "home";

    static styles = [
        css`
            :host {
                display: block;
            }

            sl-dialog::part(base) {
                z-index: 99999;
            }

            #mainList li {
                width: 100%;
            }

            #list-actions {
                display: none;
                margin-bottom: 12px;

                background: var(--sl-panel-background-color);
                padding: 8px;
                border-radius: 4px;

                align-items: center;
                justify-content: space-between;
            }

            fluent-button {
                border: none;
            }

            #timeline-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                gap: 12px;
            }

            #timeline-header md-select {
                flex: 1;
                max-width: 300px;
            }

            @media(prefers-color-scheme: dark) {
                fluent-button::part(control) {
                    --neutral-fill-rest: #242428;
                    --netural-fill-stealth-active: #242428;
                    color: white;
                    border: none;
                }
            }

            #learn-more-header {
                padding-top: 0;
                margin-top: 0;
            }

            #img-preview {
                --width: 80vw;
            }

            #img-preview::part(panel) {
                height: 90vh;
            }

            #img-preview img {
                width: 100%;
                height: max-content;
                border-radius: 6px;
            }

            ul {
                display: flex;
                flex-direction: column;
                border-radius: 6px;
                margin: 0;
                padding: 0;
                list-style: none;

                height: 84vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            lit-virtualizer {
                height: 90vh;
                overflow-x: hidden !important;
            }

            ul::-webkit-scrollbar, lit-virtualizer::-webkit-scrollbar {
                display: none;
            }

            sl-card {
                --padding: 10px;
            }

            li {
                animation-name: fadein;
                animation-duration: 0.3s;
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
            }

            .fake sl-skeleton {
                height: 302px;
                --border-radius: var(--sl-border-radius-medium);
            }

            .fake {
                margin-bottom: 8px;
                animation-name: fadein;
                animation-duration: 0.3s;
            }

            #analyze ul {
                max-height: 200px;
                max-width: 390px;
                height: initial;
            }

            #analyze ul li {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
                background: var(--primary-color);
                border-radius: 6px;
                padding: 8px;
            }

            #analyze::part(panel) {
                --width: 90vw;
                height: 90vh;
            }

            #analyze::part(body) {
                display: grid;
                grid-template-columns: 29% 69%;
                gap: 16px;
            }

            #analyze timeline-item::part(image) {
                height: 200px;
            }

            #analyze timeline-item {
                overflow: hidden;
            }

            @media(max-width: 768px) {
                ul {
                    padding: 0 10px;
                }

                #timeline-header {
                    padding-left: 12px;
                    padding-right: 12px;
                }

                #timeline-header md-select {
                    max-width: none;
                }

                #analyze ul {
                    max-height: none;
                }

                #analyze::part(panel) {
                    height: 96vh;
                    --width: 96vw;
                    max-width: none;
                    max-height: none;
                }

                #analyze::part(body) {
                    display: initial;
                }

                #analyze timeline-item {
                    display: none;
                }

                #img-preview::part(panel) {
                    height: 100vh;
                    max-height: 100vh;
                    max-width: 100vw;
                    width: 100vw;
                }
            }

            @keyframes fadein {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
        `
    ];

    async connectedCallback() {
        super.connectedCallback();

        const { get } = await import("idb-keyval");
        const savedTimelineType = await get("timelineType");

        console.log("saved timeline type", savedTimelineType)

        if (savedTimelineType) {
            this.timelineType = savedTimelineType;
        }

        this.loadingData = true;
        await this.refreshTimeline();
        this.loadingData = false;

        // if (latestReadID && this.timelineType === "for you" && index > 0) {
        //     const virtualizer: any = this.shadowRoot?.querySelector('lit-virtualizer');

        //     console.log("check this", virtualizer?.element(index), index, latestReadID);
        //     virtualizer.scrollToIndex(index);
        // }

        window.requestIdleCallback(async () => {
            // setup intersection observer
            const loadMore = this.shadowRoot?.querySelector('#load-more') as any;

            const observer = new IntersectionObserver(async (entries: Array<IntersectionObserverEntry>) => {
                entries.forEach(async (entry: IntersectionObserverEntry) => {
                    if (entry.isIntersecting) {

                        if (this.loadingData) return;

                        this.loadingData = true;
                        await this.loadMore();
                        this.loadingData = false;
                    }
                });
            }
                , { threshold: 0.5 });

            observer.observe(loadMore);

        }, { timeout: 3000 });

    }

    public async refreshTimeline() {
        console.log("refreshing timeline", this.timelineType)
        switch (this.timelineType) {
            case "for you":
                const timelineDataMix = await mixTimeline("home");
                console.log("timelineData", timelineDataMix);

                this.timeline = [];
                await this.hasUpdated;

                this.timeline = timelineDataMix;

                this.requestUpdate();
                break;
            case "home and some trending":
                const timelineDataMix2 = await mixTimeline("home");
                console.log("timelineData", timelineDataMix2);

                this.timeline = [];
                await this.hasUpdated;

                this.timeline = timelineDataMix2;

                this.requestUpdate();
                break;
            case "home":
                const last_read_id = sessionStorage.getItem("latest-read");
                if (last_read_id) {
                    const timelineData = await getLastPlaceTimeline();

                    this.timeline = [];
                    await this.hasUpdated;

                    this.timeline = timelineData;

                    this.requestUpdate();
                    break;
                }

                console.log("LOOK HERE")
                const timelineData = await getPaginatedHomeTimeline("home");
                console.log("timelineData", timelineData);

                this.timeline = [];
                await this.hasUpdated;

                this.timeline = timelineData;

                this.requestUpdate();
                break;
            case "public":
                const timelineDataPub = await getPreviewTimeline();
                console.log(timelineDataPub);

                this.timeline = [];
                await this.hasUpdated;

                this.timeline = timelineDataPub;

                this.requestUpdate();
                break;
            case "media":
                console.log("media timeline")
                const timelineDataMedia = await getPaginatedHomeTimeline("home");

                // filter out tweets that don't have media
                (timelineDataMedia as Array<Post>).filter((tweet: Post) => tweet.media_attachments.length > 0);
                console.log(timelineData);

                this.timeline = timelineDataMedia;

                this.requestUpdate();
                break;

            default:
                break;
        }
    }

    async loadMore() {
        const timelineData: Post[] = await getPaginatedHomeTimeline(this.timelineType ? this.timelineType : "home");
        console.log(timelineData);

        this.timeline = [...this.timeline, ...timelineData];
    }

    handleReplies(data: Array<Post>) {
        console.log("reply", data);

        // fire custom event
        this.dispatchEvent(new CustomEvent('replies', {
            detail: {
                data
            }
        }));
    }

    async showImage(imageURL: string) {
        console.log("show image", imageURL);
        // this.imgPreview = imageURL;

        // const dialog = this.shadowRoot?.querySelector('#img-preview') as any;
        // await dialog.show();

        if ("startViewTransition" in document) {
            //@ts-ignore
            await document.startViewTransition();
            router.navigate(`/home/img-preview?src=${imageURL}`);

        }
        else {
            router.navigate(`/home/img-preview?src=${imageURL}`);
        }
    }

    async showAnalyze(data: any, imageData: any, tweet: any) {
        this.analyzeData = null;
        this.imageDesc = undefined;
        this.analyzeTweet = null;

        if (data.results && data.results?.documents[0] && data.results.documents[0].entities && data.results.documents[0].entities?.length !== 0) {
            this.analyzeData = data.results.documents[0].entities;
        }

        if (imageData) {
            this.imageDesc = imageData.descriptionResult.values[0].text;
        }

        this.analyzeTweet = tweet;


        const dialog = this.shadowRoot?.querySelector('#analyze') as any;
        await dialog.show();
    }

    async changeTimelineType(type: "home" | "public" | "media" | "for you" | "home and some trending") {
        this.timelineType = type;

        await this.refreshTimeline();

        this.requestUpdate();

        const { set } = await import('idb-keyval');

        await set('timelineType', type);
    }

    handleSummary($event: any) {
        // keep passing it up
        this.dispatchEvent(new CustomEvent('handle-summary', {
            detail: {
                data: $event.detail.data
            }
        }));
    }

    handleOpen(tweet: any) {
        this.dispatchEvent(new CustomEvent('open', {
            detail: {
                tweet
            }
        }));
    }

    render() {
        return html`

        <md-dialog id="img-preview" .open=${!!this.imgPreview} label="Image Preview">
            ${this.imgPreview ? html`<img src="${this.imgPreview}" style="width:100%;border-radius:6px;">` : null}
        </md-dialog>

        <div id="timeline-header">
            <md-select .value="${this.timelineType}" @change="${($event: any) => this.changeTimelineType($event.detail.value)}" placeholder="home">
                <md-option value="for you">for you</md-option>
                <md-option value="home and some trending">home and some trending</md-option>
                <md-option value="home">home</md-option>
                <md-option value="public">public</md-option>
            </md-select>

            <md-button circle @click="${() => this.refreshTimeline()}">
                <md-icon src="/assets/refresh-circle-outline.svg"></md-icon>
            </md-button>
        </div>



        <ul id="mainList" part="list">
            <!-- ${guard([this.timeline.length, this.timelineType], () => this.timeline.map((tweet: Post) => html`
                <li class="timeline-list-item">
                  <timeline-item @summarize="${($event: any) => this.handleSummary($event)}" tweetID="${tweet.id}" @delete="${() => this.refreshTimeline()}" @analyze="${($event: any) => this.showAnalyze($event.detail.data, $event.detail.imageData, $event.detail.tweet)}" @openimage="${($event: any) => this.showImage($event.detail.imageURL)}" ?show="${true}" @replies="${($event: any) => this.handleReplies($event.detail.data)}" .tweet="${tweet}"></timeline-item>
                </li>
            `))} -->

           <lit-virtualizer
              .items=${this.timeline}
              .renderItem=${(tweet: Post) => html`<li class="timeline-list-item"><timeline-item @open="${($event: CustomEvent) => this.handleOpen($event.detail.tweet)}" @summarize="${($event: any) => this.handleSummary($event)}" tweetID="${tweet.id}" @delete="${() => this.refreshTimeline()}" @analyze="${($event: any) => this.showAnalyze($event.detail.data, $event.detail.imageData, $event.detail.tweet)}" @openimage="${($event: any) => this.showImage($event.detail.imageURL)}" ?show="${true}" @replies="${($event: any) => this.handleReplies($event.detail.data)}" .tweet="${tweet}"></timeline-item></li>`}
            >
        </lit-virtualizer>

            <md-button variant="text" ?disabled="${this.loadingData}" id="load-more">
                Load More
            </md-button>
        </ul>
        `;
    }
}
