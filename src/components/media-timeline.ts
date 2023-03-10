import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { getPaginatedHomeTimeline } from '../services/timeline';

import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import '@lit-labs/virtualizer';

import '../components/timeline-item';
import '../components/search';
import { Post } from '../interfaces/Post';

@customElement('media-timeline')
export class MediaTimeline extends LitElement {
    @state() timeline: Post[] = [];
    @state() loadingData: boolean = false;

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
                height: 241px;
                --border-radius: var(--sl-border-radius-medium);
            }

            .fake {
                animation-name: fadein;
                animation-duration: 0.3s;
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

        this.loadingData = true;
        await this.refreshTimeline();
        this.loadingData = false;

        // update data when the user scrolls to the bottom of the page
        const scroller = this.shadowRoot?.querySelector('lit-virtualizer') as any;

        type scrollEvent = {
            deltaY: number;
        }

        scroller.onoverscroll = async (e: scrollEvent) => {
            if (e.deltaY > 0) {
                if (this.loadingData) return;

                this.loadingData = true;
                await this.loadMore();
                this.loadingData = false;
            }
        }

    }

    async refreshTimeline() {

               const timelineDataMedia = await getPaginatedHomeTimeline();

               // filter out tweets that don't have media
                const updatedTimeline = (timelineDataMedia as Array<any>).filter((tweet: Post) => tweet.media_attachments.length > 0);
                console.log(timelineDataMedia);

                this.timeline = updatedTimeline;

    }

    async loadMore() {
        const timelineData = await getPaginatedHomeTimeline();
        // filter out tweets that don't have media
        const updatedTimeline = (timelineData as Array<any>).filter((tweet: Post) => tweet.media_attachments.length > 0);
        console.log(timelineData);

        this.timeline = [...this.timeline, ...updatedTimeline];
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

    render() {
        return html`
        <ul>
            <lit-virtualizer scroller .items="${this.timeline}" .renderItem="${
                (tweet: Post) => html`
                <timeline-item ?show="${true}" @replies="${($event: any) => this.handleReplies($event.detail.data)}" .tweet="${tweet}"></timeline-item>
                `
            }">
            </lit-virtualizer>
        </ul>
        `;
    }
}
