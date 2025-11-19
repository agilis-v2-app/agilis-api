import { Project } from '@models/project.model'
import { User } from '@models/user.model'
import { Invitation } from '@models/invitation.model'
import type { Request, Response } from 'express'
import { Schema } from 'mongoose'

export const createProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { name, description } = req.body
    const ownerId = req.user._id

    const project = new Project({
      name,
      description,
      members: [{ user: ownerId, role: 'owner' }]
    })

    await project.save()
    res.status(201).json(project)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error creating project.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while creating project.' })
    }
  }
}

export const getProjects = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const userId = req.user._id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const projects = await Project.find({ 'members.user': userId })
      .skip(skip)
      .limit(limit)
      .populate('members.user', 'username')

    const totalProjects = await Project.countDocuments({
      'members.user': userId
    })
    const totalPages = Math.ceil(totalProjects / limit)

    res.status(200).json({
      projects,
      currentPage: page,
      totalPages,
      totalProjects
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching projects.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while fetching projects.' })
    }
  }
}

export const getProjectById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id } = req.params
    const userId = req.user._id
    const project = await Project.findOne({
      _id: id,
      'members.user': userId
    }).populate('members.user', 'username')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.status(200).json(project)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching project.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while fetching project.' })
    }
  }
}

export const updateProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id } = req.params
    const userId = req.user._id
    const { name, description } = req.body

    const project = await Project.findOneAndUpdate(
      { _id: id, 'members.user': userId, 'members.role': 'owner' }, // Only owner can update project details
      { name, description },
      { new: true }
    ).populate('members.user', 'username')

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not the owner' })
    }

    res.status(200).json(project)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error updating project.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while updating project.' })
    }
  }
}

export const deleteProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id } = req.params
    const userId = req.user._id

    const project = await Project.findOneAndDelete({
      _id: id,
      'members.user': userId,
      'members.role': 'owner'
    }) // Only owner can delete project

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not the owner' })
    }

    res.status(204).send()
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error deleting project.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while deleting project.' })
    }
  }
}

export const addProjectMember = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id } = req.params
    const userId = req.user._id
    const { memberId } = req.body

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

    const newMember = await User.findById(memberId)
    if (!newMember) {
      return res.status(404).json({ message: 'User to add not found' })
    }

    if (project.members.some((member) => member.user.toString() === memberId)) {
      return res
        .status(400)
        .json({ message: 'User is already a member of this project' })
    }

    project.members.push({
      user: newMember._id as Schema.Types.ObjectId,
      role: 'member'
    })
    await project.save()

    res.status(200).json(project)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error adding project member.', error: err.message })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while adding project member.'
      })
    }
  }
}

export const removeProjectMember = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id, memberId } = req.params
    const userId = req.user._id

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

    project.members = project.members.filter(
      (member) => member.user.toString() !== memberId
    )
    await project.save()

    res.status(200).json(project)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error removing project member.', error: err.message })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while removing project member.'
      })
    }
  }
}

export const getProjectMember = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { id, memberId } = req.params
    const userId = req.user._id

    // Ensure requester is a member of the project
    const project = await Project.findOne({ _id: id, 'members.user': userId })
    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    const member = project.members.find((m) => m.user.toString() === memberId)
    if (!member) {
      return res
        .status(404)
        .json({ message: 'Member not found in this project' })
    }

    const user = await User.findById(memberId).select('_id username')

    const result = {
      user: user
        ? { _id: user._id, username: user.username }
        : { _id: member.user },
      role: member.role
    }

    res.status(200).json(result)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching project member.', error: err.message })
    } else {
      res
        .status(500)
        .json({
          message: 'An unknown error occurred while fetching project member.'
        })
    }
  }
}

export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { id } = req.params
    const userId = req.user._id

    // Ensure requester is a member of the project
    const project = await Project.findOne({
      _id: id,
      'members.user': userId
    }).populate('members.user', 'username')
    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    res.status(200).json({ members: project.members })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({
          message: 'Error fetching project members.',
          error: err.message
        })
    } else {
      res
        .status(500)
        .json({
          message: 'An unknown error occurred while fetching project members.'
        })
    }
  }
}

export const getProjectStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { id } = req.params
    const userId = req.user._id

    // Ensure requester is a member of the project
    const project = await Project.findOne({ _id: id, 'members.user': userId })
    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    const now = new Date()

    const membersCount = project.members.length
    const tasksCount = project.tasks.length

    const tasksByStatus = project.tasks.reduce(
      (acc: Record<string, number>, t) => {
        const s = t.status || 'unknown'
        acc[s] = (acc[s] || 0) + 1
        return acc
      },
      {}
    )

    const tasksAssignedCount = project.tasks.filter(
      (t) => !!t.assigneeId
    ).length
    const tasksUnassignedCount = tasksCount - tasksAssignedCount

    const overdueCount = project.tasks.filter((t) => {
      if (!t.dueDate) return false
      const due = new Date(t.dueDate)
      if (isNaN(due.getTime())) return false
      // consider overdue if dueDate < now and not done
      return due < now && t.status !== 'done'
    }).length

    // pending invitations for this project
    const pendingInvitations = await Invitation.countDocuments({
      project: project._id
    })

    res.status(200).json({
      projectId: project._id,
      projectName: project.name,
      membersCount,
      tasksCount,
      tasksByStatus,
      tasksAssignedCount,
      tasksUnassignedCount,
      overdueCount,
      pendingInvitations
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching project stats.', error: err.message })
    } else {
      res
        .status(500)
        .json({
          message: 'An unknown error occurred while fetching project stats.'
        })
    }
  }
}

export const addTaskToProject = async (req: Request, res: Response) => {
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

    project.tasks.push({ name, description, status, dueDate })
    await project.save()

    res.status(201).json(project)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error adding task.', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unknown error occurred while adding task.' })
    }
  }
}

export const updateProjectTaskStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id, taskId } = req.params
    const userId = req.user._id
    const { status } = req.body

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

    task.status = status
    await project.save()

    res.status(200).json(project)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error updating task status.', error: err.message })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while updating task status.'
      })
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

    const project = await Project.findOne({ _id: id, 'members.user': userId })

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found or you are not a member' })
    }

    project.tasks = project.tasks.filter(
      (task) => task._id?.toString() !== taskId
    )
    await project.save()

    res.status(200).json(project)
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
