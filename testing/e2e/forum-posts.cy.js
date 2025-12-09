describe('Forum Posts API Tests', () => {
  const baseUrl = 'http://localhost:4000/api';
  let authToken = null;
  let testCommunityId = null;
  let testPostId = null;

  const testUser = {
    username: `forumtest_${Date.now()}`,
    email: `forum_${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  const testCommunity = {
    title: `Forum Test Community ${Date.now()}`,
    description: 'Community for testing forum posts'
  };

  const testPost = {
    content: 'This is a test forum post for Cypress testing'
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
    // Cleanup: Delete community (which will cascade delete posts)
    if (authToken && testCommunityId) {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/communities/${testCommunityId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false
      });
    }
  });

  it('should create a new forum post', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/posts`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: testPost
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('post');
      expect(response.body.post).to.have.property('id');
      expect(response.body.post.content).to.eq(testPost.content);
      expect(response.body.post.communityId).to.eq(testCommunityId);
      expect(response.body.post).to.have.property('authorId');
      
      testPostId = response.body.post.id;
    });
  });

  it('should fail to create post without authentication', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/posts`,
      body: testPost,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should fail to create post with empty content', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/posts`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: { content: '' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail to create post with content too long', () => {
    const longContent = 'a'.repeat(501);
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/posts`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: { content: longContent },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should get all posts for a community', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/communities/${testCommunityId}/posts`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('posts');
      expect(response.body.posts).to.be.an('array');
      const found = response.body.posts.find(p => p.id === testPostId);
      expect(found).to.exist;
      expect(found.content).to.eq(testPost.content);
    });
  });

  it('should fail to get posts for non-existent community', () => {
    const fakeId = '507f1f77bcf86cd799439011';
    cy.request({
      method: 'GET',
      url: `${baseUrl}/communities/${fakeId}/posts`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should delete a forum post as author', () => {
    // Create a new post first
    cy.request({
      method: 'POST',
      url: `${baseUrl}/communities/${testCommunityId}/posts`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: { content: 'Post to be deleted' }
    }).then((createResponse) => {
      const postId = createResponse.body.post.id;
      
      // Delete it
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/communities/${testCommunityId}/posts/${postId}`,
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(204);
        
        // Verify it's deleted
        cy.request({
          method: 'GET',
          url: `${baseUrl}/communities/${testCommunityId}/posts`
        }).then((getResponse) => {
          const found = getResponse.body.posts.find(p => p.id === postId);
          expect(found).to.not.exist;
        });
      });
    });
  });

  it('should fail to delete post without authentication', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/communities/${testCommunityId}/posts/${testPostId}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});

