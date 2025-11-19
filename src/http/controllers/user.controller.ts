import { type IUser, User } from '@models/user.model'
import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { Project } from '@models/project.model'
import { Invitation } from '@models/invitation.model'
import mongoose, { Types } from 'mongoose'

// Update profile (username, email) - password excluded
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })

    const userId = req.user._id
    const { username, email } = req.body

    // fetch current user
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // prepare conflicts response if needed
    const conflicts: string[] = []

    // if username provided and different, check uniqueness
    if (username && username !== user.username) {
      const existing = await User.findOne({ username }).select('_id') as { _id: Types.ObjectId }
      if (existing && existing._id.toString() !== userId) conflicts.push('username')
    }

    // if email provided and different, check uniqueness
    if (email && email !== user.email) {
      const existing = await User.findOne({ email }).select('_id') as { _id: Types.ObjectId }
      if (existing && existing._id.toString() !== userId) conflicts.push('email')
    }

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Conflict updating profile', conflicts })
    }

    // apply updates
    if (username) user.username = username
    if (email) user.email = email

    await user.save()

    // return sanitized user
    const sanitized = await User.findById(userId, { passwordHash: false }).lean<IUser>()
    return res.status(200).json(sanitized)
  } catch (err: unknown) {
    if (err instanceof Error) return res.status(500).json({ message: 'Error updating profile', error: err.message })
    return res.status(500).json({ message: 'An unknown error occurred while updating profile' })
  }
}

// Change password: requires currentPassword in body
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })

    const userId = req.user._id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both currentPassword and newPassword are required' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const match = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!match) return res.status(403).json({ message: 'Current password is incorrect' })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    user.passwordHash = passwordHash
    await user.save()

    return res.status(200).json({ message: 'Password updated successfully' })
  } catch (err: unknown) {
    if (err instanceof Error) return res.status(500).json({ message: 'Error changing password', error: err.message })
    return res.status(500).json({ message: 'An unknown error occurred while changing password' })
  }
}

export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await User.findById(req.user._id, {
      passwordHash: false
    }).lean<IUser>()

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (err: unknown) {
    console.error('Error fetching user data:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get all info exclusive to the authenticated user
export const getMyDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })

    const userId = req.user._id

    // user profile (sanitized)
    const user = await User.findById(userId, { passwordHash: false }).lean()
    if (!user) return res.status(404).json({ message: 'User not found' })

    // projects where the user is a member
    const projects = await Project.find({ 'members.user': userId }).select('name description members tasks').populate('members.user', 'username')

    const ownedProjects = projects.filter((p) => p.members.some((m) => {
      const user = m.user as unknown as { _id: Types.ObjectId }

      return user && user._id?.toString() === userId && m.role === 'owner'
    }))

    // my assigned tasks across projects (aggregate)
    const objectUserId = new mongoose.Types.ObjectId(userId)
    const tasks = await Project.aggregate([
      { $unwind: '$tasks' },
      {
        $match: {
          'tasks.assigneeId': objectUserId,
          'members.user': objectUserId
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

    // my pending invitations
    const invitations = await Invitation.find({ invitee: userId }).populate('inviter', 'username').populate('project', 'name')

    return res.status(200).json({ user, projects, ownedProjects, tasks, invitations })
  } catch (err: unknown) {
    if (err instanceof Error) return res.status(500).json({ message: 'Error fetching user details', error: err.message })
    return res.status(500).json({ message: 'An unknown error occurred while fetching user details' })
  }
}
