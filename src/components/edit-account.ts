import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './md-text-field';
import './md-text-area';
import './md-checkbox';
import './md-button';
import { editAccount, getCurrentUser } from '../services/account';
import { fileOpen } from 'browser-fs-access';

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

            md-text-area {
                height: 200px;
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

            .image-wrapper md-button {
                place-self: flex-start;
                margin-top: 10px;
            }

            @media(max-width: 800px) {
                form {
                    width: 90vw;
                }
            }
        `
    ];

    async firstUpdated() {
        this.resetForm();

    }

    async resetForm() {
        const currentUser = await getCurrentUser();

        const displayNameField = this.shadowRoot?.querySelector('#display_name') as any;
        if (displayNameField) {
            displayNameField.value = currentUser.display_name;
        }

        const noteField = this.shadowRoot?.querySelector('#note') as any;
        if (noteField) {
            noteField.value = currentUser.note;
        }

        const lockedCheckbox = this.shadowRoot?.querySelector('#locked') as any;
        if (lockedCheckbox) {
            lockedCheckbox.checked = currentUser.locked;
        }

        const botCheckbox = this.shadowRoot?.querySelector('#bot') as any;
        if (botCheckbox) {
            botCheckbox.checked = currentUser.bot;
        }

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
        const displayNameField = this.shadowRoot?.querySelector('#display_name') as any;
        const noteField = this.shadowRoot?.querySelector('#note') as any;
        const lockedCheckbox = this.shadowRoot?.querySelector('#locked') as any;
        const botCheckbox = this.shadowRoot?.querySelector('#bot') as any;

        const data = {
            display_name: displayNameField?.value || '',
            note: noteField?.value || '',
            locked: lockedCheckbox?.checked ? 'true' : 'false',
            bot: botCheckbox?.checked ? 'true' : 'false',
            avatar: this.newAvatar,
            header: this.newHeader,
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
            <md-text-field type="text" id="display_name" name="display_name" .placeholder="${'Your name..'}"></md-text-field>

            <label for="bio">Bio</label>
            <md-text-area id="note" name="note" .placeholder="${'Write something about yourself..'}">
            </md-text-area>

            <div class="image-wrapper">
                <label for="avatar">Avatar</label>

                <img id="avatar-preview" src="/assets/icons/256-icon.png" alt="Avatar preview">

                <md-button variant="filled" @click="${() => this.changeAvatar()}">Choose New</md-button>
            </div>

            <div class="image-wrapper">
                <label for="header">Header</label>

                <img id="header-preview" src="/assets/icons/256-icon.png" alt="Header preview">

                <md-button variant="filled" @click="${() => this.changeHeader()}">Choose New</md-button>
            </div>

            <label for="locked">Locked</label>
            <md-checkbox id="locked" name="locked"></md-checkbox>

            <label for="bot">Bot</label>
            <md-checkbox id="bot" name="bot"></md-checkbox>

            <md-button @click="${() => this.submitProfile()}" id="submit" variant="filled">Submit</md-button>
        </form>
        `;
    }
}
