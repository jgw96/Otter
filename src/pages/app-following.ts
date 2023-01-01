import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { getFollowing } from '../services/account';

import '../components/user-profile';

@customElement('app-following')
export class Appfollowing extends LitElement {

    @state() following: any[] = [];

    static styles = [
        css`
            :host {
                display: block;
            }

            main {
                margin-top: 80px;
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

            h2 {
                padding-left: 4em;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            ul li {
                background: var(--sl-color-gray-50);
                border-radius: 6px;
                padding: 10px;
            }

            li a {
                text-decoration: none;
                color: white;
            }

        `
    ];

    async firstUpdated() {
        // get id from url query params
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            const followingData = await getFollowing(id);
            this.following = [...followingData];
        }
    }

    render() {
        return html`
        <app-header ?enableBack="${true}"></app-header>

        <main>

            <h2>Your Following</h2>
            <ul>
                ${
                    this.following.map((follower: any) => {
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
