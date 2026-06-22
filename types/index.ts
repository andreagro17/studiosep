// Tipos de dominio compartidos (cliente + servidor)

/** Cómo se adquiere una pieza */
export type AvailabilityType = 'made_to_order' | 'in_stock'

/**
 * Estados de producción artesanal de un pedido.
 * Reflejan el proceso real del taller, de principio a fin.
 */
export type ProductionStatus =
  | 'pendiente'
  | 'aceptado'
  | 'modelando'
  | 'secando'
  | 'horno'
  | 'esmaltado'
  | 'preparando_envio'
  | 'enviado'
  | 'entregado'

/** Orden y etiqueta legible de cada estado de producción */
export const PRODUCTION_STEPS: { value: ProductionStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'modelando', label: 'Modelando' },
  { value: 'secando', label: 'Secando' },
  { value: 'horno', label: 'Horno' },
  { value: 'esmaltado', label: 'Esmaltado' },
  { value: 'preparando_envio', label: 'Preparando envío' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
]

export interface ProductImage {
  src: string
  alt: string
}

export interface ProductDimension {
  label: string // p. ej. "Altura", "Ø"
  valueCm: number
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
