import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import { publishPost, uploadImageAsFormData, uploadImageFromBlob } from '../services/posts';
import { createImage } from '../services/ai';

@customElement('post-dialog')
export class PostDialog extends LitElement {
    @state() attachmentPreview: string | undefined;
    @state() attachmentID: string | undefined;

    @state() attaching: boolean = false;

    @state() showPrompt: boolean = false;
    @state() generatingImage: boolean = false;

    @state() generatedImage: string | undefined;

    aiBlob: Blob | undefined;

    static styles = [
        css`
            :host {
                display: block;
            }

            #ai-preview-block {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
            }

            #ai-preview-block sl-skeleton {
                height: 320px;
                width: 100%;
            }

            #ai-image {
                background: rgba(255, 255, 255, 0.04);
                padding: 10px;
                margin-top: 1em;
                display: flex;
                flex-direction: column-reverse;
                gap: 10px;
                min-height: 370px;
                border-radius: 6px;

                animation: fadein 0.5s;
            }

            #ai-image img {
                width: 20em;
                height: 320px;
                border-radius: 6px;
            }

            #ai-input-block {
                display: flex;
                gap: 8px;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }

            #ai-input-block sl-input {
                width: 80%;
            }

            sl-dialog::part(panel) {
                min-width: 60vw;
                min-height: 60vh;

                content-visibility: auto;
                contain: layout style paint;
              }

              sl-dialog sl-textarea::part(textarea) {
                height: 20vh;
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

                border-radius: 6px;
            }

            .img-preview img {
                width: 8em;
                height: 8em;
                border-radius: 6px;
                margin-top: 4px;
            }

            sl-skeleton {
                height: 8em;
                width: 8em;
                --sl-border-radius-default: 4px;
            }

            @keyframes fadein {
                from { opacity: 0; }
                to   { opacity: 1; }
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

    async addAIImageToPost() {
        if (this.generatedImage && this.aiBlob) {
            this.showPrompt = false;

            this.attaching = true;
            const attachmentData = await uploadImageFromBlob(this.aiBlob);

            this.attaching = false;
            this.attachmentID = attachmentData.id;
            this.attachmentPreview = attachmentData.preview_url;

            this.generatedImage = undefined;
            this.aiBlob = undefined;
        }
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

    async doAIImage(prompt: string) {
        this.generatingImage = true;
        const imageData = await createImage(prompt);
        this.generatingImage = false;

        console.log("image", imageData);
        const baseData = imageData.data[0].b64_json;

        // convert base64 to blob
        const blob = await fetch(`data:image/png;base64,${baseData}`).then(async r => await r.blob());

        this.aiBlob = blob;

        this.generatedImage = URL.createObjectURL(blob);
    }

    async openAIPrompt() {
        this.showPrompt = true;
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

            ${this.showPrompt ? html`<div id="ai-image">
                ${
                    this.showPrompt && this.generatedImage ? html`
                    <img src="${this.generatedImage}">
                    ` : this.showPrompt && this.generatingImage === false ? html`<div id="ai-preview-block"><p>Enter a prompt to generate an image with AI!</p></div>` : html`<div id="ai-preview-block"><sl-skeleton></sl-skeleton></div>`
                }
                ${
                    this.showPrompt ? html`
                    <div id="ai-input-block">
                      <sl-input placeholder="A picture of an orange cat" @sl-change="${(e: any) => this.doAIImage(e.target.value)}"></sl-input>

                      <sl-button ?disabled=${!this.generatedImage} pill variant="primary" @click="${() => this.addAIImageToPost()}">Add to post</sl-button>
                    </div>
                    ` : null
                }
            </div>` : null}

            ${this.showPrompt === false ? html`<sl-button slot="footer" pill @click="${() => this.openAIPrompt()}">Generate AI Image</sl-button>` : null}
            <sl-button pill slot="footer" @click="${() => this.attachFile()}">
                <sl-icon src="/assets/albums-outline.svg"></sl-icon>
            </sl-button>
            <sl-button pill @click="${() => this.publish()}" slot="footer" variant="primary">Publish</sl-button>
        </sl-dialog>
        `;
    }
}
