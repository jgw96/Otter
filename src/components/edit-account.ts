import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { provideFluentDesignSystem, fluentTextField, fluentTextArea, fluentCheckbox } from '@fluentui/web-components';
import { editAccount, getCurrentUser } from '../services/account';
import { fileOpen } from 'browser-fs-access';

provideFluentDesignSystem().register(fluentTextField(), fluentTextArea(), fluentCheckbox());

@customElement('edit-account')
export class EditAccount extends LitElement {

    @state() newAvatar: File | null = null;
    @state() newHeader: File | null = null;

    static styles = [
        css`
            :host {
                display: block;
            }

            form {
                display: flex;
                flex-direction: column;

                width: 50vw;
                padding: 10px;

                gap: 10px;

                background: #ffffff12;
                border-radius: 6px;

                height: 86vh;
                overflow-y: auto;
            }

            form::-webkit-scrollbar {
                display: none;
            }

            form label {
                font-weight: bold;
            }

            fluent-text-area::part(control) {
                height: 100%;
            }

            #submit {
                place-self: flex-end;
            }

            .image-wrapper {
                display: flex;
                flex-direction: column;
            }

            .image-wrapper img {
                width: 130px;
                height: 130px;
                object-fit: cover;
                border-radius: 6px;
            }

            .image-wrapper fluent-button {
                place-self: flex-start;
                margin-top: 10px;
            }

            @media(max-width: 800px) {
                form {
                    width: 90vw;
                }
            }

            @media(prefers-color-scheme: dark) {
                fluent-text-area::part(control), fluent-button[appearance="neutral"]::part(control), fluent-text-field::part(control), fluent-text-field::part(root) {
                    background: #1e1e1e;
                    color: white;
                }
            }
        `
    ];

    async firstUpdated() {
        this.resetForm();

    }

    async resetForm() {
        const currentUser = await getCurrentUser();
        this.shadowRoot?.querySelector('#display_name')?.setAttribute('value', currentUser.display_name);
        this.shadowRoot?.querySelector('#note')?.setAttribute('value', currentUser.note);
        this.shadowRoot?.querySelector('#locked')?.setAttribute('checked', currentUser.locked);
        this.shadowRoot?.querySelector('#bot')?.setAttribute('checked', currentUser.bot);

        const avatarPreview = this.shadowRoot?.querySelector('#avatar-preview');
        if (avatarPreview) {
            avatarPreview.setAttribute('src', currentUser.avatar);
        }

        const headerPreview = this.shadowRoot?.querySelector('#header-preview');
        if (headerPreview) {
            headerPreview.setAttribute('src', currentUser.header);
        }

        const avatarInput = this.shadowRoot?.querySelector('#avatar');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    if (avatarPreview) {
                        avatarPreview.setAttribute('src', reader.result as string);
                    }
                });
                reader.readAsDataURL(file);
            });
        }

        const headerInput = this.shadowRoot?.querySelector('#header');
        if (headerInput) {
            headerInput.addEventListener('change', (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    if (headerPreview) {
                        headerPreview.setAttribute('src', reader.result as string);
                    }
                });
                reader.readAsDataURL(file);
            });
        }

    }

    async submitProfile() {
        const form = this.shadowRoot?.querySelector('form');
        if (!form) return;

        const formData = new FormData(form);

        const data = {
            display_name: formData.get('display_name') as string,
            note: formData.get('note') as string,
            locked: formData.get('locked') as string,
            bot: formData.get('bot') as string,
            avatar: formData.get('avatar') as File,
            header: formData.get('header') as File,
        };

        console.log(data);

        await editAccount(data.display_name, data.note, data.locked, data.bot, data.avatar, data.header);
    }

    async changeAvatar() {
        const blob = await fileOpen({
            mimeTypes: ['image/*'],
            startIn: 'pictures',
        });

        const blobURL = URL.createObjectURL(blob);

        if (blobURL) {
            const avatarPreview = this.shadowRoot?.querySelector('#avatar-preview');
            if (avatarPreview) {
                avatarPreview.setAttribute('src', blobURL);

                this.newAvatar = blob;
            }
        }
    }

    async changeHeader() {
        const blob = await fileOpen({
            mimeTypes: ['image/*'],
            startIn: 'pictures',
        });

        const blobURL = URL.createObjectURL(blob);

        if (blobURL) {
            const headerPreview = this.shadowRoot?.querySelector('#header-preview');
            if (headerPreview) {
                headerPreview.setAttribute('src', blobURL);

                this.newHeader = blob;
            }
        }
    }

    render() {
        return html`
        <form>
            <label for="name">Name</label>
            <fluent-text-field type="text" id="display_name" name="display_name" placeholder="Your name.."></fluent-text-field>

            <label for="bio">Bio</label>
            <fluent-text-area id="note" name="note" placeholder="Write something about yourself.." style="height:200px">
            </fluent-text-area>

            <div class="image-wrapper">
                <label for="avatar">Avatar</label>

                <img id="avatar-preview" src="/assets/icons/256-icon.png" alt="Avatar preview">

                <fluent-button appearance="accent" @click="${() => this.changeAvatar()}">Choose New</fluent-button>
            </div>

            <div class="image-wrapper">
                <label for="header">Header</label>

                <img id="header-preview" src="/assets/icons/256-icon.png" alt="Header preview">

                <fluent-button appearance="accent" @click="${() => this.changeHeader()}">Choose New</fluent-button>
            </div>

            <label for="locked">Locked</label>
            <fluent-checkbox id="locked" name="locked"></fluent-checkbox>

            <label for="bot">Bot</label>
            <fluent-checkbox id="bot" name="bot"></fluent-checkbox>

            <fluent-button @click="${() => this.submitProfile()}" id="submit" appearance="accent">Submit</fluent-button>
        </form>
        `;
    }
}
