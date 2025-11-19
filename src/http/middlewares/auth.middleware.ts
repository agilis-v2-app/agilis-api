import type { JwtUserPayload } from '@/types/jwt'
import type { MiddlewareFunction } from '@/types/middleware'
import jwt from 'jsonwebtoken'

export const authenticate: MiddlewareFunction = (req, res, next) => {
  const header = req.header('Authorization')

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No Authorization header provided' })
  }

  const token = header.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtUserPayload

    req.user = {
      _id: payload._id,
      username: payload.username
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
