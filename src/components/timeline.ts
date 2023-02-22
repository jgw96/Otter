import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { getPaginatedHomeTimeline, getPublicTimeline } from '../services/timeline';

import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import '@lit-labs/virtualizer';

import '../components/timeline-item';
import '../components/search';

@customElement('app-timeline')
export class Timeline extends LitElement {
    @state() timeline: any[] = [];
    @state() loadingData: boolean = false;

    @state() imgPreview: string | undefined = undefined;

    @state() analyzeData: any | undefined = undefined;
    @state() imageDesc: string | undefined = undefined;
    @state() analyzeTweet: any | undefined = undefined;

    @property({ type: String }) timelineType: "Home" | "Public" | "Media" = "Home";

    static styles = [
        css`
            :host {
                display: block;
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

                height: 90vh;
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

            @media(max-width: 768px) {
                ul {
                    padding: 0 10px;
                }

                #img-preview::part(panel) {
                    height: initial;
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

    async firstUpdated() {
        window.requestIdleCallback(async () => {
            this.loadingData = true;
            await this.refreshTimeline(true);
            this.loadingData = false;
        }, { timeout: 3000});

        window.requestIdleCallback(async () => {
            // update data when the user scrolls to the bottom of the page
            const scroller = this.shadowRoot?.querySelector('lit-virtualizer') as any;

            scroller.onoverscroll = async (e: any) => {
                if (e.deltaY > 0) {
                    if (this.loadingData) return;

                    this.loadingData = true;
                    await this.loadMore();
                    this.loadingData = false;
                }
            }
        }, { timeout: 3000});

    }

    async refreshTimeline(cache: boolean) {
        console.log("refreshing timeline", this.timelineType)
        switch (this.timelineType) {
            case "Home":
                const timelineData = await getPaginatedHomeTimeline(cache);
                console.log("timelineData", timelineData);

                this.timeline = timelineData;
                break;
            case "Public":
                const timelineDataPub = await getPublicTimeline();
                console.log(timelineData);

                this.timeline = timelineDataPub;
                break;
            case "Media":
                console.log("media timeline")
               const timelineDataMedia = await getPaginatedHomeTimeline();

               // filter out tweets that don't have media
                (timelineDataMedia as Array<any>).filter((tweet: any) => tweet.media_attachments.length > 0);
                console.log(timelineData);

                this.timeline = timelineDataMedia;
                break;

            default:
                break;
        }
    }

    async loadMore() {
        const timelineData: any[] = await getPaginatedHomeTimeline();
        console.log(timelineData);

        this.timeline = [...this.timeline, ...timelineData];
    }

    handleReplies(data: any) {
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
        this.imgPreview = imageURL;

        const dialog = this.shadowRoot?.querySelector('#img-preview') as any;
        await dialog.show();
    }

    async showAnalyze(data: any, imageData: any, tweet: any) {
        this.analyzeData = null;
        this.imageDesc = undefined;
        this.analyzeTweet = null;

        if (data.results && data.results?.documents[0] && data.results.documents[0].entities && data.results.documents[0].entities?.length !== 0) {
            this.analyzeData = data.results.documents[0].entities;
        };

        console.log("image data", imageData)

        if (imageData) {
            this.imageDesc = imageData.descriptionResult.values[0].text;
        }

        this.analyzeTweet = tweet;


        const dialog = this.shadowRoot?.querySelector('#analyze') as any;
        await dialog.show();
    }

    render() {
        return html`

        <sl-dialog label="Analyze" id="analyze">
                <timeline-item .tweet="${this.analyzeTweet}"></timeline-item>

                <div>
                <h2>Learn More</h2>
                <p>Learn more about the subjects mentioned in this status</p>

                ${
                    this.analyzeData && this.analyzeData.length > 0 ?
                    html`
                        <ul>
                            ${this.analyzeData!.map((entity: any) => html`
                                <li>
                                    <strong>${entity.name}</strong>

                                    <sl-button size="small" pill .href="${entity.url}" target="_blank">
                                      Open in ${entity.dataSource}
                                    </sl-button>
                                </li>
                            `)}
                        </ul>
                    ` : null
                }

                ${
                    this.imageDesc ? html`
                      <h2>Image Analysis</h2>
                      <p>Learn more about the image in this status</p>

                      <strong>Image Description</strong>
                      <p>${this.imageDesc}</p>


                    ` : null
                }
                </div>
        </sl-dialog>

        <sl-dialog id="img-preview">
            ${ this.imgPreview ? html`<img .src="${this.imgPreview}">` : null}
        </sl-dialog>

        <div id="list-actions">
            <sl-button @click="${() => this.refreshTimeline(false)}" circle size="small">
              <sl-icon src="/assets/refresh-circle-outline.svg"></sl-icon>
            </sl-button>
        </div>

        <ul>
            ${this.loadingData ? html`
                <li class="fake">
                    <sl-skeleton effect="pulse"></sl-skeleton>
                </li>

                <li class="fake">
                    <sl-skeleton effect="pulse"></sl-skeleton>
                </li>

                <li class="fake">
                    <sl-skeleton effect="pulse"></sl-skeleton>
                </li>

                <li class="fake">
                    <sl-skeleton effect="pulse"></sl-skeleton>
                </li>

                <li class="fake">
                    <sl-skeleton effect="pulse"></sl-skeleton>
                </li>
            ` : null}

            <lit-virtualizer scroller .items="${this.timeline}" .renderItem="${
                (tweet: any) => html`
                <timeline-item @analyze="${($event: any) => this.showAnalyze($event.detail.data, $event.detail.imageData, $event.detail.tweet)}" @openimage="${($event: any) => this.showImage($event.detail.imageURL)}" ?show="${true}" @replies="${($event: any) => this.handleReplies($event.detail.data)}" .tweet="${tweet}"></timeline-item>
                `
            }">
            </lit-virtualizer>
        </ul>
        `;
    }
}
