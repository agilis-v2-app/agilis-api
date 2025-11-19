import type { Request, Response } from 'express'
import { Invitation } from '../../models/invitation.model'
import { Project } from '../../models/project.model'
import { User } from '../../models/user.model'
import type { Schema } from 'mongoose'

export const sendInvitation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { id } = req.params
    const userId = req.user._id
    const { inviteeUsername } = req.body

    // Check if project exists and user is the owner
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

    // Check if invitee exists (by username)
    const invitee = await User.findOne({ username: inviteeUsername }).lean()
    if (!invitee) {
      return res.status(404).json({
        message: 'User to invite not found',
        reason: 'user_not_found'
      })
    }

    const inviteeId = invitee._id.toString()

    // Check if invitee is already a member
    if (
      project.members.some((member) => member.user.toString() === inviteeId)
    ) {
      return res.status(400).json({
        message: 'User is already a member of this project',
        reason: 'already_member'
      })
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      invitee: invitee._id,
      project: id
    })

    if (existingInvitation) {
      return res.status(400).json({
        message: 'Invitation already sent to this user',
        reason: 'already_invited'
      })
    }

    // Create invitation
    const invitation = new Invitation({
      inviter: userId,
      invitee: invitee._id,
      project: id
    })

    await invitation.save()

    res.status(201).json(invitation)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error sending invitation.', error: err.message })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while sending invitation.'
      })
    }
  }
}

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { invitationId } = req.params
    const userId = req.user._id

    const user = await User.findOne({ _id: userId })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Find invitation for the current user
    const invitation = await Invitation.findOne({
      _id: invitationId,
      invitee: userId
    })

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    // Get the project
    const project = await Project.findById(invitation.project)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Add user to project as member
    project.members.push({
      user: user._id as Schema.Types.ObjectId,
      role: 'member'
    })

    await project.save()

    // Delete the invitation
    await Invitation.deleteOne({ _id: invitationId })

    res.status(200).json({ message: 'Invitation accepted' })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error accepting invitation.', error: err.message })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while accepting invitation.'
      })
    }
  }
}

export const rejectInvitation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const { invitationId } = req.params
    const userId = req.user._id

    // Find invitation for the current user
    const invitation = await Invitation.findOne({
      _id: invitationId,
      invitee: userId
    })

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    // Delete the invitation
    await Invitation.deleteOne({ _id: invitationId })

    res.status(200).json({ message: 'Invitation rejected' })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error rejecting invitation.', error: err.message })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while rejecting invitation.'
      })
    }
  }
}

export const getMyInvitations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const userId = req.user._id

    const invitations = await Invitation.find({ invitee: userId })
      .populate('inviter', 'username')
      .populate('project', 'name')

    res.status(200).json({ invitations })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({
        message: 'Error fetching invitations.',
        error: err.message
      })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred while fetching invitations.'
      })
    }
  }
}

export const getProjectInvitationsByOwner = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = req.params
    const userId = req.user._id

    // Verify that the requester is the owner of the project
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

    // Return all pending invitations for the project (owner can see all)
    const invitations = await Invitation.find({ project: id })
      .populate('invitee', 'username')
      .populate('inviter', 'username')
      .populate('project', 'name')

    res.status(200).json({ invitations })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching invitations.', error: err.message })
    } else {
      res
        .status(500)
        .json({
          message: 'An unknown error occurred while fetching invitations.'
        })
    }
  }
}

export const cancelInvitationByOwner = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { invitationId } = req.params
    const userId = req.user._id

    // Find the invitation and ensure the requester is the inviter
    const invitation = await Invitation.findOne({
      _id: invitationId,
      inviter: userId
    })

    if (!invitation) {
      return res
        .status(404)
        .json({ message: 'Invitation not found or you are not the inviter' })
    }

    await Invitation.deleteOne({ _id: invitationId })

    res.status(200).json({ message: 'Invitation cancelled' })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error cancelling invitation.', error: err.message })
    } else {
      res
        .status(500)
        .json({
          message: 'An unknown error occurred while cancelling invitation.'
        })
    }
  }
}
