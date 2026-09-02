export function formatMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  const fixed = Math.abs(n).toFixed(2);
  if (fixed === "0.00") return "$0.00";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${fixed}`;
}

export function splitEqual(amount, ids) {
  if (!ids || ids.length === 0) return {};
  const totalCents = Math.round(Number(amount) * 100);
  const n = ids.length;
  const baseCents = Math.floor(totalCents / n);
  const rem = totalCents % n;
  const shares = {};
  ids.forEach((id, index) => {
    const cents = baseCents + (index < rem ? 1 : 0);
    shares[id] = Number((cents / 100).toFixed(2));
  });
  return shares;
}

export function percentsSumTo100(percents) {
  const values = Object.values(percents).map(Number);
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100) < 0.01;
}

export function splitByPercent(amount, percents) {
  const totalCents = Math.round(Number(amount) * 100);
  const entries = Object.entries(percents);
  if (entries.length === 0) return {};
  const shares = {};
  let allocatedCents = 0;
  entries.forEach(([id, pct], i) => {
    if (i === entries.length - 1) {
      const lastCents = totalCents - allocatedCents;
      shares[id] = Number((lastCents / 100).toFixed(2));
    } else {
      const cents = Math.round((totalCents * Number(pct)) / 100);
      allocatedCents += cents;
      shares[id] = Number((cents / 100).toFixed(2));
    }
  });
  return shares;
}

export function sharesForExpense(expense) {
  if (expense.splitType === "percent" && expense.percents) {
    return splitByPercent(expense.amount, expense.percents);
  }
  return splitEqual(expense.amount, expense.splitWith);
}
