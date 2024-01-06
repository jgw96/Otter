import { test, expect } from '@playwright/test';

const url = 'http://localhost:3000';

// before each test
test.beforeEach(async ({ page }) => {
    await page.goto(url);
});

test('ensure application loads', async ({ page }) => {
    // find the button with the text "Login"
    const loginButton = page.locator('text=Login');

    // expect loginButton to exist and be visible
    await expect(loginButton).toBeVisible();
});

test('ensure home page loads with server and token', async ({ page }) => {
    // add token to local storage
    await page.evaluate(() => {
        localStorage.setItem("server", "https://tech.lgbt");
        localStorage.setItem("accessToken", "84oZCLxHFOUEP_rLET5r1FcRvNhGYfWoahtSSq4ZQ6I");
    });

    await page.reload();

    await page.waitForLoadState('networkidle');

    // ensure the url contains /home
    expect(page.url()).toContain('/home');
});

test('ensure timeline loads on home page', async ({ page }) => {
    await page.evaluate(() => {
        localStorage.setItem("server", "https://tech.lgbt");
        localStorage.setItem("accessToken", "84oZCLxHFOUEP_rLET5r1FcRvNhGYfWoahtSSq4ZQ6I");
    });

    await page.reload();

    await page.waitForLoadState('networkidle');

    // expect the timeline to be visible
    await expect(page.locator('#sl-tab-panel-1 app-timeline')).toBeVisible();
});

test('ensure that the notifications tab loads', async ({ page }) => {
    await page.evaluate(() => {
        localStorage.setItem("server", "https://tech.lgbt");
        localStorage.setItem("accessToken", "84oZCLxHFOUEP_rLET5r1FcRvNhGYfWoahtSSq4ZQ6I");
    });

    await page.reload();

    await page.waitForLoadState('networkidle');

    // click the notifications tab
    await page.click('sl-tab[panel="notifications"]');

    // expect the notifications tab to be visible
    await expect(page.locator('#sl-tab-panel-7 app-notifications')).toBeVisible();
});

test('ensure that the bookmarks tab loads', async ({ page }) => {
    await page.evaluate(() => {
        localStorage.setItem("server", "https://tech.lgbt");
        localStorage.setItem("accessToken", "84oZCLxHFOUEP_rLET5r1FcRvNhGYfWoahtSSq4ZQ6I");
    });

    await page.reload();

    await page.waitForLoadState('networkidle');

    // click the notifications tab
    await page.click('sl-tab[panel="bookmarks"]');

    // expect the notifications tab to be visible
    await expect(page.locator('#sl-tab-panel-5 app-bookmarks')).toBeVisible();
});

test('ensure that the search tab loads', async ({ page }) => {
    await page.evaluate(() => {
        localStorage.setItem("server", "https://tech.lgbt");
        localStorage.setItem("accessToken", "84oZCLxHFOUEP_rLET5r1FcRvNhGYfWoahtSSq4ZQ6I");
    });

    await page.reload();

    await page.waitForLoadState('networkidle');

    // click the notifications tab
    await page.click('sl-tab[panel="search"]');

    // expect the notifications tab to be visible
    await expect(page.locator('#sl-tab-panel-8 app-search')).toBeVisible();
});

test('ensure service worker is registered', async ({ page }) => {
    test.slow();
    // expect the service worker to be registered
    await expect(await page.evaluate(async () => await navigator.serviceWorker.getRegistration())).toBeTruthy();
});


