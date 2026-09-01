const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** amount зберігається в центах (щоб уникнути floating-point помилок з грошима) */
export function formatCurrency(amountInCents: number): string {
  return currencyFormatter.format(amountInCents / 100);
}

/** Скорочений формат для міток осей графіків — $1.2k замість $1,234.56 */
export function formatCompactCurrency(amountInCents: number): string {
  return compactCurrencyFormatter.format(amountInCents / 100);
}

export function formatDate(isoString: string): string {
  return dateFormatter.format(new Date(isoString));
}
