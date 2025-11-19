import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware'
import {
  acceptInvitation,
  getMyInvitations,
  rejectInvitation,
  sendInvitation
} from '../controllers/invitation.controller'
import { cancelInvitationByOwner } from '../controllers/invitation.controller'
import { getProjectInvitationsSchema } from '../validations/invitation.validation'
import { getProjectInvitationsByOwner } from '../controllers/invitation.controller'
import {
  acceptInvitationSchema,
  getMyInvitationsSchema,
  rejectInvitationSchema,
  sendInvitationSchema
} from '../validations/invitation.validation'

export const invitationRoutes: Router = Router()

// Send invitation (project owner only)
invitationRoutes.post(
  '/projects/:id/invitations',
  authenticate,
  validate(sendInvitationSchema),
  sendInvitation
)

// Get my invitations
invitationRoutes.get(
  '/users/me/invitations',
  authenticate,
  validate(getMyInvitationsSchema),
  getMyInvitations
)

// Get invitations for a project created by its owner
invitationRoutes.get(
  '/projects/:id/invitations/sent',
  authenticate,
  validate(getProjectInvitationsSchema),
  getProjectInvitationsByOwner
)

// Accept invitation
invitationRoutes.post(
  '/invitations/:invitationId/accept',
  authenticate,
  validate(acceptInvitationSchema),
  acceptInvitation
)

// Reject invitation
invitationRoutes.delete(
  '/invitations/:invitationId/reject',
  authenticate,
  validate(rejectInvitationSchema),
  rejectInvitation
)

// Cancel invitation (inviter/owner)
invitationRoutes.delete(
  '/invitations/:invitationId/cancel',
  authenticate,
  validate(rejectInvitationSchema),
  cancelInvitationByOwner
)
