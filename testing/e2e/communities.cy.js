describe('Communities API Tests', () => {
  const baseUrl = Cypress.env('apiBaseUrl') || 'https://stockroom-1078634816222.us-central1.run.app/api';
  
  let authToken = null;
  let testUserId = null;
  let testCommunityId = null;

  const timestamp = Date.now();
  const testUser = {
    username: `commtest_${timestamp}`,
    email: `comm_${timestamp}@example.com`,
    password: 'testpassword123'
  };

  const testCommunity = {
    title: `Test Community ${timestamp}`,
    description: 'This is a test community for Cypress testing',
    image: 'https://example.com/image.jpg'
  };

  before(() => {
    // Register and login a test user
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: testUser
    }).then((response) => {
      expect(response.status).to.eq(201);
      authToken = response.body.token;
      testUserId = response.body.user.id;
    });
  });

  after(() => {
    // Cleanup: Delete test community if it exists
    if (authToken && testCommunityId) {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/communities/${testCommunityId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false
      });
    }
  });

  it('should create a new community', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: testCommunity
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('community');
      expect(response.body.community).to.have.property('id');
      expect(response.body.community.title).to.eq(testCommunity.title);
      expect(response.body.community.description).to.eq(testCommunity.description);
      expect(response.body.community.ownerId).to.eq(testUserId);
      
      testCommunityId = response.body.community.id;
    });
  });

  it('should fail to create community without authentication', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities`,
      body: testCommunity,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should fail to create community with short title', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'AB',
        description: 'Too short'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should get a community by ID', () => {
    // Ensure we have a community ID
    if (!testCommunityId) {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/communities`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testCommunity
      }).then((response) => {
        testCommunityId = response.body.community.id;
      });
    }
    
    cy.request({
      method: 'GET',
      url: `${baseUrl}/communities/${testCommunityId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('community');
      expect(response.body.community.id).to.eq(testCommunityId);
      expect(response.body.community.title).to.eq(testCommunity.title);
    });
  });

  it('should fail to get non-existent community', () => {
    const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
    cy.request({
      method: 'GET',
      url: `${baseUrl}/communities/${fakeId}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should list all communities', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/communities`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('communities');
      expect(response.body.communities).to.be.an('array');
      // Should include our test community if it exists
      if (testCommunityId) {
        const found = response.body.communities.find(c => c.id === testCommunityId);
        expect(found).to.exist;
      }
    });
  });

  it('should search communities by query', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/communities?q=Test`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('communities');
      expect(response.body.communities).to.be.an('array');
    });
  });

  it('should update community', () => {
    // Ensure we have a community ID
    if (!testCommunityId) {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/communities`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testCommunity
      }).then((response) => {
        testCommunityId = response.body.community.id;
      });
    }
    
    const updatedData = {
      title: `Updated Community ${timestamp}`,
      description: 'Updated description'
    };
    
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/communities/${testCommunityId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: updatedData
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.community.title).to.eq(updatedData.title);
      expect(response.body.community.description).to.eq(updatedData.description);
    });
  });

  it('should fail to update community without authentication', () => {
    if (!testCommunityId) return;
    
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/communities/${testCommunityId}`,
      body: { title: 'Unauthorized update' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should delete community', () => {
    // Create a new community for deletion test
    let deleteCommunityId;
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: `Delete Test Community ${timestamp}`,
        description: 'To be deleted'
      }
    }).then((response) => {
      deleteCommunityId = response.body.community.id;
      
      // Delete it
      return cy.request({
        method: 'DELETE',
        url: `${baseUrl}/communities/${deleteCommunityId}`,
        headers: { Authorization: `Bearer ${authToken}` }
      });
    }).then((response) => {
      expect(response.status).to.eq(204);
      
      // Verify it's deleted
      cy.request({
        method: 'GET',
        url: `${baseUrl}/communities/${deleteCommunityId}`,
        failOnStatusCode: false
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(404);
      });
    });
  });
});

