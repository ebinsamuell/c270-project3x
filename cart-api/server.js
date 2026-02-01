const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "cart" })
);

const CATALOG_URL = process.env.CATALOG_URL || "http://localhost:4000";

async function getGame(id) {
  const r = await fetch(`${CATALOG_URL}/api/games/${id}`);
  if (!r.ok) return null;
  return r.json();
}

function calcDiscount(subtotal) {
  // Simple, explainable rule: 10% off if subtotal >= 100
  return subtotal >= 100 ? subtotal * 0.1 : 0;
}

app.post("/api/checkout", async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items must be a non-empty array" });
  }

  for (const it of items) {
    if (!it || typeof it.id !== "string" || !Number.isInteger(it.qty) || it.qty <= 0) {
      return res.status(400).json({
        error: "Each item must have id (string) and qty (positive int)",
      });
    }
  }

  const lines = [];
  let subtotal = 0;

  for (const it of items) {
    const game = await getGame(it.id);
    if (!game) return res.status(404).json({ error: `Game not found: ${it.id}` });

    const lineTotal = Number((game.price * it.qty).toFixed(2));
    subtotal = Number((subtotal + lineTotal).toFixed(2));

    lines.push({
      id: game.id,
      name: game.name,
      qty: it.qty,
      unitPrice: game.price,
      lineTotal,
    });
  }

  const discount = Number(calcDiscount(subtotal).toFixed(2));
  const total = Number((subtotal - discount).toFixed(2));

  res.json({ lines, subtotal, discount, total });
});

module.exports = { app, calcDiscount };

if (require.main === module) {
  const port = process.env.PORT || 4001;
  app.listen(port, () => console.log(`cart-api on ${port}`));
}
