import 'dotenv/config'
import app from './http/server'
import { connectMongo } from './infra/database/mongo'

async function main() {
  await connectMongo()
  const PORT = process.env.APP_PORT ?? 3000

  app.listen(PORT, (err) => {
    if (err) {
      console.error('Failed to start server: %s', err.message)
      process.exit(1)
    }

    console.log('Server started at :%d', PORT)
  })
}

main()
