import mongoose from 'mongoose'

export async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Failed to connect to MongoDB: %s', err.message)
    } else {
      console.error('An unknown error occurred while connecting to MongoDB')
    }
    process.exit(1)
  }
}
