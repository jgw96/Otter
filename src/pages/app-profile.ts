import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js';
import { followUser, getAccount, getUsersPosts } from '../services/account';

import '../components/timeline-item';

import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';

@customElement('app-profile')
export class AppProfile extends LitElement {

    @state() user: any;
    @state() posts: any[] = [];
    @state() followed: boolean = false;

    static styles = [
        css`
            :host {
                display: block;
            }

            sl-badge {
                cursor: pointer;
              }

              #avatarSkel {
                width: 80px;
                height: 80px;
                border-radius: 50%;
              }

            #fields {
                display: flex;
                flex-direction: column;
                overflow-x: auto;
                margin-top: 12px;
            }

            main {
                margin-top: 80px;
                display: grid;
                grid-template-columns: 26vw 70vw;
                gap: 14px;
            }

            #profile-card-actions {
                margin-top: 2em;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            ul {

                display: flex;
                flex-direction: column;
                margin: 0px;
                padding: 0px;
                list-style: none;
                height: 88vh;
                overflow: hidden scroll;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            #profile {
                padding: 12px;
                padding-top: 0;
                border-radius: 6px;

                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }

            #fake-profile {
                padding: 12px;
                padding-top: 0;
                border-radius: 6px;

                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 400px
            }

            #fake-profile sl-skeleton {
                display: block;
                height: 400px;
                --border-radius: 4px;
            }

              #username-block {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-top: 8px;
              }

              #profile-card-actions sl-button {
                width: 100%;
              }

            #profile #avatar-block img {
                height: 5em;


                border: solid var(--sl-color-primary-600) 4px;

                position: relative;
                top: 6px;
                right: 2px;
                border-radius: 4px;
              }

              #fields sl-badge span {
                max-width: 109px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              #fields img {
                height: 22px;
              }

              #profile-top {
                    background: #2f41776b;
                    padding: 0px;
                    padding-left: 8px;
                    padding-right: 8px;
                    padding-bottom: 8px;
                    padding-top: 8px;
                    border-radius: 4px;

                    overflow-x: hidden;
                    text-overflow: ellipsis;
              }

              #avatar-block {
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                padding: 6px;
                border-radius: 4px;
              }

              #profile-top h3 {
                margin-bottom: 0;
                margin-top: 0;
              }

              #profile-top p {
                color: grey;
                font-size: 14px;
              }

              #user-url {
                margin-top: 4px;
                font-size: 12px;
              }

              @media(max-width: 600px) {
                main {
                    display: flex;
                    flex-direction: column;
                }

                ul {
                    height: initial;
                }
              }
        `
    ];

    async firstUpdated() {
        // get id from query string
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            const accountData = await getAccount(id);
            console.log(accountData);
            this.user = accountData;

            const postsData = await getUsersPosts(id);
            console.log(postsData);

            this.posts = postsData;
        }
    }

    async follow() {
        await followUser(this.user.id);
        this.followed = true;
    }

    render() {
        return html`
        <app-header ?enableBack="${true}"></app-header>

        <main>
            ${this.user ? html`
            <div id="profile">
                <div id="profile-top">
                    ${this.user ? html`
                    <div id="avatar-block" style=${styleMap({backgroundImage: `url(${this.user.header})`})}>
                        <img src="${this.user.avatar}" />
                    </div>
                    ` : null}
                    <div id="username-block">
                        <h3>${this.user ? this.user.display_name : "Loading..."}</h3>
                    </div>

                    <p id="user-url">${this.user ? this.user.url : "Loading..."}</p>

                    <div .innerHTML=${this.user ? this.user.note : "Loading..." }></div>

                    <sl-badge>${this.user ? this.user.followers_count : "Loading..."} followers</sl-badge>
                    <sl-badge>${this.user ? this.user.following_count : "Loading..."} following</sl-badge>

                    <div id="fields">
                        ${this.user ? this.user.fields.map((field: any) => html`
                        <div>
                            <sl-badge>
                                ${
                                    field.name.toLowerCase() === "twitter" ? html`<img src="/assets/logo-twitter.svg" alt="twitter logo">` : null
                                }

                               <span .innerHTML="${field.value}"></span>
                            </sl-badge>
                        </div>
                        `) : null}
                    </div>

                    <div id="profile-card-actions">
                        ${this.followed ? html`<sl-button>Following</sl-button>` : html`<sl-button
                            @click="${() => this.follow()}">Follow</sl-button>`}
                    </div>
                </div>
            </div>
            ` : html`<div id="fake-profile">
                <sl-skeleton></sl-skeleton>
            </div>`}

            <ul>
                ${this.posts.map(post => html`
                <li>
                    <timeline-item .tweet=${post}></timeline-item>
                </li>
                ` )}
            </ul>

        </main>
        `;
    }
}
