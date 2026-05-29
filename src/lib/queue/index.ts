import { Queue } from 'bullmq'

const connection = { url: process.env.REDIS_URL! }

export const researchQueue = new Queue('research', { connection })
export const productionQueue = new Queue('production', { connection })
export const publishQueue = new Queue('publish', { connection })
export const analyticsQueue = new Queue('analytics', { connection })
