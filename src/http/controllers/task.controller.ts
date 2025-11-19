import type { Request, Response } from 'express'
import { Schema } from 'mongoose'
import { Project } from '../../models/project.model'

export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id } = req.params
    const userId = req.user._id

    const project = await Project.findOne({ _id: id, 'members.user': userId })

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    res.status(200).json(project.tasks)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching tasks.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while fetching tasks.' })
    }
  }
}

export const getProjectTaskById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id, taskId } = req.params
    const userId = req.user._id

    const project = await Project.findOne({ _id: id, 'members.user': userId })

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    const task = project.tasks.find((task) => task._id?.toString() === taskId)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.status(200).json(task)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching task.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while fetching task.' })
    }
  }
}

export const createProjectTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id } = req.params
    const userId = req.user._id
    const { name, description, status, dueDate } = req.body

    const project = await Project.findOne({ _id: id, 'members.user': userId })

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    // check creator role in project members
    const member = project.members.find((m) => m.user.toString() === userId)
    const isOwner = member?.role === 'owner'

    if (isOwner) {
      project.tasks.push({ name, description, status, dueDate })
    } else {
      project.tasks.push({
        name,
        description,
        status,
        dueDate,
        assigneeId: userId as unknown as Schema.Types.ObjectId
      })
    }

    await project.save()

    res.status(201).json(project.tasks[project.tasks.length - 1])
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error creating task.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while creating task.' })
    }
  }
}

export const updateProjectTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id, taskId } = req.params
    const userId = req.user._id
    const { name, description, status, dueDate } = req.body

    const project = await Project.findOne({ _id: id, 'members.user': userId })

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    const member = project.members.find((m) => m.user.toString() === userId)
    const isOwner = member?.role === 'owner'

    const task = project.tasks.find((task) => task._id?.toString() === taskId)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (isOwner) {
      // owners can update all editable fields (not assigneeId — use assign endpoint)
      task.name = name ?? task.name
      task.description = description ?? task.description
      task.status = status ?? task.status
      task.dueDate = dueDate ?? task.dueDate
    } else {
      // non-owners can only update the status of tasks assigned to them
      if (!task.assigneeId || task.assigneeId.toString() !== userId) {
        return res
          .status(403)
          .json({ message: 'You can only update the status of your own tasks' })
      }

      // disallow changing other fields
      if (
        name !== undefined ||
        description !== undefined ||
        dueDate !== undefined
      ) {
        return res.status(403).json({
          message:
            'Members can only update the status of their own tasks. Other fields cannot be modified.'
        })
      }

      if (status !== undefined) task.status = status
    }

    await project.save()

    res.status(200).json(task)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error updating task.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while updating task.' })
    }
  }
}

export const deleteProjectTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id, taskId } = req.params
    const userId = req.user._id

    // only owners can delete tasks
    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.role': 'owner'
    })

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not the owner' })
    }

    const existed = project.tasks.some((t) => t._id?.toString() === taskId)
    if (!existed) return res.status(404).json({ message: 'Task not found' })

    project.tasks = project.tasks.filter(
      (task) => task._id?.toString() !== taskId
    )
    await project.save()

    res.status(204).send()
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error deleting task.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while deleting task.' })
    }
  }
}

export const assignTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { id, taskId } = req.params
    const userId = req.user._id
    const { assigneeId } = req.body

    // only owner can assign
    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.role': 'owner'
    })
    if (!project)
      return res
        .status(404)
        .json({ message: 'Project not found or you are not the owner' })

    // verify assignee is a member
    const isMember = project.members.some(
      (m) => m.user.toString() === assigneeId
    )
    if (!isMember)
      return res
        .status(400)
        .json({ message: 'Assignee must be a member of the project' })

    const task = project.tasks.find((t) => t._id?.toString() === taskId)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    task.assigneeId = assigneeId as unknown as Schema.Types.ObjectId
    await project.save()

    res.status(200).json(task)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error assigning task.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while assigning task.' })
    }
  }
}

export const unassignTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { id, taskId } = req.params
    const userId = req.user._id

    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.role': 'owner'
    })
    if (!project)
      return res
        .status(404)
        .json({ message: 'Project not found or you are not the owner' })

    const task = project.tasks.find((t) => t._id?.toString() === taskId)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    task.assigneeId = undefined as unknown as Schema.Types.ObjectId
    await project.save()

    res.status(200).json(task)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error unassigning task.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while unassigning task.' })
    }
  }
}

export const getMyTasksInProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id } = req.params
    const userId = req.user._id

    const project = await Project.findOne({ _id: id, 'members.user': userId })

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    const myTasks = project.tasks.filter(
      (task) => task.assigneeId?.toString() === userId
    )

    res.status(200).json(myTasks)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching your tasks.', error: err.message })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while fetching your tasks.'
      })
    }
  }
}

import mongoose from 'mongoose'

export const getMyTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userId = new mongoose.Types.ObjectId(req.user._id)

    const tasks = await Project.aggregate([
      { $unwind: '$tasks' },

      {
        $match: {
          'tasks.assigneeId': userId,
          'members.user': userId
        }
      },

      {
        $project: {
          _id: 0,
          projectId: '$_id',
          projectName: '$name',
          taskId: '$tasks._id',
          name: '$tasks.name',
          description: '$tasks.description',
          status: '$tasks.status',
          dueDate: '$tasks.dueDate',
          assigneeId: '$tasks.assigneeId'
        }
      }
    ])

    res.status(200).json({ tasks: tasks })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({
        message: 'Error fetching your tasks.',
        error: err.message
      })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while fetching your tasks.'
      })
    }
  }
}
