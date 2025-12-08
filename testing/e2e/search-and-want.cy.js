describe('End-to-end: Search community, view item, and mark as wanted', () => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'testpassword123';

  beforeEach(() => {
    // Start at home page
    cy.visit('/');
  });

  it('logs in, searches for a community, selects an item, and marks it as wanted', () => {
    // 1. Login
    cy.contains('a', /login|sign in/i).click({ force: true });
    cy.url().should('include', '/login');

    // Fill in login form
    cy.get('#login-email').type(testEmail);
    cy.get('#login-password').type(testPassword);
    cy.get('button').contains(/login/i).click();

    // Wait for redirect and verify logged in
    cy.url().should('eq', 'http://localhost:3000/');

    // 2. Search for a community with partial search
    cy.get('input[type="search"]').type('Pokemon');
    cy.get('button').contains(/search/i).click();

    // Wait for search results
    cy.contains('Search results', { timeout: 5000 }).should('be.visible');

    // Verify at least one search result appears
    cy.get('article[role="listitem"]').should('have.length.greaterThan', 0);

    // 3. Click on the first community result to view it
    cy.get('article[role="listitem"]').first().within(() => {
      cy.contains('button', /view community/i).click();
    });

    // Verify we're now in a community collection view
    cy.url().should('include', '/collection/');

    // 4. Wait for items to load and mark the first item as "wanted"
    cy.get('article[role="listitem"]', { timeout: 5000 }).should('have.length.greaterThan', 0);

    // Find and interact with the first item's "Want" radio button
    cy.get('input[type="radio"][value="want"]').first().click();

    // Verify the radio is now checked
    cy.get('input[type="radio"][value="want"]').first().should('be.checked');
  });
});
