export default function formatNumber(num) {
  const abs = Math.abs(num);

  if (abs >= 999_999) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  if (abs >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }

  return num.toLocaleString();
}
