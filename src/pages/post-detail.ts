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
            }

            #post-actions {
                display: flex;
                justify-content: flex-end;
                gap: 6px;
            }

            #replies {
                flex: 2;
            }

            #replies h2 {
                margin-top: 0;
            }

            @media(max-width: 768px) {
                main {
                    flex-direction: column;
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

    async firstUpdated() {
        // get id from query string
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        console.log('id', id);

        const { getPostDetail } = await import('../services/posts');

        if (id) {
            const post = await getPostDetail(id);
            console.log('post', post);

            this.tweet = post;

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
                    <sl-button @click="${() => this.shareStatus()}" pill variant="primary">
                        Share

                        <sl-icon slot="suffix" src="/assets/share-social-outline.svg"></sl-icon>
                    </sl-button>

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
