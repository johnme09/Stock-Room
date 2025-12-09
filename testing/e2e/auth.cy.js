describe('Authentication API Tests', () => {
  const baseUrl = 'http://localhost:4000/api';
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  let authToken = null;

  after(() => {
    // Cleanup: Try to delete test user if token exists
    if (authToken) {
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
      
      authToken = response.body.token;
    });
  });

  it('should fail to register with duplicate email', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: testUser,
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
        username: 'testuser2',
        email: 'invalid-email',
        password: 'testpassword123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail to register with short password', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: {
        username: 'testuser3',
        email: 'test3@example.com',
        password: 'short'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
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

