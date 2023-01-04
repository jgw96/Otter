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
        const favoritesData = await getFavorites();
        console.log(favoritesData);

        this.favorites = favoritesData;
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
