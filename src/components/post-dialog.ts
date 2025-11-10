import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './md-dialog.js';
import './md-button.js';
import './md-text-field.js';
import './md-text-area.js';
import './md-icon.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import { publishPost, uploadImageAsFormData, uploadImageFromBlob } from '../services/posts';
import { createAPost, createImage } from '../services/ai';

// @ts-ignore
import { createGesture } from 'https://cdn.jsdelivr.net/npm/@ionic/core@latest/dist/esm/index.mjs';

// @ts-ignore
import MarkdownWorker from '../utils/markdown-worker?worker';

@customElement('post-dialog')
export class PostDialog extends LitElement {
    @state() attachmentPreview: string | undefined;
    @state() attachmentID: string | undefined;

    @state() attachmentIDs: Array<string> = [];
    @state() attachmentPreviews: Array<string> = [];

    @state() attaching: boolean = false;

    @state() showPrompt: boolean = false;
    @state() generatingImage: boolean = false;

    @state() generatingPost: boolean = false;

    @state() generatedImage: string | undefined;

    @state() hasStatus: boolean = false;
    @state() sensitive: boolean = false;

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

            #markdown-support {
                margin: 0;
                padding-top: 4px;
                font-size: 11px;
            }

            md-dialog::part(dialog) {
                z-index: 99999;
                min-width: 60vw;
                min-height: 60vh;

                content-visibility: auto;
                contain: layout style paint;
            }

            .dialog-footer-actions {
                gap: 5px;
                display: flex;
                justify-content: flex-end;
                align-items: center;

                margin-bottom: env(keyboard-inset-height, 0px);
            }

            #post-copilot {
                background: rgb(0 0 0 / 6%);
                border-radius: 6px;
                padding-left: 10px;
                padding-right: 10px;
                padding-bottom: 10px;
                padding-top: 10px;
                margin-top: 12px;

                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            #post-copilot span {
                font-size: 12px;
            }

            #post-copilot md-button {
                place-self: flex-end;
                margin-top: 8px;
            }

            ul {
                padding: 0;
                margin: 0;
                display: flex;
                gap: 6px;
                list-style: none;
                margin-top: 8px;

                overflow: hidden;
                overflow-x: scroll;
            }

            ul::-webkit-scrollbar {
                display: none;
            }

            md-button {
                border: none;
            }

            md-text-field {
                width: 100%;
                margin-top: 8px;
            }

            md-text-area {
                width: 100%;
            }

            @media(prefers-color-scheme: dark) {
                /* Dark mode handled by md-text-field and md-text-area components */
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

            @media(max-width: 600px) {
                md-dialog::part(dialog) {
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
                object-fit: cover;
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

    protected async firstUpdated() {
        setTimeout(() => {
            const dialog: any = this.shadowRoot?.querySelector('md-dialog');
            console.log("dialog", dialog.dialog)
            const gesture = createGesture({
                el: dialog.dialog,
                threshold: 15,
                direction: 'y',
                gestureName: 'my-gesture',
                onMove: (ev: any) => this.onMoveHandler(ev, dialog)
            });

            gesture.enable();
        }, 1000)
    }

    onMoveHandler(ev: any, dialog: any) {
        // animate dialog to new position
        dialog!.dialog!.style.transform = `translateY(${ev.deltaY}px)`;

        if (ev.deltaY < -200) {
            dialog.hide();

            setTimeout(() => {
                dialog.dialog.style.transform = `translateY(0px)`;
            }, 500);
        }
        else if (ev.deltaY > 200) {
            dialog.hide();

            setTimeout(() => {
                dialog.dialog.style.transform = `translateY(0px)`;
            }
                , 500);
        }

    }

    public async openNewDialog() {
        const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
        dialog.show();

        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.has("name")) {
            const name = urlParams.get("name");

            if (name) {
                await this.shareTarget(name);
            }
        }
    }

    async shareTarget(name: string) {
        const cache = await caches.open("shareTarget");
        const result = [];

        for (const request of await cache.keys()) {
            // If the request URL matches, add the response to the result
            if (
                (request.url.endsWith(".png") && request.url.includes(name)) ||
                request.url.endsWith(".jpg") && request.url.includes(name)) {
                result.push(await cache.match(name));
            }
        }

        console.log("share target result", result);

        if (result.length > 0) {
            const blob = await result[0]!.blob();

            // await this.openNewDialog();

            this.attaching = true;

            const { uploadImageFromBlob } = await import("../services/posts");
            const data = await uploadImageFromBlob(blob);

            this.attaching = false;

            this.attachmentID = data.id;
            this.attachmentPreview = data.preview_url;
        }
    }

    async attachFile() {
        this.attaching = true;
        const attachmentData = await uploadImageAsFormData();
        console.log("attachmentData", attachmentData);

        const ids: Array<any> = [];
        const previews: Array<any> = [];

        attachmentData.forEach((attachment) => {
            ids.push(attachment.id);
            previews.push(attachment.preview_url);
        });

        this.attachmentIDs = [...ids];
        this.attachmentPreviews = [...previews];

        this.attaching = false;
    }

    async addAIImageToPost() {
        if (this.generatedImage && this.aiBlob) {
            this.showPrompt = false;

            this.attaching = true;
            const attachmentData = await uploadImageFromBlob(this.aiBlob);

            this.attachmentIDs = [...this.attachmentIDs, attachmentData.id];
            this.attachmentPreviews = [...this.attachmentPreviews, attachmentData.preview_url];

            this.attaching = false;

            this.generatedImage = undefined;
            this.aiBlob = undefined;
        }
    }

    removeImage(preview: string) {
        const index = this.attachmentPreviews.indexOf(preview);
        if (index > -1) {
            this.attachmentPreviews.splice(index, 1);
            this.attachmentIDs.splice(index, 1);

            this.requestUpdate();
        }

        if (this.attachmentPreviews.length === 0) {
            this.attachmentPreviews = [];
            this.attachmentIDs = [];
        }
    }

    async publish() {
        const status = (this.shadowRoot?.querySelector('md-text-area') as any).value;
        console.log(status);

        let spoilerText = "";

        if (status && status.length > 0) {
            const worker = new MarkdownWorker();

            worker.onmessage = async (e: any) => {
                const html = e.data;
                console.log(html);

                if (this.attachmentIDs) {
                    if (this.sensitive === true) {
                        const sensitiveInput = this.shadowRoot?.getElementById('sensitive-input') as any;
                        spoilerText = sensitiveInput.value;
                    }

                    await publishPost(status, this.attachmentIDs, this.sensitive, spoilerText);

                    this.attachmentIDs = [];
                    this.attachmentPreviews = [];
                    this.generatedImage = undefined;
                    this.aiBlob = undefined;

                    (this.shadowRoot?.querySelector("md-text-area") as any)!.value = "";
                }
                else {
                    if (this.sensitive === true) {
                        const sensitiveInput = this.shadowRoot?.getElementById('sensitive-input') as any;
                        spoilerText = sensitiveInput.value;
                    }

                    await publishPost(status, undefined, this.sensitive, spoilerText);

                    this.attachmentIDs = [];
                    this.attachmentPreviews = [];
                    this.generatedImage = undefined;
                    this.aiBlob = undefined;

                    (this.shadowRoot?.querySelector("md-text-area") as any)!.value = "";
                }

                const dialog = this.shadowRoot?.getElementById('notify-dialog') as any;
                dialog.hide();

                worker.terminate();

                // fire custom eventt
                this.dispatchEvent(new CustomEvent('published', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        status: status
                    }
                }));
            };

            worker.postMessage(status);
        }
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
        const textarea = this.shadowRoot?.querySelector('md-text-field') as any;
        const publishText = this.shadowRoot?.querySelector('md-text-area') as any;

        const prompt = textarea.value;

        publishText.value = "Generating post...";

        this.generatingPost = true;

        const data = await createAPost(prompt);

        if (data && data.choices[0]) {
            const generated = data.choices[0].message.content.trim();
            /// remove quotes from generated text
            publishText.value = generated.replace(/"/g, "");
            publishText.value = data.choices[0].message.content.trim();
        }
        else {
            publishText.value = "Failed to generate post.";
        }

        this.generatingPost = false;
    }

    handleStatus(ev: any) {
        if (ev.target.value.length > 0) {
            this.hasStatus = true;
        }
    }

    async markAsSensitive() {
        this.sensitive = !this.sensitive;
    }

    render() {
        return html`
        <md-dialog id="notify-dialog" label="New Post">

            <md-text-area @change="${($event: any) => this.handleStatus($event)}" autofocus placeholder="What's on your mind?" rows="6"></md-text-area>

            ${this.sensitive ? html`<div id="sensitive-warning">
                <md-text-field id="sensitive-input" placeholder="Write your warning here"></md-text-field>
            </div>` : null}

            <div id="post-copilot">
                <span>Enter a prompt in the field below and Otter will generate a toot for you.</span>
                <md-text-field @change="${() => this.generateStatus()}" placeholder="I got promoted!"></md-text-field>
            </div>

            <div slot="footer" class="dialog-footer-actions">
                <md-button variant="text" @click="${() => this.markAsSensitive()}">
                    Set Visibility
                    <md-icon src="/assets/eye-outline.svg"></md-icon>
                </md-button>

                <!--<div id="post-ai-actions">-->
                ${this.showPrompt === false ? html`<md-button size="small" pill @click="${() => this.openAIPrompt()}">AI: Generate Image</md-button>` : null}
                <!--</div>-->

                ${this.attaching === false ? html`
                    <ul>
                    ${this.attachmentPreviews.map((preview) => {
                        return html`
                        <div class="img-preview">
                            <md-button size="small" @click="${() => this.removeImage(preview)}">
                                <md-icon src="/assets/close-outline.svg"></md-icon>
                            </md-button>
                            <img src="${preview}" />
                        </div>
                        `
                    })}
                    </ul>
                    ` : html`<div id="attachment-loading"><sl-skeleton effect="sheen"></sl-skeleton></div>`}



                ${this.showPrompt ? html`<div id="ai-image">
                    ${this.showPrompt && this.generatedImage ? html`
                        <img src="${this.generatedImage}">
                        ` : this.showPrompt && this.generatingImage === false ? html`<div id="ai-preview-block"><p>Enter a prompt to generate an image with AI!</p></div>` : html`<div id="ai-preview-block"><sl-skeleton effect="sheen"></sl-skeleton></div>`
                    }
                    ${this.showPrompt ? html`
                        <div id="ai-input-block">
                        <sl-input placeholder="A picture of an orange cat" @sl-change="${(e: any) => this.doAIImage(e.target.value)}"></sl-input>

                        <md-button ?disabled=${!this.generatedImage} pill variant="filled" @click="${() => this.addAIImageToPost()}">Add to post</md-button>
                        </div>
                        ` : null
                    }
                </div>` : null}

                <md-button pill variant="outlined" @click="${() => this.attachFile()}">
                    Attach Media
                    <md-icon src="/assets/attach-outline.svg"></md-icon>
                </md-button>
                <md-button ?disabled="${this.hasStatus === false || this.attaching === true}" pill variant="filled" @click="${() => this.publish()}">Publish</md-button>
            </div>
        </md-dialog>
        `;
    }
}
