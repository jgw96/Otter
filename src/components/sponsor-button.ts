import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('sponsor-button')
export class SponsorButton extends LitElement {

    static styles = [
        css`
            :host {
                display: block;
                z-index: 100;

                backdrop-filter: blur(40px);
                border-radius: 6px;
            }

            a {
                color: initial;
            }

            @media(prefers-color-scheme: dark) {
                a {
                    color: white;
                }
            }

            @media(max-width: 600px) {
                :host {
                    display: none;
                }
            }
        `
    ];

    render() {
        return html`
        <sl-dropdown placement="top-start">
            <fluent-button appearance="lightweight" slot="trigger">Support Mammoth</fluent-button>
            <sl-menu>
                <sl-menu-item>
                    <a href="https://buy.stripe.com/eVa6skb447CO1G0eUU" target="_blank">Support Mammoth Directly</a>
                </sl-menu-item>
                <sl-divider></sl-divider>
                <sl-menu-item>
                <iframe src="https://github.com/sponsors/jgw96/button" title="Sponsor jgw96" height="32" width="114"
            style="border: 0; border-radius: 6px;"></iframe>
                </sl-menu-item>
                <sl-divider></sl-divider>
                <sl-menu-item>
                  <a href="https://www.patreon.com/lilpwa" target="_blank">patreon.com/lilpwa</a>
                </sl-menu-item>
            </sl-menu>
        </sl-dropdown>
        `;
    }
}
