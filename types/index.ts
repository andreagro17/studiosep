// Tipos de dominio compartidos (cliente + servidor)

/** Cómo se adquiere una pieza */
export type AvailabilityType = 'made_to_order' | 'in_stock'

/**
 * Estados de un pedido, de principio a fin.
 * Flujo simple del taller; `cancelado` es un estado final aparte.
 */
export type ProductionStatus =
  | 'pendiente'
  | 'aceptado'
  | 'en_produccion'
  | 'enviado'
  | 'entregado'
  | 'cancelado'

/** Orden y etiqueta legible de cada estado */
export const PRODUCTION_STEPS: { value: ProductionStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'en_produccion', label: 'En producción' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export interface ProductImage {
  src: string
  alt: string
}

export interface ProductDimension {
  label: string // p. ej. "Altura", "Ø"
  valueCm: number
}

/** Variante de una pieza (color, tamaño, acabado…) */
export interface ProductVariant {
  id: string
  /** Tipo de variante */
  type: 'color' | 'tamaño' | 'acabado'
  /** Etiqueta visible, p. ej. "Arena", "Grande" */
  label: string
  /** Diferencia de precio respecto al precio base, en céntimos */
  priceDeltaCents?: number
  /** Unidades disponibles (solo relevante en in_stock) */
  stockQuantity?: number
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  availabilityType: AvailabilityType
  priceCents: number
  currency: string
  /** Días de producción (solo relevante en made_to_order) */
  productionTimeDays?: number
  /** Unidades disponibles (solo relevante en in_stock) */
  stockQuantity?: number
  images: ProductImage[]
  dimensions: ProductDimension[]
  materials: string[]
  /** Variantes disponibles (color, tamaño, acabado). Vacío si no aplica */
  variants?: ProductVariant[]
  collectionId?: string
  isFeatured?: boolean
  isPublished: boolean
}

export interface Collection {
  id: string
  slug: string
  title: string
  /** Mes de la colección (YYYY-MM-01) */
  month: string
  description: string
  coverImage: string
  productCount: number
  isPublished: boolean
}
