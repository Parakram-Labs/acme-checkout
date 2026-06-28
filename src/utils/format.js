function formatUSD(cents) {
  return "$" + (cents / 100).toFixed(2);
}
function formatDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}
function titleCase(s) {
  return s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1));
}
module.exports = { formatUSD, formatDate, titleCase };
