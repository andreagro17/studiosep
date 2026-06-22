import type { Product, Collection } from '~/types'

/**
 * Datos de ejemplo (mock) para desarrollo de la interfaz.
 * Se sustituirán por consultas a Supabase más adelante.
 */

const img = (seed: string) => ({
  src: `https://picsum.photos/seed/${seed}/900/1125`,
  alt: 'Pieza de cerámica artesanal',
})

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'jarron-alba',
    name: 'Jarrón Alba',
    description:
      'Jarrón de líneas suaves modelado a torno. Su esmalte mate evoca la luz del amanecer sobre el barro.',
    availabilityType: 'made_to_order',
    priceCents: 9500,
    currency: 'EUR',
    productionTimeDays: 24,
    images: [img('alba-1'), img('alba-2')],
    dimensions: [
      { label: 'Altura', valueCm: 28 },
      { label: 'Ø', valueCm: 14 },
    ],
    materials: ['Gres', 'Esmalte mate'],
    variants: [
      { id: 'v1', type: 'color', label: 'Arena' },
      { id: 'v2', type: 'color', label: 'Carbón' },
    ],
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'p2',
    slug: 'cuenco-luna',
    name: 'Cuenco Luna',
    description:
      'Cuenco de porcelana de paredes finas, cocido a alta temperatura. Pieza única con vidriado satinado.',
    availabilityType: 'in_stock',
    priceCents: 4200,
    currency: 'EUR',
    stockQuantity: 6,
    collectionId: 'c1',
    images: [img('luna-1'), img('luna-2')],
    dimensions: [
      { label: 'Altura', valueCm: 8 },
      { label: 'Ø', valueCm: 16 },
    ],
    materials: ['Porcelana', 'Vidriado satinado'],
    isPublished: true,
  },
  {
    id: 'p3',
    slug: 'plato-terra',
    name: 'Plato Terra',
    description:
      'Plato llano de gres con borde irregular. El engobe terroso resalta el gesto de la mano.',
    availabilityType: 'in_stock',
    priceCents: 3200,
    currency: 'EUR',
    stockQuantity: 12,
    collectionId: 'c1',
    images: [img('terra-1'), img('terra-2')],
    dimensions: [{ label: 'Ø', valueCm: 22 }],
    materials: ['Gres', 'Engobe'],
    isPublished: true,
  },
  {
    id: 'p4',
    slug: 'tetera-niebla',
    name: 'Tetera Niebla',
    description:
      'Tetera de gres con asa de caña. Modelada por encargo, cada pieza ajusta su capacidad a tu ritual.',
    availabilityType: 'made_to_order',
    priceCents: 14500,
    currency: 'EUR',
    productionTimeDays: 32,
    images: [img('niebla-1'), img('niebla-2')],
    dimensions: [
      { label: 'Altura', valueCm: 18 },
      { label: 'Capacidad', valueCm: 90 },
    ],
    materials: ['Gres', 'Caña natural'],
    variants: [
      { id: 'v3', type: 'tamaño', label: 'Individual' },
      { id: 'v4', type: 'tamaño', label: 'Compartir', priceDeltaCents: 3000 },
    ],
    isFeatured: true,
    isPublished: true,
  },
]

export const collections: Collection[] = [
  {
    id: 'c1',
    slug: 'junio',
    title: 'Colección Junio',
    month: '2026-06-01',
    description:
      'Una selección de piezas de mesa en tonos tierra, disponibles para envío inmediato mientras haya stock.',
    coverImage: 'https://picsum.photos/seed/junio-cover/1600/900',
    productCount: 12,
    isPublished: true,
  },
]

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getCollectionBySlug(slug: string) {
  return collections.find((c) => c.slug === slug)
}
