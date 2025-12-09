describe('Authentication API Tests', () => {
  const baseUrl = Cypress.env('apiBaseUrl') || 'https://stockroom-1078634816222.us-central1.run.app/api';
  
  // Generate unique test user data
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'testpassword123'
  };

  let authToken = null;
  let createdUserId = null;

  after(() => {
    // Cleanup: Attempt to delete test user if token exists
    // Note: User deletion may not be implemented, so this is best effort
    if (authToken && createdUserId) {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/users/me`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false
      });
    }
  });

  it('should register a new user', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: testUser
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('id');
      expect(response.body.user).to.have.property('username', testUser.username);
      expect(response.body.user).to.have.property('email', testUser.email);
      expect(response.body.user).to.not.have.property('passwordHash');
      expect(response.body.user).to.not.have.property('password');
      
      authToken = response.body.token;
      createdUserId = response.body.user.id;
    });
  });

  it('should fail to register with duplicate email', () => {
    // First register the user
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: {
        username: `testuser2_${timestamp}`,
        email: testUser.email, // Same email
        password: 'testpassword123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body).to.have.property('message');
    });
  });

  it('should fail to register with invalid email', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: {
        username: `testuser3_${timestamp}`,
        email: 'invalid-email',
        password: 'testpassword123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message');
    });
  });

  it('should fail to register with short password', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: {
        username: `testuser4_${timestamp}`,
        email: `test4_${timestamp}@example.com`,
        password: 'short'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message');
    });
  });

  it('should login with valid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: testUser.email,
        password: testUser.password
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
      expect(response.body.user.email).to.eq(testUser.email);
      expect(response.body.user.username).to.eq(testUser.username);
      
      authToken = response.body.token;
    });
  });

  it('should fail to login with invalid email', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: 'nonexistent@example.com',
        password: 'testpassword123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should fail to login with wrong password', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: testUser.email,
        password: 'wrongpassword'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });
});

