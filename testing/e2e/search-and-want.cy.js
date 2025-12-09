describe('End-to-end: Search community, view item, and mark as wanted', () => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'testpassword123';
  const testUser = {
        username: 'testuser55',
        email: testEmail,
        password: testPassword
    };
  before(() => {
    // Ensure test user exists via backend API (backend server runs on port 4000)
    cy.request({
        method: 'POST',
        url: 'http://localhost:4000/api/auth/register',
        body: testUser,
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 201, 400, 409]).to.include(res.status);
      });
    cy.visit('/login');
  });

  it('logs in, searches for a community, selects an item, and marks it as wanted', () => {
    // Fill in login form
    cy.get('#login-email').type(testEmail);
    cy.get('#login-password').type(testPassword);
    cy.get('button.auth-button').contains(/login/i).click();

    // Wait for redirect and verify logged in (frontend default port)
    cy.url().should('eq', 'http://localhost:5173/');

    // 2. Search for a community with partial search using explicit IDs
    cy.get('#community-search').type('Pokemon');
    cy.get('#community-search-btn').click();

    // Wait for search results container
    cy.get('div[role="list"][aria-label="Search results"]', { timeout: 5000 }).should('be.visible');

    // Verify at least one search result appears
    cy.get('div[aria-label="Search results"] article.community').should('have.length.greaterThan', 0);

    // 3. Click on the first community result to view it
    cy.get('div[aria-label="Search results"] article.community').first().within(() => {
      cy.get('button.community-action').click();
    });

    // Verify we're now in a community collection view
    cy.url().should('include', '/collection/');

    // 4. Wait for items to load and mark the first item as "want"
    cy.get('div[role="list"][aria-label="Community items"] article.itemCard', { timeout: 5000 }).should(
      'have.length.greaterThan',
      0,
    );

    // In community view the status is a select; set first select to "want"
    cy.get('select[id^="status-"]').first().select('want').should('have.value', 'want');
  });
});
