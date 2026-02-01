const request = require("supertest");
const { app, calcDiscount } = require("../server");

test("discount rule works", () => {
  expect(calcDiscount(99.99)).toBe(0);
  expect(calcDiscount(100)).toBeCloseTo(10, 5);
});

test("health works", async () => {
  const res = await request(app).get("/api/health");
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe("ok");
});

test("rejects empty items", async () => {
  const res = await request(app).post("/api/checkout").send({ items: [] });
  expect(res.statusCode).toBe(400);
});

test("rejects invalid item shape", async () => {
  const res = await request(app).post("/api/checkout").send({ items: [{ id: 123, qty: -1 }] });
  expect(res.statusCode).toBe(400);
});
