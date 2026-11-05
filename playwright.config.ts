/* =========================================================================
   playwright.config.ts — testes de responsividade e navegação
   -------------------------------------------------------------------------
   `npm test` faz o build, sobe o preview e roda os testes em 6 larguras
   (360 → 1920). Ver tests/site.spec.ts.
   ========================================================================= */
import { defineConfig, devices } from '@playwright/test';

const BASE = '/portofolio-developer-automation-cientista/';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:4322${BASE}`,
    colorScheme: 'dark',
    launchOptions: { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  webServer: {
    command: 'npm run build && npx astro preview --port 4322 --ignore-lock',
    url: `http://localhost:4322${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'celular-360', use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 740 } } },
    { name: 'iphone-390', use: { ...devices['iPhone 14'], browserName: 'chromium' } },
    { name: 'celular-deitado', use: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-1920', use: { viewport: { width: 1920, height: 1080 } } },
  ],
});
