describe('Items API Tests', () => {
  const baseUrl = Cypress.env('apiBaseUrl') || 'https://stockroom-1078634816222.us-central1.run.app/api';
  
  let authToken = null;
  let testCommunityId = null;
  let testItemId = null;

  const timestamp = Date.now();
  const testUser = {
    username: `itemtest_${timestamp}`,
    email: `item_${timestamp}@example.com`,
    password: 'testpassword123'
  };

  const testCommunity = {
    title: `Item Test Community ${timestamp}`,
    description: 'Community for testing items'
  };

  const testItem = {
    title: `Test Item ${timestamp}`,
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
      expect(response.status).to.eq(201);
      authToken = response.body.token;
      
      return cy.request({
        method: 'POST',
        url: `${baseUrl}/communities`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testCommunity
      });
    }).then((response) => {
      expect(response.status).to.eq(201);
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
    // Ensure we have an item
    if (!testItemId) {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/communities/${testCommunityId}/items`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testItem
      }).then((response) => {
        testItemId = response.body.item.id;
      });
    }
    
    cy.request({
      method: 'GET',
      url: `${baseUrl}/communities/${testCommunityId}/items`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('items');
      expect(response.body.items).to.be.an('array');
      if (testItemId) {
        const found = response.body.items.find(item => item.id === testItemId);
        expect(found).to.exist;
      }
    });
  });

  it('should update an item', () => {
    // Ensure we have an item
    if (!testItemId) {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/communities/${testCommunityId}/items`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testItem
      }).then((response) => {
        testItemId = response.body.item.id;
      });
    }
    
    const updatedData = {
      title: `Updated Item ${timestamp}`,
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
    if (!testItemId) return;
    
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
    // Create a new item for deletion test
    let itemToDelete;
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: `Delete Test Item ${timestamp}`,
        description: 'To be deleted'
      }
    }).then((response) => {
      itemToDelete = response.body.item.id;
      
      // Delete it
      return cy.request({
        method: 'DELETE',
        url: `${baseUrl}/items/${itemToDelete}`,
        headers: { Authorization: `Bearer ${authToken}` }
      });
    }).then((response) => {
      expect(response.status).to.eq(204);
      
      // Verify it's deleted by checking items list
      cy.request({
        method: 'GET',
        url: `${baseUrl}/communities/${testCommunityId}/items`
      }).then((getResponse) => {
        const found = getResponse.body.items.find(item => item.id === itemToDelete);
        expect(found).to.not.exist;
      });
    });
  });

  it('should get item ownership counts', () => {
    // Create a new item first
    let countTestItemId;
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/items`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: `Count Test Item ${timestamp}`,
        description: 'For ownership count testing'
      }
    }).then((createResponse) => {
      countTestItemId = createResponse.body.item.id;
      
      // Get ownership counts
      return cy.request({
        method: 'GET',
        url: `${baseUrl}/communities/${testCommunityId}/item-ownership-counts`
      });
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('ownershipCounts');
      expect(response.body.ownershipCounts).to.be.an('object');
      // New item should have 0 owners
      expect(response.body.ownershipCounts[countTestItemId]).to.eq(0);
    });
  });
});

