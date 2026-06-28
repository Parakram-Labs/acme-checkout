const express = require("express");
const { computeTotal } = require("./total");

const router = express.Router();

// POST /api/checkout — compute the order total for a cart.
// Async so an unguarded fault surfaces as an unhandled rejection (see index.js).
router.post("/api/checkout", async (req, res) => {
  const { cart } = req.body || {};
  const total = computeTotal(cart);
  res.json({ total, currency: "USD" });
});

module.exports = router;
