import { getMyTasks } from '@controllers/task.controller'
import {
  changePassword,
  getMyDetails,
  me,
  updateProfile
} from '@controllers/user.controller'
import { Router } from 'express'
import { getMyInvitations } from '../controllers/invitation.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware'
import { getMyInvitationsSchema } from '../validations/invitation.validation'
import {
  changePasswordSchema,
  updateProfileSchema
} from '@validations/user.validation'

const userRouter: Router = Router()

userRouter.get('/me', authenticate, me)
userRouter.get('/me/tasks', authenticate, getMyTasks)

userRouter.put(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  updateProfile
)
userRouter.post(
  '/me/password',
  authenticate,
  validate(changePasswordSchema),
  changePassword
)

userRouter.get('/me/details', authenticate, getMyDetails)

userRouter.get(
  '/me/invitations',
  authenticate,
  validate(getMyInvitationsSchema),
  getMyInvitations
)

export default userRouter
