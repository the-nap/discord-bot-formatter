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
  if(percentage > 0)
    return `🟢 +${percentage}%`;
  if(percentage <= 0 && percentage >= -20)
    return `🟡 ${percentage}%`;
  if(percentage < -20 && percentage >= -50)
    return `🟠 ${percentage}%`;
  return `🔴 ${percentage}%`;
}

export function getRankVariation(oldValue, newValue) {
  if(!oldValue) return '';
  const diff = newValue - oldValue;

  if (diff < 0) return `▲${-diff}`;
  if (diff > 0) return `▼${diff}`;
  return `➖`;

}

