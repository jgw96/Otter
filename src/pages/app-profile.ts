import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { followUser, getAccount, getUsersPosts } from '../services/account';

import '../components/timeline-item';

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
                gap: 14px;
                margin: 0px;
                padding: 0px;
                list-style: none;
                height: 88vh;
                overflow: hidden scroll;
            }

            #profile {
                padding: 12px;
                padding-top: 14px;
                background: rgb(24 31 52);
                border-radius: 6px;

                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }

              #username-block {
                display: flex;
                align-items: center;
                gap: 14px;
                justify-content: space-between;
                margin-top: 8px;
              }

              #profile-card-actions sl-button {
                width: 100%;
              }

            #profile img {
                height: 5em;
                border-radius: 50%;
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
                    ${this.user ? html`<img src="${this.user.avatar}" />` : html`<img src="https://via.placeholder.com/150" />`}
                    <div id="username-block">
                        <h3>${this.user ? this.user.display_name : "Loading..."}</h3>
                    </div>

                    <p id="user-url">${this.user ? this.user.url : "Loading..."}</p>

                    <div .innerHTML=${this.user ? this.user.note : "Loading..."}></div>

                    <sl-badge>${this.user ? this.user.followers_count : "Loading..."} followers</sl-badge>
                    <sl-badge>${this.user ? this.user.following_count : "Loading..."} following</sl-badge>

                    <div id="profile-card-actions">
                        ${this.followed ? html`<sl-button>Following</sl-button>` : html`<sl-button @click="${() => this.follow()}">Follow</sl-button>` }
                    </div>
                </div>
            </div>
            ` : null}

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
