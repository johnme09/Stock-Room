// Local test support commands for testing/e2e
// Mirrors the repo-level Cypress commands so tests run inside the `testing` project
/* global Cypress, cy */

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});
