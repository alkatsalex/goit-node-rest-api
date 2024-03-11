import "dotenv/config";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../app";

const DB_URI = process.env.DB_URI;

describe("register", () => {
  beforeAll(async () => {
    await mongoose.connect(DB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect(DB_URI);
  });

  test("login OK", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      email: "alex@mistik.com",
      password: "qwe",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toStrictEqual(expect.any(String));
    expect(response.body.user).toStrictEqual(
      expect.objectContaining({
        email: expect.any(String),
        subscription: expect.any(String),
      })
    );
  });

  test("login BAD", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      email: "max@mistik.com",
      password: "qwe",
    });
    expect(response.statusCode).toBe(401);
  });
});
