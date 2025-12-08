import express from "express";
import request from "supertest";
import sinon from "sinon";
import { expect } from "chai";
import path from "path";
import url from "url";

// ESM import helper
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
  let tokenUtil;
  let sandbox;

  before(async function () {
    const routesMod = await importEsm("backend/src/routes/communityRoutes.js");
    communityRoutes = routesMod.default;

    const communityMod = await importEsm("backend/src/models/Community.js");
    Community = communityMod.default;

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

  it("creates a new community with the authenticated user as owner", async function () {
    const userId = "222222222222222222222222";
    const fakeToken = "faketoken";

    // Stub token verification and User.findById
    sandbox.stub(tokenUtil, "verifyToken").returns({ sub: userId });
    sandbox.stub(User, "findById").resolves({ id: userId });

    // Stub Community.create to return the created community
    const createdCommunity = {
      id: "community-1",
      title: "Pokemon Collection",
      description: "Share and trade Pokemon cards",
      image: "https://example.com/pokemon.jpg",
      ownerId: userId,
    };
    sandbox.stub(Community, "create").resolves(createdCommunity);

    const res = await request(app)
      .post("/communities")
      .set("Authorization", `Bearer ${fakeToken}`)
      .send({
        title: "Pokemon Collection",
        description: "Share and trade Pokemon cards",
        image: "https://example.com/pokemon.jpg",
      })
      .expect(201);

    expect(res.body).to.have.property("community");
    expect(res.body.community.title).to.equal("Pokemon Collection");
    expect(res.body.community.ownerId).to.equal(userId);
  });
});