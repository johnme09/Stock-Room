describe('Authentication', () => {
    const testUser = {
        username: 'cypress_test_user',
        email: 'cypress_test_user@example.com',
        password: 'password123'
    };

    before(() => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:4000/api/auth/register',
            body: testUser,
            failOnStatusCode: false,
        }).then((res) => {
            expect([200, 201, 400, 409]).to.include(res.status);
        });
    });

    it('should login with valid credentials', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();


        cy.location('pathname').should('eq', '/');


        cy.contains(`Hi, ${testUser.username}`).should('be.visible');

    });



    it('should show error for invalid credentials', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();

        cy.contains('Invalid email or password').should('be.visible');
        cy.location('pathname').should('eq', '/login');
    });

    it('should logout successfully', () => {
        cy.login(testUser.email, testUser.password);


        cy.get('button[aria-label="Toggle navigation menu"]').click();

        cy.contains('nav[aria-label="Main navigation"] *', 'Log out').click();

        cy.location('pathname').should('eq', '/');

        cy.contains('Log in to track your favorite communities').should('be.visible');

    });



});
