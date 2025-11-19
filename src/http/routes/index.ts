import { Router } from 'express'
import authRouter from './auth.routes'
import userRouter from './user.routes'
import projectRouter from './project.routes'
import taskRouter from './task.routes'
import { invitationRoutes } from './invitation.routes'

const router: Router = Router()

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/projects', projectRouter)
router.use('/projects/:id/tasks', taskRouter)
router.use(invitationRoutes)

export default router
