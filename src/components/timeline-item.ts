import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { boostPost, getReplies, reblogPost } from '../services/timeline';

import '../components/user-profile';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { addBookmark } from '../services/bookmarks';

@customElement('timeline-item')
export class TimelineItem extends LitElement {
    @property({ type: Object }) tweet: any;
    @property({ type: Boolean }) show: boolean = false;

    @state() isBoosted = false;
    @state() isReblogged = false;

    static styles = [
        css`
            :host {
                display: block;
            }


            sl-card {
                --padding: 10px;
                width: 100%;
            }

            sl-card::part(base) {
                border: none;
            }

            sl-card img {
                height: 420px;
                object-fit: cover;
            }

            .header-block {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .header-block img {
                height: 62px;
                border-radius: 50%;
            }

            .header-block h4 {
                margin-bottom: 0;
            }

            .actions {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
            }
        `
    ];

    firstUpdated( ) {
        console.log("this.showreplies", this.show);
    }

    async favorite(id: string) {
        console.log("favorite", id);
        await boostPost(id);

        this.isBoosted = true;

        // fire custom event
        this.dispatchEvent(new CustomEvent('favorite', {
            detail: {
                id
            }
        }));
    }

    async reblog(id: string) {
        console.log("reblog", id);
        await reblogPost(id);

        this.isReblogged = true;

        // fire custom event
        this.dispatchEvent(new CustomEvent('reblog', {
            detail: {
                id
            }
        }));
    }

    async bookmark(id: string) {
        console.log("bookmark", id);
        await addBookmark(id);
    }

    async replies(id: string) {
      const data = await getReplies(id);
      console.log(data);

        // fire custom event
        this.dispatchEvent(new CustomEvent('replies', {
            detail: {
                data: data.descendants,
                id
            }
        }));
    }

    render() {
        return html`
          ${this.tweet.reblog === null || this.tweet.reblog === undefined ? html`
                <sl-card>
                      ${
                        this.tweet.media_attachments.length > 0 ? html`
                         <img slot="image" src="${this.tweet.media_attachments[0].preview_url}">
                        ` : html``
                      }


                        <user-profile .account="${this.tweet.account}"></user-profile>
                        <div .innerHTML="${this.tweet.content}"></div>

                        <div class="actions" slot="footer">
                          ${this.show === true ? html`<sl-button pill @click="${() => this.replies(this.tweet.id)}">
                            <sl-icon src="/assets/albums-outline.svg"></sl-icon>
                        </sl-button>` : null}
                          <sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.bookmark(this.tweet.id)}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></sl-button>
                          <sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.favorite(this.tweet.id)}">${this.tweet.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></sl-button>
                          <sl-button ?disabled="${this.isReblogged || this.tweet.reblogged}" pill @click="${() => this.reblog(this.tweet.id)}">${this.tweet.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></sl-button>
                        </div>
                    </sl-card>
                    ` : html`
                    <sl-card>
                    ${
                        this.tweet.reblog.media_attachments.length > 0 ? html`
                         <img slot="image" src="${this.tweet.reblog.media_attachments[0].preview_url}">
                        ` : html``
                      }

                        <div class="header-block" slot="header">

                            <user-profile ?small="${true}" .account="${this.tweet.account}"></user-profile>
                              <span>boosted</span>
                            <user-profile ?small="${true}"  .account="${this.tweet.reblog.account}"></user-profile>
                        </div>
                        <h5>${this.tweet.reblog.account.acct} posted</h5>

                        <div .innerHTML="${this.tweet.reblog.content}"></div>

                        <div class="actions" slot="footer">
                        ${this.show === true ? html`<sl-button pill @click="${() => this.replies(this.tweet.id)}">
                            <sl-icon src="/assets/albums-outline.svg"></sl-icon>
                        </sl-button>` : null}
                            <sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.bookmark(this.tweet.id)}"><sl-icon src="/assets/bookmark-outline.svg"></sl-icon></sl-button>
                            <sl-button ?disabled="${this.isBoosted || this.tweet.favourited}" pill @click="${() => this.favorite(this.tweet.id)}">${this.tweet.reblog.favourites_count} <sl-icon src="/assets/heart-outline.svg"></sl-icon></sl-button>
                            <sl-button ?disabled="${this.isReblogged || this.tweet.reblogged}"  pill @click="${() => this.reblog(this.tweet.id)}">${this.tweet.reblog.reblogs_count} <sl-icon src="/assets/repeat-outline.svg"></sl-icon></sl-button>
                        </div>
                    </sl-card>


                    `}

        `;
    }
}
