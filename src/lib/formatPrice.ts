export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' CFA';
};

export const formatPriceShort = (price: number): string => {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + 'M CFA';
  }
  if (price >= 1000) {
    return (price / 1000).toFixed(0) + 'K CFA';
  }
  return price + ' CFA';
};
