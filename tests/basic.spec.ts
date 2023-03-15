import { test, expect } from '@playwright/test';

const url = 'https://wonderful-glacier-07b022d1e.2.azurestaticapps.net/';

// get username and password from environment variables
const username = process.env.MAS_USERNAME || "";
const password = process.env.MAS_PASSWORD || "";

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
        localStorage.setItem("accessToken", "eXQJuum5bGmy5xkB_Xzx19_FThAmhI0W-dbBQp671CU");
    });

    await page.reload();

    await page.waitForLoadState('networkidle');

    // ensure the url contains /home
    expect(page.url()).toContain('/home');
});

test('ensure timeline loads on home page', async ({ page }) => {
    await page.evaluate(() => {
        localStorage.setItem("server", "https://tech.lgbt");
        localStorage.setItem("accessToken", "eXQJuum5bGmy5xkB_Xzx19_FThAmhI0W-dbBQp671CU");
    });

    await page.reload();

    await page.waitForLoadState('networkidle');

    // expect the timeline to be visible
    await expect(page.locator('#sl-tab-panel-1 app-timeline')).toBeVisible();
});

test('ensure that you can switch tabs, such as to the notifications tab', async ({ page }) => {
    await page.evaluate(() => {
        localStorage.setItem("server", "https://tech.lgbt");
        localStorage.setItem("accessToken", "eXQJuum5bGmy5xkB_Xzx19_FThAmhI0W-dbBQp671CU");
    });

    await page.reload();

    await page.waitForLoadState('networkidle');

    // click the notifications tab
    await page.click('sl-tab[panel="notifications"]');

    // expect the notifications tab to be visible
    await expect(page.locator('#sl-tab-panel-7 app-notifications')).toBeVisible();
});
