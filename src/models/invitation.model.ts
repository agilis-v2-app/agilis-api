import { Schema, model, Document } from 'mongoose'
import { User } from './user.model'
import { Project } from './project.model'

export interface IInvitation extends Document {
  inviter: Schema.Types.ObjectId
  invitee: Schema.Types.ObjectId
  project: Schema.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const InvitationSchema = new Schema<IInvitation>(
  {
    inviter: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
      required: true
    },
    invitee: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: Project.modelName,
      required: true
    }
  },
  {
    timestamps: true
  }
)

// Create a compound unique index to prevent duplicate invitations
InvitationSchema.index({ invitee: 1, project: 1 }, { unique: true })

export const Invitation = model<IInvitation>('Invitation', InvitationSchema)
