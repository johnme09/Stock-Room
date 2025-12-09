describe('Users API Tests', () => {
  const baseUrl = 'http://localhost:4000/api';
  let authToken = null;
  let testUserId = null;
  let testCommunityId = null;

  const testUser = {
    username: `usertest_${Date.now()}`,
    email: `user_${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  const testCommunity = {
    title: `User Test Community ${Date.now()}`,
    description: 'Community for user testing'
  };

  before(() => {
    // Register user and create community
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: testUser
    }).then((response) => {
      authToken = response.body.token;
      testUserId = response.body.user.id;
      
      return cy.request({
        method: 'POST',
        url: `${baseUrl}/communities`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testCommunity
      });
    }).then((response) => {
      testCommunityId = response.body.community.id;
    });
  });

  after(() => {
    // Cleanup: Delete community
    if (authToken && testCommunityId) {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/communities/${testCommunityId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false
      });
    }
  });

  it('should get current user profile', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users/me`,
      headers: { Authorization: `Bearer ${authToken}` }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('user');
      expect(response.body.user.id).to.eq(testUserId);
      expect(response.body.user.username).to.eq(testUser.username);
      expect(response.body.user.email).to.eq(testUser.email);
      expect(response.body).to.have.property('favoriteCommunities');
    });
  });

  it('should fail to get profile without authentication', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users/me`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should update user profile', () => {
    const updates = {
      about: 'This is a test user profile',
      image: 'https://example.com/profile.jpg'
    };
    
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/users/me`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: updates
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.user.about).to.eq(updates.about);
      expect(response.body.user.image).to.eq(updates.image);
    });
  });

  it('should fail to update profile without authentication', () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/users/me`,
      body: { about: 'Unauthorized update' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should add community to favorites', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/users/me/favorites/${testCommunityId}`,
      headers: { Authorization: `Bearer ${authToken}` }
    }).then((response) => {
      expect(response.status).to.eq(204);
      
      // Verify it's in favorites
      cy.request({
        method: 'GET',
        url: `${baseUrl}/users/me`,
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((getResponse) => {
        const favoriteIds = getResponse.body.favoriteCommunities.map(c => c.id || c._id);
        expect(favoriteIds).to.include(testCommunityId);
      });
    });
  });

  it('should remove community from favorites', () => {
    // First add it
    cy.request({
      method: 'POST',
      url: `${baseUrl}/users/me/favorites/${testCommunityId}`,
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(() => {
      // Then remove it
      return cy.request({
        method: 'DELETE',
        url: `${baseUrl}/users/me/favorites/${testCommunityId}`,
        headers: { Authorization: `Bearer ${authToken}` }
      });
    }).then((response) => {
      expect(response.status).to.eq(204);
      
      // Verify it's removed
      cy.request({
        method: 'GET',
        url: `${baseUrl}/users/me`,
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((getResponse) => {
        const favoriteIds = getResponse.body.favoriteCommunities.map(c => c.id || c._id);
        expect(favoriteIds).to.not.include(testCommunityId);
      });
    });
  });

  it('should fail to add non-existent community to favorites', () => {
    const fakeId = '507f1f77bcf86cd799439011';
    cy.request({
      method: 'POST',
      url: `${baseUrl}/users/me/favorites/${fakeId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should search users by username', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users?q=${testUser.username.substring(0, 5)}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('users');
      expect(response.body.users).to.be.an('array');
      const found = response.body.users.find(u => u.id === testUserId);
      expect(found).to.exist;
    });
  });

  it('should get user by ID', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users/${testUserId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('user');
      expect(response.body.user.id).to.eq(testUserId);
      expect(response.body.user.username).to.eq(testUser.username);
    });
  });

  it('should fail to get non-existent user', () => {
    const fakeId = '507f1f77bcf86cd799439011';
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users/${fakeId}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});

