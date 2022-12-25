import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { getBookmarks } from '../services/bookmarks';

import './timeline-item';

@customElement('app-bookmarks')
export class Bookmarks extends LitElement {
    @state() bookmarks = [];

    static styles = [
        css`
            :host {
                display: block;
            }

            ul {
                display: flex;
                flex-direction: column;
                gap: 14px;
                margin: 0;
                padding: 0;
                list-style: none;

                height: 88vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            ul::-webkit-scrollbar {
                display: none;
            }
        `
    ];

    async firstUpdated() {
        const bookmarksData = await getBookmarks();
        console.log(bookmarksData);

        this.bookmarks = bookmarksData;
    }

    render() {
        return html`
          <ul>
            ${
                this.bookmarks.map((bookmark: any) => {
                    return html`
                        <timeline-item .tweet=${bookmark}></timeline-item>
                    `;
                })
            }
          </ul>
        `;
    }
}
