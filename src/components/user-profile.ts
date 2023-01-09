import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { classMap } from 'lit/directives/class-map.js';
import { router } from '../utils/router';

@customElement('user-profile')
export class UserProfile extends LitElement {

    @property() account: any | undefined = undefined;

    @property({ type: Boolean }) small: boolean = false;

    static styles = [
        css`
            :host {
                display: block;
                cursor: pointer;
            }

            p, h4 {
                max-width: 160px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .headerBlock {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .headerBlock img {
                height: 50px;
                width: 50px;
                border-radius: 50%;

                border: solid var(--sl-color-primary-600) 2px;
            }

            .headerBlock p {
                margin-top: 0;
            }

            div.small img {
                height: 36px;
                width: 36px;
            }

            div.small p {
                display: none;
            }

            div.small h4 {
                margin-top: 0;
                white-space: nowrap;
                overflow-x: hidden;
                text-overflow: ellipsis;
                max-width: 100px;
            }

            .headerBlock h4 {
                margin-bottom: 0;
            }


        `
    ];

    async firstUpdated() {
        // set up intersection observer
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage();

                    observer.unobserve(entry.target);
                }
            });
        }
            , options);

        observer.observe(this.shadowRoot?.querySelector('div') as Element);
    }

    loadImage() {
        window.requestIdleCallback(() => {
            const img = this.shadowRoot?.querySelector('img');
            if (img) {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.setAttribute('src', src);
                    img.removeAttribute('data-src');
                }
            }
        })
    }

    openUser() {
        router.navigate(`/account?id=${this.account.id}`);
    }

    render() {
        return html`
        <div @click="${() => this.openUser()}" class=${classMap({ small: this.small === true, headerBlock: true })} slot="header">
            <img data-src="${this.account.avatar_static}">
            <div>
                <h4>${this.account.display_name}</h4>
                <p>${this.account.acct}</p>
            </div>
        </div>
        `;
    }
}
