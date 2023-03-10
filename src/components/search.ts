import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/menu-label/menu-label.js';

import { fluentTextField, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentTextField());

import { router } from '../utils/router';

@customElement('app-search')
export class Search extends LitElement {
    @state() searchData: any | undefined;
    static styles = [
        css`
            :host {
                display: block;

                contain: paint layout style;
                content-visibility: auto;
            }

            .avatar {
                width: 24px;
                height: 24px;
                border-radius: 50%;
            }

            .account {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            @media(max-width: 768px) {
                fluent-text-field {
                    width: 100%;
                }

                fluent-text-field::part(root) {
                    height: 3em;
                }
            }

            @media(prefers-color-scheme: dark) {
                fluent-text-field, fluent-text-field::part(control), fluent-text-field::part(root) {
                    background: #1e1e1e;
                    color: white;
                }

                .account {
                    color: white;
                }
            }
        `
    ];

    protected async connectedCallback() {
        super.connectedCallback();

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {

            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const { searchTimeline } = await import('../services/timeline');
                    const searchData = await searchTimeline("Mastodon");
                    console.log("searchData", searchData);

                    this.searchData = searchData;

                    // fire custom event
                    const event = new CustomEvent('search', {
                        detail: {
                            searchData
                        }
                    });
                    this.dispatchEvent(event);

                    observer.disconnect();
                }
            });
        }
            , options);

        observer.observe(this);
    }

    async handleSearch(value: string) {
        console.log(value);

        // const dropdown: any = this.shadowRoot?.querySelector('sl-dropdown');
        const { searchTimeline } = await import('../services/timeline');
        const searchData = await searchTimeline(value);
        console.log("searchData", searchData);

        this.searchData = searchData;

        // fire custom event
        const event = new CustomEvent('search', {
            detail: {
                searchData
            }
        });
        this.dispatchEvent(event);

        // await dropdown?.show();
    }

    openAccount(id: string) {
        router.navigate(`/account?id=${id}`);
    }

    render() {
        return html`

            <fluent-text-field @change="${($event: any) => this.handleSearch($event.target.value)}" placeholder="Search" type="search">
    </fluent-text-field>

        `;
    }
}
