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

                contain: paint layout style;
                content-visibility: auto;
            }

            ul {
                display: flex;
                flex-direction: column;
                margin: 0;
                padding: 0;
                list-style: none;

                height: 90vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            ul::-webkit-scrollbar {
                display: none;
            }
        `
    ];

    async firstUpdated() {

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {

            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const bookmarksData = await getBookmarks();
                    console.log(bookmarksData);

                    this.bookmarks = bookmarksData;

                    observer.disconnect();
                }
            });
        }
        , options);

        observer.observe(this);

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
