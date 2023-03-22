import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/header';
import '../components/edit-account';

@customElement('edit-page')
export class EditPage extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }

            main {
              display: block;
              padding-top: 44px;
              margin-top: initial;

              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
        `
    ];

    render() {
        return html`
            <app-header title="Edit Account" enableBack></app-header>

            <main>
              <edit-account></edit-account>
            </main>
        `;
    }
}
