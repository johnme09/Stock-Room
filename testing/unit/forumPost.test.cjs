import express from "express";
import request from "supertest";
import sinon from "sinon";
import { expect } from "chai";
import path from "path";
import url from "url";

/// ESM import helper
const importEsm = async (relPath) => {
  const absPath = path.resolve(__dirname, "..", "..", relPath);
  const moduleUrl = url.pathToFileURL(absPath).href;
  return await import(moduleUrl);
};

describe("Forum post routes", function () {
  let app;
  let communityRoutes;
  let Community;
  let ForumPost;
  let User;
  let tokenUtil;
  let sandbox;

  before(async function () {
    // Dynamically import ESM modules used by the router
    const routesMod = await importEsm("backend/src/routes/communityRoutes.js");
    communityRoutes = routesMod.default;

    const communityMod = await importEsm("backend/src/models/Community.js");
    Community = communityMod.default;

    const forumPostMod = await importEsm("backend/src/models/ForumPost.js");
    ForumPost = forumPostMod.default;

    const userMod = await importEsm("backend/src/models/User.js");
    User = userMod.default;

    tokenUtil = await importEsm("backend/src/utils/token.js");

    app = express();
    app.use(express.json());
    app.use("/communities", communityRoutes);
  });

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("GET /:communityId/posts returns posts for existing community", async function () {
    const communityId = "64a5f1c8d3f1a2b3c4d5e6f7";
    // Stub Community.findById to return a community
    sandbox.stub(Community, "findById").resolves({ id: communityId });

    // Prepare fake posts array
    const posts = [
      { id: "1", content: "hello", authorId: { username: "alice", image: "img1" } },
      { id: "2", content: "world", authorId: { username: "bob", image: "img2" } },
    ];

    // Stub ForumPost.find to return an object with chainable sort().populate()
    sandbox.stub(ForumPost, "find").returns({
      sort: () => ({
        populate: () => Promise.resolve(posts),
      }),
    });

    const res = await request(app).get(`/communities/${communityId}/posts`).expect(200);

    expect(res.body).to.have.property("posts");
    expect(res.body.posts).to.deep.equal(posts);
  });

  it("POST /:communityId/posts creates a post and populates author", async function () {
    const communityId = "64a5f1c8d3f1a2b3c4d5e6f7";
    const fakeToken = "faketoken";

    // Stub verifyToken to accept our token and return a payload
    sandbox.stub(tokenUtil, "verifyToken").returns({ sub: "userid123" });

    // Stub User.findById to return the user object that auth middleware expects
    sandbox.stub(User, "findById").resolves({ id: "userid123", username: "alice", image: "img1" });

    // Stub Community.findById to return a community
    sandbox.stub(Community, "findById").resolves({ id: communityId, ownerId: "ownerid" });

    // Stub ForumPost.create to return an object that has a populate method
    const created = {
      id: "postid",
      content: "A new post",
      authorId: "userid123",
      populate: function (field, fields) {
        // Simulate populate by attaching author details
        this.authorId = { username: "alice", image: "img1" };
        return Promise.resolve(this);
      },
    };

    sandbox.stub(ForumPost, "create").resolves(created);

    const res = await request(app)
      .post(`/communities/${communityId}/posts`)
      .set("Authorization", `Bearer ${fakeToken}`)
      .send({ content: "A new post" })
      .expect(201);

    expect(res.body).to.have.property("post");
    expect(res.body.post).to.have.property("id", "postid");
    expect(res.body.post.authorId).to.deep.equal({ username: "alice", image: "img1" });
  });
});
