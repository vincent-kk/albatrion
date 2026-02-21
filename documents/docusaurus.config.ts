import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'Albatrion',
  tagline: 'Technical documentation for Albatrion packages',
  favicon: 'img/image2_22_c.png',

  url: 'https://vincent-kk.github.io',
  baseUrl: '/albatrion/',

  organizationName: 'vincent-kk',
  projectName: 'albatrion',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    localeConfigs: {
      ko: {
        label: '한국어',
        direction: 'ltr',
        htmlLang: 'ko',
      },
    },
  },

  future: {
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
      rspackBundler: true,
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/vincent-kk/albatrion/tree/master/documents/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    'docusaurus-plugin-llms',
    function ajvEsmFixPlugin() {
      return {
        name: 'ajv-esm-fix',
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  resolve: { fullySpecified: false },
                },
              ],
            },
          };
        },
      };
    },
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'ko'],
        indexBlog: false,
        docsRouteBasePath: '/docs',
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Albatrion',
      items: [
        {
          position: 'left',
          label: '@canard',
          to: '/docs/canard/',
        },
        {
          position: 'left',
          label: '@lerx',
          to: '/docs/lerx/',
        },
        {
          position: 'left',
          label: '@winglet',
          to: '/docs/winglet/',
        },
        {
          position: 'left',
          label: '@slats',
          to: '/docs/slats/',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/vincent-kk/albatrion',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Packages',
          items: [
            { label: '@canard/schema-form', to: '/docs/canard/schema-form/' },
            { label: '@lerx/promise-modal', to: '/docs/lerx/promise-modal/' },
            { label: '@winglet utilities', to: '/docs/winglet/' },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/vincent-kk/albatrion',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Albatrion.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['json', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
