import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { getPaginatedHomeTimeline, getPublicTimeline } from '../services/timeline';

import '../components/timeline-item';

@customElement('app-timeline')
export class Timeline extends LitElement {
    @state() timeline: any[] = [];
    @state() loadingData: boolean = false;

    @property({ type: String }) type: "Home" | "Public" = "Home";

    static styles = [
        css`
            :host {
                display: block;
            }

            #list-actions {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 12px;

                background: #242428;
                padding: 8px;
                border-radius: 4px;
            }

            ul {
                display: flex;
                flex-direction: column;
                gap: 14px;
                margin: 0;
                padding: 0;
                list-style: none;

                height: 81vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            sl-card {
                --padding: 10px;
            }

            sl-card img {
                height: 302px;
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
        `
    ];

    async firstUpdated() {
        this.loadingData = true;
        await this.refreshTimeline();
        this.loadingData = false;

        // setup intersection observer
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadingData = true;
                    this.loadMore();
                    this.loadingData = false;
                }
            });
        }

        , options);

        const target = this.shadowRoot?.querySelector('#load-more');
        observer.observe(target!);
    }

    async refreshTimeline() {
        switch (this.type) {
            case "Home":
                const timelineData = await getPaginatedHomeTimeline();
                console.log(timelineData);

                this.timeline = timelineData;
                break;
            case "Public":
                const timelineDataPub = await getPublicTimeline();
                console.log(timelineData);

                this.timeline = timelineDataPub;
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

    render() {
        return html`
        <div id="list-actions">
            <sl-button @click="${() => this.refreshTimeline()}" circle size="small">
              <sl-icon src="/assets/refresh-circle-outline.svg"></sl-icon>
            </sl-button>
        </div>

        <ul>
          ${
            this.timeline.map((tweet: any) => {
                return html`
                  <timeline-item ?show="${true}" @replies="${($event: any) => this.handleReplies($event.detail.data)}" .tweet="${tweet}"></timeline-item>
                    `
            })
            }

            <sl-button ?loading="${this.loadingData}" id="load-more" @click="${() => this.loadMore()}">Load More</sl-button>
        </ul>
        `;
    }
}
