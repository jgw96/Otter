import { test, expect } from '@playwright/test';

const url = 'https://wonderful-glacier-07b022d1e.2.azurestaticapps.net/';

// get username and password from environment variables
// const username = process.env.MAS_USERNAME || "";
// const password = process.env.MAS_PASSWORD || "";

// before each test
test.beforeEach(async ({ page }) => {
    await page.goto(url);
});

// Test suite
test('ensure application loads', async ({ page }) => {
    // find the button with the text "Login"
    const loginButton = page.locator('text=Login');

    // expect loginButton to exist and be visible
    await expect(loginButton).toBeVisible();
});

// test('ensure login works', async ({ page }) => {
//     await page.getByLabel('').click();
//     await page.getByLabel('').fill('tech.lgbt');
//     await page.getByRole('button', { name: 'Login' }).click();
//     await page.waitForLoadState('networkidle');
//     await page.getByLabel('E-mail address').fill(username);
//     await page.getByLabel('Password').click();
//     await page.getByLabel('Password').fill(password);
//     await page.getByLabel('Password').press('Enter');
//     await page.getByRole('button', { name: 'Authorize' }).click();
//     await page.waitForLoadState('networkidle');

//     // url should be ${url}home after login
//     expect(page.url()).toBe(`${url}home`);
// });

// test('ensure login works with https', async ({ page }) => {
//     await page.getByLabel('').click();
//     await page.getByLabel('').fill('https://tech.lgbt');
//     await page.getByRole('button', { name: 'Login' }).click();
//     await page.waitForLoadState('networkidle');
//     await page.getByLabel('E-mail address').fill(username);
//     await page.getByLabel('Password').click();
//     await page.getByLabel('Password').fill(password);
//     await page.getByLabel('Password').press('Enter');
//     await page.getByRole('button', { name: 'Authorize' }).click();
//     await page.waitForLoadState('networkidle');

//     // url should be ${url}home after login
//     expect(page.url()).toBe(`${url}home`);
// })