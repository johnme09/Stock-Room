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

describe("Item addition to collection", function () {
  let app;
  let communityRoutes;
  let Item;
  let Community;
  let User;
  let tokenUtil;
  let sandbox;

  before(async function () {
    const routesMod = await importEsm("backend/src/routes/communityRoutes.js");
    communityRoutes = routesMod.default;

    const itemMod = await importEsm("backend/src/models/Item.js");
    Item = itemMod.default;

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

  it("allows the community owner to add a new item to the collection", async function () {
    const communityId = "64a5f1c8d3f1a2b3c4d5e6f7";
    const ownerId = "111111111111111111111111";
    const fakeToken = "faketoken";

    // Stub token verification and User.findById
    sandbox.stub(tokenUtil, "verifyToken").returns({ sub: ownerId });
    sandbox.stub(User, "findById").resolves({ id: ownerId });

    // Stub Community.findById to return a community owned by the authenticated user
    const community = { id: communityId, ownerId: ownerId };
    sandbox.stub(Community, "findById").resolves(community);

    // Stub Item.create to return the created item
    const createdItem = {
      id: "item-1",
      communityId,
      title: "Rare Pokemon Card",
      description: "First edition holographic",
      image: "https://example.com/card.jpg",
      createdBy: ownerId,
    };
    sandbox.stub(Item, "create").resolves(createdItem);

    const res = await request(app)
      .post(`/communities/${communityId}/items`)
      .set("Authorization", `Bearer ${fakeToken}`)
      .send({
        title: "Rare Pokemon Card",
        description: "First edition holographic",
        image: "https://example.com/card.jpg",
      })
      .expect(201);

    expect(res.body).to.have.property("item");
    expect(res.body.item.title).to.equal("Rare Pokemon Card");
    expect(res.body.item.createdBy).to.equal(ownerId);
  });
});