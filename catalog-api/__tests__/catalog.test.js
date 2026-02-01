const request = require("supertest");
const app = require("../server");

test("GET /api/health works", async () => {
  const res = await request(app).get("/api/health");
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe("ok");
});

test("GET /api/games returns list", async () => {
  const res = await request(app).get("/api/games");
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test("search filters by genre/name", async () => {
  const res = await request(app).get("/api/games?search=indie");
  expect(res.statusCode).toBe(200);
  const names = res.body.map((x) => x.name).join(" ");
  expect(names).toMatch(/Stardew/i);
});

test("minPrice/maxPrice filters work", async () => {
  const res = await request(app).get("/api/games?minPrice=50&maxPrice=80");
  expect(res.statusCode).toBe(200);
  expect(res.body.every((g) => g.price >= 50 && g.price <= 80)).toBe(true);
});

test("GET /api/featured returns only featured", async () => {
  const res = await request(app).get("/api/featured");
  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
  expect(res.body.every((g) => g.featured === true)).toBe(true);
});

test("GET /api/games/:id 404 for unknown", async () => {
  const res = await request(app).get("/api/games/not-real");
  expect(res.statusCode).toBe(404);
});
