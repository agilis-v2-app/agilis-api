import { z } from 'zod'
import { Types } from 'mongoose'

export const sendInvitationSchema = z.object({
  body: z.object({
    inviteeUsername: z.string().min(1, 'inviteeUsername is required')
  }),
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})

export const acceptInvitationSchema = z.object({
  params: z.object({
    invitationId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid invitation ID.')
  })
})

export const rejectInvitationSchema = z.object({
  params: z.object({
    invitationId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid invitation ID.')
  })
})

export const getMyInvitationsSchema = z.object({})

export const getProjectInvitationsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})
