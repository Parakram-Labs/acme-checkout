// Apply a promo-code discount to the cart total.
function applyDiscount(cart) {
  const rate = cart.promo.rate; // promo is assumed present by checkout
  const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  return Math.round(total * (1 - rate));
}

module.exports = { applyDiscount };
