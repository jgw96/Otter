import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import { getSettings, setSettings, Settings } from '../services/settings';

@customElement('app-theme')
export class AppTheme extends LitElement {
    @state() primary_color: string = '#809bce';
    @state() font_size: string = '16px';

    settings: Settings | undefined;

    static styles = [
        css`
            :host {
                display: block;
            }

            #open-button {
                position: fixed;
                bottom: 20px;
                left: 16px;
            }

            #blue {
                background-color: #809bce;
            }

            #green {
                background-color: #95b8d1;
            }

            #red {
                background-color: #b8e0d4;
            }

            #yellow {
                background-color: #d6eadf;
            }

            #purple {
                background-color: #eac4d5;
            }

            #orange {
                background-color: #c095e4;
            }

            #pink {
                background-color: #f8bbd0;
            }

            #brown {
                background-color: #d7ccc8;
            }

            #custom {
                background-color: #057dcd;
            }

            .color {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                border: 4px solid var(--sl-color-primary-600);
            }

            #colors-grid {
                display: grid;
                grid-template-columns: repeat(3, 0.2fr);
                gap: 18px;
            }

            span {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 16px;
                display: block;
            }

            #wrapper {
                display: flex;
                flex-direction: column;
                gap: 40px;
            }
        `
    ];

    firstUpdated() {
        this.settings = getSettings();

        const potentialColor = this.settings.primary_color;
        const potentialFontSize = this.settings.font_size;

        if (potentialColor) {
          this.primary_color = potentialColor;
          document.body.style.setProperty('--sl-color-primary-600', potentialColor);
        }
        else {
          // get css variable color
          const color = getComputedStyle(document.body).getPropertyValue('--sl-color-primary-600');
          this.primary_color = color;
        }

        if (potentialFontSize) {
            this.font_size = potentialFontSize;
            document.body.style.setProperty('--sl-font-size-medium', potentialFontSize);
        }
        else {
            // get css variable size
            const fontSize = getComputedStyle(document.body).getPropertyValue('--sl-font-size-medium');
            this.font_size = fontSize;
        }
    }

    chooseColor(color: string) {
        console.log(color);

        this.primary_color = color;

        setSettings({
            primary_color: color,
            font_size: this.font_size,
            data_saver: this.settings!.data_saver,
            wellness: this.settings!.wellness,
            focus: this.settings!.focus
        })

        // set css variable color
        document.body.style.setProperty('--sl-color-primary-600', color);
    }

    changeFontSize(size: string) {
        setSettings({
            primary_color: this.settings!.primary_color,
            font_size: `${size}px`,
            data_saver: this.settings!.data_saver,
            wellness: this.settings!.wellness,
            focus: this.settings!.focus
        })

        this.font_size = `${size}px`;

        // set css variable color
        document.documentElement.style.setProperty('--sl-font-size-medium', `${size}px`);
    }

    async customColor() {
        const eyeDropper = new (window as any).EyeDropper();

        const color = await eyeDropper.open();
        this.chooseColor(color);
    }

    render() {
        return html`
        <div id="wrapper">
            <div>
                <span>Primary Color</span>
                <div id="colors-grid">
                    <!-- list of pastel colors -->
                    <div class="color" id="blue" @click="${() => this.chooseColor("#809bce")}"></div>
                    <div class="color" id="green" @click="${() => this.chooseColor("#95b8d1")}"></div>
                    <div class="color" id="red" @click="${() => this.chooseColor("#b8e0d4")}"></div>
                    <div class="color" id="yellow" @click="${() => this.chooseColor("#d6eadf")}"></div>
                    <div class="color" id="purple" @click="${() => this.chooseColor("#eac4d5")}"></div>
                    <div class="color" id="orange" @click="${() => this.chooseColor("#c095e4")}"></div>
                    <div class="color" id="pink" @click="${() => this.chooseColor("#f8bbd0")}"></div>
                    <div class="color" id="brown" @click="${() => this.chooseColor("#d7ccc8")}"></div>
                    <div class="color" id="custom" @click="${() => this.chooseColor("#057dcd")}"></div>

                    ${ "EyeDropper" in window ? html`<sl-button circle @click="${() => this.customColor()}">
                      <sl-icon src="/assets/add-outline.svg"></sl-icon>
                    </sl-button>` : null}
                </div>
            </div>

            <div>
                <span>Font Size</span>
                <sl-input @sl-change="${($event: any) => this.changeFontSize($event.target.value)}" type="number" min="12" max="46" value="16"></sl-input>
            </div>
        </div>
        `;
    }
}
