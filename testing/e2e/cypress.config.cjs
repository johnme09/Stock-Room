const { defineConfig } =  require('cypress');

module.exports = defineConfig({
  e2e: {
    // baseUrl not needed since we're testing API directly with full URLs
    setupNodeEvents(on, config) {
      // Read API base URL from environment variable, default to deployed URL
      // Can override with API_BASE_URL or CYPRESS_API_BASE_URL env vars for local testing
      const apiBaseUrl = process.env.API_BASE_URL || process.env.CYPRESS_API_BASE_URL || 'https://stockroom-1078634816222.us-central1.run.app/api';
      config.env.apiBaseUrl = apiBaseUrl;
      return config;
    },
    specPattern: '**/*.cy.js',
    supportFile: 'e2e/support/commands.js',
    video: false,
    screenshotOnRunFailure: false,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
