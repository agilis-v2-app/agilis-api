import { Router } from 'express'
import { login, register } from '@controllers/auth.controller'
import { validate } from '@middlewares/validation.middleware'
import { registerSchema, loginSchema } from '@validations/auth.validation'

const authRouter: Router = Router()

authRouter.post('/register', validate(registerSchema), register)
authRouter.post('/login', validate(loginSchema), login)

export default authRouter
