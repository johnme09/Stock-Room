const { defineConfig } =  require('cypress');

module.exports = defineConfig({
  e2e: {
    // baseUrl not needed since we're testing API directly with full URLs
    setupNodeEvents(on, config) {    },
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
