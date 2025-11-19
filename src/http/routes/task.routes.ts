import { Router } from 'express'
import {
  getProjectTasks,
  getProjectTaskById,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  assignTask,
  unassignTask,
  getMyTasksInProject
} from '@controllers/task.controller'
import { authenticate } from '@middlewares/auth.middleware'
import { validate } from '@middlewares/validation.middleware'
import {
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  getTaskSchema,
  getProjectTasksSchema,
  assignTaskSchema,
  unassignTaskSchema,
  getMyTasksInProjectSchema
} from '@validations/task.validation'

const taskRouter: Router = Router({ mergeParams: true })

taskRouter.use(authenticate)

taskRouter.get('/', validate(getProjectTasksSchema), getProjectTasks)
taskRouter.get('/me', validate(getMyTasksInProjectSchema), getMyTasksInProject)
taskRouter.get('/:taskId', validate(getTaskSchema), getProjectTaskById)
taskRouter.post('/', validate(createTaskSchema), createProjectTask)
taskRouter.put('/:taskId', validate(updateTaskSchema), updateProjectTask)
taskRouter.post('/:taskId/assign', validate(assignTaskSchema), assignTask)
taskRouter.delete('/:taskId/assign', validate(unassignTaskSchema), unassignTask)
taskRouter.delete('/:taskId', validate(deleteTaskSchema), deleteProjectTask)

export default taskRouter
