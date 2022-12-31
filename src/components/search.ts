import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/menu-label/menu-label.js';
import { searchTimeline } from '../services/timeline';
import { Router } from '@vaadin/router';

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

    async handleSearch(value: string) {
        console.log(value);

        const dropdown: any = this.shadowRoot?.querySelector('sl-dropdown');

        const searchData = await searchTimeline(value);
        console.log("searchData", searchData);

        this.searchData = searchData;

        await dropdown?.show();
    }

    openAccount(id: string) {
        Router.go(`/account?id=${id}`);
    }

    render() {
        return html`
          <sl-dropdown placement="bottom">
            <sl-input slot="trigger" @sl-change="${($event: any) => this.handleSearch($event.target.value)}" placeholder="Search" type="search"></sl-input>

            <sl-menu>
                <sl-menu-label>Accounts</sl-menu-label>
                ${
                    this.searchData && this.searchData.accounts ? this.searchData.accounts.map((account: any) => {
                        return html`<sl-menu-item @click="${() => this.openAccount(account.id)}">
                            <div class="account">
                                <img class="avatar" src="${account.avatar}">
                                ${account.username}
                            </div>
                        </sl-menu-item>`
                    }) : null}

                <sl-menu-label>Hashtags</sl-menu-label>
                ${
                    this.searchData && this.searchData.hashtags ? this.searchData.hashtags.map((hashtag: any) => {
                        return html`<sl-menu-item>#${hashtag.name}</sl-menu-item>`
                    }) : null}
            </sl-menu>
          </sl-dropdown>
        `;
    }
}
