/* eslint-disable no-undef */
const knex = require("knex");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./helpers");

describe("Auth Endpoints", () => {
  let db;

  const { testUsers } = helpers.makeWimmArray();
  const testUser = testUsers[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });
  after("disconnect from db", () => db.destroy());
  before("cleanup", () => helpers.cleanTable(db));
  afterEach("cleanup", () => helpers.cleanTable(db));

  describe("POST /api/auth/login", () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
    const requiredFields = ["user_name", "password"];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        user_name: testUser.user_name,
        password: testUser.password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post(`/api/auth/login`)
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
      it(`responds 400 'invalid user_name or password' when bad user_name`, () => {
        const userInvalidUser = { user_name: "user-not", password: "existy" };

        return supertest(app)
          .post("/api/auth/login")
          .send(userInvalidUser)
          .expect(400, { error: `Incorrect user_name or password` });
      });
      it(`responds 400 'invalid user_name or password' when bad password`, () => {
        const userInvalidPass = {
          user_name: testUser.user_name,
          password: "incorrect",
        };

        return supertest(app)
          .post(`/api/auth/login`)
          .send(userInvalidPass)
          .expect(400, { error: `Incorrect user_name or password` });
      });
      it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
        const userValidsCreds = {
          user_name: testUser.user_name,
          password: testUser.password,
        };
        const expectedToken = jwt.sign(
          { user_id: testUser.id }, //payload
          process.env.JWT_SECRET,
          {
            subject: testUser.user_name,
            algorithm: "HS256",
          }
        );
        return supertest(app)
          .post(`/api/auth/login`)
          .send(userValidsCreds)
          .expect(200, {
            authToken: expectedToken,
          });
      });
    });
  });
});
