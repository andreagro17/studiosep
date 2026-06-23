import { serverSupabaseServiceRole } from '#supabase/server'

// Public endpoint for the order request form. Creates (or reuses) a customer
// by email, then an order + order item, using the service-role client to
// bypass RLS. The product price and type are read from the DB (never trusted
// from the client). All input is validated and trimmed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const productSlug = String(body?.productSlug ?? '').trim()
  const variant = String(body?.variant ?? '').trim()
  const notes = String(body?.notes ?? '').trim()

  if (!name || name.length > 120) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre no es válido.' })
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'El email no es válido.' })
  }
  if (!productSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Selecciona una pieza.' })
  }

  const supabase = serverSupabaseServiceRole(event)

  // 1. Resolve the product (must be published). Price/type come from the DB.
  const { data: product, error: productErr } = await supabase
    .from('products')
    .select('id, price_cents, availability_type')
    .eq('slug', productSlug)
    .eq('is_published', true)
    .maybeSingle()

  if (productErr) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo procesar la solicitud.' })
  }
  if (!product) {
    throw createError({ statusCode: 400, statusMessage: 'La pieza seleccionada no está disponible.' })
  }

  // 2. Optional variant: resolve its id and price delta.
  let variantId: string | null = null
  let unitPrice = product.price_cents as number
  if (variant) {
    const { data: v } = await supabase
      .from('product_variants')
      .select('id, price_delta_cents')
      .eq('product_id', product.id)
      .eq('label', variant)
      .maybeSingle()
    if (v) {
      variantId = v.id as string
      unitPrice += (v.price_delta_cents as number) ?? 0
    }
  }

  // 3. Find or create the customer by email.
  let customerId: string
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    customerId = existing.id as string
  } else {
    const { data: created, error: customerErr } = await supabase
      .from('customers')
      .insert({ full_name: name, email })
      .select('id')
      .single()
    if (customerErr) {
      throw createError({ statusCode: 500, statusMessage: 'No se pudo procesar la solicitud.' })
    }
    customerId = created.id as string
  }

  // 4. Create the order.
  const type = product.availability_type === 'in_stock' ? 'stock' : 'commission'
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      type,
      total_cents: unitPrice,
      notes: notes || null,
    })
    .select('id, order_number')
    .single()

  if (orderErr) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo crear el pedido.' })
  }

  // 5. Create the order item.
  const { error: itemErr } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    variant_id: variantId,
    quantity: 1,
    unit_price_cents: unitPrice,
    custom_specs: variant ? { variant } : null,
  })

  if (itemErr) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo registrar la pieza del pedido.' })
  }

  return { ok: true, orderNumber: order.order_number }
})
