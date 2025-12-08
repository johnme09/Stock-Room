const { defineConfig } =  require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {    },
    specPattern: 'testing/e2e/**/*.cy.js',
    supportFile: 'testing/e2e/support/e2e.js',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
