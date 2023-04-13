import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { Post } from '../interfaces/Post';
import { getPreviewTimeline } from '../services/timeline';

import '../components/timeline-item';

import '@lit-labs/virtualizer';

@customElement('preview-timeline')
export class PreviewTimeline extends LitElement {
    @state() timeline: any[] = [];

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

            li {
                width: 100%;
            }
        `
    ];

    async firstUpdated() {
        const previewData = await getPreviewTimeline();
        this.timeline = previewData;
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
        </ul>
        `;
    }
}
