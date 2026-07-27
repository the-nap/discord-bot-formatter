import formatNumber from "#utils/formatNumber.js";

export function calculateTodayDamage(current, previous) {
  return current >= previous
    ? current - previous
    : current;
}

export function getVariation(oldValue, newValue) {
  if (!oldValue) return "";

  const percentage = (((newValue - oldValue) / oldValue) * 100).toFixed(2);
  if(percentage > 1000 || percentage < -1000)
    return "";

  return percentage >= 0
    ? `(+${percentage}%)`
    : `(${percentage}%)`;
}

export function formatDamage(today, variation) {
  const result = `${formatNumber(today)} ${variation}`;
  return result;
}
