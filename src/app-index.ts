import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import './pages/app-login';
import './components/header';
import './styles/global.css';

@customElement('app-index')
export class AppIndex extends LitElement {
  static get styles() {
    return css`
      main {
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 16px;
      }

      @media(max-width: 600px) {
        main {
          padding-left: 8px;
          padding-right: 8px;
        }
      }

      #routerOutlet > * {
        width: 100% !important;
      }

      #routerOutlet > .leaving {
        animation: 160ms fadeOut ease-in-out;
      }

      #routerOutlet > .entering {
        animation: 160ms fadeIn linear;
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }

        to {
          opacity: 0;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0.2;
        }

        to {
          opacity: 1;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/

    // For more info on using the @vaadin/router check here https://vaadin.com/router
    const router = new Router(this.shadowRoot?.querySelector('#routerOutlet'));
    router.setRoutes([
      // temporarily cast to any because of a Type bug with the router
      {
        path: (import.meta as any).env.BASE_URL,
        animate: true,
        children: [
          { path: '', component: 'app-login' },
          {
            path: 'home',
            component: 'app-home',
            action: async () => {
              await import('./pages/app-home.js');
            }
          },
          {
            path: 'search',
            component: 'search-page',
            action: async () => {
              await import('./pages/search-page.js');
            }
          },
          {
            path: "account",
            component: "app-profile",
            action: async () => {
              await import("./pages/app-profile.js");
            }
          },

          {
            path: 'followers',
            component: 'app-followers',
            action: async () => {
              await import('./pages/app-followers.js');
            }
          },
          {
            path: 'about',
            component: 'app-about',
            action: async () => {
              await import('./pages/app-about/app-about.js');
            },
          },
          {
            path: 'messages',
            component: 'app-messages',
            action: async () => {
              await import('./pages/app-messages.js');
            }
          },
          {
            path: 'following',
            component: 'app-following',
            action: async () => {
              await import('./pages/app-following.js');
            }
          },
          {
            path: 'hashtag',
            component: 'app-hashtags',
            action: async () => {
              await import('./pages/app-hashtags.js');
            }
          }
        ],
      } as any,
    ]);
  }

  render() {
    return html`
      <div>
        <main>
          <div id="routerOutlet"></div>
        </main>
      </div>
    `;
  }
}
