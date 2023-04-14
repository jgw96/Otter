import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { Post } from '../interfaces/Post';
import { getPreviewTimeline } from '../services/timeline';

import '../components/timeline-item';

import '@lit-labs/virtualizer';

@customElement('preview-timeline')
export class PreviewTimeline extends LitElement {
    @state() timeline: any[] = [];
    @state() loadingData = false;

    static styles = [
        css`
            :host {
                display: block;
            }

            ul {
                display: flex;
                flex-direction: column;
                border-radius: 6px;
                margin: 0;
                padding: 0;
                list-style: none;
                width: 100%;

                height: 90vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            lit-virtualizer {
                height: 90vh;
                overflow-x: hidden !important;
                width: 100%;
            }

            #load-more {
                height: 10px;
            }

            ul::-webkit-scrollbar, lit-virtualizer::-webkit-scrollbar {
                display: none;
            }

            li {
                width: 100%;
            }
        `
    ];

    async firstUpdated() {
        const previewData = await getPreviewTimeline();
        this.timeline = previewData;

        // load more when the virtual scroller is at the bottom
        const virtualizer = this.shadowRoot?.querySelector('lit-virtualizer') as any;
        virtualizer.addEventListener('scroll', async (e: any) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                if (this.loadingData) return;

                this.loadingData = true;
                await this.loadMore();
                this.loadingData = false;
            }
        })
    }

    async loadMore() {
        const previewData = await getPreviewTimeline();
        this.timeline = [...this.timeline, ...previewData];
    }

    render() {
        return html`
        <ul>
            <lit-virtualizer scroller .items="${this.timeline}" .renderItem="${
                (tweet: Post) => html`
                <timeline-item ?show="${false}" .tweet="${tweet}"></timeline-item>

                `
            }">

            </lit-virtualizer>

            <li id="load-more"></li>
        </ul>
        `;
    }
}
