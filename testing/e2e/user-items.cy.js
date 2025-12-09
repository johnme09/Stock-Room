describe('User Items (Status) API Tests', () => {
  const baseUrl = 'http://localhost:4000/api';
  let authToken = null;
  let testCommunityId = null;
  let testItemId = null;

  const testUser = {
    username: `statustest_${Date.now()}`,
    email: `status_${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  const testCommunity = {
    title: `Status Test Community ${Date.now()}`,
    description: 'Community for testing user item statuses'
  };

  const testItem = {
    title: `Status Test Item ${Date.now()}`,
    description: 'Item for status testing'
  };

  before(() => {
    // Register user, create community and item
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: testUser
    }).then((response) => {
      authToken = response.body.token;
      
      return cy.request({
        method: 'POST',
        url: `${baseUrl}/communities`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testCommunity
      });
    }).then((response) => {
      testCommunityId = response.body.community.id;
      
      return cy.request({
        method: 'POST',
        url: `${baseUrl}/communities/${testCommunityId}/items`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testItem
      });
    }).then((response) => {
      testItemId = response.body.item.id;
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

  it('should mark item as "have"', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/user-items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        itemId: testItemId,
        status: 'have'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('userItem');
      expect(response.body.userItem.status).to.eq('have');
    });
  });

  it('should mark item as "want"', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/user-items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        itemId: testItemId,
        status: 'want'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.userItem.status).to.eq('want');
    });
  });

  it('should mark item as "dont_have"', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/user-items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        itemId: testItemId,
        status: 'dont_have'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.userItem.status).to.eq('dont_have');
    });
  });

  it('should fail with invalid status', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/user-items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        itemId: testItemId,
        status: 'invalid_status'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail without authentication', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/user-items`,
      body: {
        itemId: testItemId,
        status: 'have'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should get user items for a community', () => {
    // First mark item as "have"
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/user-items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        itemId: testItemId,
        status: 'have'
      }
    }).then(() => {
      // Get user items
      cy.request({
        method: 'GET',
        url: `${baseUrl}/user-items?communityId=${testCommunityId}`,
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('userItems');
        expect(response.body.userItems).to.be.an('array');
        const found = response.body.userItems.find(ui => ui.item && ui.item.id === testItemId);
        expect(found).to.exist;
        expect(found.status).to.eq('have');
      });
    });
  });

  it('should get all user items without community filter', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/user-items`,
      headers: { Authorization: `Bearer ${authToken}` }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('userItems');
      expect(response.body.userItems).to.be.an('array');
    });
  });

  it('should fail to get user items without authentication', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/user-items`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});

