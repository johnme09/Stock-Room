// Local test support commands for testing/e2e
// Mirrors the repo-level Cypress commands so tests run inside the `testing` project
/* global Cypress, cy */

// Helper function to get API base URL
// Can be used in tests as: const baseUrl = Cypress.env('apiBaseUrl') || 'https://stockroom-1078634816222.us-central1.run.app/api';
// Or access via: cy.getApiBaseUrl()

Cypress.Commands.add('getApiBaseUrl', () => {
  return Cypress.env('apiBaseUrl') || 'https://stockroom-1078634816222.us-central1.run.app/api';
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});
