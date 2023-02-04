import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { cache } from 'lit/directives/cache.js';

import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';

@customElement('right-click')
export class RightClick extends LitElement {
    static styles = [
        css`
            :host {
                display: block;

                content-visibility: auto;
                contain: layout style paint;
            }

            #context-menu {
                position: fixed;
                z-index: 10000;
                width: 150px;
                background: #1blala;
                border-radius: 5px;
                display: none;
                pointer-events: none;
            }

            #context-menu.visible {
              display: block;
              pointer-events: auto;
            }

        `
    ];

    firstUpdated() {
        const contextMenu = this.shadowRoot?.getElementById("context-menu");
        const scope = document.querySelector("body");

        console.log("contextMenu", contextMenu);

        if (scope && contextMenu) {
            scope.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                const { clientX: mouseX, clientY: mouseY } = event;
                contextMenu.style.top = `${mouseY}px`;
                contextMenu.style.left = `${mouseX}px`;
                contextMenu.classList.add("visible");
                event.preventDefault();
            });
        }
    }

    render() {
        return html`
        <div id="context-menu">
            <sl-menu>
                <sl-menu-item>Item 1</sl-menu-item>
                <sl-menu-item>Item 2</sl-menu-item>
                <sl-menu-item>Item 3</sl-menu-item>

                <sl-menu-divider></sl-menu-divider>

                <sl-menu-item>Item 4</sl-menu-item>
                <sl-menu-item>Item 5</sl-menu-item>
                <sl-menu-item>Item 6</sl-menu-item>
            </sl-menu>
        </div>
        `;
    }
}
