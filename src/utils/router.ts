import { html } from 'lit';

// @ts-ignore
import { Router } from '@thepassle/app-tools/router.js';
// @ts-ignore
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';
// @ts-ignore
import { title } from '@thepassle/app-tools/router/plugins/title.js';

export const router = new Router({
    routes: [
      {
        path: '',
        title: 'login',
        render: (context: any) => html`<app-login></app-login>`
      },
      {
        path: 'home',
        title: 'home',
        plugins: [
          lazy(() => import('../pages/app-home.js')),
        ],
        render: (context: any) => html`<app-home></app-home>`
      },
      {
        path: 'search',
        title: 'search',
        plugins: [
          lazy(() => import('../pages/search-page.js')),
        ],
        render: (context: any) => html`<search-page></search-page>`
      },
      {
        path: "account",
        title: "profile",
        plugins: [
          lazy(() => import('../pages/app-profile.js')),
        ],
        render: (context: any) => html`<app-profile></app-profile>`
      },
      {
        path: 'followers',
        title: 'followers',
        plugins: [
          lazy(() => import('../pages/app-followers.js')),
        ],
        render: (context: any) => html`<app-followers></app-followers>`
      },
      {
        path: 'about',
        title: 'about',
        plugins: [
          lazy(() => import('../pages/app-about/app-about.js')),
        ],
        render: (context: any) => html`<app-about></app-about>`
      },
      {
        path: 'messages',
        title: 'messages',
        plugins: [
          lazy(() => import('../pages/app-messages.js')),
        ],
        render: (context: any) => html`<app-messages></app-messages>`
      },
      {
        path: 'following',
        title: 'following',
        plugins: [
          lazy(() => import('../pages/app-following.js')),
        ],
        render: (context: any) => html`<app-following></app-following>`
      },
      {
        path: 'hashtag',
        title: 'hashtags',
        plugins: [
          lazy(() => import('../pages/app-following.js')),
        ],
        render: (context: any) => html`<app-hashtags></app-hashtags>`
      }
      // {
      //   path: 'bar/:id',
      //   title: ({ params }: any) => `Bar ${params.id}`,
      //   render: ({ params }: any) => `bar ${params.id}`
      // },
    ]
  });