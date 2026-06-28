// Cart total calculation.
//
// Baseline is defensive: an empty/missing cart yields 0 rather than throwing.
// (The demo's "risky refactor" removes this guard.)
function computeTotal(cart) {
  if (!cart || !Array.isArray(cart.items)) {
    return 0;
  }
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

module.exports = { computeTotal };
