describe('Authentication', () => {
    const testUser = {
        username: `testuser_${Date.now()}`,
        email: `testuser_${Date.now()}@example.com`,
        password: 'password123'
    };

    it('should register a new user', () => {
        cy.visit('/register');
        cy.get('input[name="username"]').type(testUser.username);
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        // Should redirect to login or home, depending on flow. 
        // Assuming redirect to login after registration or auto-login.
        // Let's check for URL or UI element.
        cy.url().should('include', '/');
    });

    it('should login with valid credentials', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        cy.url().should('eq', Cypress.config().baseUrl + '/');
        // Verify user is logged in (e.g., check for profile link or logout button)
        // Adjust selector based on actual UI
        cy.contains('Profile').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();

        cy.contains('Invalid credentials').should('be.visible'); // Adjust error message text
    });

    it('should logout successfully', () => {
        // Login first
        cy.login(testUser.email, testUser.password);

        // Perform logout
        cy.get('button').contains('Logout').click(); // Adjust selector

        cy.url().should('include', '/login');
        cy.contains('Login').should('be.visible');
    });
});
