import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../components/search';
import { router } from '../utils/router';

@customElement('search-page')
export class SearchPage extends LitElement {

    @state() searchData: any | undefined;

    static styles = [
        css`
            :host {
                display: block;
            }

            main {
                padding-left: 16px;
                padding-right: 16px;
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

            ul {
                display: flex;
                flex-direction: column;
                gap: 14px;
                margin: 0;
                padding: 0;
                list-style: none;

                height: 77vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            li {
                cursor: pointer;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            #searchResults {
                display: flex;
                column-gap: 8px;
                padding-top: 8px;
            }

            #searchResults section {
                flex: 1;

                background: #242428;
                border-radius: 6px;
                padding: 8px;
                padding-top: 0;
            }


        `
    ];

    async handleSearch(search: any) {
        console.log(search);
        this.searchData = search.searchData;
    }

    openAccount(id: string) {
        router.navigate(`/account?id=${id}`);
    }

    handleHashtagClick(hashtag: string) {
        router.navigate(`/hashtag?tag=${hashtag}`);
    }

    render() {
        return html`
        <main>
            <app-search @search="${($event: any) => this.handleSearch($event.detail)}"></app-search>

            <sl-tab-group placement="top">
                <sl-tab slot="nav" panel="accounts">Accounts</sl-tab>
                <sl-tab slot="nav" panel="hashtags">Hashtags</sl-tab>

                <sl-tab-panel name="accounts">
                ${ this.searchData && this.searchData.accounts ? html`
                    <ul>
                    ${
                        this.searchData && this.searchData.accounts ? this.searchData.accounts.map((account: any) => {
                            return html`<li @click="${() => this.openAccount(account.id)}">
                                <div class="account">
                                    <img class="avatar" src="${account.avatar}">
                                    ${account.username}
                                </div>
                            </li>`
                        }) : null}
                    </ul>
                ` : null}
                </sl-tab-panel>

                <sl-tab-panel name="hashtags">
                ${ this.searchData && this.searchData.hashtags ? html`
                    <ul>
                    ${
                        this.searchData && this.searchData.hashtags ? this.searchData.hashtags.map((hashtag: any) => {
                            return html`<li @click="${() => this.handleHashtagClick(hashtag.name)}">
                                <div class="account">
                                    #${hashtag.name}
                                </div>
                            </li>`
                        }) : null}
                    </ul>
                ` : null}
                </sl-tab-panel>
            </sl-tab-group>

        </main>
        `;
    }
}
