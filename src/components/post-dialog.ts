import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { publishPost, uploadImageAsFormData } from '../services/posts';

@customElement('post-dialog')
export class PostDialog extends LitElement {
    @state() attachmentPreview: string | undefined;
    @state() attachmentID: string | undefined;

    static styles = [
        css`
            :host {
                display: block;
            }

            sl-dialog::part(header-actions) {
                align-items: center;
            }

            .img-preview {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                width: 8em;
                margin-top: 10px;
                background: #00000040;
                padding: 6px;
                gap: 6px;
            }

            .img-preview img {
                width: 8em;
            }
        `
    ];

    public async openNewDialog() {
        const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
        dialog.show();
    }

    async attachFile() {
        const attachmentData = await uploadImageAsFormData();
        console.log("attachmentData", attachmentData);

        this.attachmentID = attachmentData.id;
        this.attachmentPreview = attachmentData.preview_url;
    }

    async publish() {
        const status = (this.shadowRoot?.querySelector('sl-textarea') as any).value;
        console.log(status);

        if (this.attachmentID) {
          await publishPost(status, this.attachmentID);
        }
        else {
          await publishPost(status);
        }

        const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
        dialog.hide();
      }

    render() {
        return html`
        <sl-dialog id="notify-dialog" label="New Post">
            <sl-button size="small" circle slot="header-actions" @click="${() => this.attachFile()}">
                <sl-icon src="/assets/attach-outline.svg"></sl-icon>
            </sl-button>
            <sl-textarea placeholder="What's on your mind?"></sl-textarea>

            ${this.attachmentPreview ? html`
                <div class="img-preview">
                    <sl-button circle size="small">
                        <sl-icon src="/assets/close-outline.svg"></sl-icon>
                    </sl-button>
                  <img src="${this.attachmentPreview}" />
                </div>
            ` : html``}

            <sl-button @click="${() => this.publish()}" slot="footer" variant="primary">Publish</sl-button>
        </sl-dialog>
        `;
    }
}
