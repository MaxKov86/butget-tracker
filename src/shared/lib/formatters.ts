const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
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

export function formatDate(isoString: string): string {
  return dateFormatter.format(new Date(isoString));
}
