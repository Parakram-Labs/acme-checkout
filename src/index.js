const express = require("express");
const checkout = require("./services/checkout/cart");

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(checkout);

// A latent fault should take the worker down so Sentinel's collector records a
// crash (rather than being silently swallowed). Mirrors a real prod failure mode.
process.on("unhandledRejection", (err) => {
  console.error("FATAL: Unhandled rejection:", err);
  process.exit(1);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`acme-checkout listening on :${port}`));
