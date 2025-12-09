const { defineConfig } =  require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {    },
    specPattern: '**/*.cy.js',
    supportFile: 'e2e/support/commands.js',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
