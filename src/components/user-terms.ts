import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { fluentCheckbox, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentCheckbox());

@customElement('user-terms')
export class UserTerms extends LitElement {

    @state() private _interests: string[] = [];

    static styles = [
        css`
            :host {
                display: block;
            }

            ul {
                list-style: none;
                padding: 0;
                margin: 0;

                gap: 8px;
                display: flex;
                flex-direction: column;
                height: 200px;
                overflow-y: auto;
            }

            ul::-webkit-scrollbar {
                width: 8px;
            }

            @media(prefers-color-scheme: dark) {
                fluent-checkbox::part(label) {
                    color: white;
                }
            }
        `
    ];

    async firstUpdated() {
        const { get } = await import('idb-keyval');

        const interests = await get('interests');

        if (interests && interests.length > 0) {
            this._interests = interests;
        }
    }

    async handleChecked(e: CustomEvent) {
        const checkbox = e.target as any;
        const value = checkbox.value;

        console.log("checkbox", checkbox);
        console.log("value", value);

        if (checkbox.checked) {
            this._interests.push(value);
        } else {
            const index = this._interests.indexOf(value);
            if (index > -1) {
                this._interests.splice(index, 1);
            }
        }

        console.log("interests", this._interests);

        // dedupe this._interests
        this._interests = [...new Set(this._interests)];

        const { set } = await import('idb-keyval');
        await set('interests', this._interests);
    }

    render() {
        return html`
            <h4 id="title">Interests</h4>

            <div id="interests">
                <ul>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("news")}" @change="${($event: any) =>  this.handleChecked($event)}" value="news">News</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("technology")}" @change="${($event: any) =>  this.handleChecked($event)}" value="technology">Technology</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("sports")}" @change="${($event: any) =>  this.handleChecked($event)}" value="sports">Sports</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("politics")}" @change="${($event: any) =>  this.handleChecked($event)}" value="politics">Politics</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("entertainment")}" @change="${($event: any) =>  this.handleChecked($event)}" value="entertainment">Entertainment</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("business")}" @change="${($event: any) =>  this.handleChecked($event)}" value="business">Business</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("science")}" @change="${($event: any) =>  this.handleChecked($event)}" value="science">Science</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("health")}" @change="${($event: any) =>  this.handleChecked($event)}" value="health">Health</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("travel")}" @change="${($event: any) =>  this.handleChecked($event)}" value="travel">Travel</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("food")}" @change="${($event: any) =>  this.handleChecked($event)}" value="food">Food</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("fashion")}" @change="${($event: any) =>  this.handleChecked($event)}" value="fashion">Fashion</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("lifestyle")}" @change="${($event: any) =>  this.handleChecked($event)}" value="lifestyle">Lifestyle</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("art")}" @change="${($event: any) =>  this.handleChecked($event)}" value="art">Art</fluent-checkbox>
                    </li>
                    <li>
                        <fluent-checkbox ?checked="${this._interests.includes("music")}" @change="${($event: any) =>  this.handleChecked($event)}" value="music">Music</fluent-checkbox>
                    </li>
                </ul>
            </div>
        `;
    }
}
