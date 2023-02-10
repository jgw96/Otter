import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { getHashtagTimeline } from '../services/timeline';

@customElement('app-hashtags')
export class AppHashtags extends LitElement {
    @state() data: any[] | undefined;
    @state() tag: string | null | undefined;

    static styles = [
        css`
            :host {
                display: block;
            }

            main {
                padding-top: 60px;
                padding: 10px;
            }

        `
    ];

    protected async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        // get tag from url
        const params = new URLSearchParams(window.location.search);
        const tag = params.get('tag');

        this.tag = tag;

        if (tag) {
            // get hashtag data
            const hashtagData = await getHashtagTimeline(tag);

            console.log("hashtagData", hashtagData);

            this.data = hashtagData;
        }
    }

    render() {
        return html`
          <app-header ?enableBack=${true}></app-header>

          <main>
            <h3>
                ${this.tag ? `#${this.tag}` : ''}
            </h3>

            <app-timeline .data=${this.data}></app-timeline>
          </main>
        `;
    }
}
