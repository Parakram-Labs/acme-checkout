function confirmOrder(order) {
  return { id: order.id, status: "confirmed", at: new Date().toISOString() };
}
module.exports = { confirmOrder };
