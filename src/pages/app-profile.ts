import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js';
import { checkFollowing, followUser, getAccount, getUsersPosts } from '../services/account';

import '../components/timeline-item';

import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';

@customElement('app-profile')
export class AppProfile extends LitElement {

    @state() user: any;
    @state() posts: any[] = [];
    @state() followed: boolean = false;
    @state() showMiniProfile: boolean = false;

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

            #mini-profile {
                position: fixed;
                top: 10px;
                background: rgb(98 99 105 / 19%);
                left: 15vw;
                right: 15vw;
                border-radius: 6px;
                backdrop-filter: blur(40px);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px;

                z-index: 100;

                animation-name: slidedown;
                animation-duration: 0.3s;
            }

            #mini-profile p {
                padding: 8px;
                margin: 0;
                font-weight: bold;
            }

            #avatar-mini {
                display: flex;
                align-items: center;
                gap: 2px;
            }

            #avatar-mini img {
                height: 40px;
                border-radius: 50%;
                border: solid 2px var(--sl-color-primary-600);
            }

            main {
                margin-top: 80px;
                display: grid;
                gap: 14px;
                grid-template-columns: auto;
                padding-left: 14vw;
                padding-right: 14vw;
            }

            #profile-card-actions {
                margin-top: 2em;
                gap: 4px;

                display: flex;
                justify-content: flex-end;
                align-items: center;
                flex-direction: row;
            }

            #profile-card-actions sl-button::part(base) {
                width: 110px;
            }

            ul {

                display: flex;
                flex-direction: column;
                margin: 0px;
                padding: 0px;
                list-style: none;
                overflow: hidden scroll;

                border-radius: 6px;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            #profile {
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

            #profile #avatar-block img {
                height: 5em;


                border: solid var(--sl-color-primary-600) 4px;

                position: relative;
                top: 6px;
                right: 2px;
                border-radius: 4px;
              }

              #fields sl-badge span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 400px;
              }

              #fields img {
                height: 22px;
              }

              #profile-top {
                    padding: 0px;
                    padding-left: 8px;
                    padding-right: 8px;
                    padding-bottom: 8px;
                    padding-top: 8px;
                    border-radius: 4px;

                    background: #1b1d26;

                    overflow-x: hidden;
                    text-overflow: ellipsis;
              }

              #avatar-block {
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                padding: 6px;
                border-radius: 4px;
                height: 280px;

                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-end;
                padding-bottom: 10px;
              }

              #profile-top h3 {
                margin-bottom: 0;
                margin-top: 0;
              }

              #profile-top p {
                color: white;
                font-size: 15px;
              }

              #user-url {
                margin-top: 4px;
                font-size: 12px;
              }

              @media(max-width: 600px) {
                main {
                    display: flex;
                    flex-direction: column;

                    padding-left: 10px;
                    padding-right: 10px;
                }

                ul {
                    height: initial;
                }

                #mini-profile {
                    right: 14px;
                    left: 14px;
                    bottom: 10px;
                    top: initial;

                    animation-name: slideup;
                    animation-duration: 0.3s;
                }
              }

              @keyframes slideup {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }

                to {
                    transform: translateY(0);
                    opacity: 1;
                }
              }

              @keyframes slidedown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }

                to {
                    transform: translateY(0);
                    opacity: 1;
                }
              }
        `
    ];

    async firstUpdated() {
        // get id from query string
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            const followCheck = await checkFollowing(id);
            console.log('followCheck', followCheck)
            this.followed = followCheck[0].following;

            const accountData = await getAccount(id);
            console.log(accountData);
            this.user = accountData;

            const postsData = await getUsersPosts(id);
            console.log(postsData);

            this.posts = postsData;
        }

        window.requestIdleCallback(() => {
            // set up intersection observer
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.5
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log('intersecting');

                        window.requestIdleCallback(async () => {
                            this.showMiniProfile = !this.showMiniProfile;
                        })
                    }
                })
            }
            , options);

            // get second child element of postsList
            const secondChild = this.shadowRoot!.querySelector('ul')!.children[1] as HTMLElement;

            observer.observe(secondChild!);
        })
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
                            <sl-badge variant="primary">
                                ${
                                    field.name.toLowerCase() === "twitter" ? html`<img src="/assets/logo-twitter.svg" alt="twitter logo">` : null
                                }

                               <span .innerHTML="${field.value}"></span>
                            </sl-badge>
                        </div>
                        `) : null}
                    </div>

                    <div id="profile-card-actions">
                        ${this.followed ? html`<sl-button pill disabled>Following</sl-button>` : html`<sl-button pill variant="primary"
                            @click="${() => this.follow()}">Follow</sl-button>`}
                    </div>
                </div>
            </div>
            ` : html`<div id="fake-profile">
                <sl-skeleton></sl-skeleton>
            </div>`}

            ${
                this.showMiniProfile && this.user ? html`
                <div id="mini-profile">
                    <div id="avatar-mini">
                        <img src="${this.user.avatar}" />

                        <p>${this.user.display_name}</p>
                    </div>

                 ${this.followed ? html`<sl-button pill disabled>Following</sl-button>` : html`<sl-button pill variant="primary"
                            @click="${() => this.follow()}">Follow</sl-button>`}
            </div>
                ` : null
            }

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
