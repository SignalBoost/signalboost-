/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'es', 'pt', 'pl', 'ru'],
    defaultLocale: 'en',
    localeDetection: true,
  },
};

module.exports = nextConfig;
