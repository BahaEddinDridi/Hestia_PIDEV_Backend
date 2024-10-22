const request = require("supertest");
const express = require("express");
const statistiquesRouter = require("./statistiques");

const app = express();

app.use("/statistiques", statistiquesRouter);

describe("Statistiques Routes", () => {
  it("should get user status stats", async () => {
    const response = await request(app).get("/statistiques/user-status");
    expect(response.status).toBe(200);
    // Add more assertions based on the expected response
  });

  it("should get user gender stats", async () => {
    const response = await request(app).get("/statistiques/user-gender");
    expect(response.status).toBe(200);
    // Add more assertions based on the expected response
  });

  it("should get user role stats", async () => {
    const response = await request(app).get("/statistiques/user-role");
    expect(response.status).toBe(200);
    // Add more assertions based on the expected response
  });

  it("should get user age group stats", async () => {
    const response = await request(app).get("/statistiques/user-age-group");
    expect(response.status).toBe(200);
    // Add more assertions based on the expected response
  });

  it("should count all users", async () => {
    const response = await request(app).get("/statistiques/count");
    expect(response.status).toBe(200);
    // Add more assertions based on the expected response
  });

  it("should get user registration stats", async () => {
    const response = await request(app).get(
      "/statistiques/user-registration-stats"
    );
    expect(response.status).toBe(200);
    // Add more assertions based on the expected response
  });

  it("should get new users per month stats", async () => {
    const response = await request(app).get(
      "/statistiques/new-users-per-month"
    );
    expect(response.status).toBe(200);
    // Add more assertions based on the expected response
  });
});
