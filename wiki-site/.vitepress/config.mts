import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'The Petty Lord Wiki',
  description: 'Implementation, testing and operations guide for The Petty Lord.',
  base: '/wiki/',
  cleanUrls: true,
  ignoreDeadLinks: false,
  lastUpdated: true,
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/krishiv-ga/petty-lord/edit/main/wiki-site/:path',
      text: 'Edit this page on GitHub',
    },
    nav: [
      { text: 'Getting started', link: '/getting-started' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'Game systems', link: '/game-systems/time-economy-orders' },
      { text: 'Development', link: '/development/work-packets' },
      { text: 'Operations', link: '/operations/logging' },
      { text: 'Reference', link: '/reference/commands' },
    ],
    sidebar: [
      {
        text: 'Start',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Getting started', link: '/getting-started' },
        ],
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Overview', link: '/architecture/overview' },
          { text: 'Deterministic simulation', link: '/architecture/deterministic-sim' },
          { text: 'Scheduler and RNG', link: '/architecture/scheduler-and-rng' },
          { text: 'Content and schemas', link: '/architecture/content-and-schemas' },
          { text: 'Persistence', link: '/architecture/persistence' },
          { text: 'UI and assets', link: '/architecture/ui-and-assets' },
        ],
      },
      {
        text: 'Game systems',
        items: [
          { text: 'Time, economy and Orders', link: '/game-systems/time-economy-orders' },
          { text: 'Politics and support', link: '/game-systems/politics-and-support' },
          { text: 'Claim, Church and succession', link: '/game-systems/claim-church-succession' },
          { text: 'War and occupation', link: '/game-systems/war-and-occupation' },
          { text: 'AI, knowledge and events', link: '/game-systems/ai-knowledge-events' },
          { text: 'Endings', link: '/game-systems/endings' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Work packets', link: '/development/work-packets' },
          { text: 'Agent workflow', link: '/development/agent-workflow' },
          { text: 'Testing', link: '/development/testing' },
          { text: 'Debugging', link: '/development/debugging' },
          { text: 'Balance and paperplay', link: '/development/balance-and-paperplay' },
          { text: 'Visual language', link: '/development/visual-language' },
        ],
      },
      {
        text: 'Operations',
        items: [
          { text: 'Logging', link: '/operations/logging' },
          { text: 'Releases', link: '/operations/releases' },
          { text: 'Deployment', link: '/operations/deployment' },
          { text: 'Troubleshooting', link: '/operations/troubleshooting' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Commands', link: '/reference/commands' },
          { text: 'State schema', link: '/reference/state-schema' },
          { text: 'Content schema', link: '/reference/content-schema' },
          { text: 'Action catalog', link: '/reference/action-catalog' },
          { text: 'Glossary', link: '/reference/glossary' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/krishiv-ga/petty-lord' }],
  },
});
