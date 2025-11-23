import * as e from 'express'

export const clients = new Map<string, e.Response>()

export const notify = (clientId: string, event: string, data) => {
  const client = clients.get(clientId)
  if (client) client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}
