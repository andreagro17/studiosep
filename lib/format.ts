/** Formatea céntimos a precio legible (EUR por defecto) */
export function formatPrice(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

/** Convierte días de producción a un rango legible en semanas */
export function productionTimeLabel(days?: number): string {
  if (!days) return ''
  if (days <= 7) return `${days} días`
  const weeks = Math.round(days / 7)
  return `${weeks}-${weeks + 1} semanas`
}
