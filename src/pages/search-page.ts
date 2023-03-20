import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../components/search';
import '../components/media-timeline';
import { router } from '../utils/router';

import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

// import fluent tabs
import { fluentTabs, fluentTab, fluentTabPanel, fluentButton, fluentTextField, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentTabs());
provideFluentDesignSystem().register(fluentTab());
provideFluentDesignSystem().register(fluentTabPanel());
provideFluentDesignSystem().register(fluentButton());
provideFluentDesignSystem().register(fluentTextField());

@customElement('search-page')
export class SearchPage extends LitElement {

    @state() searchData: any | undefined;
    @state() trending: any[] | undefined;

    static styles = [
        css`
            :host {
                display: block;

                content-visibility: auto;
                contain: layout style paint;
            }

            @media(prefers-color-scheme: dark) {
                fluent-tab {
                    color: white;
                }
            }

            fluent-tab-panel {
                margin-top: 16px;
                animation: slideFromLeft 0.3s ease-in-out;
              }

            main {
                padding-left: 10px;
                padding-right: 10px;
                padding-top: 10px;
            }

            .avatar {
                width: 24px;
                height: 24px;
                border-radius: 50%;
            }

            sl-skeleton {
                height: 20px;
                width: 138px;
            }

            .account sl-skeleton {
                margin-bottom: 10px;
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

                height: 70vh;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            media-timeline {
                height: 70vh;
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

            @keyframes slideFromLeft {
                from {
                    transform: translateX(-30%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @media(prefers-color-scheme: dark) {
                .account {
                    color: white;
                }
            }


        `
    ];

    async handleSearch(search: any) {
        console.log(search);
        this.searchData = search.searchData;

        const { getTrendingStatuses } = await import('../services/timeline');

        const trendingStatuses = await getTrendingStatuses();
        console.log("trendingStatuses", trendingStatuses);

        this.trending = trendingStatuses;
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

            <fluent-tabs placement="top">
                <fluent-tab slot="nav" panel="accounts">Accounts</fluent-tab>
                <fluent-tab slot="nav" panel="trending">Trending</fluent-tab>
                <fluent-tab slot="nav" panel="hashtags">Hashtags</fluent-tab>
                <fluent-tab slot="nav" panel="media">Media</fluent-tab>

                <fluent-tab-panel name="accounts">
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
                ` : html`
                  <div class="account">
                    <sl-skeleton></sl-skeleton>
                  </div>

                  <div class="account">
                    <sl-skeleton></sl-skeleton>
                  </div>

                  <div class="account">
                    <sl-skeleton></sl-skeleton>
                  </div>

                  <div class="account">
                    <sl-skeleton></sl-skeleton>
                  </div>

                  <div class="account">
                    <sl-skeleton></sl-skeleton>
                  </div>
                `}
                </fluent-tab-panel>


                <fluent-tab-panel name="trending">
                    <ul>
                        ${
                            this.trending ? this.trending.map((status: any) => {
                                return html`<timeline-item .tweet="${status}"></timeline-item>`
                            }) : null
                        }
                    </ul>
                </fluent-tab-panel>

                <fluent-tab-panel name="hashtags">
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
                </fluent-tab-panel>

                <fluent-tab-panel name="media">
                  <media-timeline></media-timeline>
                </fluent-tab-panel>
            </fluent-tabs>

        </main>
        `;
    }
}
