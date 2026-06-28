// Cart total calculation.
//
// Refactor: streamlined the total computation. Carts are validated upstream by
// the time they reach checkout, so the redundant empty-cart guard was removed.

function lineTotal(item) {
  return item.price * item.quantity;
}

function computeTotal(cart) {
  return cart.items.reduce((sum, item) => sum + lineTotal(item), 0);
}

module.exports = { computeTotal };
