import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { getFavorites } from '../services/favorites';

@customElement('app-favorites')
export class Favorites extends LitElement {
    @state() favorites = [];

    static styles = [
        css`
            :host {
                display: block;

                content-visibility: auto;
                contain: layout style paint;
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

            @media (max-width: 768px) {
                ul {
                    padding-left: 10px;
                    padding-right: 10px;
                }
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
                    const favoritesData = await getFavorites();
                    console.log(favoritesData);

                    this.favorites = favoritesData;

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
                this.favorites.map((favorite: any) => {
                    return html`
                        <timeline-item .tweet=${favorite}></timeline-item>
                    `;
                })
            }
          </ul>
        `;
    }
}
