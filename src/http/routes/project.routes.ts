import { Router } from 'express'
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectMember,
  getProjectMembers,
  getProjectStats
} from '@controllers/project.controller'
import { authenticate } from '@middlewares/auth.middleware'
import { validate } from '@middlewares/validation.middleware'
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  getProjectByIdSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
  getProjectsSchema
} from '@validations/project.validation'

const projectRouter: Router = Router()

projectRouter.use(authenticate)

projectRouter.post('/', validate(createProjectSchema), createProject)
projectRouter.get('/', validate(getProjectsSchema), getProjects)
projectRouter.get('/:id', validate(getProjectByIdSchema), getProjectById)
projectRouter.put('/:id', validate(updateProjectSchema), updateProject)
projectRouter.delete('/:id', validate(deleteProjectSchema), deleteProject)
projectRouter.post(
  '/:id/members',
  validate(addProjectMemberSchema),
  addProjectMember
)
projectRouter.delete(
  '/:id/members/:memberId',
  validate(removeProjectMemberSchema),
  removeProjectMember
)
projectRouter.get(
  '/:id/members/:memberId',
  validate(removeProjectMemberSchema),
  getProjectMember
)
projectRouter.get(
  '/:id/members',
  validate(getProjectByIdSchema),
  getProjectMembers
)
projectRouter.get('/:id/stats', validate(getProjectByIdSchema), getProjectStats)

export default projectRouter
