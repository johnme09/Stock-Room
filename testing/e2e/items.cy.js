describe('Items API Tests', () => {
  const baseUrl = 'http://localhost:4000/api';
  let authToken = null;
  let testCommunityId = null;
  let testItemId = null;

  const testUser = {
    username: `itemtest_${Date.now()}`,
    email: `item_${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  const testCommunity = {
    title: `Item Test Community ${Date.now()}`,
    description: 'Community for testing items'
  };

  const testItem = {
    title: `Test Item ${Date.now()}`,
    description: 'This is a test item',
    image: 'https://example.com/item.jpg'
  };

  before(() => {
    // Register user and create community
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
    });
  });

  after(() => {
    // Cleanup: Delete community (which will cascade delete items)
    if (authToken && testCommunityId) {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/communities/${testCommunityId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false
      });
    }
  });

  it('should create a new item in community', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: testItem
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('item');
      expect(response.body.item).to.have.property('id');
      expect(response.body.item.title).to.eq(testItem.title);
      expect(response.body.item.description).to.eq(testItem.description);
      expect(response.body.item.communityId).to.eq(testCommunityId);
      
      testItemId = response.body.item.id;
    });
  });

  it('should fail to create item without authentication', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/items`,
      body: testItem,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should fail to create item with short title', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'A',
        description: 'Too short'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should get all items in a community', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/communities/${testCommunityId}/items`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('items');
      expect(response.body.items).to.be.an('array');
      const found = response.body.items.find(item => item.id === testItemId);
      expect(found).to.exist;
    });
  });

  it('should update an item', () => {
    const updatedData = {
      title: `Updated Item ${Date.now()}`,
      description: 'Updated item description'
    };
    
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/items/${testItemId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: updatedData
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.item.title).to.eq(updatedData.title);
      expect(response.body.item.description).to.eq(updatedData.description);
    });
  });

  it('should fail to update item without authentication', () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/items/${testItemId}`,
      body: { title: 'Unauthorized update' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should delete an item', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/items/${testItemId}`,
      headers: { Authorization: `Bearer ${authToken}` }
    }).then((response) => {
      expect(response.status).to.eq(204);
      
      // Verify it's deleted by checking items list
      cy.request({
        method: 'GET',
        url: `${baseUrl}/communities/${testCommunityId}/items`
      }).then((getResponse) => {
        const found = getResponse.body.items.find(item => item.id === testItemId);
        expect(found).to.not.exist;
      });
      
      testItemId = null; // Mark as deleted
    });
  });

  it('should get item ownership counts', () => {
    // Create a new item first
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: `Count Test Item ${Date.now()}`,
        description: 'For ownership count testing'
      }
    }).then((createResponse) => {
      const itemId = createResponse.body.item.id;
      
      // Get ownership counts
      cy.request({
        method: 'GET',
        url: `${baseUrl}/communities/${testCommunityId}/item-ownership-counts`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('ownershipCounts');
        expect(response.body.ownershipCounts).to.be.an('object');
        // New item should have 0 owners
        expect(response.body.ownershipCounts[itemId]).to.eq(0);
      });
    });
  });
});

