import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/menu-label/menu-label.js';
import { searchTimeline } from '../services/timeline';

import { router } from '../utils/router';

@customElement('app-search')
export class Search extends LitElement {
    @state() searchData: any | undefined;
    static styles = [
        css`
            :host {
                display: block;
            }

            .avatar {
                width: 24px;
                height: 24px;
                border-radius: 50%;
            }

            .account {
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `
    ];

    protected async firstUpdated() {
        const searchData = await searchTimeline("Mastodon");
        console.log("searchData", searchData);

        this.searchData = searchData;

        // fire custom event
        const event = new CustomEvent('search', {
            detail: {
                searchData
            }
        });
        this.dispatchEvent(event);
    }

    async handleSearch(value: string) {
        console.log(value);

        // const dropdown: any = this.shadowRoot?.querySelector('sl-dropdown');

        const searchData = await searchTimeline(value);
        console.log("searchData", searchData);

        this.searchData = searchData;

        // fire custom event
        const event = new CustomEvent('search', {
            detail: {
                searchData
            }
        });
        this.dispatchEvent(event);

        // await dropdown?.show();
    }

    openAccount(id: string) {
        router.navigate(`/account?id=${id}`);
    }

    render() {
        return html`

            <sl-input @sl-change="${($event: any) => this.handleSearch($event.target.value)}" placeholder="Search" type="search"></sl-input>

        `;
    }
}
