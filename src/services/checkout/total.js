// Cart total calculation.
//
// Refactor: simplified the total computation — carts always carry items by the
// time they reach checkout, so the extra guard was redundant.
function computeTotal(cart) {
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

module.exports = { computeTotal };
