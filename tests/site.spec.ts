/* =========================================================================
   site.spec.ts — o que precisa funcionar em TODOS os tamanhos de tela
   ========================================================================= */
import { test, expect, type Page } from '@playwright/test';

/** Coleta erros de JavaScript da página (falha o teste se houver). */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1200) < 700;

test('home carrega sem erros e sem rolagem lateral', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Carla');
  await page.waitForTimeout(2500); // dá tempo da cena 3D carregar
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'nada pode passar da largura da tela').toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test('todas as seções existem', async ({ page }) => {
  await page.goto('./');
  for (const id of ['sobre', 'projetos', 'lab', 'trajetoria', 'contratacao', 'contato']) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
});

test('alvos de toque têm pelo menos 44 px no celular', async ({ page }) => {
  test.skip(!isMobile(page), 'regra de toque vale para celular');
  await page.goto('./');
  const small = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('.btn, .pref, .chip-btn, .menu-btn, .faq summary, .proj')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ el: el.className, h: el.getBoundingClientRect().height }))
      .filter((x) => x.h < 44));
  expect(small).toEqual([]);
});

test('menu do celular abre, trava o conteúdo e fecha', async ({ page }) => {
  test.skip(!isMobile(page), 'menu em tela cheia só no celular');
  await page.goto('./');
  const btn = page.locator('.menu-btn');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.nav__list a').first()).toBeVisible();
  expect(await page.evaluate(() => document.querySelector('main')!.inert)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
});

test('filtro da trajetória esconde e mostra itens', async ({ page }) => {
  await page.goto('./');
  const dev = page.locator('.filter [data-type="dev"]');
  await dev.scrollIntoViewIfNeeded();
  await dev.click();
  await expect(page.locator('.tl[data-type="dev"]').first()).toBeHidden();
  await dev.click();
  await expect(page.locator('.tl[data-type="dev"]').first()).toBeVisible();
});

test('abre a página de um projeto e volta', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('./');
  await page.locator('.proj').first().click();
  await expect(page).toHaveURL(/projetos\/portal-de-operacoes/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Portal');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.getByRole('link', { name: /Todos os projetos/ }).click();
  await expect(page.locator('#projetos')).toBeAttached();
  expect(errors).toEqual([]);
});

test('painel de calibração abre e fecha', async ({ page }) => {
  await page.goto('./');
  await page.waitForTimeout(2500);
  if (isMobile(page)) await page.locator('.menu-btn').click();
  await page.locator('.pref[data-pref="panel"]').click();
  await expect(page.locator('.calib')).toBeVisible();
  await page.locator('.calib__close').click();
  await expect(page.locator('.calib')).toBeHidden();
});
