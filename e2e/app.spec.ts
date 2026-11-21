import { expect, test } from '@playwright/test';

test('abre el listado de Andidex', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('ion-title').first()).toContainText('Andidex');
});

test('abre la pantalla Acerca de', async ({ page }) => {
  await page.goto('/acerca');
  await expect(page.locator('h1')).toContainText('Andidex');
});