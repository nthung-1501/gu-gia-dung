import { Queue } from 'bullmq'

function createConnection() {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    // During Next.js build phase, return a placeholder — queues won't actually connect
    return { host: 'localhost', port: 6379, enableReadyCheck: false, maxRetriesPerRequest: null }
  }
  const url = new URL(redisUrl)
  return {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: decodeURIComponent(url.password),
    tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  }
}

const connection = createConnection()

export const researchQueue = new Queue('research', { connection })
export const productionQueue = new Queue('production', { connection })
export const publishQueue = new Queue('publish', { connection })
export const analyticsQueue = new Queue('analytics', { connection })
