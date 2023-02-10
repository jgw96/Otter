import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import { publishPost, uploadImageAsFormData } from '../services/posts';

@customElement('post-dialog')
export class PostDialog extends LitElement {
    @state() attachmentPreview: string | undefined;
    @state() attachmentID: string | undefined;

    @state() attaching: boolean = false;

    static styles = [
        css`
            :host {
                display: block;
            }

            sl-dialog::part(panel) {
                min-width: 60vw;
                min-height: 60vh;

                content-visibility: auto;
                contain: layout style paint;
              }

              sl-dialog sl-textarea::part(textarea) {
                height: 34vh;
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
                min-height: 6em;
            }

            sl-skeleton {
                height: 8em;
                width: 8em;
                --sl-border-radius-default: 4px;
            }
        `
    ];

    public async openNewDialog() {
        const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
        dialog.show();
    }

    async attachFile() {
        this.attaching = true;
        const attachmentData = await uploadImageAsFormData();
        console.log("attachmentData", attachmentData);

        this.attaching = false;

        this.attachmentID = attachmentData.id;
        this.attachmentPreview = attachmentData.preview_url;
    }

    removeImage() {
        this.attachmentID = undefined;
        this.attachmentPreview = undefined;
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

            <sl-textarea autofocus placeholder="What's on your mind?"></sl-textarea>

            ${this.attachmentPreview && this.attaching === false ? html`
                <div class="img-preview">
                    <sl-button circle size="small" @click="${() => this.removeImage()}">
                        <sl-icon src="/assets/close-outline.svg"></sl-icon>
                    </sl-button>
                  <img src="${this.attachmentPreview}" />
                </div>
            ` : this.attaching === true ? html`<div class="img-preview">
                <sl-skeleton></sl-skeleton>
            </div>` : null}

            <sl-button pill slot="footer" @click="${() => this.attachFile()}">
                <sl-icon src="/assets/albums-outline.svg"></sl-icon>
            </sl-button>
            <sl-button pill @click="${() => this.publish()}" slot="footer" variant="primary">Publish</sl-button>
        </sl-dialog>
        `;
    }
}
