import express, { type Express } from 'express'
import mongoose from 'mongoose'
import router from './routes'
import cors from 'cors'
import { logging } from './middlewares/logging.middleware'

const app: Express = express()

app.use(
  cors({
    origin: '*'
  })
)

app.use(express.json())

app.use(logging)

app.use('/', router)

app.get('/health', async (_, res) => {
  const isDbConnected = mongoose.connection.readyState === 1

  res.status(200).json({
    status: 'ok',
    database: isDbConnected,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

export default app
