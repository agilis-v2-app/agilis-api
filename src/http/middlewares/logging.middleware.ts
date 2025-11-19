import type { MiddlewareFunction } from '@/types/middleware'

export const logging: MiddlewareFunction = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const method = req.method
    const path = req.originalUrl || req.url
    const status = res.statusCode
    const timestamp = new Date().toISOString()

    console.log(`${timestamp} - ${method} ${path} ${status} - ${duration}ms`)
  })

  next()
}
