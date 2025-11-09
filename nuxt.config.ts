// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image', '@nuxt/ui', '@nuxtjs/i18n'],
  imports: { autoImport: false },
  css: ['~/assets/css/fonts.css'],
  colorMode: {
    preference: 'light',
  },
  i18n: {
    locales: [{ code: 'en', name: 'English', iso: 'en-US' }],
    defaultLocale: 'en',
    strategy: 'no_prefix',
  },
});
