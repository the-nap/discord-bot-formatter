import formatNumber from "#utils/formatNumber.js";

export function calculateTodayDamage(current, previous) {
  return current >= previous
    ? current - previous
    : current;
}

export function getVariation(oldValue, newValue) {
  if (oldValue <= 0) return "";

  const percentage = (((newValue - oldValue) / oldValue) * 100).toFixed(2);

  return percentage > 0
    ? `(+${percentage}%)`
    : `(${percentage}%)`;
}

export function formatDamage(today, variation) {
  const result = `${formatNumber(today)} ${variation}`;
  console.log(result);
  return result;
}
