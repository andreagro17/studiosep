import { serverSupabaseServiceRole } from '#supabase/server'

// Public endpoint for the contact form. Inserts into `inquiries` using the
// service-role client (bypasses RLS), since the table has no public-write
// policy. All input is validated and trimmed before insertion.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const message = String(body?.message ?? '').trim()

  if (!name || name.length > 120) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre no es válido.' })
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'El email no es válido.' })
  }
  if (!message || message.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'El mensaje no es válido.' })
  }

  const supabase = serverSupabaseServiceRole(event)
  const { error } = await supabase.from('inquiries').insert({ name, email, message })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo enviar el mensaje. Inténtalo de nuevo.' })
  }

  return { ok: true }
})
