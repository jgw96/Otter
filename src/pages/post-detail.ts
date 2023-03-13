import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../components/header';
import '../components/timeline-item';
import { Post } from '../interfaces/Post';
import { getReplies } from '../services/timeline';

@customElement('post-detail')
export class PostDetail extends LitElement {
    @state() tweet: Post | null = null;
    @state() replies: any[] = [];

    static styles = [
        css`
            :host {
                display: block;

                overflow-y: scroll;
                height: 100vh;
            }

            main {
                padding-top: 60px;

                display: flex;
                padding-left: 4vw;
                justify-content: space-between;
                align-items: flex-start;
                padding-right: 4vw;
                gap: 16px;

            }

            :host::-webkit-scrollbar {
                display: none;
            }

            #main-block {
                display: flex;
                flex-direction: column;
                flex: 1.5;
                position: sticky;
                top: 60px;

                overflow-x: hidden;
            }

            #post-actions {
                display: flex;
                justify-content: flex-end;
                gap: 6px;
            }

            #replies {
                flex: 2;
                animation: slideup 0.3s ease-in-out;
                animation-delay: 0.5s;
            }

            #replies h2 {
                margin-top: 0;
            }

            #main {
                min-height: 300px;

                view-transition-name: card;
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

            @media(max-width: 768px) {
                main {
                    flex-direction: column;
                }

                #main-block {
                    display: initial;
                    position: initial;
                    width: 100%;

                    overflow-x: hidden;
                }

                #main {
                    position: initial;
                    flex: 1;
                }

                #replies {
                    flex: 1;
                }
            }
        `
    ];

    async connectedCallback() {
        super.connectedCallback();

        // remove ? from beginning of window.location.search
        const query = window.location.search.substring(1);

        const decoded = JSON.parse(decodeURIComponent(query));
        // remove + and - from decoded.content
        if (decoded.reblog) {
            decoded.reblog.content = decoded.reblog.content.replace(/\+/g, ' ').replace(/\-/g, '');
        }

        decoded.content = decoded.content.replace(/\+/g, ' ').replace(/\-/g, '');

        this.tweet = decoded;
    }

    async firstUpdated() {
        // get id from query string
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            // get post replies
            const replies = await getReplies(id);
            console.log('replies', replies);

            this.replies = replies.descendants;
        }
    }

    async shareStatus() {
        if (navigator.share) {
            // share the post
            await navigator.share({
                title: 'Mammoth',
                text: this.tweet?.content,
                url: this.tweet?.url
            });
        }
        else {
            // fallback to clipboard api
            await navigator.clipboard.writeText(this.tweet?.url || "");
        }
    }

    render() {
        return html`
        <app-header ?enableBack="${true}"></app-header>

        <main>
            <div id="main-block">
                <timeline-item id="main" .tweet="${this.tweet}"></timeline-item>
                <div id="post-actions">
                    <fluent-button appearance="accent" @click="${() => this.shareStatus()}" pill variant="primary">
                        Share

                        <sl-icon slot="suffix" src="/assets/share-social-outline.svg"></sl-icon>
                    </fluent-button>

                    <!-- <sl-button pill variant="primary">
                                        Reply

                                        <sl-icon slot="suffix" src="/assets/add-outline.svg"></sl-icon>
                                    </sl-button> -->
                </div>
            </div>

            <div id="replies">

                ${this.replies.length > 0 ? html`<h2>Replies</h2>` : html`<h2>No Replies</h2>`}
                ${this.replies.map(reply => html`
                <timeline-item .tweet="${reply}"></timeline-item>
                `)}
            </div>
        </main>
        `;
    }
}
