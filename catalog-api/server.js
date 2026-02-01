const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve game cover images statically at /gamecovers/<file>
app.use("/gamecovers", express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "catalog" })
);

// Game data with local filenames
const gamesData = [
  {
    id: "minecraft",
    name: "Minecraft",
    price: 29.9,
    genre: "Sandbox",
    rating: 4.7,
    ratingCount: 5200,
    featured: true,
    coverFile: "minecraft.png",
  },
  {
    id: "elden-ring",
    name: "Elden Ring",
    price: 59.9,
    genre: "RPG",
    rating: 4.8,
    ratingCount: 3100,
    featured: true,
    coverFile: "eldenring.png",
  },
  {
    id: "gta-vi",
    name: "GTA VI",
    price: 79.9,
    genre: "Action",
    rating: 4.4,
    ratingCount: 1200,
    featured: false,
    coverFile: "gta6.png",
  },
  {
    id: "stardew",
    name: "Stardew Valley",
    price: 14.9,
    genre: "Indie",
    rating: 4.9,
    ratingCount: 8800,
    featured: false,
    coverFile: "stardewvalley.png",
  },
];

// Helper: return coverUrl that works through frontend nginx proxy
function withCoverUrl(game) {
  return {
    ...game,
    coverUrl: `/api/catalog/gamecovers/${game.coverFile}`,
  };
}

function toNumberOrNull(v) {
  if (v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// GET /api/games?search=&minPrice=&maxPrice=
app.get("/api/games", (req, res) => {
  const search = (req.query.search || "").toString().trim().toLowerCase();
  const minPrice = toNumberOrNull(req.query.minPrice);
  const maxPrice = toNumberOrNull(req.query.maxPrice);

  let results = gamesData;

  if (search) {
    results = results.filter(
      (g) =>
        g.name.toLowerCase().includes(search) ||
        g.genre.toLowerCase().includes(search)
    );
  }
  if (minPrice !== null) results = results.filter((g) => g.price >= minPrice);
  if (maxPrice !== null) results = results.filter((g) => g.price <= maxPrice);

  res.json(results.map(withCoverUrl));
});

// Featured list
app.get("/api/featured", (req, res) => {
  res.json(gamesData.filter((g) => g.featured).map(withCoverUrl));
});

// Single game
app.get("/api/games/:id", (req, res) => {
  const game = gamesData.find((g) => g.id === req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(withCoverUrl(game));
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`catalog-api on ${port}`));
}
