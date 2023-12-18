import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../components/header';
import '../components/timeline-item';
import { Post } from '../interfaces/Post';
import { getReplies } from '../services/timeline';

import { fluentButton, fluentTextArea, provideFluentDesignSystem } from "@fluentui/web-components";
import { replyToPost } from '../services/posts';
provideFluentDesignSystem().register(fluentButton(), fluentTextArea());

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

            fluent-button::part(control) {
                border: none;
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
                flex-direction: column;
            }

            #replies {
                flex: 2;
            }

            #replies h2 {
                margin-top: 0;
            }

            #reply-button {
                place-self: flex-end;
            }

            #main {
                min-height: 230px;

                view-transition-name: card;
            }

            @media(prefers-color-scheme: dark) {
                fluent-text-area::part(control), fluent-button[appearance="neutral"]::part(control), fluent-text-field::part(control), fluent-text-field::part(root) {
                    background: #1e1e1e;
                    color: white;
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

            @media(max-width: 768px) {
                main {
                    flex-direction: column;
                }

                #post-actions {
                    position: fixed;
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                    background: #f8f8f80f;
                    padding: 8px;
                    border-radius: 6px;
                    z-index: 999;
                    backdrop-filter: blur(42px);
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
                    width: 100%;
                }
            }
        `
    ];

    async connectedCallback() {
        super.connectedCallback();

        // remove ? from beginning of window.location.search
        const query = window.location.search.substring(1);

        const decoded = JSON.parse(decodeURIComponent(query));
        console.log("decoded", decoded)
        // remove + and - from decoded.content
        if (decoded.reblog) {
            decoded.reblog.content = decoded.reblog.content.replace(/\+/g, ' ').replace(/\-/g, '');
        }

        decoded.content = decoded.content.replace(/\+/g, ' ').replace(/\-/g, '');

        this.tweet = decoded;
    }

    async firstUpdated() {
        // get id from query string
        await this.loadReplies();
    }

    private async loadReplies() {
        if (this.tweet && this.tweet.id) {
            // get post replies
            const replies = await getReplies(this.tweet.id);
            console.log('replies', replies);

            this.replies = replies.descendants;
        }
    }

    async shareStatus() {
        if (navigator.share) {
            // share the post
            await navigator.share({
                title: 'Otter',
                text: this.tweet?.content,
                url: this.tweet?.url
            });
        }
        else {
            // fallback to clipboard api
            await navigator.clipboard.writeText(this.tweet?.url || "");
        }
    }

    async handleReply() {
        const textArea = this.shadowRoot?.querySelector('fluent-text-area') as any;


        if (textArea.value && this.tweet && this.tweet.id) {
            await replyToPost(this.tweet.id, textArea.value);

            await this.loadReplies();

            this.replies = [...this.replies];

            textArea.value = '';
        }
    }

    render() {
        return html`
        <app-header ?enableBack="${true}"></app-header>

        <main>
            <div id="main-block">
                <timeline-item id="main" .tweet="${this.tweet}"></timeline-item>
                <div id="post-actions">
                    <fluent-text-area placeholder="Reply to this post..."></fluent-text-area>
                    <fluent-button @click="${() => this.handleReply()}" id="reply-button" appearance="accent">
                        Reply

                        <sl-icon slot="suffix" src="/assets/add-outline.svg"></sl-icon>
                    </fluent-button>
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
