import { Queue } from 'bullmq'

function createConnection() {
  const url = new URL(process.env.REDIS_URL!)
  return {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: decodeURIComponent(url.password),
    tls: process.env.REDIS_URL!.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  }
}

const connection = createConnection()

export const researchQueue = new Queue('research', { connection })
export const productionQueue = new Queue('production', { connection })
export const publishQueue = new Queue('publish', { connection })
export const analyticsQueue = new Queue('analytics', { connection })
