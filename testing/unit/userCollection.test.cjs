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

describe("Personal collection behavior", function () {
  let app;
  let userItemRoutes;
  let UserItem;
  let User;
  let tokenUtil;
  let sandbox;

  before(async function () {
    const routesMod = await importEsm("backend/src/routes/userItemRoutes.js");
    userItemRoutes = routesMod.default;

    const userItemMod = await importEsm("backend/src/models/UserItem.js");
    UserItem = userItemMod.default;

    const userMod = await importEsm("backend/src/models/User.js");
    User = userMod.default;

    tokenUtil = await importEsm("backend/src/utils/token.js");

    app = express();
    app.use(express.json());
    app.use("/user-items", userItemRoutes);
  });

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("returns the items for the user passed via query rather than the authenticated user", async function () {
    const communityId = "64a5f1c8d3f1a2b3c4d5e6f7";
    const loggedInUserId = "111111111111111111111111";
    const profileUserId = "222222222222222222222222";

    // Stub token verification and User.findById so the auth middleware authenticates a logged-in user
    sandbox.stub(tokenUtil, "verifyToken").returns({ sub: loggedInUserId });
    sandbox.stub(User, "findById").resolves({ id: loggedInUserId });

    // Fake user-items for the profile user (profileUserId)
    const fakeUserItems = [
      {
        id: "ui-1",
        status: "want",
        itemId: { toJSON: () => ({ id: "item-1", title: "Profile Item" }) },
      },
    ];

    // Stub UserItem.find to ensure it's called with filters containing the profile user id
    const findStub = sandbox.stub(UserItem, "find").returns({
      populate: () => Promise.resolve(fakeUserItems),
    });

    const res = await request(app)
      .get(`/user-items?communityId=${communityId}&userId=${profileUserId}`)
      .set("Authorization", "Bearer faketoken")
      .expect(200);

    // Verify the model was queried with the requested user's id, not the logged-in user
    sinon.assert.calledWith(findStub, { userId: profileUserId, communityId });

    expect(res.body).to.have.property("userItems");
    expect(res.body.userItems).to.deep.equal([
      { id: "ui-1", status: "want", item: { id: "item-1", title: "Profile Item" } },
    ]);
  });
});
