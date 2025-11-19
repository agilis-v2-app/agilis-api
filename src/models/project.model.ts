import { Schema, model, Document, Types } from 'mongoose'
import { User } from './user.model'

export interface IProjectMember {
  user: Schema.Types.ObjectId
  role: 'owner' | 'member'
}

export interface ITask {
  _id?: Types.ObjectId // Mongoose adds _id to subdocuments
  name: string
  description?: string
  status: 'todo' | 'pending' | 'done'
  dueDate: string
  assigneeId?: Schema.Types.ObjectId
}

export interface IProject extends Document {
  name: string
  description?: string
  members: IProjectMember[]
  tasks: ITask[]
}

const ProjectMemberSchema = new Schema<IProjectMember>({
  user: { type: Schema.Types.ObjectId, ref: User.modelName, required: true },
  role: { type: String, enum: ['owner', 'member'], required: true }
})

const TaskSchema = new Schema<ITask>({
  name: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['todo', 'pending', 'done'],
    required: true
  },
  dueDate: { type: String, required: true },
  assigneeId: { type: Schema.Types.ObjectId, ref: User.modelName }
})

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [ProjectMemberSchema],
    tasks: [TaskSchema]
  },
  {
    timestamps: true
  }
)

export const Project = model<IProject>('Project', ProjectSchema)
