import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { getUsersFollowers } from '../services/account';

import '../components/user-profile';

@customElement('app-followers')
export class AppFollowers extends LitElement {

    @state() followers: any[] = [];

    static styles = [
        css`
            :host {
                display: block;

                overflow-y: scroll;
                height: 100vh;
            }

            :host::-webkit-scrollbar {
                display: none;
            }

            main {
                padding-top: 60px;
            }

            ul {
                display: flex;
                flex-direction: column;
                gap: 14px;
                margin: 0;
                padding: 0;
                list-style: none;

                height: 81vh;
                overflow-y: scroll;
                overflow-x: hidden;

                padding-left: 6em;
                padding-right: 6em;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            h2 {
                padding-left: 4em;
                animation: slideInFromLeft 0.3s ease-in-out;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            ul li {
                background: var(--sl-color-gray-50);
                border-radius: 6px;
                padding: 10px;

                animation: slideUp 0.3s ease-in-out;
            }


            li a {
                text-decoration: none;
                color: white;
            }

            @keyframes slideUp {
                from {
                    transform: translateY(30%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes slideInFromLeft {
                from {
                    transform: translateX(-30%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @media(prefers-color-scheme: light) {
                ul li {
                    color: black;
                }

                li a {
                    color: black;
                }
            }

        `
    ];

    async firstUpdated() {
        // get id from url query params
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            const followersData = await getUsersFollowers(id);
            this.followers = [...followersData];
        }
    }

    render() {
        return html`
        <app-header ?enableBack="${true}"></app-header>

        <main>

            <h2>Your Followers</h2>
            <ul>
                ${
                    this.followers.map((follower: any) => {
                        return html`
                          ${follower && follower.id ? html`<li>
                            <a href="/account?id=${follower.id}">
                                <user-profile .account=${follower}></user-profile>
                            </a>
                            </li>` : null}
                        `;
                    })
                }
            </ul>
        </main>
        `;
    }
}
