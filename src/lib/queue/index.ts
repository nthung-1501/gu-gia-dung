import { Queue } from 'bullmq'

function createConnection() {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    return { host: 'localhost', port: 6379, enableReadyCheck: false, maxRetriesPerRequest: null as null }
  }

  // Parse rediss://user:password@host:port manually — avoids new URL() issues with non-standard protocols
  const match = redisUrl.match(/^rediss?:\/\/(?:[^:]+):([^@]+)@([^:]+):(\d+)/)
  if (!match) {
    return { host: 'localhost', port: 6379, enableReadyCheck: false, maxRetriesPerRequest: null as null }
  }

  const [, password, host, port] = match
  return {
    host,
    port: parseInt(port, 10),
    password,
    tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    enableReadyCheck: false,
    maxRetriesPerRequest: null as null,
  }
}

const connection = createConnection()

export const researchQueue = new Queue('research', { connection })
export const productionQueue = new Queue('production', { connection })
export const publishQueue = new Queue('publish', { connection })
export const analyticsQueue = new Queue('analytics', { connection })
