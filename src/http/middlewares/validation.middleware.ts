import { z } from 'zod'
import type { MiddlewareFunction } from '@/types/middleware'

type ValidateInput = (
  schema: z.ZodObject<{
    body?: z.ZodTypeAny
    query?: z.ZodTypeAny
    params?: z.ZodTypeAny
  }>
) => MiddlewareFunction

export const validate: ValidateInput = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  })

  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: z.formatError(result.error)
    })
  }

  next()
}
