const express = require("express");
const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");
const path = require("path");
const url = require("url");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "J6h5ZjDy9LSWqcM0x5SPqBhDohF77074";

const importEsm = async (relPath) => {
  const absPath = path.resolve(__dirname, "..", "..", relPath);
  const moduleUrl = url.pathToFileURL(absPath).href;
  return await import(moduleUrl);
};

describe("Community creation", function () {
  let app;
  let communityRoutes;
  let Community;
  let User;
  let sandbox;

  const testUserId = "222222222222222222222222";

  before(async function () {
    const routesMod = await importEsm("backend/src/routes/communityRoutes.js");
    communityRoutes = routesMod.default;

    const communityMod = await importEsm("backend/src/models/Community.js");
    Community = communityMod.default;

    const userMod = await importEsm("backend/src/models/User.js");
    User = userMod.default;

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

  it("creates a new community with the authenticated user as owner", async function () {
    // Create a real JWT that your auth middleware will accept
    // Adjust payload field if your token.js uses a different key
    const payload = { id: testUserId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Stub DB calls
    sandbox
      .stub(User, "findById")
      .resolves({ id: testUserId, _id: testUserId });

    const createdCommunity = {
      id: "community-1",
      title: "Pokemon Collection",
      description: "Share and trade Pokemon cards",
      image: "https://example.com/pokemon.jpg",
      ownerId: testUserId,
    };
    sandbox.stub(Community, "create").resolves(createdCommunity);

    const res = await request(app)
      .post("/communities")
      .set("Authorization", `Bearer ${token}`) // 🔑 real auth header
      .send({
        title: "Pokemon Collection",
        description: "Share and trade Pokemon cards",
        image: "https://example.com/pokemon.jpg",
      })
      .expect(201); // should now be "Created", not 401

    expect(res.body).to.have.property("community");
    expect(res.body.community.title).to.equal("Pokemon Collection");
    expect(res.body.community.ownerId).to.equal(testUserId);
  });
});
