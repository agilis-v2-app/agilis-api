import { Document, model, Schema, type WithTimestamps } from 'mongoose'

interface IUser {
  username: string
  email: string
  passwordHash: string
}

interface IUserDocument extends WithTimestamps<IUser>, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 32
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    passwordHash: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export const User = model<IUserDocument>('User', userSchema)
export type { IUser }
