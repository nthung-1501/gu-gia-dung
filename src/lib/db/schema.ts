import {
  pgTable, text, timestamp, integer, jsonb,
  pgEnum, uuid, real, index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const productStatusEnum = pgEnum('product_status', [
  'pending', 'researched', 'scripted', 'produced', 'published',
])

export const scriptStatusEnum = pgEnum('script_status', [
  'draft', 'approved', 'in_production', 'done',
])

export const videoStatusEnum = pgEnum('video_status', [
  'pending', 'rendering', 'ready', 'failed',
])

export const publishStatusEnum = pgEnum('publish_status', [
  'scheduled', 'published', 'failed', 'cancelled',
])

export const seriesEnum = pgEnum('series', [
  'test-that', 'house-30s', 'which-one-better',
])

export type ProductBrief = {
  productName: string
  category: string
  priceRange: string
  keyFeatures: string[]
  targetAudience: string
  painPoints: string[]
  competitors: string[]
  contentAngles: string[]
  suggestedSeries: ('test-that' | 'house-30s' | 'which-one-better')[]
  suggestedHooks: string[]
}

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrls: jsonb('image_urls').$type<string[]>().default([]),
  sourceUrl: text('source_url'),
  priceRange: text('price_range'),
  category: text('category'),
  brand: text('brand'),
  status: productStatusEnum('status').default('pending').notNull(),
  briefJson: jsonb('brief_json').$type<ProductBrief>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  statusIdx: index('products_status_idx').on(t.status),
}))

export const scripts = pgTable('scripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  series: seriesEnum('series').notNull(),
  hook: text('hook').notNull(),
  body: text('body').notNull(),
  cta: text('cta').notNull(),
  estimatedDuration: integer('estimated_duration'),
  status: scriptStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  productIdx: index('scripts_product_id_idx').on(t.productId),
}))

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  scriptId: uuid('script_id').references(() => scripts.id, { onDelete: 'cascade' }).notNull(),
  topviewJobId: text('topview_job_id'),
  creatomateJobId: text('creatomate_job_id'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  durationSeconds: integer('duration_seconds'),
  status: videoStatusEnum('status').default('pending').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const publishJobs = pgTable('publish_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').references(() => videos.id).notNull(),
  tiktokPostId: text('tiktok_post_id'),
  caption: text('caption').notNull(),
  hashtags: jsonb('hashtags').$type<string[]>().default([]),
  trendingSoundUrl: text('trending_sound_url'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  publishedAt: timestamp('published_at'),
  status: publishStatusEnum('status').default('scheduled').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  statusIdx: index('publish_jobs_status_idx').on(t.status),
  scheduledIdx: index('publish_jobs_scheduled_at_idx').on(t.scheduledAt),
}))

export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  publishJobId: uuid('publish_job_id').references(() => publishJobs.id).notNull(),
  tiktokPostId: text('tiktok_post_id').notNull(),
  views: integer('views').default(0).notNull(),
  likes: integer('likes').default(0).notNull(),
  comments: integer('comments').default(0).notNull(),
  shares: integer('shares').default(0).notNull(),
  saves: integer('saves').default(0).notNull(),
  avgWatchTime: real('avg_watch_time'),
  completionRate: real('completion_rate'),
  insightsJson: jsonb('insights_json'),
  snapshotAt: timestamp('snapshot_at').defaultNow().notNull(),
}, (t) => ({
  postIdx: index('analytics_tiktok_post_id_idx').on(t.tiktokPostId),
}))

export const commentTriggers = pgTable('comment_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tiktokPostId: text('tiktok_post_id').notNull(),
  tiktokCommentId: text('tiktok_comment_id').notNull().unique(),
  commenterUsername: text('commenter_username').notNull(),
  commentText: text('comment_text').notNull(),
  responseScriptId: uuid('response_script_id').references(() => scripts.id),
  responseVideoId: uuid('response_video_id').references(() => videos.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  commentIdIdx: index('comment_triggers_comment_id_idx').on(t.tiktokCommentId),
  postIdx: index('comment_triggers_post_id_idx').on(t.tiktokPostId),
}))

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  scripts: many(scripts),
}))

export const scriptsRelations = relations(scripts, ({ one, many }) => ({
  product: one(products, { fields: [scripts.productId], references: [products.id] }),
  videos: many(videos),
}))

export const videosRelations = relations(videos, ({ one }) => ({
  script: one(scripts, { fields: [videos.scriptId], references: [scripts.id] }),
}))

export const publishJobsRelations = relations(publishJobs, ({ one, many }) => ({
  video: one(videos, { fields: [publishJobs.videoId], references: [videos.id] }),
  analyticsSnapshots: many(analyticsSnapshots),
}))

export const analyticsSnapshotsRelations = relations(analyticsSnapshots, ({ one }) => ({
  publishJob: one(publishJobs, { fields: [analyticsSnapshots.publishJobId], references: [publishJobs.id] }),
}))

export const commentTriggersRelations = relations(commentTriggers, ({ one }) => ({
  responseScript: one(scripts, { fields: [commentTriggers.responseScriptId], references: [scripts.id] }),
  responseVideo: one(videos, { fields: [commentTriggers.responseVideoId], references: [videos.id] }),
}))

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Script = typeof scripts.$inferSelect
export type NewScript = typeof scripts.$inferInsert
export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type PublishJob = typeof publishJobs.$inferSelect
export type NewPublishJob = typeof publishJobs.$inferInsert
export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect
export type NewAnalyticsSnapshot = typeof analyticsSnapshots.$inferInsert
export type CommentTrigger = typeof commentTriggers.$inferSelect
export type NewCommentTrigger = typeof commentTriggers.$inferInsert
