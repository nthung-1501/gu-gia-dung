import { db } from './src/lib/db/index'
import { videos, scripts, products } from './src/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const rows = await db.select({
  id: videos.id,
  status: videos.status,
  error: videos.errorMessage,
  topview: videos.topviewJobId,
  creatomate: videos.creatomateJobId,
  series: scripts.series,
  product: products.name,
  created: videos.createdAt,
  updated: videos.updatedAt,
}).from(videos)
  .innerJoin(scripts, eq(videos.scriptId, scripts.id))
  .innerJoin(products, eq(scripts.productId, products.id))
  .orderBy(desc(videos.createdAt))
  .limit(6)

console.log(JSON.stringify(rows, null, 2))
process.exit(0)
