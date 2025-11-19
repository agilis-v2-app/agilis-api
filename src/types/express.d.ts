import { JwtUserPayload } from './jwt'

declare global {
  namespace Express {
    export interface Request {
      user?: JwtUserPayload
    }
  }
}
