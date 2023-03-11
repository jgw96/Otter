import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js';
import { checkFollowing, followUser, getAccount, getUsersPosts } from '../services/account';

import '../components/timeline-item';

import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';

import { fluentBadge, provideFluentDesignSystem } from "@fluentui/web-components";
provideFluentDesignSystem().register(fluentBadge());

@customElement('app-profile')
export class AppProfile extends LitElement {

    @state() user: any | undefined;
    @state() posts: any[] = [];
    @state() followed: boolean = false;
    @state() showMiniProfile: boolean = false;

    static styles = [
        css`
            :host {
                display: block;

                overflow-y: scroll;
                height: 100vh;
            }

            #avatar-block img {
                view-transition-name: profile-image;
            }

            h3 sl-skeleton {
                width: 186px;
                height: 22px;
                border-radius: 8px;
            }

            #user-url sl-skeleton {
                width: 300px;
            }

            #bio-placeholder {
                display: flex;
                width: 60%;
                flex-direction: column;
                gap: 8px;
                height: 100px;
            }

            #bio-placeholder sl-skeleton {
                height: 12px;
                width: 100%;
            }

            #avatar-block sl-skeleton {
                height: -webkit-fill-available;
                width: -webkit-fill-available;
                border-radius: 8px;
            }


            sl-badge {
                cursor: pointer;
              }

              #avatarSkel {
                width: 80px;
                height: 80px;
                border-radius: 50%;
              }

              #follower-info {
                display: flex;
                gap: 4px;
              }

            #fields {
                display: flex;
                overflow-x: auto;
                margin-top: 12px;

                flex-direction: row;
                gap: 4px;
                flex-wrap: wrap;
                margin-top: 1em;
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

            .field-name {
                font-weight: bold;
                margin-right: 4px;
                border-right: solid white 2px;
                padding-right: 6px;
            }

            main {
                padding-top: 60px;
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

                // animation-name: slideup;
                // animation-duration: 0.3s;
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
                width: 5em;
                border-radius: 4px;
                object-fit: cover;
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

                    background: rgb(32 32 35);

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
                    padding-top: 60px;
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

              @media(prefers-color-scheme: light) {
                #profile-top {
                    background: white;
                    color: black;
                }

                #profile-top p {
                    color: black;
                }
              }

              @keyframes slideup {
                from {
                    transform: translateY(30%);
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
                threshold: 0.8
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    console.log('entry', entry)
                    if (entry.isIntersecting) {
                        console.log('intersecting', entry);

                        window.requestIdleCallback(async () => {
                            this.showMiniProfile = false;
                        })
                    }
                    else {
                        this.showMiniProfile = true;
                    }
                })
            }
            , options);

            // get second child element of postsList
            const profileDiv = this.shadowRoot?.getElementById('profile');

            observer.observe(profileDiv!);
        })
    }

    async follow() {
        await followUser(this.user.id);
        this.followed = true;
    }

    async reloadPosts() {
        const postsData = await getUsersPosts(this.id);
        console.log(postsData);

        this.posts = postsData;
    }

    render() {
        return html`
        <app-header ?enableBack="${true}"></app-header>

        <main>
            <div id="profile">
                <div id="profile-top">
                    ${this.user ? html`
                    <div id="avatar-block" style=${styleMap({backgroundImage: `url(${this.user.header})`})}>
                        <img src="${this.user.avatar}" />
                    </div>
                    ` : null}
                    <div id="username-block">
                        <h3>${this.user ? this.user.display_name : html`<sl-skeleton></sl-skeleton>`}</h3>
                    </div>

                    <p id="user-url">${this.user ? this.user.url : html`<sl-skeleton></sl-skeleton>`}</p>

                    ${
                        this.user && this.user.note ? html`
                          <div .innerHTML=${this.user ? this.user.note : "" }></div>
                        ` : html`
                            <div id="bio-placeholder">
                                <sl-skeleton></sl-skeleton>
                                <sl-skeleton></sl-skeleton>
                                <sl-skeleton></sl-skeleton>
                            </div>
                        `
                    }

                    <div id="follower-info">
                      <fluent-badge appearance="accent">${this.user ? this.user.followers_count : 0} followers</fluent-badge>
                      <fluent-badge appearance="accent">${this.user ? this.user.following_count : 0} following</fluent-badge>
                    </div>

                    <div id="fields">
                        ${this.user ? this.user.fields.map((field: any) => html`
                        <div>
                            <fluent-badge appearance="accent">
                                <span class="field-name" .innerHTML="${field.name}"></span>
                               <span class="field-value" .innerHTML="${field.value}"></span>
                            </fluent-badge>
                        </div>
                        `) : null}
                    </div>

                    <div id="profile-card-actions">
                        ${this.followed ? html`<fluent-button appearance="accent" pill disabled>Following</fluent-button>` : html`<fluent-button pill appearance="accent"
                            @click="${() => this.follow()}">Follow</fluent-button>`}
                    </div>
                </div>
            </div>


            ${
                this.showMiniProfile && this.user ? html`
                <div id="mini-profile">
                    <div id="avatar-mini">
                        <img src="${this.user.avatar}" />

                        <p>${this.user.display_name}</p>
                    </div>

                 ${this.followed ? html`<fluent-button pill disabled>Following</fluent-button>` : html`<fluent-button pill appearance="accent"
                            @click="${() => this.follow()}">Follow</fluent-button>`}
            </div>
                ` : null
            }

            <ul>
                ${this.posts.map(post => html`
                <li>
                    <timeline-item @delete="${() => this.reloadPosts()}" .tweet=${post}></timeline-item>
                </li>
                ` )}
            </ul>

        </main>
        `;
    }
}
