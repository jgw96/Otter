import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import { publishPost, uploadImageAsFormData, uploadImageFromBlob } from '../services/posts';
import { createAPost, createImage } from '../services/ai';

import { fluentButton, fluentTextArea, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentButton());
provideFluentDesignSystem().register(fluentTextArea());

@customElement('post-dialog')
export class PostDialog extends LitElement {
    @state() attachmentPreview: string | undefined;
    @state() attachmentID: string | undefined;

    @state() attaching: boolean = false;

    @state() showPrompt: boolean = false;
    @state() generatingImage: boolean = false;

    @state() generatingPost: boolean = false;

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

            fluent-button::part(control) {
                border: none;
            }

            @media(prefers-color-scheme: dark) {
                fluent-text-area::part(control), fluent-button[appearance="neutral"]::part(control) {
                    background: #1e1e1e;
                    color: white;
                }
            }

            #post-ai-actions {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
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

              sl-dialog fluent-text-area {
                width: 100%;
              }

              sl-dialog fluent-text-area::part(control) {
                height: 20vh;
                width: 100%;
              }

            sl-dialog::part(header-actions) {
                align-items: center;
            }

            @media(max-width: 600px) {
                sl-dialog::part(panel) {
                    height: 100vh;
                    max-height: 100vh;
                    max-width: 100vw;
                    width: 100vw;
                }
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
        const status = (this.shadowRoot?.querySelector('fluent-text-area') as any).value;
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
        this.generatedImage = undefined;

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

    async generateStatus() {
        const textarea = this.shadowRoot?.querySelector('fluent-text-area') as any;

        const prompt = textarea.value;

        console.log(prompt, prompt.length);

        if (!prompt && prompt.length === 0) {
            textarea.placeholder = "Start your post here, and AI will help generate a post for you";

            const listener = textarea.addEventListener("sl-change", async () => {
                await this.handleGeneratePost(textarea.value, textarea, listener);
            })
        }
        else {
            await this.handleGeneratePost(prompt, textarea, undefined);
        }
    }

    private async handleGeneratePost(prompt: any, textarea: any, listener: any) {
        this.generatingPost = true;

        if (prompt && prompt.length > 0) {
            const data = await createAPost(prompt);

            if (data && data.choices[0]) {
                textarea.value = data.choices[0].text.trim();

                this.generatingPost = false;

                // drop event listerner
                textarea.removeEventListener("sl-change", listener);
            }
            else {
                this.generatingPost = false;

                textarea.removeEventListener("sl-change", listener);
            }
        }
        else {
            this.generatingPost = false;
            textarea.removeEventListener("sl-change", listener);
        }
    }

    render() {
        return html`
        <sl-dialog id="notify-dialog" label="New Post">

            <fluent-text-area autofocus placeholder="What's on your mind?"></fluent-text-area>

            <div id="post-ai-actions">
              <fluent-button ?loading="${this.generatingPost}" pill size="small" @click="${() => this.generateStatus()}">AI: Help with my post</fluent-button>

              ${this.showPrompt === false ? html`<fluent-button size="small" pill @click="${() => this.openAIPrompt()}">AI: Generate Image</fluent-button>` : null}
            </div>

            ${this.attachmentPreview && this.attaching === false ? html`
            <div class="img-preview">
                <fluent-button circle size="small" @click="${() => this.removeImage()}">
                    <sl-icon src="/assets/close-outline.svg"></sl-icon>
                </fluent-button>
                <img src="${this.attachmentPreview}" />
            </div>
            ` : this.attaching === true ? html`<div class="img-preview">
                <sl-skeleton effect="sheen"></sl-skeleton>
            </div>` : null}

            ${this.showPrompt ? html`<div id="ai-image">
                ${
                    this.showPrompt && this.generatedImage ? html`
                    <img src="${this.generatedImage}">
                    ` : this.showPrompt && this.generatingImage === false ? html`<div id="ai-preview-block"><p>Enter a prompt to generate an image with AI!</p></div>` : html`<div id="ai-preview-block"><sl-skeleton effect="sheen"></sl-skeleton></div>`
                }
                ${
                    this.showPrompt ? html`
                    <div id="ai-input-block">
                      <sl-input placeholder="A picture of an orange cat" @sl-change="${(e: any) => this.doAIImage(e.target.value)}"></sl-input>

                      <fluent-button ?disabled=${!this.generatedImage} pill appearance="accent" @click="${() => this.addAIImageToPost()}">Add to post</fluent-button>
                    </div>
                    ` : null
                }
            </div>` : null}

            <fluent-button pill slot="footer" @click="${() => this.attachFile()}">
                <sl-icon src="/assets/albums-outline.svg"></sl-icon>
            </fluent-button>
            <fluent-button pill @click="${() => this.publish()}" slot="footer" appearance="accent">Publish</fluent-button>
        </sl-dialog>
        `;
    }
}
